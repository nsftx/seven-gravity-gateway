var platform = require('./messaging/platform'),
    pubSub = require('./pub_sub'),
    contentHandler = require('./content_handler/platform_handler'),
    logger = require('./utils/logger');

function validateProductsConfig(products) {
    var productValidity = true;

    for(var game in products) {
        if(!products[game].frameId || typeof products[game].frameId !== 'string' ) {
            logger.out('error', '[G] Platform:', 'frameId property is invalid or missing for game ' + game);
            productValidity = false;
        } else if(!products[game].data || typeof products[game].data !== 'object' ) {
            logger.out('error', '[G] Platform:', 'data property is invalid or missing for game ' + game);
            productValidity = false;
        } else if (!products[game].init || typeof products[game].init !== 'function' ) {
            logger.out('error', '[G] Platform:', 'init property is invalid or missing for game ' + game);
            productValidity = false;
        }
    }

    return productValidity;
}

function validateInitialization(config) {
    if(!config.products || typeof config.products !== 'object') {
        logger.out('error', '[G] Platform:', 'products object is invalid or missing');
        return false;
    } else if(!validateProductsConfig(config.products)) {
        return false;
    } else {
        logger.out('info', '[G] Platform:', 'Initializing');
        return true;
    }
}

var platformGateway = {

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

    enableScrollMsg : function(productFrameId) {
        window.addEventListener('scroll', function() {
            this.sendMessage(productFrameId, {
                action : 'Product.Scroll',
                data : contentHandler.getViewData(productFrameId)
            });
        }.bind(this));
    },

    checkProductScroll : function() {
        // Check if scroll message is enabled
        for(var game in  this.products) {
            if(this.products[game].scroll) {
                this.enableScrollMsg(this.products[game].frameId);
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
        var productPattern = new RegExp('^Product\\.', 'g'),
            platformPattern = new RegExp('^Platform\\.', 'g');

        // Check if message is reserved system message (Product and Platform messages)
        if(productPattern.test(event.data.action) || platformPattern.test(event.data.action)) {
            this.handleProtectedMessage(event);
            return false;
        }

        if(this.allowedOrigins !== '*' && this.allowedOrigins.indexOf(event.origin) === -1) {
            logger.out('error', '[G] Platform: Message origin is not allowed');
            return false;
        }

        logger.out('info', '[G] Platform - Product message received:', event.data);
        pubSub.publish(event.data);
    },

    handleProtectedMessage : function(event) {
        if(!this.products[event.data.productId]) {
            return false;
        }
        var productData = this.products[event.data.productId];

        if(event.data.action === 'Product.Init') {
            logger.out('info', '[G] Platform:', 'Starting to load product.', event.data);
            contentHandler.resetFrameSize(productData.frameId); //On every init reset the frame size
            productData.init(event.data.data); // Run the product init callback and notify product to load
            productData.data.action = 'Product.Load';
            this.sendMessage(productData.frameId, productData.data);
        } else if(event.data.action === 'Product.Resize') {
            logger.out('info', '[G] Platform:', 'Resizing product.', event.data);
            contentHandler.resize(productData.frameId, event);
        } else if(event.data.action === 'Product.Loaded') {
            if(productData.loaded) {
                logger.out('info', '[G] Platform:', 'Product loaded.', event.data);
                productData.loaded();
            }
        } else {
            logger.out('warn', '[G] Product:', 'Actions with domain `Product` or `Platform` are protected!');
        }
    },

    subscribe : function(data) {
        pubSub.subscribe(data);
    },

    unsubscribe : function(data) {
        pubSub.unsubscribe(data);
    },

    clearSubscriptions : function() {
        pubSub.clearSubscriptions();
    },

    sendMessage : function(productFrameId, data, origin) {
        var productFrame = document.getElementById(productFrameId);
        if(!productFrame) {
            return false;
        }

        platform.sendMessage(productFrame, data, origin);
    }
};

/**
 * Gateway is singleton 
 * If it is already initialized return the Gateway otherwise return false
 */
module.exports = function(config) {
    if(config && config.debugMode === true) {
        logger.debugMode = true;
    }

    if(!platformGateway.initialized && validateInitialization(config)) {
        platformGateway.init(config);
        return platformGateway;
    } else if(platformGateway.initialized) {
        return platformGateway;
    } else {
        return false;
    }
};