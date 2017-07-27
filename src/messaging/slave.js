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
        window.parent.postMessage(data, windowDomain);

        if (this.worker && this.msgBlacklist.indexOf(data.action) === -1) {
            this.worker.postMessage(data);
        }
    }
};

module.exports = new Porthole();