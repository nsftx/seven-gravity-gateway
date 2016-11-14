var gateway = require('../src/messaging/master'),
    assert = require('assert'),
    dom = require('jsdom-global')();

describe('Posting messages to product in iframe.', function() {

    it('Received value should be 3.14', function(done) {
        var iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        gateway.sendMessage(iframe, '3.14');

        iframe.contentWindow.addEventListener('message', function(e) {
            if(e.data != '3.14') {
                done(new Error("Value is " + e.data + ' but expected to be 3.14'));
            } else {
                done();
            }

        });
    });
});
