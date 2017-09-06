(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("master", [], factory);
	else if(typeof exports === 'object')
		exports["master"] = factory();
	else
		root["gravity"] = root["gravity"] || {}, root["gravity"]["gateway"] = root["gravity"]["gateway"] || {}, root["gravity"]["gateway"]["master"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

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

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var logger = __webpack_require__(0).logger;

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

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var logger = __webpack_require__(0).logger;

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


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(4);

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var masterPorthole = __webpack_require__(5),
    pubSub = __webpack_require__(1),
    contentHandler = __webpack_require__(6),
    logger = __webpack_require__(0).logger,
    eventHandler = __webpack_require__(2);

function validateSlavesConfig(slaves) {
    var configValid = true;

    for (var slave in slaves) {
        if (!slaves[slave].frameId || typeof slaves[slave].frameId !== 'string') {
            logger.out('error', '[GG] Master:', 'frameId property is invalid or missing for ' + slave);
            configValid = false;
        }
    }

    return configValid;
}

function validateInitialization(config) {
    var slaves = config.slaves || config.products,
        configValid;

    if (!slaves || typeof slaves !== 'object') {
        logger.out('warn', '[GG] Master:', 'slaves/products object is invalid or missing');
    }

    configValid = slaves ? validateSlavesConfig(slaves) : true;

    if (!configValid) {
        return false;
    } else {
        logger.out('info', '[GG] Master:', 'Initializing');
        return true;
    }
}

var masterGateway = {

    initialized: false,

    slaves: {},

    config: null,

    allowedOrigins: null,

    msgSender: 'Master',

    init: function (config) {
        var slaves = config.slaves || config.products;
        this.initialized = true;
        this.config = config;
        this.slaves = slaves || {};
        this.setAllowedDomains();
        //Set message handler
        window.addEventListener('message', this.handleMessage.bind(this));
    },

    addSlave: function(config) {
        var slaveId = config.slaveId || config.productId;

        if (!slaveId || typeof slaveId !== 'string') {
            logger.out('error', '[GG] Master:', 'slaveId/productId property is invalid or missing for ' + config);
            return false;
        } else if (!config.frameId || typeof config.frameId !== 'string') {
            logger.out('error', '[GG] Master:', 'frameId property is invalid or missing for ' + config);
            return false;
        }
        //Delete slaveId prop for sake of standardization
        delete config.slaveId;
        this.slaves[slaveId] = config;
    },

    removeSlave: function(slaveId) {
        if(slaveId && this.slaves[slaveId]) {
            delete this.slaves[slaveId];
            logger.out('info', '[GG] Master:', 'slave: ' + slaveId + ' succesfully removed.');
        } else {
            logger.out('error', '[GG] Master:', 'Passed slaveId is invalid or it doesn`t exist.');
            return false;
        }
    },

    setAllowedDomains: function () {
        if (this.config && this.config.allowedOrigins) {
            this.allowedOrigins = this.config.allowedOrigins;
        } else {
            this.allowedOrigins = '*';
        }
    },

    handleMessage: function (event) {
        if (!event.data.msgSender || event.data.msgSender === this.msgSender) return false;

        var masterPattern,
            slavePattern;

        if (this.allowedOrigins !== '*' && this.allowedOrigins.indexOf(event.origin) === -1) {
            logger.out('error', '[GG] Master: Message origin is not allowed');
            return false;
        }

        masterPattern = new RegExp('^Master\\.', 'g');
        slavePattern = new RegExp('^Slave\\.', 'g');

        // Check if message is reserved system message (Master and Slave messages)
        if (slavePattern.test(event.data.action) || masterPattern.test(event.data.action)) {
            this.handleProtectedMessage(event);
            return false;
        }

        logger.out('info', '[GG] Master: Slave message received:', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    handleProtectedMessage: function (event) {
        var slaveId = event.data.slaveId || event.data.productId;

        if (!this.slaves[slaveId]) {
            return false;
        }
        var slaveData = this.slaves[slaveId],
            actionName = event.data.action.replace('.', '');
        //Lowercase the first letter
        actionName = actionName.charAt(0).toLowerCase() + actionName.slice(1);
        if (this[actionName]) {
            this[actionName](event, slaveData);
        } else {
            logger.out('warn', '[GG] Master:', 'Actions with domain `Master` or `Slave` are protected!');
        }
    },

    slaveInit : function(event, slaveData) {
        logger.out('info', '[GG] Master:', 'Starting to load slave.', event.data);

        if(typeof slaveData.autoResize !== 'undefined' && slaveData.autoResize !== true) {
            //On every init reset the frame sizes
            contentHandler.resetFrameSize(slaveData.frameId);
        }
        // Run the slave init callback and notify slave to load
        if (slaveData.init) {
            slaveData.init(event.data);
        }
        if(event.data.eventListeners) {
            //Curry the sendMessage function with frameId argument in this special case
            eventHandler(event.data.eventListeners, this.sendMessage.bind(this, slaveData.frameId), 'Master.Event');
        }
        this.slaveLoad(slaveData);
    },

    slaveLoad : function(slaveData) {
        this.sendMessage(slaveData.frameId, {
            action : 'Slave.Load',
            data: typeof slaveData.data === 'function' ? slaveData.data() : slaveData.data || {},
            autoResize : typeof slaveData.autoResize !== 'undefined' ? slaveData.autoResize : true
        });
    },

    slaveResize : function(event, slaveData) {
        logger.out('info', '[GG] Master:', 'Resizing slave.', event.data);
        contentHandler.resize(slaveData.frameId, event);
    },

    slaveLoaded : function(event, slaveData) {
        if (!slaveData.loaded) {
            return false;
        }
        logger.out('info', '[GG] Master:', 'Slave loaded.', event.data);
        slaveData.loaded(event.data);
    },

    slaveEvent : function(event) {
        logger.out('info', '[GG] Master:', 'Slave.Event event received.', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    subscribe: function (action, callback) {
        return pubSub.subscribe(action, callback);
    },

    unsubscribe: function (action) {
        return pubSub.unsubscribe(action);
    },

    clearSubscriptions: function () {
        return pubSub.clearSubscriptions();
    },

    sendMessage: function (frameId, data, origin) {
        var frame = document.getElementById(frameId);
        if (!frame) {
            logger.out('warn', '[GG] Master:', 'Frame ' + frameId + ' is non existent.');
            return false;
        }

        data.msgSender = this.msgSender;
        masterPorthole.sendMessage(frame, data, origin);
    }
};

/**
 * Gateway is singleton
 * If it is already initialized return the Gateway otherwise return false
 */
module.exports = function (config) {
    if (config && config.debug === true) {
        logger.debug = true;
    }

    if (!masterGateway.initialized && validateInitialization(config)) {
        masterGateway.init(config);
        return masterGateway;
    } else if (masterGateway.initialized) {
        return masterGateway;
    } else {
        return false;
    }
};

/***/ }),
/* 5 */
/***/ (function(module, exports) {

function Porthole() {}

Porthole.prototype = {

    sendMessage: function(productFrame, data, domain) {
        var targetWindow = productFrame.contentWindow || window,
            windowDomain = domain || '*';

        targetWindow.postMessage(data, windowDomain);
    }
};

module.exports = new Porthole();

/***/ }),
/* 6 */
/***/ (function(module, exports) {

var contentHandler = {

    resetFrameSize : function(frameId) {
        var frame = document.getElementById(frameId);
        if(frame) {
            frame.style.height = '0px';
        }
    },

    resize : function(frameId, event) {
        var frame = document.getElementById(frameId);
        if(frame) {
            frame.style.height = event.data.height + 'px';
        }
    }
};

module.exports = contentHandler;

/***/ })
/******/ ]);
});