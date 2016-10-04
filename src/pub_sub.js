function PubSub(groupId) {
    this.groupId = groupId;
    this.topics = {};
}

PubSub.prototype.checkNamespaceActions = function(action) {
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
};

PubSub.prototype.subscribe = function(data) {
    if(data.action && typeof data.callback === 'function') {
        this.topics[data.action] = data.callback;
        return true;
    } else {
        return false;
    }
};

PubSub.prototype.unsubscribe = function(data) {
    if(!this.topics[data.action]) {
        return false;
    } else {
        delete this.topics[data.action];
        return true;
    }
};

PubSub.prototype.publish = function(data) {
    var topicAction = this.checkNamespaceActions(data.action);

    if(!Boolean(topicAction) || this.groupId !== data.groupId) {
        return false;
    } else {
        topicAction(data);
        return true;
    }

};

PubSub.prototype.clearSubscriptions = function() {
    this.topics = {};
};

module.exports = PubSub;