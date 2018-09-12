var porthole = require('../src/messaging/slave'),
    assert = require('assert'),
    dom = require('jsdom-global')();

describe('Posting messages to master.', function () {
    it('Received value should be 3.14', function (done) {
        var messageHandler = function (e) {
            window.removeEventListener('message', messageHandler);
            if (e.data != '3.14') {
                setTimeout(function () {
                    done(new Error("Value is " + e.data + ' but expected to be 3.14'));
                });
            } else {
                setTimeout(function () {
                    done();
                });
            }
        };

        window.addEventListener('message', messageHandler);
        porthole.sendMessage('3.14');
    });
});
