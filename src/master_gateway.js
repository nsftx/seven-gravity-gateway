var masterPorthole = require('./messaging/master'),
    pubSub = require('./pub_sub'),
    contentHandler = require('./content_handler/master_handler'),
    logger = require('./utils/utils').logger,
    throttle = require('./utils/utils').throttle,
    keyBindingsHandler = require('./key_bindings/event_handler');

function validateProductsConfig(products) {
    var configValid = true;

    for (var slave in products) {
        if (!products[slave].frameId || typeof products[slave].frameId !== 'string') {
            logger.out('error', '[GG] Master:', 'frameId property is invalid or missing for ' + slave);
            configValid = false;
        } else if (!products[slave].data || typeof products[slave].data !== 'object') {
            logger.out('error', '[GG] Master:', 'data property is invalid or missing for ' + slave);
            configValid = false;
        }
    }

    return configValid;
}

function validateInitialization(config) {
    if (!config.products || typeof config.products !== 'object') {
        logger.out('error', '[GG] Master:', 'products object is invalid or missing');
        return false;
    } else if (!validateProductsConfig(config.products)) {
        return false;
    } else {
        logger.out('info', '[GG] Master:', 'Initializing');
        return true;
    }
}

var masterGateway = {

    initialized: false,

    products: {},

    config: null,

    allowedOrigins: null,

    msgSender: 'Master',

    init: function (config) {
        this.initialized = true;
        this.config = config;
        this.products = config.products;
        this.setAllowedDomains();
        this.checkProductScroll();
        //Set message handler
        window.addEventListener('message', this.handleMessage.bind(this));
    },

    setAllowedDomains: function () {
        if (this.config && this.config.allowedOrigins) {
            this.allowedOrigins = this.config.allowedOrigins;
        } else {
            this.allowedOrigins = '*';
        }
    },

    checkProductScroll: function () {
        // Check if scroll message is enabled
        for (var slave in  this.products) {
            if (this.products[slave].scroll) {
                this.enableScrollMsg(this.products[slave].frameId);
            }
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
        if (!this.products[event.data.productId]) {
            return false;
        }
        var productData = this.products[event.data.productId],
            actionName = event.data.action.replace('.', '');
        //Lowercase the first letter
        actionName = actionName.charAt(0).toLowerCase() + actionName.slice(1);
        if (this[actionName]) {
            this[actionName](event, productData);
        } else {
            logger.out('warn', '[GG] Master:', 'Actions with domain `Master` or `Slave` are protected!');
        }
    },

    slaveInit : function(event, productData) {
        logger.out('info', '[GG] Master:', 'Starting to load slave.', event.data);
        //On every init reset the frame size
        contentHandler.resetFrameSize(productData.frameId);
        // Run the slave init callback and notify slave to load
        if (productData.init) {
            productData.init(event.data);
        }
        // Propagate events to Slave
        if(event.data.keyListeners) {
            //Curry the sendMessage function with frameId argument in this special case
            keyBindingsHandler(event.data.keyListeners, this.sendMessage.bind(this, productData.frameId), 'Master.Event');
        }
        productData.data.action = 'Slave.Load';
        this.sendMessage(productData.frameId, productData.data);
    },

    slaveResize : function(event, productData) {
        logger.out('info', '[GG] Master:', 'Resizing slave.', event.data);
        contentHandler.resize(productData.frameId, event);
    },

    slaveLoaded : function(event, productData) {
        if (!productData.loaded) {
            return false;
        }
        logger.out('info', '[GG] Master:', 'Slave loaded.', event.data);
        productData.loaded(event.data);
    },

    slaveEvent : function(event) {
        logger.out('info', '[GG] Master:', 'Slave.Event event received.', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    enableScrollMsg: function (frameId) {

        window.addEventListener('scroll', throttle(function () {
            this.sendMessage(frameId, {
                action: 'Master.Scroll',
                data: contentHandler.getViewData(frameId)
            });
        }.bind(this), 100));

    },

    subscribe: function (action, callback) {
        pubSub.subscribe(action, callback);
    },

    unsubscribe: function (action) {
        pubSub.unsubscribe(action);
    },

    clearSubscriptions: function () {
        pubSub.clearSubscriptions();
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