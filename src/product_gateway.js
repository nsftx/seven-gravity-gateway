var product = require('./messaging/product'),
    PubSub = require('./pub_sub');

function ProductGateway(groupId) {
    this.pubSub = new PubSub(groupId);
    this.groupId = groupId;
    this.msgOrigin = 'product';
    
    window.addEventListener('message', function (data) {
        if(data.groupId == this.groupId && data.origin != this.msgOrigin) {
            this.pubSub.publish(data);
        }
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
    //Attach origin and id of group
    data.origin = this.msgOrigin;
    data.groupId = this.groupId;

    product.sendMessage(data, origin);
};

module.exports = ProductGateway;