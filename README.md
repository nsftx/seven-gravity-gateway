=Seven Gravity Gateway=

This component serves as communication layer between products and platform frames

=Install=

You can install this package with **npm**:

`npm install seven-gravity-gateway --save`

Seven Gravity Gateway component consists of 2 files:
 - platform_gateway
 - product_gateway

To use this component in web browser load it from !!dist!! directory in !!node_modules!!:


== Load module ==

You can load module in your code using embedded require module loader:

Platform gateway:

```
lang=javascript
var platformGateway = require('platform_gateway');
```
Product gateway:

```
lang=javascript
var productGateway = require('product_gateway');
```

=Usage=

==Product gateway==

To instantiate gateway, module should be called with !!getInstance!! method.

```
lang=javascript
var Gateway = productGateway.getInstance($groupId);
```

IMPORTANT: !!groupId!! param is mandatory for product gateway component an its value must be an ID of the game.

== Platfrom gateway==


```
lang=javascript
var Gateway = platformGateway.getInstance();
```

NOTE: Gateway per product/platforms are singleton and !!getInstance!! should be called only once, otherwise return value of !!getInstance!! will be !!false!!.

==Subscription==

Gateway uses pub/sub pattern to handle events and actions.

Subscription format:

```
lang=javascript
Gateway.subscribe({
    action : 'betslip.add',
    callback: function
})
```

==Message exchange==

Product -> Platfrom

```
lang=javascript
Gateway.sendMessage({
    action : 'betslip.add',
})
```

Platform -> Product

```
lang=javascript
Gateway.sendMessage(gameFrame, {
    action : 'betslip.add',
    groupId : 'LiveBetting'
})
```

IMPORTANT: !!groupId!! prop must be an ID of game to which message is dispatched

=Running tests=

To run unit tests on whole library run:

```
npm test
```

=Publishing=

This library can be published to `npm.nsoft.ba` registry.
To publish run command:

```
npm publish
```

When publishing, npm will automatically run tests.

It is very important that you set valid version in package before publishing.