var product = require('./messaging/product'),
    pubSub = require('./pub_sub');

var productGateway = {

    groupId : '',

    initialized : false,

    init: function(config){
        if(config && config.allowedOrigins) {
            this.allowedOrigins = config.allowedOrigins;
        } else {
            this.allowedOrigins = '*';
        }

        window.addEventListener('message', this.handleMessage);
    },

    handleMessage : function(event) {
        // For Chrome, the origin property is in the event.originalEvent object.
        var origin = event.origin || event.originalEvent.origin;

        if(this.allowedOrigins !== '*' && this.allowedOrigins.indexOf(origin) === -1) {
            return false;
        }

        pubSub.publish(event.data);
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

module.exports = function(config) {

    if(!productGateway.initialized) {
        productGateway.init(config);
        productGateway.initialized = true;
    }

    return productGateway;
};