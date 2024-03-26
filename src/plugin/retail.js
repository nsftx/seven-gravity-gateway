var logger = require('../utils/utils').logger;
var Scan = require('./barcode-scan');

// Register all sub plugins for retail channel
var subPlugins = {
    'scan': new Scan()
};

var preventKeysList = [];

function shouldPreventKeyDefaultBehavior(key) {
    if (!preventKeysList.length) return false;

    return !!preventKeysList.find(function(preventKey) {
        return preventKey.key === key;
    });
}

function Retail() {}

Retail.prototype.setUpOnce = function(slave) {
    window.document.addEventListener('keydown', function(e) {
        if (shouldPreventKeyDefaultBehavior(e.key)) {
            e.preventDefault();
            logger.out('debug', '[GGP] Plugin Retail:  Preventing key default behavior.', {
                key: e.key
            });
        }
    });

    Object.keys(subPlugins).forEach(function(key) {
        subPlugins[key].setUpOnce(slave);
    });
};

Retail.prototype.onLoad = function(slave, loadData) {
    if (loadData.data.settings.hasOwnProperty('preventKeys')) {
        loadData.data.settings.preventKeys.forEach(function(key) {
            preventKeysList.push(key);
        });
    }

    Object.keys(subPlugins).forEach(function(key) {
        subPlugins[key].onLoad(slave, loadData);
    });
};

module.exports = Retail;
