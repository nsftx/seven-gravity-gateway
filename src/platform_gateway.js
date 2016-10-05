var platform = require('./messaging/platform'),
    PubSub = require('./pub_sub');

function PlatformGateway() {
    this.pubSub = new PubSub();
    this.groupId = 'default';
    this.msgOrigin = 'platform';

    window.addEventListener('message', function (data) {
        if(data.origin != this.msgOrigin) {
            this.pubSub.publish(data);
        }
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
    //Attach sender origin to data
    data.origin = this.msgOrigin;
    platform.sendMessage(productFrame, data, origin);
};

module.exports = PlatformGateway;