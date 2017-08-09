var masterPorthole = require('./messaging/master'),
    pubSub = require('./pub_sub'),
    contentHandler = require('./content_handler/master_handler'),
    logger = require('./utils/utils').logger,
    eventHandler = require('./event_dispatching/event_handler');

function validateSlavesConfig(slaves) {
    var configValid = true;

    for (var slave in slaves) {
        if (!slaves[slave].frameId || typeof slaves[slave].frameId !== 'string') {
            logger.out('error', '[GG] Master:', 'frameId property is invalid or missing for ' + slave);
            configValid = false;
        }
    }

    return configValid;
}

function validateInitialization(config) {
    var slaves = config.slaves || config.products,
        configValid;

    if (!slaves || typeof slaves !== 'object') {
        logger.out('warn', '[GG] Master:', 'slaves/products object is invalid or missing');
    }

    configValid = slaves ? validateSlavesConfig(slaves) : true;

    if (!configValid) {
        return false;
    } else {
        logger.out('info', '[GG] Master:', 'Initializing');
        return true;
    }
}

var masterGateway = {

    initialized: false,

    slaves: {},

    config: null,

    allowedOrigins: null,

    msgSender: 'Master',

    init: function (config) {
        var slaves = config.slaves || config.products;
        this.initialized = true;
        this.config = config;
        this.slaves = slaves || {};
        this.setAllowedDomains();
        //Set message handler
        window.addEventListener('message', this.handleMessage.bind(this));
    },

    addSlave: function(config) {
        var slaveId = config.slaveId || config.productId;

        if (!slaveId || typeof slaveId !== 'string') {
            logger.out('error', '[GG] Master:', 'slaveId/productId property is invalid or missing for ' + config);
            return false;
        } else if (!config.frameId || typeof config.frameId !== 'string') {
            logger.out('error', '[GG] Master:', 'frameId property is invalid or missing for ' + config);
            return false;
        }
        //Delete slaveId prop for sake of standardization
        delete config.slaveId;
        this.slaves[slaveId] = config;
    },

    removeSlave: function(slaveId) {
        if(slaveId && this.slaves[slaveId]) {
            delete this.slaves[slaveId];
            logger.out('info', '[GG] Master:', 'slave: ' + slaveId + ' succesfully removed.');
        } else {
            logger.out('error', '[GG] Master:', 'Passed slaveId is invalid or it doesn`t exist.');
            return false;
        }
    },

    setAllowedDomains: function () {
        if (this.config && this.config.allowedOrigins) {
            this.allowedOrigins = this.config.allowedOrigins;
        } else {
            this.allowedOrigins = '*';
        }
    },

    handleMessage: function (event) {
        if (!event.data.msgSender || event.data.msgSender === this.msgSender) return false;

        var masterPattern,
            slavePattern;

        if (this.allowedOrigins !== '*' && this.allowedOrigins.indexOf(event.origin) === -1) {
            logger.out('error', '[GG] Master: Message origin is not allowed');
            return false;
        }

        masterPattern = new RegExp('^Master\\.', 'g');
        slavePattern = new RegExp('^Slave\\.', 'g');

        // Check if message is reserved system message (Master and Slave messages)
        if (slavePattern.test(event.data.action) || masterPattern.test(event.data.action)) {
            this.handleProtectedMessage(event);
            return false;
        }

        logger.out('info', '[GG] Master: Slave message received:', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    handleProtectedMessage: function (event) {
        var slaveId = event.data.slaveId || event.data.productId;

        if (!this.slaves[slaveId]) {
            return false;
        }
        var slaveData = this.slaves[slaveId],
            actionName = event.data.action.replace('.', '');
        //Lowercase the first letter
        actionName = actionName.charAt(0).toLowerCase() + actionName.slice(1);
        if (this[actionName]) {
            this[actionName](event, slaveData);
        } else {
            logger.out('warn', '[GG] Master:', 'Actions with domain `Master` or `Slave` are protected!');
        }
    },

    slaveInit : function(event, slaveData) {
        logger.out('info', '[GG] Master:', 'Starting to load slave.', event.data);
        //On every init reset the frame size
        contentHandler.resetFrameSize(slaveData.frameId);
        // Run the slave init callback and notify slave to load
        if (slaveData.init) {
            slaveData.init(event.data);
        }
        if(event.data.eventListeners) {
            //Curry the sendMessage function with frameId argument in this special case
            eventHandler(event.data.eventListeners, this.sendMessage.bind(this, slaveData.frameId), 'Master.Event');
        }
        this.slaveLoad(slaveData);
    },

    slaveLoad : function(slaveData) {
        this.sendMessage(slaveData.frameId, {
            action : 'Slave.Load',
            data: slaveData.data || {},
            autoResize : typeof slaveData.autoResize !== 'undefined' ? slaveData.autoResize : true
        });
    },

    slaveResize : function(event, slaveData) {
        logger.out('info', '[GG] Master:', 'Resizing slave.', event.data);
        contentHandler.resize(slaveData.frameId, event);
    },

    slaveLoaded : function(event, slaveData) {
        if (!slaveData.loaded) {
            return false;
        }
        logger.out('info', '[GG] Master:', 'Slave loaded.', event.data);
        slaveData.loaded(event.data);
    },

    slaveEvent : function(event) {
        logger.out('info', '[GG] Master:', 'Slave.Event event received.', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    subscribe: function (action, callback) {
        return pubSub.subscribe(action, callback);
    },

    unsubscribe: function (action) {
        return pubSub.unsubscribe(action);
    },

    clearSubscriptions: function () {
        return pubSub.clearSubscriptions();
    },

    sendMessage: function (frameId, data, origin) {
        var frame = document.getElementById(frameId);
        if (!frame) {
            logger.out('warn', '[GG] Master:', 'Frame ' + frameId + ' is non existent.');
            return false;
        }

        data.msgSender = this.msgSender;
        masterPorthole.sendMessage(frame, data, origin);
    }
};

/**
 * Gateway is singleton
 * If it is already initialized return the Gateway otherwise return false
 */
module.exports = function (config) {
    if (config && config.debug === true) {
        logger.debug = true;
    }

    if (!masterGateway.initialized && validateInitialization(config)) {
        masterGateway.init(config);
        return masterGateway;
    } else if (masterGateway.initialized) {
        return masterGateway;
    } else {
        return false;
    }
};