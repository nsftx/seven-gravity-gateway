var logger = require('../utils/utils').logger;

function Porthole() {
    this.worker = null;
    this.msgBlacklist = null;
}

Porthole.prototype = {
    setWorker: function (worker, msgBlacklist) {
        this.worker = worker;
        this.msgBlacklist = msgBlacklist;
        this.setWorkerProxy();
    },
    setWorkerProxy: function () {
      if (this.worker) {
          // Listen message from worker and proxy same message to slave
          this.worker.addEventListener('message', function (event) {
              if (event.data) {
                  logger.out('info', '[GG] Slave redirecting message from worker =>', event.data);
                  window.postMessage(event.data, window.location.origin);
              }
          });
      }
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