var preventKeysList = [];

function Retail() {}

Retail.prototype.setUpOnce = function() {
};

Retail.prototype.onLoad = function(slave, loadData) {
    loadData.data.settings.preventKeys.forEach(function(key) {
        preventKeysList.push(key);
    });
};

module.exports = Retail;
