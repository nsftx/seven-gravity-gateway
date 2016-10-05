var PlatformGateway = require('../src/platform_gateway'),
    assert = require('assert');

describe('Testing platform gateway instantiation', function() {
    it('Should return instance', function() {
        var instance = PlatformGateway.getInstance();
        assert.equal(typeof instance, 'object');
    });

    it('Instantiation should fail', function() {
        var instance = PlatformGateway.getInstance();
        assert.equal(instance, false);
    });

});