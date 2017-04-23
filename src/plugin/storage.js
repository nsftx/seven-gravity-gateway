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