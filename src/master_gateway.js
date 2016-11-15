var masterPorthole = require('./messaging/master'),
    pubSub = require('./pub_sub'),
    contentHandler = require('./content_handler/master_handler'),
    logger = require('./utils/utils').logger,
    throttle = require('./utils/utils').throttle;

function validateProductsConfig(products) {
    var configValid = true;

    for(var slave in products) {
        if(!products[slave].frameId || typeof products[slave].frameId !== 'string' ) {
            logger.out('error', '[GW] Master:', 'frameId property is invalid or missing for ' + slave);
            configValid = false;
        } else if(!products[slave].data || typeof products[slave].data !== 'object' ) {
            logger.out('error', '[GW] Master:', 'data property is invalid or missing for ' + slave);
            configValid = false;
        } else if (!products[slave].init || typeof products[slave].init !== 'function' ) {
            logger.out('error', '[GW] Master:', 'init property is invalid or missing for ' + slave);
            configValid = false;
        }
    }

    return configValid;
}

function validateInitialization(config) {
    if(!config.products || typeof config.products !== 'object') {
        logger.out('error', '[GW] Master:', 'products object is invalid or missing');
        return false;
    } else if(!validateProductsConfig(config.products)) {
        return false;
    } else {
        logger.out('info', '[GW] Master:', 'Initializing');
        return true;
    }
}

var masterGateway = {

    initialized : false,

    products : {},

    config : null,

    allowedOrigins : null,

    setAllowedDomains : function() {
        if(this.config && this.config.allowedOrigins) {
            this.allowedOrigins = this.config.allowedOrigins;
        } else {
            this.allowedOrigins = '*';
        }
    },

    enableScrollMsg : function(frameId) {

        window.addEventListener('scroll', throttle(function(){
            this.sendMessage(frameId, {
                action : 'Master.Scroll',
                data : contentHandler.getViewData(frameId)
            });
        }.bind(this), 100));

    },

    checkProductScroll : function() {
        // Check if scroll message is enabled
        for(var slave in  this.products) {
            if(this.products[slave].scroll) {
                this.enableScrollMsg(this.products[slave].frameId);
            }
        }
    },

    init: function(config) {
        this.initialized = true;
        this.config = config;
        this.products = config.products;
        this.setAllowedDomains();
        this.checkProductScroll();
        //Set message handler
        window.addEventListener('message', this.handleMessage.bind(this));
    },

    handleMessage : function(event) {
        var masterPattern = new RegExp('^Master\\.', 'g'),
            slavePattern = new RegExp('^Slave\\.', 'g');

        // Check if message is reserved system message (Master and Slave messages)
        if(slavePattern.test(event.data.action) || masterPattern.test(event.data.action)) {
            this.handleProtectedMessage(event);
            return false;
        }

        if(this.allowedOrigins !== '*' && this.allowedOrigins.indexOf(event.origin) === -1) {
            logger.out('error', '[GW] Master: Message origin is not allowed');
            return false;
        }

        logger.out('info', '[GW] Master: Slave message received:', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    handleProtectedMessage : function(event) {
        if(!this.products[event.data.productId]) {
            return false;
        }
        var productData = this.products[event.data.productId];

        if(event.data.action === 'Slave.Init') {
            logger.out('info', '[GW] Master:', 'Starting to load slave.', event.data);
            contentHandler.resetFrameSize(productData.frameId); //On every init reset the frame size
            productData.init(event.data); // Run the slave init callback and notify slave to load
            productData.data.action = 'Slave.Load';
            this.sendMessage(productData.frameId, productData.data);
        } else if(event.data.action === 'Slave.Resize') {
            logger.out('info', '[GW] Master:', 'Resizing slave.', event.data);
            contentHandler.resize(productData.frameId, event);
        } else if(event.data.action === 'Slave.Loaded') {
            if(productData.loaded) {
                logger.out('info', '[GW] Master:', 'Slave loaded.', event.data);
                productData.loaded(event.data);
            }
        } else {
            logger.out('warn', '[GW] Master:', 'Actions with domain `Master` or `Slave` are protected!');
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

    sendMessage : function(frameId, data, origin) {
        var frame = document.getElementById(frameId);
        if(!frame) {
            return false;
        }

        masterPorthole.sendMessage(frame, data, origin);
    }
};

/**
 * Gateway is singleton 
 * If it is already initialized return the Gateway otherwise return false
 */
module.exports = function(config) {
    if(config && config.debug === true) {
        logger.debug = true;
    }

    if(!masterGateway.initialized && validateInitialization(config)) {
        masterGateway.init(config);
        return masterGateway;
    } else if(masterGateway.initialized) {
        return masterGateway;
    } else {
        return false;
    }
};