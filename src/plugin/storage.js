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