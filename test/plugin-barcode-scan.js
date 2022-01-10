var assert = require('assert'),
    sinon = require('sinon'),
    Gateway = require('../src/slave_gateway'),
    BarcodeScan = require('../plugin-barcode-scan'),
    barcodeScanPlugin = new BarcodeScan();


describe('Barcode scan', function() {
    var slaveInstance;

    beforeEach(function () {
        slaveInstance = Gateway();
    });

    afterEach(function () {
        sinon.restore();
    });

    it('on init should attach keydonw listener on document', function() {
        var spy = sinon.spy(window.document, 'addEventListener');
        barcodeScanPplugin.setUpOnce(slaveInstance);
        assert.equal(spy.called, true);
    });

    it('should emit Slave.ScanFinished when scan is finished', function() {
        var spy = sinon.spy(slaveInstance, 'emit');
        var result = '8x2lh2g02';
        var event = new KeyboardEvent('keydown', {'code': 'space'});
        document.dispatchEvent(event);
        result.split('').forEach(function(c) {
            var event = new KeyboardEvent('keydown', { 'key': c });
            document.dispatchEvent(event);
        });
      
        assert(spy.calledWith, {
            action: 'Slave.ScanFinished',
            data: {
                code: result
            }
        });
    });

    it('should emit Slave.ScanFinished when scan is finished without prefix', function() {
        var spy = sinon.spy(slaveInstance, 'emit');
        var result = '8x2lh2g02';
        result.split('').forEach(function(c) {
            var event = new KeyboardEvent('keydown', { 'key': c });
            document.dispatchEvent(event);
        });
      
        assert(spy.calledWith, {
            action: 'Slave.ScanFinished',
            data: {
                code: result
            }
        });
    });
});