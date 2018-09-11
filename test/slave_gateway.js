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
});