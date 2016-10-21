var product = require('./messaging/product'),
    pubSub = require('./pub_sub'),
    contentHandler = require('./content_handler/product_handler'),
    productPattern = new RegExp('^Product\\.', 'g'),
    platformPattern = new RegExp('^Platform\\.', 'g');

var productGateway = {

    groupId : '',

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
        this.config = config;
        this.groupId = config.groupId;
        this.loadCallback = config.loadCallback;
        this.setAllowedDomains();
        
        //Pass the event callback, and event name
        contentHandler.init(this.sendMessage.bind(this), 'Product.Resize');
        
        //Set message handler
        window.addEventListener('message', this.handleMessage.bind(this));
        
        //Notify platform that product is evaluated
        this.sendMessage({action: 'Product.Init'});
    },

    handleMessage : function(event) {
        // Check if message is reserved system message (Product and Platfrom messages)
        if(event.data && (productPattern.test(event.data.action) || platformPattern.test(event.data.action))) {
            this.handleNamespaceMessage(event);
            return false;
        }
        // For Chrome, the origin property is in the event.originalEvent object.
        var origin = event.origin || event.originalEvent.origin;

        if(this.allowedOrigins !== '*' && this.allowedOrigins.indexOf(origin) === -1) {
            return false;
        }

        pubSub.publish(event.data);
    },

    handleNamespaceMessage : function(event) {
        if(event.data.action === 'Product.Load') {
            this.loadCallback(event.data);
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

    sendMessage : function(data, origin) {
        data.groupId = this.groupId;

        product.sendMessage(data, origin);
    }
};


/**
 * Gateway is singleton
 * If it is already initialized return the Gateway otherwise return false
 */
module.exports = function(config) {
    if(!productGateway.initialized && config) {
        productGateway.init(config);
        productGateway.initialized = true;

        return productGateway;
    } else if(productGateway.initialized && !config) {

        return productGateway;
    } else {

        return false;
    }
};