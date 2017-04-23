require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var OBSERVED_EVENTS = [
    {type: 'Animation Start',       eventName : ['animationstart','webkitAnimationStart']},
    {type: 'Animation Iteration',   eventName : ['animationiteration','webkitAnimationIteration']},
    {type: 'Animation End',         eventName : ['animationend','webkitAnimationEnd']},
    {type: 'Input',                 eventName : 'input'},
    {type: 'Resize',                eventName : 'resize'},
    {type: 'Click',                 eventName : 'click'},
    {type: 'Orientation Change',    eventName : 'orientationchange'},
    {type: 'Print',                 eventName : ['afterprint', 'beforeprint']},
    {type: 'Ready State Change',    eventName : 'readystatechange'},
    {type: 'Touch Start',           eventName : 'touchstart'},
    {type: 'Touch End',             eventName : 'touchend'},
    {type: 'Touch Cancel',          eventName : 'touchcancel'},
    {type: 'Transition Start',      eventName : ['transitionstart','webkitTransitionStart','MSTransitionStart','oTransitionStart','otransitionstart']},
    {type: 'Transition Iteration',  eventName : ['transitioniteration','webkitTransitionIteration','MSTransitionIteration','oTransitionIteration','otransitioniteration']},
    {type: 'Transition End',        eventName : ['transitionend','webkitTransitionEnd','MSTransitionEnd','oTransitionEnd','otransitionend']}],
    INTERVAL_DURATION = 200,
    intervalTimer = null;

var contentHandler = {

    eventName : null,

    DOMReady : false,

    currentWidth : 0,

    currentHeight : 0,

    init: function(eventCb, eventName) {
        this.eventCallback = eventCb;
        this.eventName = eventName;

        this.addContentListeners();
        this.listenDOMReady();

        if (window.MutationObserver || window.WebKitMutationObserver){
            this.setupMutationObserver();
        } else {
            this.runDirtyCheck();
        }
    },

    handleContentChange : function() {
        if(!this.DOMReady) {
            return false;
        }

        var windowWidth = window.innerWidth,
            windowHeight = this.getContentHeight() + this.getElementOffset(document.body),
            data;

        // Check to prevent unnecessary message dispatch even if size didn't change
        if(windowWidth !== this.currentWidth || windowHeight !== this.currentHeight) {
            this.currentWidth = windowWidth;
            this.currentHeight = windowHeight;
            data = {
                action : this.eventName,
                width : windowWidth,
                height : windowHeight
            };
            this.eventCallback(data);
        }
    },

    //Get offset height of iframe content
    getContentHeight : function() {
        var contentHeight = 0,
            bodyChildNodes = document.querySelectorAll('body > *');

        //If iframe's body has no child nodes
        if(!bodyChildNodes.length) {
            return 0;
        }

        //Convert HTML collection to array and calc the first level child nodes height sum
        Array.prototype.forEach.call(bodyChildNodes, function(element){
            contentHeight += element.offsetHeight + this.getElementOffset(element);
        }.bind(this));

        return contentHeight;
    },

    getElementOffset : function(element) {
        //Get body margin and padding
        var styles = getComputedStyle(element),
            contentHeight = 0;

        contentHeight += parseInt(styles.getPropertyValue('margin-top'));
        contentHeight += parseInt(styles.getPropertyValue('margin-bottom'));
        contentHeight += parseInt(styles.getPropertyValue('padding-top'));
        contentHeight += parseInt(styles.getPropertyValue('padding-bottom'));

        return contentHeight;
    },

    listenDOMReady : function() {
        var self = this;
        var readyInterval = window.setInterval(function () {
            if(window.document.readyState !== 'loading') {
                clearInterval(readyInterval);
                self.DOMReady = true;
                self.handleContentChange();
            }
        }, 5);
    },
    
    addContentListeners : function() {
        OBSERVED_EVENTS.forEach(function(event) {
            if(Array.isArray(event.eventName)) {
                event.eventName.forEach(function(event) {
                    window.addEventListener(event, this.handleContentChange.bind(this));
                }.bind(this));
            } else {
                window.addEventListener(event.eventName, this.handleContentChange.bind(this));
            }
        }.bind(this));
    },

    setupMutationObserver : function() {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
            mutationConfig = {
                childList : true,
                subtree : true,
                characterData : true,
                attributes : true
            },
            observer,
            target = document.querySelector('body');

        observer = new MutationObserver(this.handleContentChange.bind(this));
        observer.observe(target, mutationConfig);
    },

    runDirtyCheck : function() {
        intervalTimer = setInterval(function() {
            this.handleContentChange();
        }.bind(this), INTERVAL_DURATION);

    }
};

module.exports= contentHandler;

},{}],2:[function(require,module,exports){
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
    this.addEventListeners();
}

EventHandler.prototype = {

    addEventListeners : function() {
        for(var event in this.config) {
            window.addEventListener(event, this.handleEvent.bind(this));
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

},{"../utils/utils":6}],3:[function(require,module,exports){
var logger = require('../utils/utils').logger;

function Porthole() {
    this.worker = null;
    this.msgBlacklist = null;
}

Porthole.prototype = {
    setWorker: function (worker, msgBlacklist) {
        this.worker = worker;
        this.msgBlacklist = msgBlacklist;
    },
    sendMessage: function (data, domain) {
        var windowDomain = domain || '*';
        window.parent.postMessage(data, windowDomain);

        if (this.worker && this.msgBlacklist.indexOf(data.action) === -1) {
            this.worker.postMessage(data);
        }
    }
};

module.exports = new Porthole();
},{"../utils/utils":6}],4:[function(require,module,exports){
var logger = require('./utils/utils').logger;

var pubSub = {

    topics : {},

    subscribe : function(action, callback) {
        var self = this;

        if(action && typeof callback === 'function') {
            if(!this.topics[action]) {
                //Create array of actions for first time subscription
                this.topics[action] = [];
            }
            var index = this.topics[action].push(callback) - 1;

            //Return remove to unsubscripe single susbcription
            return {
                remove: function() {
                    delete self.topics[action][index];
                }
            };
        } else {
            logger.out('error', 'Subscribe failed - action property is invalid or missing.');
            return false;
        }
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
        var topicAction = this.findAction(action);

        if(!topicAction) {
            logger.out('error', 'Publish failed - topic ' + action + ' doesn´t exist');
            return false;
        } else {
            topicAction.forEach(function(callback) {
                callback(data !== undefined ? data : {});
            });
        }

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

module.exports = pubSub;
},{"./utils/utils":6}],5:[function(require,module,exports){
var slavePorthole = require('./messaging/slave'),
    pubSub = require('./pub_sub'),
    contentHandler = require('./content_handler/slave_handler'),
    logger = require('./utils/utils').logger,
    eventHandler = require('./event_dispatching/event_handler');

function validateInitialization(config) {
    if(!config.productId || typeof config.productId !== 'string') {
        logger.out('error', '[GG] Slave:', 'productId property is invalid or missing');
        return false;
    } else if(!config.data || typeof config.data !== 'object') {
        logger.out('error', '[GG] Slave.' + config.productId + ':', 'data property is invalid or missing');
        return false;
    } else if(!config.load || typeof config.load !== 'function') {
        logger.out('error', '[GG] Slave.' + config.productId + ':', 'load property is invalid or missing');
        return false;
    } else {
        logger.out('info', '[GG] Slave.' + config.productId + ':', 'Initializing');
        return true;
    }
}

var slaveGateway = {

    productId : '',

    config : null,

    initialized : false,

    load : null,

    worker : null,

    msgSender : 'Slave',

    init: function(config){
        this.initialized = true;
        this.config = config;
        this.productId = config.productId;
        this.load = config.load;
        this.setAllowedDomains();
        //Set message handler
        window.addEventListener('message', this.handleMessage.bind(this));
        //Pass the event callback, and event name
        contentHandler.init(this.sendMessage.bind(this), 'Slave.Resize');
        //Pass the key propagation config object, event callback, event name
        if(this.config.eventPropagation) {
            eventHandler(this.config.eventPropagation, this.sendMessage.bind(this), 'Slave.Event');
        }
        if(this.config.worker) {
            this.setWorker();
        }
        this.startProductInitialization();
    },
    
    setAllowedDomains : function() {
        if(this.config && this.config.allowedOrigins) {
            this.allowedOrigins = this.config.allowedOrigins;
        } else {
            this.allowedOrigins = '*';
        }
    },

    startProductInitialization : function() {
        this.sendMessage({
            action: 'Slave.Init',
            data: this.config.data,
            eventPropagation : this.config.eventPropagation,
            eventListeners : this.config.eventListeners
        });
    },

    handleMessage : function(event) {
        if(!event.data.msgSender || event.data.msgSender === this.msgSender) return false;

        var productPattern,
            platformPattern;

        if(this.allowedOrigins !== '*' && this.allowedOrigins.indexOf(event.origin) === -1) {
            logger.out('error', '[GG] Slave.' +  this.productId + ':' + ' Message origin is not allowed');
            return false;
        }

        productPattern = new RegExp('^Slave\\.', 'g');
        platformPattern = new RegExp('^Master\\.', 'g');
        // Check if message is reserved system message (Master and Slave messages)
        if(productPattern.test(event.data.action) || platformPattern.test(event.data.action)) {
            this.handleProtectedMessage(event);
            return false;
        }

        logger.out('info', '[GG] Slave.' +  this.productId + ':' + ' Master message received:', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    handleProtectedMessage : function(event) {
        var actionName = event.data.action.replace('.', '');
        //Lowercase the first letter
        actionName = actionName.charAt(0).toLowerCase() + actionName.slice(1);

        if (this[actionName]) {
            this[actionName](event);
        } else {
            logger.out('warn', '[GG] Slave.' +  this.productId + ':', 'Actions with domain `Master` or `Slave` are protected!');
        }
    },

    setWorker: function(){
        var msgBlacklist = ['Slave.Resize'],
            self = this;

        if(this.config.worker instanceof Worker) {
            this.worker = this.config.worker;
        } else if (typeof this.config.worker === 'string') {
            this.worker = new Worker(this.config.worker);
        } else {
            logger.out('error', '[GG] Slave.' +  this.productId + ':', 'Web worker initialization failed. Provide instance of Worker or path to file');
            return false;
        }

        logger.out('info', '[GG] Slave.' +  this.productId + ':', 'Web worker initialized.');

        // Set worker message proxy
        this.worker.addEventListener('message', function (event) {
            if (event.data && event.data.action) {
                if (event.data.action === 'Slave.Loaded') {
                    logger.out('info', '[GG] Slave redirecting message from worker to master =>', event.data);
                    self.sendMessage({
                        action: 'Slave.Loaded',
                        data: event.data.data
                    });
                } else {
                    logger.out('info', '[GG] Slave redirecting message from worker to slave =>', event.data);
                    pubSub.publish(event.data.action, event.data);
                }
            }
        });

        slavePorthole.setWorker(this.worker, msgBlacklist);
    },

    slaveLoad : function(event) {
        logger.out('info', '[GG] Slave.' +  this.productId + ':', 'Starting to load.');
        this.load(event.data);
    },

    masterEvent : function(event) {
        logger.out('info', '[GG] Slave.' +  this.productId + ':', 'Publish Master.Event event.', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    subscribe : function(action, callback) {
        pubSub.subscribe(action, callback);
    },

    unsubscribe : function(action) {
        pubSub.unsubscribe(action);
    },

    clearSubscriptions : function() {
        pubSub.clearSubscriptions();
    },

    sendMessage : function(data, origin) {
        data.productId = this.productId;
        data.msgSender = 'Slave';
        slavePorthole.sendMessage(data, origin);
    }
};

module.exports = function(config) {
    if(config && config.debug === true) {
        logger.debug = true;
    }

    if(!slaveGateway.initialized && validateInitialization(config)) {
        slaveGateway.init(config);
        return slaveGateway;
    } else if(slaveGateway.initialized) {
        return slaveGateway;
    } else {
        return false;
    }
};
},{"./content_handler/slave_handler":1,"./event_dispatching/event_handler":2,"./messaging/slave":3,"./pub_sub":4,"./utils/utils":6}],6:[function(require,module,exports){
var logger = {
    debug : false, //Verbosity setting

    out : function(){
        if(this.debug) {
            //Convert to array
            var args = Array.prototype.slice.call(arguments);
            //First argument is notification type (log, error, warn, info)
            var type = args.splice(0,1);

            if(console[type]) {
                console[type].apply(this, args);
            } else {
                console.log.apply(this, args);
            }
        }
    }
};

var throttle = function(fn, wait) {
    var time = Date.now();
    return function() {
        if ((time + wait - Date.now()) < 0) {
            fn();
            time = Date.now();
        }
    };
};


module.exports = {
    logger : logger,
    throttle : throttle
};
},{}],"seven-gravity-gateway/slave":[function(require,module,exports){
module.exports = require('./src/slave_gateway');
},{"./src/slave_gateway":5}]},{},["seven-gravity-gateway/slave"]);
