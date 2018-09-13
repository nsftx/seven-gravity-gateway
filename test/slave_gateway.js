var Gateway = require('../src/slave_gateway'),
    assert = require('assert'),
    sinon = require('sinon'),
    expect = require('chai').expect,
    dom = require('jsdom-global')(); //Inject dom in test because window deps

describe('Slave gateway instantiation', function() {
    var slaveInstance;

    it('Instantiation should fail - Configuration not passed', function() {
        slaveInstance = Gateway();
        assert.equal(slaveInstance, false);
    });

    it('Instantiation should fail - productId missing', function() {
        slaveInstance = Gateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            data : {
                config : {}
            },
            load: function(){}
        });
        assert.equal(slaveInstance, false);
    });

    it('Should return instance', function() {
        slaveInstance = Gateway({
            productId : 'Product',
            allowedOrigins : ['http://www.nsoft.ba']
        });
        assert.equal(typeof slaveInstance, 'object');
    });

    it('Should return instance', function() {
        slaveInstance = Gateway({
            productId : 'Product',
            allowedOrigins : ['http://www.nsoft.ba'],
            data : {
                config : {}
            },
            load: function(){}
        });
        assert.equal(typeof slaveInstance, 'object');
    });

    it('Instantiation should return existing instance', function() {
        assert.strictEqual(Gateway(), slaveInstance);
    });
});

describe('Slave gateway message exchange', function() {
    var slavePorthole = require('../src/messaging/slave');

    afterEach(function () {
        sinon.restore();
    });

    it('Should send message', function() {
        var instance = Gateway({
            productId : 'Product',
            allowedOrigins : ['http://www.nsoft.ba'],
            data : {
                config : {}
            }
        });
        var spy = sinon.spy(slavePorthole, 'sendMessage');
        instance.sendMessage({}, '*');
        assert.equal(spy.called, true);
    });

    it('Should call subscribeCrossContextCallbacks', function() {
        var instance = Gateway({
            productId : 'Product',
            allowedOrigins : ['http://www.nsoft.ba'],
            data : {
                config : {}
            }
        });
        var spy = sinon.spy(instance, 'subscribeCrossContextCallbacks');
        instance.sendMessage({
            action : 'Widget.TestMsg',
            callbacks : [
                {
                    title: 'Dummy msg',
                    method: function() {
                        // Code here
                    }
                }
            ]
        }, '*');
        assert.equal(spy.called, true);
    });

    it('Should succesfully subscribe cross context callbacks', function() {
        var instance = Gateway({
            productId : 'Product',
            allowedOrigins : ['http://www.nsoft.ba'],
            data : {
                config : {}
            }
        });
        var msgData =  {
            action : 'Widget.TestMsg',
            callbacks : [
                {
                    title: 'Dummy msg',
                    method: function() {
                        // Code here
                    }
                }
            ]
        };
        instance.sendMessage(msgData, '*');
        expect(msgData.callbacks[0].cbHash).to.be.a('string');
    });

    it('parseCrossContextCallbacks should attach methods', function() {
        var instance = Gateway({
            productId : 'Product',
            allowedOrigins : ['http://www.nsoft.ba'],
            data : {
                config : {}
            }
        });
        var eventData = {
            data: {
                action: 'Widget.TestMsg',
                msgSender: 'Master',
                callbacks : [
                    {
                        method: 1,
                        cbHash: '123456'
                    }
                ]
            },
            origin: 'http://www.nsoft.ba'
        }

        instance.handleMessage(eventData);
        expect(eventData.data.callbacks[0]).to.have.property('method')
        expect(eventData.data.callbacks[0]).to.have.property('methodAsync');
    });

    it('parseCrossContextCallbacks should call sendMessageAsync', function() {
        var instance = Gateway();
        var spy = sinon.spy(instance, 'sendMessageAsync');
        var eventData = {
            data: {
                action: 'Widget.TestMsg',
                msgSender: 'Master',
                slaveId: 'dummy',
                callbacks : [
                    {
                        method: 1,
                        cbHash: '123456'
                    }
                ]
            },
            origin: 'http://www.nsoft.ba'
        }
        instance.handleMessage(eventData);
        eventData.data.callbacks[0].methodAsync();
        assert.equal(spy.called, true);
    });

    it('Should succesfully subscribe cross context callback', function() {
        var instance = Gateway({
            productId : 'Product',
            allowedOrigins : ['http://www.nsoft.ba'],
            data : {
                config : {}
            }
        });
        var msgData =  {
            action : 'Widget.TestMsg',
            callback : {
                title: 'Dummy msg',
                method: function() {
                    // Code here
                }
            }
            
        };
        instance.sendMessage(msgData, '*');
        expect(msgData.callback.cbHash).to.be.a('string');
    });
});