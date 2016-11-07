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
        pubSub.subscribe('betslip.add',
            function() {
                return true;
            }
        );

        var result = pubSub.publish('betslip.add', 'Dummy Text');
        assert.equal(result, true);
    });


    it('Publish: Should be successful - Publish namespaced action', function() {
        pubSub.subscribe('ticket', function() {
                return true;
            }
        );

        var result = pubSub.publish('ticket.add');
        assert.equal(result, true);
    });


    it('Publish: Should fail - Topic is not existent', function() {
        var result = pubSub.publish('stake.update');
        assert.equal(result, false);
    });
});

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