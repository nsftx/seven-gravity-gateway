var logger = require('./utils/utils').logger;

var pubSub = {

    topics : {},

    subscribe : function(action, callback) {
        var self = this,
            index;

        if(action && typeof callback === 'function') {
            if(!this.topics[action]) {
                //Create array of actions for first time subscription
                this.topics[action] = [];
            }
            index = this.topics[action].push(callback) - 1;

            //Return remove to un subscribe from single subscription
            return {
                remove: function() {
                    self.topics[action].splice(index, 1);
                }
            };
        } else {
            logger.out('error', 'Subscribe failed - action property is invalid or missing.');
            return false;
        }
    },

    once : function(action, callback) {
        var subscription = false;
        if(typeof callback === 'function') {
            subscription = this.subscribe(action, function(response) {
                callback(response);
                subscription.remove();
            });
        }
        return subscription;
    },

    unsubscribe : function(action) {
        if (!this.topics[action]) {
            logger.out('error', 'Unsubscribe failed - topic ' + action + ' doesn´t exist');
            return false;
        } else {
            delete this.topics[action];
            return true;
        }
    },

    publish : function(action, data) {
        var topicAction = this.findAction(action),
            returnData = false;

        if(!topicAction) {
            logger.out('error', 'Publish failed - topic ' + action + ' doesn´t exist');
            return false;
        } else {
            topicAction.forEach(function(callback) {
                returnData = callback(data !== undefined ? data : {});
            });
        }

        if(returnData) return returnData;
    },

    clearSubscriptions : function() {
        this.topics = {};
    },

    findAction : function(actionName) {
        var actionFound = this.topics.hasOwnProperty(actionName);

        if(actionFound) {
            return this.topics[actionName];
        } else if (actionName !== '*') {
            return this.checkWildcardActions(actionName);
        } else {
            return false;
        }
    },

    isSubscribed : function(actionName) {
        return !!(this.topics.hasOwnProperty(actionName) && this.topics[actionName].length);
    },

    checkWildcardActions : function(actionName) {
        var pattern,
            newAction,
            namespaceArr = actionName.split('.');

        namespaceArr.pop();

        if(namespaceArr.length > 0) {
            newAction = namespaceArr.join('.');
            for (var topicName in this.topics) {
                pattern = new RegExp('^' + newAction + '\\.\\*$', 'g');
                if(pattern.test(topicName)){
                    return this.topics[topicName];
                }
            }

            return this.checkWildcardActions(newAction);
        } else {
            return this.findAction('*');
        }
    }
};

//Add aliases
pubSub.on = pubSub.subscribe;
pubSub.off = pubSub.unsubscribe;

module.exports = pubSub;