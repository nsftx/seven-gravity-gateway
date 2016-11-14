var slaveMessages = require('./messaging/slave'),
    pubSub = require('./pub_sub'),
    contentHandler = require('./content_handler/slave_handler'),
    logger = require('./utils/logger');

function validateInitialization(config) {
    if(!config.productId || typeof config.productId !== 'string') {
        logger.out('error', '[GW] Slave:', 'productId property is invalid or missing');
        return false;
    } else if(!config.data || typeof config.data !== 'object') {
        logger.out('error', '[GW] Slave:', 'data property is invalid or missing');
        return false;
    } else if(!config.load || typeof config.load !== 'function') {
        logger.out('error', '[GW] Slave:', 'load property is invalid or missing');
        return false;
    } else {
        logger.out('info', '[GW] Slave:', 'Initializing');
        return true;
    }
}

var slaveGateway = {

    productId : '',

    config : null,

    initialized : false,

    load : null,

    setAllowedDomains : function() {
        if(this.config && this.config.allowedOrigins) {
            this.allowedOrigins = this.config.allowedOrigins;
        } else {
            this.allowedOrigins = '*';
        }
    },

    init: function(config){
        this.initialized = true;
        this.config = config;
        this.productId = config.productId;
        this.load = config.load;
        this.setAllowedDomains();
        //Pass the event callback, and event name
        contentHandler.init(this.sendMessage.bind(this), 'Slave.Resize');
        //Set message handler
        window.addEventListener('message', this.handleMessage.bind(this));
        //Notify platform that product is evaluated and pass the necessary init data
        this.startProductInitialization();
    },

    handleMessage : function(event) {
        var productPattern = new RegExp('^Slave\\.', 'g'),
            platformPattern = new RegExp('^Master\\.', 'g');

        // Check if message is reserved system message (Product and Platfrom messages)
        if(productPattern.test(event.data.action) || platformPattern.test(event.data.action)) {
            this.handleProtectedMessage(event);
            return false;
        }

        if(this.allowedOrigins !== '*' && this.allowedOrigins.indexOf(event.origin) === -1) {
            logger.out('error', '[GW] Slave: Message origin is not allowed');
            return false;
        }

        logger.out('info', '[G"] Slave: Master message received:', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    startProductInitialization : function() {
        this.sendMessage({
            action: 'Slave.Init',
            data: this.config.data
        });
    },

    handleProtectedMessage : function(event) {
        if(event.data.action === 'Slave.Load') {
            logger.out('info', '[GW] Slave:', 'Starting to load.');
            this.load(event.data);
        } else if (event.data.action === 'Master.Scroll') {
            logger.out('info', '[GW] Slave:', 'Publish Master.Scroll event.', event.data);
            pubSub.publish(event.data.action, event.data);
        } else {
            logger.out('warn', '[GW] Slave:', 'Actions with domain `Master` or `Slave` are protected!');
        }
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

        slaveMessages.sendMessage(data, origin);
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