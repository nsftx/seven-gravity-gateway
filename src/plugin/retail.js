var logger = require('../utils/utils').logger;

var preventKeysList = [];

function shouldPreventKeyDefaultBehavior(key) {
    if (!preventKeysList.length) return false;

    return !!preventKeysList.find(function(preventKey) {
        return preventKey.key === key;
    });
}

function Retail() {}

Retail.prototype.setUpOnce = function() {
    window.document.addEventListener('keydown', function(e) {
        if (shouldPreventKeyDefaultBehavior(e.key)) {
            e.preventDefault();
            logger.out('debug', '[GGP] Plugin Retail:  Preventing key default behavior.', {
                key: e.key
            });
        }
    });
};

Retail.prototype.onLoad = function(slave, loadData) {
    loadData.data.settings.preventKeys.forEach(function(key) {
        preventKeysList.push(key);
    });
};

module.exports = Retail;
