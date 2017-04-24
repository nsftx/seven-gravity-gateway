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
            logger.out('info', '[GGP] Plugin Storage: Message doesn`t have valid signature.');
            return false;
        }

        var lastSeparatorIdx = action.lastIndexOf('.');
        action = action.replace('.', '');
        action = action.substring(lastSeparatorIdx);
        action = action.charAt(0).toLowerCase() + action.slice(1);

        if(this[action]) {
            return this[action](event.data.data);
        } else {
            logger.out('info', '[GGP] Plugin Storage: Method isn`t supported.');   
            return false;
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

module.exports = Locker;