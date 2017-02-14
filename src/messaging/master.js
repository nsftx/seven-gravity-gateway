function Porthole() {
    this.worker = null;
}

Porthole.prototype = {

    setWorker: function(worker) {
        this.worker = worker;
    },

    sendMessage: function(productFrame, data, domain) {
        var targetWindow = productFrame.contentWindow || window,
            windowDomain = domain || '*';

        targetWindow.postMessage(data, windowDomain);
        if(this.worker) {
            this.worker.postMessage(data, windowDomain);
        }
    }
};

module.exports = new Porthole();