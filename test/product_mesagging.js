var gateway = require('../src/messaging/product'),
    assert = require('assert'),
    dom = require('jsdom-global')();

describe('Posting messages to platform.', function() {

    it('Received value should be 3.14', function(done) {
        gateway.sendMessage('3.14');

        window.addEventListener('message', function(e) {
            if(e.data != '3.14') {
                setTimeout(function() {
                    done(new Error("Value is " + e.data + ' but expected to be 3.14'));
                }, 50);
            } else {
                setTimeout(function() {
                    done();
                }, 50);
            }

        });
    });
});
