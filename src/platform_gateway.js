var platform = require('./messaging/platform'),
    PubSub = require('./pub_sub');

// Gateway must be singleton
var PlatformGateway = (function() {

    var instantiated = false;

    function Gateway() {
        this.pubSub = new PubSub();
        this.groupId = 'default';
        this.msgOrigin = 'platform';

        window.addEventListener('message', function (data) {
            if(data.origin !== this.msgOrigin) {
                this.pubSub.publish(data);
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
        data.origin = this.msgOrigin;
        platform.sendMessage(productFrame, data, origin);
    };

    return {
        getInstance : function() {
            if(!instantiated) {
                instantiated = true;
                return new Gateway();
            } else {
                return false;
            }
        }
    };

})();

module.exports = PlatformGateway;