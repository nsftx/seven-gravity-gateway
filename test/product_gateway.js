var ProductGateway = require('../src/product_gateway'),
    assert = require('assert'),
    dom = require('jsdom-global')(); //Inject dom in test because window deps

describe('Testing product gateway instantiation', function() {
    var productInstance;

    it('Instantiation should fail - productId missing', function() {
        productInstance = ProductGateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            data : {
                config : {}
            },
            load: function(){}
        });
        assert.equal(productInstance, false);
    });

    it('Instantiation should fail - load method missing', function() {
        productInstance = ProductGateway({
            productId : 'Product',
            allowedOrigins : ['http://www.nsoft.ba'],
            data : {
                config : {}
            }
        });
        assert.equal(productInstance, false);
    });

    it('Should return instance', function() {
        productInstance = ProductGateway({
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
        assert.strictEqual(ProductGateway(), productInstance);
    });

});