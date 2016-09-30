module.exports = {

    notifyPlatform: function(data, domain) {
        domain = domain || '*';

        window.parent.postMessage(data, domain);
    }
};