function Porthole() {}

Porthole.prototype = {

    sendMessage: function(productFrame, data, domain) {
        var targetWindow = productFrame.contentWindow || window;
        var windowDomain = domain || '*';
        var clonedData = JSON.parse(JSON.stringify(data)); // Strip down function from object

        targetWindow.postMessage(clonedData, windowDomain);
    }
};

module.exports = new Porthole();
