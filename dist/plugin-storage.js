require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Plugin supported drivers
var DRIVERS = [
    'localStorage', 'sessionStorage'
];

var Locker = {
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

module.exports = Locker;
},{}],"seven-gravity-gateway/plugin-storage":[function(require,module,exports){
module.exports = require('./src/plugin/storage');
},{"./src/plugin/storage":1}]},{},["seven-gravity-gateway/plugin-storage"]);
