function Porthole() {}

Porthole.prototype = {
    /**
     * Emit message to IFrame element or current window
     *
     * @param {HTMLIFrameElement} productFrame
     * @param {Object} data
     * @param {String} domain
     */
    sendMessage: function(productFrame, data, domain) {
        var targetWindow = productFrame.contentWindow || window;
        var windowDomain = domain || '*';
        var clonedData = JSON.parse(JSON.stringify(data)); // Strip down function from object

        targetWindow.postMessage(clonedData, windowDomain);
    }
};

module.exports = new Porthole();
