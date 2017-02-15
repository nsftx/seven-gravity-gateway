function Porthole(){
    this.worker = null;
}

Porthole.prototype = {

    setWorker: function(worker) {
        this.worker = worker;
    },

    sendMessage: function(data, domain) {
        var windowDomain = domain || '*';
        window.parent.postMessage(data, windowDomain);
        if(this.worker) {
            this.worker.postMessage(data);
        }
    }
};

module.exports = new Porthole();