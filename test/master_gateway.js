var assert = require('assert'),
    sinon = require('sinon'),
    expect = require('chai').expect;

describe('Master gateway instantiation', function() {
    var instance,
        Gateway = require('../src/master_gateway');

    before(function () {
        this.jsdom = require('jsdom-global')('<html><div id="test-frame">Hello world</div></html>');
    });
    it('Instantiation should fail - Configuration not passed', function() {
        instance = Gateway();
        assert.equal(instance, false);
    });

    it('Instantiation should fail - frameId missing', function() {
        instance = Gateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            products : {
                'product': {
                    data : {},
                    scroll : true,
                    init : function(){},
                    loaded : function(){}
                }
            }
        });
        assert.equal(instance, false);
    });

    it('Should return instance', function() {
        instance = Gateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            products : {
                'product': {
                    frameId: 'product'
                }
            }
        });

        assert.equal(typeof instance, 'object');
    });

    it('Adding slaves on fly should fail - frameId missing', function() {
        var result = instance.addSlave({
            slaveId : 'dummy'
        });

        assert.equal(result, false);
    });

    it('Adding slaves on fly should fail - slaveId missing', function() {
        var result = instance.addSlave({
            frameId : 'dummy'
        });

        assert.equal(result, false);
    });

    it('Adding slaves on fly should pass', function() {
        instance.addSlave({
            frameId : 'dummy',
            slaveId : 'dummy'
        });

        assert.equal(instance.slaves.hasOwnProperty('dummy'), true);
    });

    it('Removing slaves on fly should fail', function() {
        var result = instance.removeSlave();
        assert.equal(result, false);
    });

    it('Removing slaves on fly should pass', function() {
        instance.removeSlave('dummy');
        assert.equal(instance.slaves.hasOwnProperty('dummy'), false);
    });

    it('Should prevent another loaded callback if a slave is already loaded', function() {
        instance.addSlave({
            frameId : 'dummy',
            slaveId : 'dummy',
        });
        var slaveData = {
            frameId : 'dummy',
            loaded: function () {},
        };
        instance.slaveLoaded({}, slaveData);
        var value = instance.slaveLoaded({}, slaveData);
        assert.equal(value, false);
    });

    it('Should prevent another loaded callback if loaded callback is not provided', function() {
        instance.addSlave({
            frameId : 'dummy',
            slaveId : 'dummy',
        });
        var slaveData = {
            frameId : 'dummy',
        };
        var value = instance.slaveLoaded({}, slaveData);
        assert.equal(value, false);
    });

    it('Should return instance', function() {
        instance = Gateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            products : {
                'product': {
                    frameId: 'product',
                    data : {},
                    scroll : true,
                    init : function(){},
                    loaded : function(){}
                }
            }
        });
        assert.equal(typeof instance, 'object');
    });

    it('Should return existing instance', function() {
        assert.strictEqual(Gateway(), instance);
    });

    it('Send msg to all slaves should fail', function() {
        var result;
        instance.removeSlave('dummy');
        result = instance.sendToAll('Test msg', '*');

        assert.equal(result, false);
    });

    it('Send msg to all slaves should pass', function() {
        var result;
        instance.addSlave({
            frameId : 'dummy',
            slaveId : 'dummy'
        });
        result = instance.sendToAll('Test msg', '*');

        assert.equal(result, undefined);
    });

    it('Get all slaves should pass', function () {
        var result = instance.getAll();

        assert.equal(Object.keys(result).length ,1);
    });

});

describe('Master gateway message exchange', function() {
    var Gateway = require('../src/master_gateway'),
        masterPorthole = require('../src/messaging/master');

    afterEach(function () {
        sinon.restore();
    });

    it('Should send message', function() {
        var instance = Gateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            products : {
                'product': {
                    frameId: 'product'
                }
            }
        });
        var spy = sinon.spy(masterPorthole, 'sendMessage');
        instance.sendMessage('test-frame', {}, '*');
        assert.equal(spy.called, true);
    });

    it('Should call subscribeCrossContextCallbacks', function() {
        var instance = Gateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            products : {
                'product': {
                    frameId: 'product'
                }
            }
        });
        var spy = sinon.spy(instance, 'subscribeCrossContextCallbacks');
        instance.sendMessage('test-frame', {
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
            allowedOrigins : ['http://www.nsoft.ba'],
            products : {
                'product': {
                    frameId: 'product'
                }
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
        instance.sendMessage('test-frame', msgData, '*');
        expect(msgData.callbacks[0].cbHash).to.be.a('string');
    });

    it('Should call parseCrossContextCallbacks', function() {
        var instance = Gateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            products : {
                'product': {
                    frameId: 'product'
                }
            }
        });
        var spy = sinon.spy(instance, 'parseCrossContextCallbacks');
        var eventData = {
            data: {
                action: 'Widget.TestMsg',
                msgSender: 'Slave',
                slaveId: 'dummy',
                callbacks : [
                    {
                        method: 1,
                        cbHash: '123456'
                    }
                ]
            },
            origin: 'http://www.nsoft.ba'
        };

        instance.handleMessage(eventData);
        assert.equal(spy.called, true);
    });

    it('parseCrossContextCallbacks should attach methods', function() {
        var instance = Gateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            products : {
                'dummy': {
                    frameId: 'dummy'
                }
            }
        });
        var eventData = {
            data: {
                action: 'Widget.TestMsg',
                msgSender: 'Slave',
                slaveId: 'dummy',
                callbacks : [
                    {
                        method: 1,
                        cbHash: '123456'
                    }
                ]
            },
            origin: 'http://www.nsoft.ba'
        };

        instance.handleMessage(eventData);
        expect(eventData.data.callbacks[0]).to.have.property('method');
        expect(eventData.data.callbacks[0]).to.have.property('methodAsync');
    });

    it('parseCrossContextCallbacks should call sendMessageAsync', function() {
        var instance = Gateway();
        var spy = sinon.spy(instance, 'sendMessageAsync');
        var eventData = {
            data: {
                action: 'Widget.TestMsg',
                msgSender: 'Slave',
                slaveId: 'dummy',
                callbacks : [
                    {
                        method: 1,
                        cbHash: '123456'
                    }
                ]
            },
            origin: 'http://www.nsoft.ba'
        };
        instance.handleMessage(eventData);
        eventData.data.callbacks[0].methodAsync();
        assert.equal(spy.called, true);
    });

    it('Should succesfully subscribe cross context callback', function() {
        var instance = Gateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            products : {
                'product': {
                    frameId: 'product'
                }
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
        instance.sendMessage('test-frame', msgData, '*');
        expect(msgData.callback.cbHash).to.be.a('string');
    });

    it('Should succesfully subscribe once', function() {
        var instance = Gateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            products : {
                'dummy': {
                    frameId: 'dummy'
                }
            }
        });
        var result = instance.once('betslip.toggle', function() {
            // eslint-disable-next-line
            var onceValue = true;
        });
        var value = typeof result === 'object';
        assert.equal(value, true);
    });

    it('Executing once subscription: Should be succesfull', function() {
        var instance = Gateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            products : {
                'dummy': {
                    frameId: 'dummy'
                }
            }
        });
        var eventData = {
            data: {
                action: 'betslip.toggle_bet',
                msgSender: 'Slave',
                slaveId: 'dummy'
            },
            origin: 'http://www.nsoft.ba'
        };
        instance.once('betslip.toggle_bet', function() {
            // eslint-disable-next-line
            var  onceValue = true;
        });
        assert.equal(instance.isSubscribed('betslip.toggle_bet'), true);
        instance.handleMessage(eventData);
        assert.equal(instance.isSubscribed('betslip.toggle_bet'), false);
    });
});