var assert = require('assert'),
    sinon = require('sinon'),
    Gateway = require('../src/slave_gateway'),
    Retail = require('../plugin-retail'),
    retailPlugin = new Retail();


describe('Retail', function() {
    var slaveInstance;

    beforeEach(function () {
        slaveInstance = Gateway();
    });

    afterEach(function () {
        sinon.restore();
    });

    it('should attach document keydown listener on init', function() {
        var spy = sinon.spy(window.document, 'addEventListener');
        retailPlugin.setUpOnce(slaveInstance);
        assert.equal(spy.called, true);
    });
});
