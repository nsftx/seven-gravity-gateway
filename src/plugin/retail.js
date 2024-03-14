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
        shouldPreventKeyDefaultBehavior(e);
    });
};

Retail.prototype.onLoad = function(slave, loadData) {
    loadData.data.settings.preventKeys.forEach(function(key) {
        preventKeysList.push(key);
    });
};

module.exports = Retail;
