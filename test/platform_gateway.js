var PlatformGateway = require('../src/platform_gateway'),
    assert = require('assert'),
    dom = require('jsdom-global')(); //Inject dom in test because window deps

describe('Testing platform gateway instantiation', function() {
    var instance;

    it('Instantiation should fail - frameId missing', function() {
        instance = PlatformGateway({
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

    it('Instantiation should fail - initi method missing', function() {
        instance = PlatformGateway({
            allowedOrigins : ['http://www.nsoft.ba'],
            products : {
                'product': {
                    frameId: 'product',
                    data : {},
                    scroll : true,
                    loaded : function(){}
                }
            }
        });

        assert.equal(instance, false);
    });

    it('Should return instance', function() {
        instance = PlatformGateway({
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
        assert.strictEqual(PlatformGateway(), instance);
    });

});