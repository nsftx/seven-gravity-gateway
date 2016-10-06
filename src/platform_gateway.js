var platform = require('./messaging/platform'),
    PubSub = require('./pub_sub');

var GatewayInstance;
    
function Gateway() {
    this.pubSub = new PubSub();
    this.groupId = 'default';
    this.msgOrigin = 'platform';

    window.addEventListener('message', function (event) {
        if(event.data.msgOrigin !== this.msgOrigin) {
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

Gateway.prototype.sendMessage = function(productFrame, data, origin) {
    //Attach sender origin to data
    data.msgOrigin = this.msgOrigin;
    platform.sendMessage(productFrame, data, origin);
};

module.exports = function() {
    // Gateway must be singleton
    return GatewayInstance ? GatewayInstance : GatewayInstance = new Gateway();
};