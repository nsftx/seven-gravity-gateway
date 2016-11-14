module.exports = {

    sendMessage: function(data, domain) {
        domain = domain || '*';

        window.parent.postMessage(data, domain);
    }
};