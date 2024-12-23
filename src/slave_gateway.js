var slavePorthole = require('./messaging/slave'),
    pubSub = require('./pub_sub'),
    contentHandler = require('./content_handler/slave_handler'),
    logger = require('./utils/utils').logger,
    eventHandler = require('./event_dispatching/event_handler'),
    uuidv4 = require('./utils/utils').uuidv4,
    slaveProxy = require('./slave_proxy'),
    VERSION = require('../package.json').version;

function validateInitialization(config) {
    if(!config) {
        return false;
    }

    var slaveId = config.slaveId || config.productId;

    if(!slaveId || typeof slaveId !== 'string') {
        logger.out('critical', '[GG] Slave:', 'slaveId/productId property is invalid or missing');
        return false;
    } else {
        logger.out('info', '[GG] Slave.' + slaveId + ':', 'Initializing');
        return true;
    }
}

var slaveGateway = {

    slaveId : '',

    config : null,

    autoResize: null,

    initialized : false,

    load : null,

    eventHandler: null,

    msgSender : 'Slave',

    eventsMuted: false,

    muteTimeout: null,

    calculateFixedAndAbsoluteElements: false,
    
    init: function(config){
        this.initialized = true;
        this.config = config;
        this.slaveId = config.slaveId || config.productId;
        this.autoResize = config.autoResize;
        this.load = config.load || null;
        this.calculateFixedAndAbsoluteElements = config.calculateFixedAndAbsoluteElements || false;
        this.setAllowedDomains();
        //Save method reference for event listeners
        this.handleMessage = this.handleMessage.bind(this);
        //Set message handler
        window.addEventListener('message', this.handleMessage);
        //Pass the key propagation config object, event callback, event name
        if(this.config.eventPropagation) {
            this.eventHandler = eventHandler(this.config.eventPropagation, this.sendMessage.bind(this), 'Slave.Event');
        }
        if(this.config.worker) {
            this.setWorker();
        }

        if(this.config.plugins && this.config.plugins.length) {
            this.config.plugins.forEach(function(plugin) {
                plugin.setUpOnce(this);
            }.bind(this));
        }
        this.startSlaveInitialization();
    },

    setAllowedDomains : function() {
        if(this.config && this.config.allowedOrigins) {
            this.allowedOrigins = this.config.allowedOrigins;
        } else {
            this.allowedOrigins = '*';
        }
    },

    startSlaveInitialization : function() {
        this.sendMessage({
            action: 'Slave.Init',
            autoResize: this.autoResize,
            data: this.config.data,
            eventPropagation : this.config.eventPropagation,
            eventListeners : this.config.eventListeners,
            VERSION: VERSION
        });
    },

    addEventsForPropagation : function (config) {
        if(typeof config !== 'object' || Array.isArray(config)) {
            logger.out('error', '[GG] Slave.' +  this.slaveId + ':' + ' Invalid configuration for events passed');
            return false;
        }

        if(this.eventHandler instanceof 'EventHandler') {
            this.eventHandler.addEventListeners(config);
        } else {
            this.eventHandler = eventHandler(this.config.eventPropagation, this.sendMessage.bind(this), 'Slave.Event');
        }
    },

    handleMessage : function(event) {
        if (!event.data.msgSender || event.data.msgSender === this.msgSender){
            return false;
        }

        var slavePattern,
            masterPattern,
            originValid = false;

        if (this.allowedOrigins !== '*') {
            for(var i = 0; i < this.allowedOrigins.length; i++) {
                if(event.origin.match(this.allowedOrigins[i])){
                    originValid = true;
                    break;
                }
            }
        } else {
            originValid = true;
        }

        if(!originValid) {
            logger.out('critical', '[GG] Slave.' +  this.slaveId + ':' + ' Message origin is not allowed');
            return false;
        }

        if (!(event.data && event.data.action)) {
            logger.out('critical', '[GG] Master: Message action missing', event.data);

            return false;
        }

        slavePattern = new RegExp('^Slave\\.', 'g');
        masterPattern = new RegExp('^Master\\.', 'g');
        // Check if message is reserved system message (Master and Slave messages)
        if(slavePattern.test(event.data.action) || masterPattern.test(event.data.action)) {
            this.handleProtectedMessage(event);
        } else {
            this.handleSubscribedMessage(event);
        }
    },

    handleSubscribedMessage: function(event) {
        var self = this;
        var resolveOrReject;

        if (this.eventsMuted && !event.data.enforceEvent) {
            logger.out('info', '[GG] Slave.' +  this.slaveId + ':' + ' Events are muted. Use slaveUnmute event in order to receive messages from Master frame.');
            return false;
        }
        if (event.data.callback || event.data.callbacks) {
            this.parseCrossContextCallbacks(event.data);
        }
        logger.out('info', '[GG] Slave.' +  this.slaveId + ':' + ' Master message received:', event.data);
        if (event.data.async && event.data.uuid) {
            // Check if there is existing subscription on event(action + uuid)
            if (self.isSubscribed(event.data.action)) {
                resolveOrReject = function(flag, returnData){
                    self.sendMessage({
                        data: returnData || { ack: true },
                        promiseResult: flag,
                        action: event.data.action + '_' + event.data.uuid,
                        enforceEvent: !!event.data.enforceEvent,
                        async: !!event.data.async,
                        uuid: event.data.uuid
                    });
                };

                event.data.resolve = function(returnData) {
                    resolveOrReject('resolve', returnData);
                };
                event.data.reject = function(returnData) {
                    resolveOrReject('reject', returnData);
                };
                pubSub.publish(event.data.action, event.data);
                // Return subsription data, or just return ack message so promise can be resovled
              
            }
        } else {
            pubSub.publish(event.data.action, event.data);
            return false;
        }
        
    },

    handleProtectedMessage: function(event) {
        var actionName = event.data.action.replace('.', '');
        //Lowercase the first letter
        actionName = actionName.charAt(0).toLowerCase() + actionName.slice(1);

        if ((this[actionName] && !this.eventsMuted) || actionName === 'slaveUnmute' || actionName === 'slaveAwake') {
            this[actionName](event);
        } else if (this.eventsMuted) {
            logger.out('info', '[GG] Slave.' +  this.slaveId + ':' + ' Events are muted. Use slaveUnmute event in order to receive messages from Master frame.');
        } else {
            logger.out('warn', '[GG] Slave.' +  this.slaveId + ':', 'Actions with domain `Master` or `Slave` are protected!');
        }
    },

    parseCrossContextCallbacks: function(data) {
        var self = this;
        data.callbacks.forEach(function (def) {
            def.method = function() {
                return self.sendMessage({
                    action: def.cbHash,
                    data: arguments[0] || false,
                    enforceEvent: !!data.enforceEvent
                });
            };
            def.methodAsync = function() {
                return self.sendMessageAsync({
                    action: def.cbHash,
                    data: arguments[0] || false,
                    enforceEvent: !!data.enforceEvent                  
                });
            };
        });
    },

    setWorker: function(){
        var msgBlacklist = ['Slave.Resize'];

        var worker = slaveProxy.setMsgProxy(this.config.worker, {debug : this.config.debug}, pubSub.publish.bind(pubSub), this.sendMessage.bind(this));

        if(worker) {
            logger.out('info', '[GG] Slave.' +  this.slaveId + ':', 'Web worker initialized.');
            slavePorthole.setWorker(worker, msgBlacklist);
        } else {
            logger.out('error', '[GG] Slave.' +  this.slaveId + ':', 'Web worker initialization failed. Provide instance of Worker or path to file');
            return false;
        }
    },

    slaveLoad : function(event) {
        var self = this;
        logger.out('info', '[GG] Slave.' +  this.slaveId + ':', 'Starting to load.', event.data);
        
        if (this.autoResize || (typeof this.autoResize === 'undefined' && event.data.autoResize)) {
            //Pass the event callback, and event name
            contentHandler.init(this.sendMessage.bind(this), 'Slave.Resize', {
                calculateFixedAndAbsoluteElements: self.calculateFixedAndAbsoluteElements,
            });
        }

        if(this.config.plugins && this.config.plugins.length) {
            this.config.plugins.forEach(function(plugin) {
                plugin.onLoad(this, event.data);
            }.bind(this));
        }

        if(this.load) {
            this.load(event.data);
        }
    },

    slaveShown : function(event) {
        logger.out('info', '[GG] Slave:', 'Slave.Shown event received.', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    slaveAddEvents : function (config) {
        this.addEventsForPropagation(config);
    },

    masterEvent : function(event) {
        logger.out('info', '[GG] Slave.' +  this.slaveId + ':', 'Publish Master.Event event.', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    slaveMute: function(event) {
        var data = event.data,
            self = this;

        this.eventsMuted = true;
        if(data.timeout && typeof data.timeout === 'number') {
            if(this.muteTimeout) {
                clearTimeout(this.muteTimeout);
                this.muteTimeout = null;
            }
            this.muteTimeout = setTimeout(function() {
                self.eventsMuted = false;
            }, data.timeout);
        }
        logger.out('info', '[GG] Slave.' +  this.slaveId + ':', 'Slave events are muted.', event.data);
    },

    slaveUnmute: function() {
        if(this.muteTimeout) {
            clearTimeout(this.muteTimeout);
            this.muteTimeout = null;
        }
        this.eventsMuted = false;
        logger.out('info', '[GG] Slave.' +  this.slaveId + ':', 'Slave events are unmuted.', event.data);
    },

    slaveSnooze: function(event) {
        logger.out('info', '[GG] Slave.' +  this.slaveId + ':', 'Slave events are snoozed.', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    slaveAwake: function(event) {
        logger.out('info', '[GG] Slave.' +  this.slaveId + ':', 'Slave events are awaked.', event.data);
        pubSub.publish(event.data.action, event.data);
    },

    once : function(action, callback) {
        return pubSub.once(action, callback);
    },

    isSubscribed : function(action) {
        return pubSub.isSubscribed(action);
    },

    subscribe : function(action, callback) {
        return pubSub.subscribe(action, callback);
    },

    unsubscribe : function(action) {
        return pubSub.unsubscribe(action);
    },

    clearSubscriptions : function() {
        return pubSub.clearSubscriptions();
    },

    subscribeCrossContextCallbacks: function(data) {
        var event = data.action + '_' + (data.uuid ? data.uuid : uuidv4());
        var self = this;

        if(data.callbacks && Array.isArray(data.callbacks)) {
            data.callbacks.forEach(function (def, idx) {
                self._createCallbackSubscription(event, def, idx);
            });
        } else {
            self._createCallbackSubscription(event, data.callback, 0);
        }
    },

    sendMessage : function(data, origin) {
        if (this.eventsMuted && !data.enforceEvent) {
            logger.out('info', '[GG] Slave.' +  this.slaveId + ':' + ' Events are muted. Use slaveUnmute event in order to send messages to Master frame.');
            return false;
        }
        if (data.callbacks || data.callback) {
            this.subscribeCrossContextCallbacks(data);
        }
        data.slaveId = this.slaveId;
        data.msgSender = 'Slave';
        data.plugin = 'GravityGateway';
        slavePorthole.sendMessage(data, origin);
    },

    sendMessageAsync : function(data, origin, rejectDuration){
        var self = this,
            rejectTimeout = null,
            subscription;

        rejectDuration = rejectDuration || 0;

        if (this.eventsMuted && !data.enforceEvent) {
            logger.out('info', '[GG] Slave.' +  this.slaveId + ':' + ' Events are muted. Use slaveUnmute event in order to send messages to Master frame.');
            return false;
        }

        return new Promise(function(resolve, reject) {
            var event;
            data.async = true;
            data.uuid = uuidv4();
            event = data.action + '_' + data.uuid;

            if (data.callbacks || data.callback) {
                self.subscribeCrossContextCallbacks(data);
            }
            subscription = self.once(event, function(response) {
                clearTimeout(rejectTimeout);
                rejectTimeout = null;
                if (response.promiseResult === 'resolve') {
                    logger.out('info', '[GG] Slave.' +  self.slaveId + 'Promise resolved for event ' + event);
                    resolve(response.data);
                } else {
                    logger.out('info', '[GG] Slave.' +  self.slaveId + 'Promise rejected for event ' + event);
                    reject(response.data);
                }
            });

            if(rejectDuration) {
                rejectTimeout = setTimeout(function() {
                    subscription.remove();
                    reject();
                    logger.out('info', '[GG] Slave.' +  self.slaveId + 'Promise rejected after timeout for event ' + event);
                }, rejectDuration);
            }

            self.sendMessage(data, origin);
        });
    },

    _createCallbackSubscription : function(event, def, idx) {
        var subscribed;
        var cbHash = event + '_' + idx;
        var self = this;

        if (!self.isSubscribed(cbHash)) {
            subscribed = self.subscribe(cbHash, def.method);
        }
        if (subscribed) {
            def.cbHash = cbHash;
        }
        delete def.method;
    }
};

//Add aliases
slaveGateway.on = slaveGateway.subscribe;
slaveGateway.off = slaveGateway.unsubscribe;
slaveGateway.emit = slaveGateway.sendMessage;
slaveGateway.emitAsync = slaveGateway.sendMessageAsync;
slaveGateway.request = slaveGateway.sendMessageAsync;

module.exports = function(config) {
    if(config && config.debug === true) {
        logger.debug = true;
        logger.igniteDebugTerminology = config.igniteDebugTerminology || false;
    }

    if(!slaveGateway.initialized && validateInitialization(config)) {
        slaveGateway.init(config);
        return slaveGateway;
    } else if(slaveGateway.initialized) {
        return slaveGateway;
    } else {
        return false;
    }
};
