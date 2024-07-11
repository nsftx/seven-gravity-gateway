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
        barcodeScanPlugin.setUpOnce(slaveInstance);
        assert.equal(spy.called, true);
    });

    it('should emit Slave.ScanFinished when scan is finished', function() {
        var spy = sinon.spy(slaveInstance, 'emit');
        var result = '8x2lh2g02';
        var event = new KeyboardEvent('keydown', {'code': 'space'});
        var enterEvent = new KeyboardEvent('keydown', {'key': 'Enter', 'code': 'Enter'});
        document.dispatchEvent(event);
        result.split('').forEach(function(c) {
            var event = new KeyboardEvent('keydown', { 'key': c, 'code': `Key${c.toUpperCase()}` });
            document.dispatchEvent(event);
        });
        document.dispatchEvent(enterEvent);
        assert(spy.calledWith(sinon.match({
            action: 'Slave.ScanFinished',
            data: { code: result }
        })));
    });

    it('should emit Slave.ScanFinished when scan is finished without prefix', function() {
        var spy = sinon.spy(slaveInstance, 'emit');
        var result = '8x2lh2g02';
        var enterEvent = new KeyboardEvent('keydown', {'key': 'Enter', 'code': 'Enter'});
        result.split('').forEach(function(c) {
            var event = new KeyboardEvent('keydown', { 'key': c, 'code': `Key${c.toUpperCase()}` });
            document.dispatchEvent(event);
        });
        document.dispatchEvent(enterEvent);
        assert(spy.calledWith(sinon.match({
            action: 'Slave.ScanFinished',
            data: { code: result }
        })));
    });

    it('should emit Slave.ScanFinished when scan is finished without prefix', function() {
        var spy = sinon.spy(slaveInstance, 'emit');
        var keys = ['Ctrl', 'b', '8', 'x', '2', 'l', 'h', '2', 'g', '0', '2'];
        var result = 'b8x2lh2g02';
        var enterEvent = new KeyboardEvent('keydown', {'key': 'Enter', 'code': 'Enter'});
        keys.forEach(function(c) {
            var key;
            var code;
            if( Object.prototype.toString.call(c) === '[object Object]' ) {
                key = c.key;
                code = c.code;
            } else {
                key = c;
                code = `Key${c.toUpperCase()}`;
            }
            var event = new KeyboardEvent('keydown', { 'key': key, 'code': code });
            document.dispatchEvent(event);
        });
        document.dispatchEvent(enterEvent);
        assert(spy.calledWith(sinon.match({
            action: 'Slave.ScanFinished',
            data: {
                code: result
            }
        })));
    });

    it('should emit Slave.ScanFinished when diff between keys is higher than default value', function(done) {
        var spy = sinon.spy(slaveInstance, 'emit');
        var keys = ['Ctrl', 'b', { 'key': ' ', 'code': 'Space' }, '8', 'x', '2', 'l', 'h', '2', 'g', '0', '2'];
        var result = '8x2lh2g02';
        var enterEvent = new KeyboardEvent('keydown', {'key': 'Enter', 'code': 'Enter'});
        keys.forEach(function(c) {
            var key;
            var code;
            if( Object.prototype.toString.call(c) === '[object Object]' ) {
                key = c.key;
                code = c.code;
            } else {
                key = c;
                code = `Key${c.toUpperCase()}`;
            }
            var event = new KeyboardEvent('keydown', { 'key': key, 'code': code });
            document.dispatchEvent(event);
        });

        setTimeout(function() {
            document.dispatchEvent(enterEvent);
            assert(spy.calledWith(sinon.match({
                action: 'Slave.ScanFinished',
                data: {
                    code: result
                }
            })));
            done();
        }, 100);
    });

    it('should not stop propagation after scan is finished', function(done) {
        var spy = sinon.spy(slaveInstance, 'emit');
        var keys = ['Ctrl', 'b', { 'key': ' ', 'code': 'Space' }, '8', 'x', '2', 'l', 'h', '2', 'g', '0', '2'];
        var result = '8x2lh2g02';
        var enterEvent = new KeyboardEvent('keydown', {'key': 'Enter', 'code': 'Enter'});
        var onKeyDownCallback = sinon.spy();
        window.document.addEventListener('keydown', onKeyDownCallback);
        keys.forEach(function(c) {
            var key;
            var code;
            if( Object.prototype.toString.call(c) === '[object Object]' ) {
                key = c.key;
                code = c.code;
            } else {
                key = c;
                code = `Key${c.toUpperCase()}`;
            }
            var event = new KeyboardEvent('keydown', { 'key': key, 'code': code });
            document.dispatchEvent(event);
        });

        document.dispatchEvent(enterEvent);
        assert(spy.calledWith(sinon.match({
            action: 'Slave.ScanFinished',
            data: {
                code: result
            }
        })));
        setTimeout(function() {
            document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Enter', 'code': 'Enter'}));
            assert(onKeyDownCallback.called);
            done();
        }, 100);
    });
});