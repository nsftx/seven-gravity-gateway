var slavePorthole = require('./messaging/slave'),
    pubSub = require('./pub_sub'),
    contentHandler = require('./content_handler/slave_handler'),
    logger = require('./utils/utils').logger,
    eventHandler = require('./event_dispatching/event_handler');

function validateInitialization(config) {
    if(!config.productId || typeof config.productId !== 'string') {
        logger.out('error', '[GG] Slave:', 'productId property is invalid or missing');
        return false;
    } else if(!config.data || typeof config.data !== 'object') {
        logger.out('error', '[GG] Slave.' + config.productId + ':', 'data property is invalid or missing');
        return false;
    } else if(!config.load || typeof config.load !== 'function') {
        logger.out('error', '[GG] Slave.' + config.productId + ':', 'load property is invalid or missing');
        return false;
    } else {
        logger.out('info', '[GG] Slave.' + config.productId + ':', 'Initializing');
        return true;
    }
}

var slaveGateway = {

    productId : '',

    config : null,

    initialized : false,

    load : null,

    worker : null,

    msgSender : 'Slave',

    init: function(config){
        this.initialized = true;
        this.config = config;
        this.productId = config.productId;
        this.load = config.load;
        this.setAllowedDomains();
        //Set message handler
        window.addEventListener('message', this.handleMessage.bind(this));
        //Pass the event callback, and event name
        contentHandler.init(this.sendMessage.bind(this), 'Slave.Resize');
        //Pass the key propagation config object, event callback, event name
        if(this.config.eventPropagation) {
            eventHandler(this.config.eventPropagation, this.sendMessage.bind(this), 'Slave.Event');
        }
        if(this.config.worker) {
            this.setWorker();
        }
        this.startProductInitialization();
    },
    
    setAllowedDomains : function() {
        if(this.config && this.config.allowedOrigins) {
            this.allowedOrigins = this.config.allowedOrigins;
        } else {
            this.allowedOrigins = '*';
        }
    },

    startProductInitialization : function() {
        this.sendMessage({
            action: 'Slave.Init',
            data: this.config.data,
            eventPropagation : this.config.eventPropagation,
            eventListeners : this.config.eventListeners
        });
    },

    handleMessage : function(event) {
        if(!event.data.msgSender || event.data.msgSender === this.msgSender) return false;

        var productPattern,
            platformPattern;

        if(this.allowedOrigins !== '*' && this.allowedOrigins.indexOf(event.origin) === -1) {
            logger.out('error', '[GG] Slave.' +  this.productId + ':' + ' Message origin is not allowed');
            return false;
        }

        productPattern = new RegExp('^Slave\\.', 'g');
        platformPattern = new RegExp('^Master\\.', 'g');
        // Check if message is reserved system message (Master and Slave messages)
        if(productPattern.test(event.data.action) || platformPattern.test(event.data.action)) {
            this.handleProtectedMessage(event);
            return false;
        }

        logger.out('info', '[GG] Slave.' +  this.productId + ':' + ' Master message received:', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    handleProtectedMessage : function(event) {
        var actionName = event.data.action.replace('.', '');
        //Lowercase the first letter
        actionName = actionName.charAt(0).toLowerCase() + actionName.slice(1);

        if (this[actionName]) {
            this[actionName](event);
        } else {
            logger.out('warn', '[GG] Slave.' +  this.productId + ':', 'Actions with domain `Master` or `Slave` are protected!');
        }
    },

    setWorker: function(){
        var msgBlacklist = ['Slave.Resize'],
            self = this;

        if(this.config.worker instanceof Worker) {
            this.worker = this.config.worker;
        } else if (typeof this.config.worker === 'string') {
            this.worker = new Worker(this.config.worker);
        } else {
            logger.out('error', '[GG] Slave.' +  this.productId + ':', 'Web worker initialization failed. Provide instance of Worker or path to file');
            return false;
        }

        logger.out('info', '[GG] Slave.' +  this.productId + ':', 'Web worker initialized.');

        // Set worker message proxy
        this.worker.addEventListener('message', function (event) {
            if (event.data && event.data.action) {
                if (event.data.action === 'Slave.Loaded') {
                    logger.out('info', '[GG] Slave redirecting message from worker to master =>', event.data);
                    self.sendMessage({
                        action: 'Slave.Loaded',
                        data: event.data.data
                    });
                } else {
                    logger.out('info', '[GG] Slave redirecting message from worker to slave =>', event.data);
                    pubSub.publish(event.data.action, event.data);
                }
            }
        });

        slavePorthole.setWorker(this.worker, msgBlacklist);
    },

    slaveLoad : function(event) {
        logger.out('info', '[GG] Slave.' +  this.productId + ':', 'Starting to load.');
        this.load(event.data);
    },

    masterEvent : function(event) {
        logger.out('info', '[GG] Slave.' +  this.productId + ':', 'Publish Master.Event event.', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    subscribe : function(action, callback) {
        pubSub.subscribe(action, callback);
    },

    unsubscribe : function(action) {
        pubSub.unsubscribe(action);
    },

    clearSubscriptions : function() {
        pubSub.clearSubscriptions();
    },

    sendMessage : function(data, origin) {
        data.productId = this.productId;
        data.msgSender = 'Slave';
        slavePorthole.sendMessage(data, origin);
    }
};

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