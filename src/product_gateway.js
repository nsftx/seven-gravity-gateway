var product = require('./messaging/product'),
    PubSub = require('./pub_sub');

// Gateway must be singleton
var ProductGateway = (function(){

    var instances = {};

    function Gateway(groupId) {
        this.pubSub = new PubSub(groupId);
        this.groupId = groupId;
        this.msgOrigin = 'product';

        window.addEventListener('message', function (data) {
            if(data.groupId === this.groupId && data.origin !== this.msgOrigin) {
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

    Gateway.prototype.sendMessage = function(data, origin) {
        //Attach origin and id of group
        data.origin = this.msgOrigin;
        data.groupId = this.groupId;

        product.sendMessage(data, origin);
    };

    return {
        getInstance : function(groupId) {
            if(!instances[groupId] && groupId) {
                instances[groupId] = true;
                return new Gateway(groupId);
            } else {
                return false;
            }
        }
    };
})();

module.exports = ProductGateway;