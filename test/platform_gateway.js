var PlatformGateway = require('../src/platform_gateway'),
    assert = require('assert');

describe('Testing platform gateway instantiation', function() {
    var instance;

    it('Should return instance', function() {
        instance = PlatformGateway({allowedOrigins : ['http://www.nsoft.ba']});
        assert.equal(typeof instance, 'object');
    });

    it('Instantiation should return existing instance', function() {
        assert.strictEqual(PlatformGateway(), instance);
    });

});