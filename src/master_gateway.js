var masterPorthole = require('./messaging/master'),
    pubSub = require('./pub_sub'),
    contentHandler = require('./content_handler/master_handler'),
    logger = require('./utils/utils').logger,
    uuidv4 = require('./utils/utils').uuidv4,
    eventHandler = require('./event_dispatching/event_handler'),
    VERSION = require('../package.json').version;

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
    if(!config) {
        return false;
    }

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

    eventHandler: null,

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

    getAll: function () {
        return this.slaves;
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
        if (this.config && this.config.allowedOrigins && Array.isArray(this.config.allowedOrigins)) {
            this.allowedOrigins = this.config.allowedOrigins;
        } else {
            this.allowedOrigins = '*';
        }
    },

    handleMessage: function (event) {
        if (!event.data.msgSender || event.data.msgSender === this.msgSender) {
            return false;
        }

        var masterPattern,
            slavePattern,
            originValid = false;

        if (this.allowedOrigins !== '*') {
            for(var i = 0; i < this.allowedOrigins.length; i++) {
                if(event.origin.match(this.allowedOrigins[i])){
                    originValid = true;
                    break;
                }
            }
        } else {
            originValid = true;
        }

        if(!originValid) {
            logger.out('error', '[GG] Master: Message origin is not allowed');
            return false;
        }

        masterPattern = new RegExp('^Master\\.', 'g');
        slavePattern = new RegExp('^Slave\\.', 'g');

        // Check if message is reserved system message (Master and Slave messages)
        if (slavePattern.test(event.data.action) || masterPattern.test(event.data.action)) {
            this.handleProtectedMessage(event);
            return false;
        } else {
            this.handleSubscribedMessage(event);
        }    
    },

    handleSubscribedMessage: function (event) {
        var returnData;
        if (event.data.callbacks && Array.isArray(event.data.callbacks)) {
            this.parseCrossContextCallbacks(event.data);
        }

        logger.out('info', '[GG] Master: Slave message received:', event.data);
        returnData = pubSub.publish(event.data.action, event.data);
        // Return async id in message upon promise in original window can be resolved
        if(!event.data.async || !event.data.uuid) return false;
        // Return subsription data, or just return ack message so promise can be resovled
        this.sendMessage(this.slaves[event.data.slaveId].frameId, {
            data: returnData || {ack: true},
            action: event.data.action + '_' + event.data.uuid,
            async: !!event.data.async,
            uuid: event.data.uuid
        });
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

    parseCrossContextCallbacks: function(data) {
        var self = this;
        data.callbacks.forEach(function (def) {
            def.method = function() {
                return self.sendMessage(self.slaves[data.slaveId].frameId, {
                    action: def.cbHash,
                    data: arguments[0] || false                    
                });
            };
            def.methodAsync = function() {
                return self.sendMessageAsync(self.slaves[data.slaveId].frameId, {
                    action: def.cbHash,
                    data: arguments[0] || false                    
                });
            };
        });
    },

    slaveInit : function(event, slaveData) {
        logger.out('info', '[GG] Master:', 'Starting to load slave.', event.data);

        // check slave and master versions
        if((VERSION && !event.data.VERSION) || (VERSION > event.data.VERSION)) {
            logger.out('info', '[GG] Master:', 'Slave is outdated, please update to latest version - ' + VERSION);
        } else if ((!VERSION && event.data.VERSION) || (VERSION < event.data.VERSION)) {
            logger.out('info', '[GG] Master:', 'Master is outdated, please update to latest version - ' + event.data.VERSION);
        }

        if(typeof slaveData.autoResize === 'undefined' || slaveData.autoResize !== false) {
            //On every init reset the frame sizes
            contentHandler.resetFrameSize(slaveData.frameId);
        }
        // Run the slave init callback and notify slave to load
        if (slaveData.init) {
            slaveData.init(event.data);
        }
        if(event.data.eventListeners) {
            //Curry the sendMessage function with frameId argument in this special case
            this.eventHandler = eventHandler(event.data.eventListeners, this.sendMessage.bind(this, slaveData.frameId), 'Master.Event');
        }
        this.slaveLoad(slaveData);
    },

    slaveLoad : function(slaveData) {
        this.sendMessage(slaveData.frameId, {
            action : 'Slave.Load',
            data: typeof slaveData.data === 'function' ? slaveData.data() : slaveData.data || {},
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

    once: function (action, callback) {
        return pubSub.once(action, callback);
    },

    isSubscribed : function(action) {
        return pubSub.isSubscribed(action);
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

    subscribeCrossContextCallbacks: function(data) {
        var event = data.action + '_' + (data.uuid ? data.uuid : uuidv4());
        var self = this;

        if(data.callbacks && Array.isArray(data.callbacks)) {
            data.callbacks.forEach(function (def, idx) {
                self._createCallbackSubscription(event, def, idx);
            });
        } else {
            self._createCallbackSubscription(event, data.callback, 0);
        }
    },

    sendMessage: function (frameId, data, origin) {
        var frame = document.getElementById(frameId);
        if (!frame) {
            logger.out('warn', '[GG] Master:', 'Frame ' + frameId + ' is non existent.');
            return false;
        }
        if (data.callbacks || data.callback) {
            this.subscribeCrossContextCallbacks(data);
        }
        data.msgSender = this.msgSender;
        data.plugin = 'GravityGateway';
        masterPorthole.sendMessage(frame, data, origin);
    },

    sendMessageAsync : function(frameId, data, origin, rejectDuration){
        var self = this,
            rejectTimeout = null,
            subscription;

        rejectDuration = rejectDuration || 0;

        return new Promise(function(resolve, reject) {
            var event;
            data.async = true;
            data.uuid = uuidv4();
            event = data.action + '_' + data.uuid;
            
            if (data.callbacks || data.callback) {
                this.subscribeCrossContextCallbacks(data);
            }

            subscription = self.once(event, function(response) {
                clearTimeout(rejectTimeout);
                rejectTimeout = null;
                logger.out('info', '[GG] Slave.' +  self.slaveId + 'Promise resolved for event ' + event);
                resolve(response);
            });

            if(rejectDuration) {
                rejectTimeout = setTimeout(function() {
                    subscription.remove();
                    reject();
                    logger.out('info', '[GG] Slave.' +  self.slaveId + 'Promise rejected for event ' + event);
                }, rejectDuration);
            }

            self.sendMessage(frameId, data, origin);
        });
    },

    sendToAll: function (data, origin) {
        var self = this;
        if(!Object.keys(this.slaves).length) {
            logger.out('info', '[GG] Master:', 'No slaves are registered', data);
            return false;
        }

        for(var key in this.slaves) {
            self.sendMessage(this.slaves[key].frameId, data, origin);
        }
    },

    _createCallbackSubscription : function(event, def, idx) {
        var subscribed;
        var cbHash = event + '_' + idx;
        var self = this;

        if (!self.isSubscribed(cbHash)) {
            subscribed = self.subscribe(cbHash, def.method);
        }
        if (subscribed) {
            def.cbHash = cbHash;
        }
        delete def.method;
    }
};

//Add aliases
masterGateway.on = masterGateway.subscribe;
masterGateway.off = masterGateway.unsubscribe;
masterGateway.emit = masterGateway.sendMessage;
masterGateway.emitAsync = masterGateway.sendMessageAsync;
masterGateway.request = masterGateway.sendMessageAsync;

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
