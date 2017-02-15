function Porthole() {}

Porthole.prototype = {

    sendMessage: function(productFrame, data, domain) {
        var targetWindow = productFrame.contentWindow || window,
            windowDomain = domain || '*';

        targetWindow.postMessage(data, windowDomain);
    }
};

module.exports = new Porthole();