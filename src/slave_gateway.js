var slavePorthole = require('./messaging/slave'),
    pubSub = require('./pub_sub'),
    contentHandler = require('./content_handler/slave_handler'),
    logger = require('./utils/utils').logger,
    eventHandler = require('./event_dispatching/event_handler'),
    uuidv4 = require('./utils/utils').uuidv4,
    slaveProxy = require('./slave_proxy');

function validateInitialization(config) {
    if(!config) {
        return false;
    }
    
    var slaveId = config.slaveId || config.productId;

    if(!slaveId || typeof slaveId !== 'string') {
        logger.out('error', '[GG] Slave:', 'slaveId/productId property is invalid or missing');
        return false;
    } else {
        logger.out('info', '[GG] Slave.' + slaveId + ':', 'Initializing');
        return true;
    }
}

var slaveGateway = {

    slaveId : '',

    config : null,

    initialized : false,

    load : null,

    msgSender : 'Slave',

    init: function(config){
        this.initialized = true;
        this.config = config;
        this.slaveId = config.slaveId || config.productId;
        this.load = config.load || null;
        this.setAllowedDomains();
        //Set message handler
        window.addEventListener('message', this.handleMessage.bind(this));
        //Pass the key propagation config object, event callback, event name
        if(this.config.eventPropagation) {
            eventHandler(this.config.eventPropagation, this.sendMessage.bind(this), 'Slave.Event');
        }
        if(this.config.worker) {
            this.setWorker();
        }
        this.startSlaveInitialization();
    },
    
    setAllowedDomains : function() {
        if(this.config && this.config.allowedOrigins) {
            this.allowedOrigins = this.config.allowedOrigins;
        } else {
            this.allowedOrigins = '*';
        }
    },

    startSlaveInitialization : function() {
        this.sendMessage({
            action: 'Slave.Init',
            data: this.config.data,
            eventPropagation : this.config.eventPropagation,
            eventListeners : this.config.eventListeners
        });
    },

    addEventsForPropagation : function (config) {
        if(typeof config !== 'object' || Array.isArray(config)) {
            logger.out('error', '[GG] Slave.' +  this.slaveId + ':' + ' Invalid configuration for events passed');
            return false;
        }
        eventHandler.addEventListeners(config);
    },

    handleMessage : function(event) {
        if(!event.data.msgSender || event.data.msgSender === this.msgSender){
            logger.out('warn', '[GG] Slave.' +  this.slaveId + ': Event data missing sender info.', event);
            return false;
        }

        var slavePattern,
            masterPattern;

        if(this.allowedOrigins !== '*' && this.allowedOrigins.indexOf(event.origin) === -1) {
            logger.out('error', '[GG] Slave.' +  this.slaveId + ':' + ' Message origin is not allowed');
            return false;
        }

        slavePattern = new RegExp('^Slave\\.', 'g');
        masterPattern = new RegExp('^Master\\.', 'g');
        // Check if message is reserved system message (Master and Slave messages)
        if(slavePattern.test(event.data.action) || masterPattern.test(event.data.action)) {
            this.handleProtectedMessage(event);
            return false;
        }

        logger.out('info', '[GG] Slave.' +  this.slaveId + ':' + ' Master message received:', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    handleProtectedMessage : function(event) {
        var actionName = event.data.action.replace('.', '');
        //Lowercase the first letter
        actionName = actionName.charAt(0).toLowerCase() + actionName.slice(1);

        if (this[actionName]) {
            this[actionName](event);
        } else {
            logger.out('warn', '[GG] Slave.' +  this.slaveId + ':', 'Actions with domain `Master` or `Slave` are protected!');
        }
    },

    setWorker: function(){
        var msgBlacklist = ['Slave.Resize'];

        var worker = slaveProxy.setMsgProxy(this.config.worker, {debug : this.config.debug}, pubSub.publish.bind(pubSub), this.sendMessage.bind(this));

        if(worker) {
            logger.out('info', '[GG] Slave.' +  this.slaveId + ':', 'Web worker initialized.');
            slavePorthole.setWorker(worker, msgBlacklist);
        } else {
            logger.out('error', '[GG] Slave.' +  this.slaveId + ':', 'Web worker initialization failed. Provide instance of Worker or path to file');
            return false;
        }
    },

    slaveLoad : function(event) {
        logger.out('info', '[GG] Slave.' +  this.slaveId + ':', 'Starting to load.', event.data);
        if(event.data.autoResize) {
            //Pass the event callback, and event name
            contentHandler.init(this.sendMessage.bind(this), 'Slave.Resize');
        }
        if(this.load) {
            this.load(event.data);
        }
    },

    slaveShown : function(event) {
        logger.out('info', '[GG] Slave:', 'Slave.Shown event received.', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    slaveAddEvents : function (config) {
        this.addEventsForPropagation(config);
    },

    masterEvent : function(event) {
        logger.out('info', '[GG] Slave.' +  this.slaveId + ':', 'Publish Master.Event event.', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    once : function(action, callback) {
        return pubSub.once(action, callback);
    },

    isSubscribed : function(action) {
        return pubSub.isSubscribed(action);
    },

    subscribe : function(action, callback) {
        return pubSub.subscribe(action, callback);
    },

    unsubscribe : function(action) {
        return pubSub.unsubscribe(action);
    },

    clearSubscriptions : function() {
        return pubSub.clearSubscriptions();
    },

    sendMessage : function(data, origin) {
        data.slaveId = this.slaveId;
        data.msgSender = 'Slave';
        slavePorthole.sendMessage(data, origin);
    },

    sendMessageAsync : function(data, origin, rejectDuration){
        var self = this,
            rejectTimeout = null,
            subscription;

        rejectDuration = rejectDuration || 0;

        return new Promise(function(resolve, reject) {
            data.asyncId = data.action + '_' + uuidv4();

            subscription = self.once(data.asyncId, function() {
                logger.out('info', '[GG] Slave.' +  self.slaveId + 'Promise resolved for event ' + data.action);
                clearTimeout(rejectTimeout);
                rejectTimeout = null;
                resolve();
            });

            if(rejectDuration) {
                rejectTimeout = setTimeout(function() {
                    logger.out('info', '[GG] Slave.' +  self.slaveId + 'Promise rejected for event ' + data.action);
                    subscription.remove();
                    reject();
                }, rejectDuration)
            }

            self.sendMessage(data, origin);
        });
    }
};

//Add aliases
slaveGateway.on = slaveGateway.subscribe;
slaveGateway.off = slaveGateway.unsubscribe;
slaveGateway.emit = slaveGateway.sendMessage;
slaveGateway.emitAsync = slaveGateway.sendMessageAsync;

module.exports = function(config) {
    if(config && config.debug === true) {
        logger.debug = true;
    }

    if(!slaveGateway.initialized && validateInitialization(config)) {
        slaveGateway.init(config);
        return slaveGateway;
    } else if(slaveGateway.initialized) {
        return slaveGateway;
    } else {
        return false;
    }
};