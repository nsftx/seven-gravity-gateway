var gateway = require('../src/messaging/platform'),
    assert = require('assert'),
    dom = require('jsdom-global')();

describe('Posting messages to product in iframe.', function() {
    var iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    it('Received value should be 3.14', function(done) {
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

// Add timeout to done callback because we get strange errors
// https://github.com/mochajs/mocha/issues/1066

describe('Posting messages to product in window object.', function() {

    it('Received value should be 3.14', function(done) {
        gateway.sendMessage(window, '3.14');

        window.addEventListener('message', function(e) {

            if(e.data != '3.14') {
                setTimeout(function() {
                    done(new Error("Value is " + e.data + ' but expected to be 3.14'));
                }, 50)
            } else {
                setTimeout(done, 50);
            }

        });
    });
});
