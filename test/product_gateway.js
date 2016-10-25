var ProductGateway = require('../src/product_gateway'),
    assert = require('assert'),
    dom = require('jsdom-global')(); //Inject dom in test because window deps

describe('Testing product gateway instantiation', function() {
    var productInstance;

    it('Should return instance', function() {
        productInstance = ProductGateway({
            productId : 'Product',
            initData : {
                gameConfig : {}
            },
            loadCallback: function(){},
            allowedOrigins : ['http://www.nsoft.ba']
        });
        assert.equal(typeof productInstance, 'object');
    });

    it('Instantiation should return existing instance', function() {
        assert.strictEqual(ProductGateway(), productInstance);
    });

});