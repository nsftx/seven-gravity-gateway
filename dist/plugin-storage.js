require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var logger = require('../utils/utils').logger;

// Plugin supported drivers
var DRIVERS = [
    'localStorage', 'sessionStorage'
];

var Locker = {
    handleMessage: function(event) {
        var pluginPattern = new RegExp('^Plugin.Storage\\.', 'g'),
            action = event.data.action;

        if (!pluginPattern.test(event.data.action)) {
            logger.out('info', '[GG] Plugin Storage: Message doesn`t have valid signature.');
            return false;
        }

        var lastSeparatorIdx = action.lastIndexOf('.');
        action = action.replace('.', '');
        action = action.substring(lastSeparatorIdx);

        if(this.action) {
            this.action(event.data);
        } else {
            logger.out('info', '[GG] Plugin Storage: Method isn`t supported.');   
        }
    },

    isSupported : function(driver) {
        if(driver in window && window[driver]) {
            return true;
        } else {
            return false;
        }
    },

    key : function(num, driver) {
        return window[driver].key(num);
    },

    getItem : function(key, driver) {
        return window[driver].getItem(key);
    },

    setItem : function(key, value, driver) {
        return window[driver].setItem(key, value);
    },

    removeItem : function(key, driver) {
        return window[driver].removeItem(key);
    },

    clear : function(driver) {
        return window[driver].clear();
    }
};

//window.addEventListener('message', Locker.handleMessage(event))

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
