var product = require('./messaging/product'),
    pubSub = require('./pub_sub'),
    contentHandler = require('./content_handler/product_handler'),
    logger = require('./utils/logger'),
    productPattern = new RegExp('^Product\\.', 'g'),
    platformPattern = new RegExp('^Platform\\.', 'g');

function validateInitialization(config) {
    if(!config.productId || typeof config.productId !== 'string') {
        logger.out('error', '[G] Product:', 'productId property is invalid or missing');
        return false;
    } else if(!config.initData || typeof config.initData !== 'object') {
        logger.out('error', '[G] Product:', 'initData property is invalid or missing');
        return false;
    } else if(!config.loadCallback || typeof config.loadCallback !== 'function') {
        logger.out('error', '[G] Product:', 'loadCallback property is invalid or missing');
        return false;
    } else {
        logger.out('info', '[G] Product:', 'Initializing');
        return true;
    }
}

var productGateway = {

    productId : '',

    config : null,

    initialized : false,

    loadCallback : null,

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
        this.loadCallback = config.loadCallback;
        if(config.infiniteScrollCallback && typeof config.infiniteScrollCallback === 'function') {
            this.infiniteScrollCallback = config.infiniteScrollCallback;
        }
        this.setAllowedDomains();
        //Pass the event callback, and event name
        contentHandler.init(this.sendMessage.bind(this), 'Product.Resize');
        //Set message handler
        window.addEventListener('message', this.handleMessage.bind(this));
        //Notify platform that product is evaluated and pass the necessary init data
        this.startProductInitialization();
    },

    handleMessage : function(event) {
        // Check if message is reserved system message (Product and Platfrom messages)
        if(event.data && (productPattern.test(event.data.action) || platformPattern.test(event.data.action))) {
            this.handleProtectedMessage(event);
            return false;
        }

        if(this.allowedOrigins !== '*' && this.allowedOrigins.indexOf(event.origin) === -1) {
            logger.out('error', '[G] Product: Message origin is not allowed');
            return false;
        }

        logger.out('info', '[G] Product - Platform message received:', event.data);
        pubSub.publish(event.data);
    },

    startProductInitialization : function() {
        this.sendMessage({
            action: 'Product.Init',
            data: this.config.initData
        });
    },

    handleProtectedMessage : function(event) {
        if(event.data.action === 'Product.Load') {
            logger.out('info', '[G] Product:', 'Starting to load.');
            this.loadCallback(event.data);
        } else if (event.data.action === 'Product.ScrollEnded') {
            if(this.infiniteScrollCallback) {
                logger.out('info', '[G] Product:', 'Trigger infinite scroll callback.', event.data);
                this.infiniteScrollCallback();
            }
        } else {
            logger.out('warn', '[G] Product:', 'Actions with domain `Product` or `Platfrom` are protected!');
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

    sendMessage : function(data, origin) {
        data.productId = this.productId;

        product.sendMessage(data, origin);
    }
};

module.exports = function(config) {
    if(config && config.debugMode === true) {
        logger.debugMode = true;
    }

    if(!productGateway.initialized && validateInitialization(config)) {
        productGateway.init(config);
        return productGateway;
    } else if(productGateway.initialized) {
        return productGateway;
    } else {
        return false;
    }
};