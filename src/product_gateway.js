var product = require('./messaging/product'),
    PubSub = require('./pub_sub');

function ProductGateway(groupId) {
    this.pubSub = new PubSub(groupId);

    window.addEventListener('message', function (data) {
        this.pubSub.publish(data);
    }.bind(this));
}

ProductGateway.prototype.subscribe = function(data) {
    this.pubSub.subscribe(data);
};

ProductGateway.prototype.unsubscribe = function(data) {
    this.pubSub.unsubscribe(data);
};

ProductGateway.prototype.clearSubscriptions = function() {
    this.pubSub.clearSubscriptions();
};

ProductGateway.prototype.sendMessage = function(data, origin) {
    product.sendMessage(data, origin);
};

module.exports = ProductGateway;