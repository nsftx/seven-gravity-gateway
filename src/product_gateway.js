var product = require('./messaging/product'),
    PubSub = require('./pub_sub');

// Gateway must be singleton per product
// Because multiple products can include gateways in sam JS scope

var GatewayInstances = {};

function Gateway(config) {
    this.pubSub = new PubSub();
    this.groupId = config.groupId;
    this.msgOrigin = 'product';

    if(config && config.allowedOrigins) {
        this.allowedOrigins = config.allowedOrigins;
    } else {
        this.allowedOrigins = '*';
    }

    window.addEventListener('message', function (event) {
        // For Chrome, the origin property is in the event.originalEvent object.
        var origin = event.origin || event.originalEvent.origin;

        if(this.allowedOrigins != '*' && this.allowedOrigins.indexOf(origin) == -1) {
            return false;
        }

        // Listen only to platform messages and messages intended to specific groupId
        if(event.data.groupId === this.groupId && event.data.msgOrigin !== this.msgOrigin) {
            this.pubSub.publish(event.data);
        }
    }.bind(this));
}

Gateway.prototype.subscribe = function(data) {
    this.pubSub.subscribe(data);
};

Gateway.prototype.unsubscribe = function(data) {
    this.pubSub.unsubscribe(data);
};

Gateway.prototype.clearSubscriptions = function() {
    this.pubSub.clearSubscriptions();
};

Gateway.prototype.sendMessage = function(data, origin) {
    //Attach origin and id of group
    data.msgOrigin = this.msgOrigin;
    data.groupId = this.groupId;

    product.sendMessage(data, origin);
};


module.exports = function(config) {
    if(!config || !config.groupId) {
        return false;
    }

    return GatewayInstances[config.groupId] ? GatewayInstances[config.groupId] :
                                              GatewayInstances[config.groupId] = new Gateway(config.groupId);
};