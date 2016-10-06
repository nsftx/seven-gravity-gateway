var platform = require('./messaging/platform'),
    PubSub = require('./pub_sub');

var GatewayInstance;
    
function Gateway(config) {
    this.pubSub = new PubSub();
    this.groupId = 'default';
    this.msgOrigin = 'platform';
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

        // Listen only to non-platform messages
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

module.exports = function(config) {
    // Gateway must be singleton
    return GatewayInstance ? GatewayInstance : GatewayInstance = new Gateway(config);
};