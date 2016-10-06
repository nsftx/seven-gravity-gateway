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

Component is initialized by calling the module and passing the proper config object.

==Product gateway==

```
lang=javascript
var Gateway = productGateway({groupId : $groupId, allowedOrigins : []});
```
Config:
|Name|Description|Type|Required|
|groupId|Product id|string|Y|
|allowedOrigins|Array of allowed URIs|array|N|

IMPORTANT: !!groupId!! param is mandatory for product gateway component an its value must be an ID of the product.

== Platfrom gateway==

```
lang=javascript
var Gateway = platformGateway({allowedOrigins : []});
```

Config:
|Name|Description|Type|Required|
|allowedOrigins|Array of allowed URIs|array|N|

!!allowedOrigins!! param contains array of URI's which are allowed to exchange messages with gateway. If obeyed default value will be set to '*'. This prop is not required by Product and Platform gateway, but it's highly recommend.

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

It is possible to use namespaced subscriptions. e.g. If one of the products subscribes to !!betslip!! action with proper callback, events 'betslip.add', 'betslip.remove' will trigger the !!betslip!! callback.

==Message exchange==

Product -> Platfrom

```
lang=javascript
Gateway.sendMessage({
    action : 'betslip.add',
}, origin)
```

Platform -> Product

```
lang=javascript
Gateway.sendMessage(gameFrame, {
    action : 'betslip.add',
    groupId : 'LiveBetting'
}, origin)
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