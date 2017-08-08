var assert = require('assert'),
    dom = require('jsdom-global')(); //Inject dom in test because window deps

describe('Master gateway instantiation', function() {
    var instance,
        Gateway = require('../src/master_gateway');

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

});