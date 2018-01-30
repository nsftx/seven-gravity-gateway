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
    this.addEventListeners(config);
}

EventHandler.prototype = {

    addEventListeners : function(config) {
        var self = this;
        for(var event in config) {
            if(!this.config[event]) {
                // Assing new event listener
                window.addEventListener(event, this.handleEvent.bind(this));
            } else {
                // Extend current
                if(Array.isArray(config[event])) {
                    // Concat events and de duplicate them
                    var events = this.config[event].concat(config[event]);
                    self.config[event] = events.filter(function (item, pos) {
                        return self.config.indexOf(item) === pos;
                    });
                }
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

        this.eventCallback(data);
    },

    handleClickEvent : function(e) {
        var data = {
            action : this.eventName,
            event : e.type
        };

        this.eventCallback(data);
    },

    handleKeyboardEvent : function(e) {
        var eventCode = e.which || e.keyCode,
            eventKey = e.key || e.keyIdentifier,
            eventList = this.config[e.type],
            keyBinding;

        for (var i = 0; i < eventList.length; i++) {
            // Cast eventCode and eventKey to String for comparison
            keyBinding = String(eventList[i]);
            eventCode = String(eventCode);
            eventKey = String(eventKey);
            // Check if key is listed for propagation
            if (keyBinding.indexOf(eventCode) !==-1 || keyBinding.indexOf(eventKey) !==-1) {
                // Check if key is combined with modifier (Alt, Ctrl...)
                if(keyBinding.indexOf('+') !== -1) {
                    var modifier = this.getModifierKey(keyBinding);
                    if(modifier && e[modifier] === true) {
                        this.keyboardEventCallback(e);
                        return;
                    }
                } else {
                    this.keyboardEventCallback(e);
                    return;
                }
            }
        }

        logger.out('info', 'Key ' + eventKey + ' is not marked for propagation.');
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

        this.eventCallback(data);
    }
};

module.exports = function (config, eventCb, eventName) {
    if(!config) {
        logger.out('info', 'No key bindings passed.');
        return false;
    }

    return new EventHandler(config, eventCb, eventName);
};
