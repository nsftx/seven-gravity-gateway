var Gateway = require('../src/slave_gateway'),
    assert = require('assert'),
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