var Gateway = require('../src/slave_gateway'),
    assert = require('assert'),
    dom = require('jsdom-global')(); //Inject dom in test because window deps

describe('Slave gateway instantiation', function() {
    var productInstance;

    it('Instantiation should fail - productId missing', function() {
        productInstance = Gateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            data : {
                config : {}
            },
            load: function(){}
        });
        assert.equal(productInstance, false);
    });

    it('Should return instance', function() {
        productInstance = Gateway({
            productId : 'Product',
            allowedOrigins : ['http://www.nsoft.ba']
        });
        assert.equal(typeof productInstance, 'object');
    });

    it('Should return instance', function() {
        productInstance = Gateway({
            productId : 'Product',
            allowedOrigins : ['http://www.nsoft.ba'],
            data : {
                config : {}
            },
            load: function(){}
        });
        assert.equal(typeof productInstance, 'object');
    });

    it('Instantiation should return existing instance', function() {
        assert.strictEqual(Gateway(), productInstance);
    });
});