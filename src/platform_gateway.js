var platform = require('./messaging/platform'),
    pubSub = require('./pub_sub'),
    contentHandler = require('./content_handler/platform_handler'),
    productPattern = new RegExp('^Product\\.', 'g'),
    platformPattern = new RegExp('^Platform\\.', 'g');

var platformGateway = {

    initialized : false,

    products : {},

    config : null,

    allowedOrigins : null,

    infiniteScroll : false,

    setAllowedDomains : function() {
        if(this.config && this.config.allowedOrigins) {
            this.allowedOrigins = this.config.allowedOrigins;
        } else {
            this.allowedOrigins = '*';
        }
    },

    setProductsConfigs : function () {
        if(this.config && this.config.products) {
            this.products = this.config.products;
        }
    },

    init: function(config) {
        this.config = config;
        this.setAllowedDomains();
        this.setProductsConfigs();
        
        //Set message handler
        window.addEventListener('message', this.handleMessage.bind(this));
    },

    handleMessage : function(event) {
        // Check if message is reserved system message (Product and Platfrom messages)
        if(event.data && (productPattern.test(event.data.action) || platformPattern.test(event.data.action))) {
            this.handleProtectedMessage(event);
            return false;
        }
        
        // For Chrome, the origin property is in the event.originalEvent object.
        var origin = event.origin || event.originalEvent.origin;
        
        if(this.allowedOrigins !== '*' && this.allowedOrigins.indexOf(origin) === -1) {
            return false;
        }

        pubSub.publish(event.data);
    },

    handleProtectedMessage : function(event) {
        if(!this.products[event.data.productId]) {
            return false;
        }
        var productData = this.products[event.data.productId],
            productFrame = document.getElementById(productData.frameId);

        if(event.data.action === 'Product.Init') {
            // Run the product init callback
            productData.productInitCallback(event.data.initData);
            // Notify product to load
            productData.data.action = 'Product.Load';
            this.sendMessage(productFrame, this.products[event.data.productId].data);
        } else if(event.data.action === 'Product.Resize') {
            // Resize product
            contentHandler.resize(productData.frameId, event);
        } else if(event.data.action === 'Product.Loaded') {
            // Call registered callback when product is loaded (e.g. - remove loader)
            productData.productLoadedCallback(event.data.initData);
        } else {
            console.log('Error - Actions with domain `Product` or `Platfrom` are protected');
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

    sendMessage : function(productFrame, data, origin) {
        platform.sendMessage(productFrame, data, origin);
    }
};

/**
 * Gateway is singleton 
 * If it is already initialized return the Gateway otherwise return false
 */
module.exports = function(config) {
    if(!platformGateway.initialized && config) {
        platformGateway.init(config);
        platformGateway.initialized = true;

        return platformGateway;
    } else if(platformGateway.initialized && !config) {

        return platformGateway;
    } else {

        return false;
    }
};