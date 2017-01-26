var logger = require('../utils/utils').logger;

var keyBindings = {
    
    init : function(config, eventCb, eventName) {
        if(!config) {
            logger.out('info', 'No key bindings passed.');
            return false;
        }

        this.config = config;
        this.eventCallback = eventCb;
        this.eventName = eventName;
        this.addEventListeners();
    },

    addEventListeners : function() {
        for(var event in this.config) {
            window.addEventListener(event, this.handleEvent.bind(this));
        }
    },

    handleEvent : function(e) {
        var eventCode = e.which || e.keyCode,
            eventKey = e.key || e.keyIdentifier,
            eventList = this.config[e.type];

        if(!eventList || eventList.indexOf(eventCode) === -1 && eventList.indexOf(eventKey) === -1) {
            logger.out('info', 'Key ' + eventKey + ' is not marked for propagation.');
            return false;
        }

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

module.exports = keyBindings;