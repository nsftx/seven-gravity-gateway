var product = require('./messaging/product'),
    PubSub = require('./pub_sub');

// Gateway must be singleton per product
// Because multiple products can include gateways in sam JS scope

var GatewayInstances = {};

function Gateway(groupId) {
    this.pubSub = new PubSub(groupId);
    this.groupId = groupId;
    this.msgOrigin = 'product';

    window.addEventListener('message', function (event) {
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


module.exports = function(groupId) {
    if(!groupId) {
        return false;
    }

    return GatewayInstances[groupId] ? GatewayInstances[groupId] : GatewayInstances[groupId] = new Gateway(groupId);
};