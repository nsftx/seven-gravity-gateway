(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("plugin-storage", [], factory);
	else if(typeof exports === 'object')
		exports["plugin-storage"] = factory();
	else
		root["gravity"] = root["gravity"] || {}, root["gravity"]["gateway"] = root["gravity"]["gateway"] || {}, root["gravity"]["gateway"]["plugin-storage"] = factory();
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
/******/ 	return __webpack_require__(__webpack_require__.s = 13);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
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

var uuidv4 = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

module.exports = {
    logger : logger,
    throttle : throttle,
    uuidv4 : uuidv4
};

/***/ }),

/***/ 13:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(14);

/***/ }),

/***/ 14:
/***/ (function(module, exports, __webpack_require__) {

var logger = __webpack_require__(0).logger;

var Locker = {

    config : null,

    setConfig : function(config) {
        this.config = config;
        if(config.debug) {
            logger.debug = config.debug;
        }
    },

    handleMessage: function(event) {
        var pluginPattern = new RegExp('^Plugin.Storage\\.', 'g'),
            action = event.data.action;

        if (!pluginPattern.test(event.data.action)) {
            logger.out('info', '[GGP] Plugin Storage: Message doesn`t have valid signature.');
            return false;
        }

        var lastSeparatorIdx = action.lastIndexOf('.');
        action = action.replace('.', '');
        action = action.substring(lastSeparatorIdx);
        action = action.charAt(0).toLowerCase() + action.slice(1);

        if(this[action]) {
            return this[action](event.data);
        } else {
            logger.out('info', '[GGP] Plugin Storage: Method isn`t supported.');   
            return false;
        }
    },

    isSupported : function(data) {
        var driver = data.driver;

        if(driver in window && window[driver]) {
            logger.out('info', '[GGP] Plugin Storage: Driver ' + driver +  ' is supported.');
            return true;
        } else {
            logger.out('info', '[GGP] Plugin Storage: Driver ' + driver +  ' isn`t supported.');
            return false;
        }
    },

    key : function(data) {
        var key = data.key,
            driver = data.driver,
            keyValue;

        if(key && driver) {
            keyValue =  window[driver].key(key);
            return {
                key : key,
                keyValue : keyValue,
                driver : driver
            };
        } else {
            logger.out('info', '[GGP] Plugin Storage: Key ' + key + ' on ' + driver + ' doesn`t exist.');
            return null;
        }
    },

    getItem : function(data) {
        var keyName = data.keyName,
            driver = data.driver,
            keyValue;

        if(keyName && driver) {
            keyValue = window[driver].getItem(keyName);
            return {
                keyName : keyName,
                keyValue : keyValue,
                driver : driver
            };
        } else {
            logger.out('error', '[GGP] Plugin Storage: keyName and storage driver must be provided.');
            return null;
        }
    },

    setItem : function(data) {
        var keyName = data.keyName,
            keyValue = data.keyValue,
            driver = data.driver;
        
        if(keyName && keyValue && driver) {
            window[driver].setItem(keyName, keyValue);
            return {
                keyName : keyName,
                keyValue : keyValue,
                driver : driver
            };
        } else {
            logger.out('error', '[GGP] Plugin Storage: keyName, keyValue and storage driver must be provided.');
            return null;
        }
    },

    removeItem : function(data) {
        var keyName = data.keyName,
            driver = data.driver;
        
        if(keyName && driver) {
            window[driver].removeItem(keyName);
            return {
                keyName : keyName,
                driver : driver
            };
        } else {
            logger.out('error', '[GGP] Plugin Storage: keyName and storage driver must be provided.');
            return null;
        }
    },

    clear : function(data) {
        var driver = data.driver;

        if(driver) {
            window[driver].clear();
            return {
                driver : driver
            };
        } else {
            logger.out('error', '[GGP] Plugin Storage: storage driver must be provided.');
            return null;
        }
    }
};

module.exports = Locker;

/***/ })

/******/ });
});