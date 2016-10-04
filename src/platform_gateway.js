var platform = require('./messaging/platform'),
    PubSub = require('./pub_sub');

function PlatformGateway(groupId) {
    this.pubSub = new PubSub(groupId);

    window.addEventListener('message', function (data) {
        this.pubSub.publish(data);
    }.bind(this));
}

PlatformGateway.prototype.subscribe = function(data) {
    this.pubSub.subscribe(data);
};

PlatformGateway.prototype.unsubscribe = function(data) {
    this.pubSub.unsubscribe(data);
};

PlatformGateway.prototype.clearSubscriptions = function() {
    this.pubSub.clearSubscriptions();
};

PlatformGateway.prototype.sendMessage = function(productFrame, data, origin) {
    platform.sendMessage(productFrame, data, origin);
};

module.exports = PlatformGateway;