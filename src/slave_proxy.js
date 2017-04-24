var logger = require('./utils/utils');

var SlaveWorker = {

    worker : null,

    plugins : null,

    publish : null,

    sendMsg : null,

    setMsgProxy : function(data, config, publish, sendMsg) {
        if(data.src instanceof Worker) {
            this.worker = data.src;
        } else if (typeof data.src === 'string') {
            this.worker = new Worker(data.src);
        } else {
            return false;
        }
        this.publish = publish;
        this.sendMessage = sendMsg;

        if(data.plugins) {
            this.plugins = data.plugins;
        }

        this.worker.addEventListener('message', this.handleProxyMsg);
        return this.worker;
    },

    handleProxyMsg : function(event) {
        if(!event.data.action) {
            logger.out('error', '[GG] Worker message is missing an action name =>', event.data);
            return false;
        }

        var pluginPattern = new RegExp('^Plugin\\.', 'g');
        var pluginMsg = pluginPattern.test(event.data.action);

        if(event.data.action === 'Slave.Loaded') {
            this.slaveLoaded(event);
        } else if(pluginMsg) {
            this.pluginMsg(event);
        } else {
            this.publishMsg(event);
        }

    },

    slaveLoaded : function(event) {
        logger.out('info', '[GG] Slave redirecting message from worker to master =>', event.data);
        this.sendMsg({
            action: 'Slave.Loaded',
            data: event.data.data
        });
    },

    pluginMsg : function(event) {
        logger.out('info', '[GG] Slave redirecting message from worker to plugin =>', event.data);
        var self = this;
        this.plugins.forEach(function(plugin) {
            var data = plugin.handleMessage(event);
            self.worker.postMessage(data);
        });
    },

    publishMsg : function(event) {
        logger.out('info', '[GG] Slave redirecting message from worker to slave =>', event.data);
        this.publish(event.data.action, event.data);
    }
};

module.exports = SlaveWorker;


/* // Set worker message proxy
        this.worker.addEventListener('message', function (event) {
            if (event.data && event.data.action) {
                if (event.data.action === 'Slave.Loaded') {
                    logger.out('info', '[GG] Slave redirecting message from worker to master =>', event.data);
                    self.sendMessage({
                        action: 'Slave.Loaded',
                        data: event.data.data
                    });
                } else {
                    if(self.config.worker.plugins) {
                        self.config.worker.plugins.forEach(function(plugin) {
                            var data = plugin.handleMessage(event);
                            console.info(data);
                            self.worker.postMessage(data);
                        });
                    }
                    logger.out('info', '[GG] Slave redirecting message from worker to slave =>', event.data);
                    pubSub.publish(event.data.action, event.data);
                }
            }
        });
*/