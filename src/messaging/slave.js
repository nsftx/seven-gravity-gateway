function Porthole() {
    this.worker = null;
    this.msgBlacklist = null;
}

Porthole.prototype = {
    setWorker: function (worker, msgBlacklist) {
        this.worker = worker;
        this.msgBlacklist = msgBlacklist;
    },
    sendMessage: function (data, domain) {
        var windowDomain = domain || '*';
        var clonedData = JSON.parse(JSON.stringify(data)); // Strip down function from object
        window.parent.postMessage(clonedData, windowDomain);

        if (this.worker && this.msgBlacklist.indexOf(clonedData.action) === -1) {
            this.worker.postMessage(clonedData);
        }
    }
};

module.exports = new Porthole();
