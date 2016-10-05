var ProductGateway = require('../src/product_gateway'),
    assert = require('assert');

describe('Testing product gateway instantiation', function() {
    it('Should return instance', function() {
        var instance = ProductGateway.getInstance('LiveBetting');
        assert.equal(typeof instance, 'object');
    });

    it('Should return instance', function() {
        var instance = ProductGateway.getInstance('LuckySix');
        assert.equal(typeof instance, 'object');
    });

    it('Instantiation should fail', function() {
        var instance = ProductGateway.getInstance('LiveBetting');
        assert.equal(instance, false);
    });

    it('Instantiation should fail', function() {
        var instance = ProductGateway.getInstance();
        assert.equal(instance, false);
    });
});