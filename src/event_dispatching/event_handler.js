var logger = require('../utils/utils').logger;

function EventHandler(config, eventCb, eventName) {
    this.MODIFIER_KEYS = {
        shiftKey : ['Shift', 16],
        ctrlKey : ['Ctrl', 17],
        altKey : ['Alt', 18, 'AltGr', 225],
        metaKey : ['Meta', 91]
    };
    this.config = config;
    this.eventCallback = eventCb;
    this.eventName = eventName;
    this.eventsSnoozed = false;
    this.snoozeTimeout = null;
    this.initEventListeners();
}

EventHandler.prototype = {

    initEventListeners : function() {
        for(var event in this.config) {
            window.addEventListener(event, this.handleEvent.bind(this));
        }
    },

    addEventListeners : function(config) {
        var self = this;

        for(var event in config) {
            if(!this.config[event]) {
                // Assing new event listener
                this.config[event] = config[event];
                window.addEventListener(event, this.handleEvent.bind(this));
            } else if(this.config[event] && Array.isArray(config[event])) {
                // Extend current - concat events and de duplicate them
                var events = this.config[event].concat(config[event]);
                self.config[event] = events.filter(function (item, pos) {
                    return events.indexOf(item) === pos;
                });
            } else if (this.config[event] && !Array.isArray(config[event])){
                window.addEventListener(event, this.handleEvent.bind(this));
            }
        }
    },

    handleEvent : function(e) {
        var eventType = e.type.toLowerCase();

        if(eventType === 'click') {
            this.handleClickEvent(e);
        } else if (eventType === 'scroll') {
            this.handleScrollEvent(e);
        } else if(eventType === 'keyup' || eventType === 'keydown' || eventType === 'keypress') {
            this.handleKeyboardEvent(e);
        } else {
            logger.out('warning', 'Unable to dispatch event! Event ' + eventType + ' is not supported by gateway.');
        }

    },

    handleScrollEvent : function(e) {
        var data = {
            action : this.eventName,
            event : e.type,
            top: window.document.body.scrollTop,
            left:  window.document.body.scrollLeft,
            totalHeight: window.innerHeight,
            totalWidth : window.innerWidth
        };

        if (this.eventsSnoozed) return;
        this.eventCallback(data);
    },

    handleClickEvent : function(e) {
        var data = {
            action : this.eventName,
            event : e.type
        };

        if (this.eventsSnoozed) return;
        this.eventCallback(data);
    },

    handleKeyboardEvent : function(e) {
        var eventConfig = this.config[e.type];

        if (eventConfig === '*') {
            this.keyboardEventCallback(e);
            return;
        } else if (Array.isArray(eventConfig)) {
            this._handleArrayOfSubscribedEvents(e, eventConfig);
        } else if (typeof eventConfig === 'object') {
            if (eventConfig.types && Array.isArray(eventConfig.types)) {
                this._handleArrayOfSubscribedEvents(e, eventConfig.types, eventConfig.blacklist);
            } else if (eventConfig.types && eventConfig.types === '*') {
                this._handleAllEvents(e, eventConfig.blacklist);
            }
        } else {
            logger.out('error', 'Keyboard subsription format is invalid.');
        }
    },

    getModifierKey : function(keyBinding) {
        for(var key in this.MODIFIER_KEYS) {
            var modifierList = this.MODIFIER_KEYS[key];
            for(var i=0; i<modifierList.length; i++) {
                if(keyBinding.indexOf(modifierList[i]) !== -1) {
                    return key;
                }
            }

        }
    },

    keyboardEventCallback : function(e) {
        var data = {
            action : this.eventName,
            event : e.type,
            key : e.key || e.keyIdentifier,
            keyCode : e.which || e.keyCode,
            keyboardButton : e.code || null,
            shiftKey : e.shiftKey,
            altKey : e.altKey,
            metaKey : e.metaKey,
            ctrlKey : e.ctrlKey
        };

        if (this.eventsSnoozed) return;
        this.eventCallback(data);
    },

    snoozeEvents: function(data) {
        var self = this;
        this.eventsSnoozed = true;

        if(data.timeout && typeof data.timeout === 'number') {
            if(this.snoozeTimeout) {
                clearTimeout(this.snoozeTimeout);
                this.snoozeTimeout = null;
            }
            this.snoozeTimeout = setTimeout(function() {
                self.eventsSnoozed = false;
            }, data.timeout);
        }
    },

    awakeEvents: function() {
        if(this.snoozeTimeout) {
            clearTimeout(this.snoozeTimeout);
            this.snoozeTimeout = null;
        }
        this.eventsSnoozed = false;
    },

    _handleArrayOfSubscribedEvents: function(e, eventList, blacklist) {
        var eventCode = String(e.which || e.keyCode),
            eventKey = String(e.key || e.keyIdentifier),
            eventBlacklist = blacklist || [],
            modifier,
            keyBinding;

        for (var i = 0; i < eventList.length; i++) {
            // Cast eventCode and eventKey to String for comparison
            keyBinding = String(eventList[i]);
            // Check if key is listed for propagation
            if (keyBinding.indexOf(eventCode) !==-1 || keyBinding.indexOf(eventKey) !==-1) {
                // Check if key is combined with modifier (Alt, Ctrl...)
                if(keyBinding.indexOf('+') !== -1) {
                    modifier = this.getModifierKey(keyBinding);
                    // Key + Modifier is active and it's not blacklisted
                    if(modifier && e[modifier] === true) {
                        if(this._eventIsBlacklisted(eventBlacklist, keyBinding, modifier)) {
                            logger.out('info', 'Key ' + eventKey + ' is blacklisted for propagation.');
                            return;
                        }
                        this.keyboardEventCallback(e);
                        return;
                    }
                } else if(!this._eventIsBlacklisted(eventBlacklist, keyBinding)) {
                    this.keyboardEventCallback(e);
                    return;
                } else {
                    logger.out('info', 'Key ' + eventKey + ' is not listed for propagation.');
                }
            }
        }
    },

    _handleAllEvents: function(e, blacklist) {
        var eventCode = String(e.which || e.keyCode),
            eventKey = String(e.key || e.keyIdentifier),
            eventBlacklist = blacklist || [],
            modifier,
            blacklistedEventsReceived = [],
            eventCodeWithModifier,
            eventKeyWithModifier,
            blacklistedEvent;

        for (var i = 0; i < eventBlacklist.length; i++) {
            blacklistedEvent = eventBlacklist[i];
            modifier = this.getModifierKey(blacklistedEvent);
            
            if(!modifier) {
                if(eventCode !== blacklistedEvent && eventKey !== blacklistedEvent) {
                    blacklistedEventsReceived.push(blacklistedEvent);
                }
            } else if (modifier && e[modifier] === true){
                eventCodeWithModifier = modifier + '+' + eventCode;
                eventKeyWithModifier = modifier + '+' + eventKey;

                if(eventCodeWithModifier !== blacklistedEvent && eventKeyWithModifier !== blacklistedEvent) {
                    blacklistedEventsReceived.push(blacklistedEvent);
                }
            }
        }

        if(!blacklistedEventsReceived.length) {
            this.keyboardEventCallback(e);
        } else {
            logger.out('info', 'Key ' + eventKey + ' is blacklisted for propagation.');
        }
        
    },

    _eventIsBlacklisted: function(eventBlacklist, keyBinding, modifier) {
        var keyWithModifier;

        if(!modifier) {
            return eventBlacklist.indexOf(keyBinding) !== -1;
        } else {
            keyWithModifier = modifier + '+' + keyBinding;
            return eventBlacklist.indexOf(keyWithModifier) !== -1;
        }
    }
};

module.exports = function (config, eventCb, eventName) {
    if(!config) {
        logger.out('info', 'No key bindings passed.');
        return false;
    }

    return new EventHandler(config, eventCb, eventName);
};
