var Gateway = require('../src/master_gateway'),
    assert = require('assert'),
    dom = require('jsdom-global')(); //Inject dom in test because window deps

describe('Testing master gateway instantiation', function() {
    var instance;

    it('Instantiation should fail - frameId missing', function() {
        instance = Gateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            products : {
                'product': {
                    data : {},
                    scroll : true,
                    init : function(){},
                    loaded : function(){}
                }
            }
        });
        assert.equal(instance, false);
    });

    it('Should return instance', function() {
        instance = Gateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            products : {
                'product': {
                    frameId: 'product'
                }
            }
        });

        assert.equal(typeof instance, 'object');
    });

    it('Should return instance', function() {
        instance = Gateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            products : {
                'product': {
                    frameId: 'product',
                    data : {},
                    scroll : true,
                    init : function(){},
                    loaded : function(){}
                }
            }
        });
        assert.equal(typeof instance, 'object');
    });

    it('Instantiation should return existing instance', function() {
        assert.strictEqual(Gateway(), instance);
    });

});