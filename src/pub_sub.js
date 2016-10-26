var logger = require('./utils/logger');

var pubSub = {

    topics : {},

    subscribe : function(data) {
        if(data.action && typeof data.callback === 'function') {
            this.topics[data.action] = data.callback;
            return true;
        } else {
            logger.out('error', 'Subscribe failed - action property is invalid or missing.');
            return false;
        }
    },

    unsubscribe : function(data) {
        if (!this.topics[data.action]) {
            logger.out('error', 'Unsubscribe failed - topic ' + data.action + ' doesn´t exist');
            return false;
        } else {
            delete this.topics[data.action];
            return true;
        }
    },


    publish : function(data) {
        var topicAction = this.checkNamespaceActions(data.action);

        if(!Boolean(topicAction)) {
            logger.out('error', 'Publish failed - topic ' + data.action + ' doesn´t exist');
            return false;
        } else {
            topicAction(data);
            return true;
        }

    },

    clearSubscriptions : function() {
        this.topics = {};
    },

    checkNamespaceActions : function(action) {
        var found = this.topics.hasOwnProperty(action),
            domainSeparator = action.lastIndexOf('.');

        while(!found && domainSeparator !== -1) {
            action = action.substr(0, domainSeparator);
            domainSeparator = action.lastIndexOf('.');
            found = this.topics.hasOwnProperty(action);
        }

        if(found) {
            return this.topics[action];
        } else {
            return false;
        }
    }
};

module.exports = pubSub;