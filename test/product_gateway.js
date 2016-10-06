var ProductGateway = require('../src/product_gateway'),
    assert = require('assert');

describe('Testing product gateway instantiation', function() {
    var LiveBettingGateway,
        LuckySixGateway;

    it('Should return instance', function() {
        LiveBettingGateway = ProductGateway({groupId : 'LiveBetting'});
        assert.equal(typeof LiveBettingGateway, 'object');
    });

    it('Should return instance', function() {
        LuckySixGateway = ProductGateway({groupId : 'LuckySix'});
        assert.equal(typeof LuckySixGateway, 'object');
    });

    it('Instantiation should return existing instance', function() {
        assert.strictEqual(ProductGateway({groupId : 'LiveBetting'}), LiveBettingGateway);
    });

    it('Instantiation should fail', function() {
        var instance = ProductGateway();
        assert.equal(instance, false);
    });
});