require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var logger = require('../utils/utils').logger;

var Locker = {
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
            logger.out('info', '[GGP] Plugin Storage: Driver' + driver +  ' is supported.');
            return true;
        } else {
            logger.out('info', '[GGP] Plugin Storage: Driver' + driver +  ' isn`t supported.');
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
},{"../utils/utils":2}],2:[function(require,module,exports){
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
},{}],"seven-gravity-gateway/plugin-storage":[function(require,module,exports){
module.exports = require('./src/plugin/storage');
},{"./src/plugin/storage":1}]},{},["seven-gravity-gateway/plugin-storage"]);
