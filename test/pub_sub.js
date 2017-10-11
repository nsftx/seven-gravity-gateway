var assert = require('assert');

describe('Subscribe/Unsubscribe funcionality', function() {
    var pubSub = require('../src/pub_sub');

    it('Subscribe: Should fail - callback missing', function() {
        var result = pubSub.subscribe('betslip.add');
        assert.equal(result, false);
    });

    it('Subscribe: Should be successful', function() {
        var result = pubSub.subscribe('betslip.add', function() {
                return true;
            }
        );
        var value = typeof result === 'object' && result !== null;
        assert.equal(value, true);
    });

    it('Is Subscribed: Should fail - Topic is not existent', function() {
        var result = pubSub.isSubscribed('betslip.remove');
        assert.equal(result, false);
    });

    it('Is Subscribed: Should pass - Topic exists', function() {
        var result = pubSub.isSubscribed('betslip.add');
        assert.equal(result, true);
    });

    it('Unsubscribe: Should fail - Topic is not existent', function() {
        var result = pubSub.unsubscribe('betslip.remove');
        assert.equal(result, false);
    });

    it('Unsubscribe: Should be successful', function() {
        var result = pubSub.unsubscribe('betslip.add');
        assert.equal(result, true);
    });
});

describe('Publish funcionality', function() {
    var pubSub = require('../src/pub_sub');

    it('Publish: Should be successful', function() {
        var value = null;
        pubSub.subscribe('betslip.add',
            function() {
                value = true;
            }
        );

        pubSub.publish('betslip.add', 'Dummy Text');
        assert.equal(value, true);
    });


    it('Publish: Should be successful - Publish namespaced action', function() {
        var value = null;
        pubSub.subscribe('ticket.*', function() {
                value = true;
            }
        );

        pubSub.publish('ticket.add');
        assert.equal(value, true);
    });


    it('Publish: Should fail - Topic is not existent', function() {
        var result = pubSub.publish('stake.update');
        assert.equal(result, false);
    });
});

describe('Subscription and callback execute', function() {

    it('Publish should be successful for both actions', function() {
        var pubSub = require('../src/pub_sub');
        var testVal1 = null;
        var testVal2 = null;
        var subscription1 = pubSub.subscribe('betslip.add',
            function() {
                testVal1 = true;
            }
        );
        var subscription2 = pubSub.subscribe('betslip.add',
            function() {
                testVal2 = true;
            }
        );

        pubSub.publish('betslip.add', 'Dummy Text');

        assert.equal(testVal1 === true, testVal2 === true);
    });

    it('Removing subscripton from first action should trigger only second subscription', function() {
        var pubSub = require('../src/pub_sub');
        var testVal1 = null;
        var testVal2 = null;
        var subscription1 = pubSub.subscribe('betslip.add',
            function() {
                testVal1 = true;
            }
        );
        var subscription2 = pubSub.subscribe('betslip.add',
            function() {
                testVal2 = true;
            }
        );

        subscription1.remove();

        pubSub.publish('betslip.add', 'Dummy Text');

        assert.equal(testVal1 === null, testVal2 === true);
    });
})

describe('Clear subscriptions', function() {
    var pubSub = require('../src/pub_sub');

    it('Publish: Should fail - Topics are empty', function() {
        pubSub.subscribe('betslip.add', function() {
                return true;
            }
        );

        pubSub.clearSubscriptions();

        var result = pubSub.publish('betslip.add');
        assert.equal(result, false);
    });
});