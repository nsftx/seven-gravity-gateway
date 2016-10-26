=Seven Gravity Gateway=


This component serves as communication layer between products and platform frames. Gateway supports cross and same origin communication between product included as iframe and platform.


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
var Gateway = productGateway({
    productId : $productId,
    initData : object,
    loadCallback: function,
    allowedOrigins : [],
    debugMode : bool
});
```
Config:
|Name|Description|Type|Required|
|productId|Product id|string|Y|
|initData|Data necesarry for product init(config, token...) id|object|Y|
|loadCallback|Callback which will be triggered when product is ready for load|function|Y|
|allowedOrigins|Array of allowed URIs|array|N|
|debugMode|Debug messages setting|bool|N|


IMPORTANT: !!productId!!  must be an unique identifier of the product(unique game ID).


== Platfrom gateway==


```
lang=javascript
var Gateway = platformGateway({
    allowedOrigins : [],
    debugMode : bool,
    products : {
        ‘LiveBetting’: {
  	    frame: frameId,
	    data : {},
	    productInitCallback : function,
	    productLoadedCallback : function,

         }
    }
);
```


Config:
|Name|Description|Type|Required|
|products|Object with details for all products|array|Y|
|allowedOrigins|Array of allowed URIs|array|N|
|debugMode|Debug messages setting|bool|N|


!!allowedOrigins!! param contains array of URI's which are allowed to exchange messages with gateway. If obeyed default value will be set to '*'. This prop is not required by Product and Platform gateway, but it's highly recommend.

!!data!! prop passed to product to initialize //product load// phase.

!!productInitCallback!! Is required callback which will be triggered when product is ready for load. In this step product can pass necessary data for initialization(e.g. Url, token, configuration…).


!!productLoadedCallback!! Is optional callback which will be triggered when product is loaded(eg removing loader).


==Subscription==


Gateway uses pub/sub pattern to handle events and actions.


NOTE: action names are case sensitive, meaning that ‘betslip.Add’ and ‘Betslip.Add’ actions are different.


Subscription format:


```
lang=javascript
Gateway.subscribe({
    action : 'betslip.add',
    callback: function
})
```


It is possible to use namespaced subscriptions. e.g. If one of the products subscribes to !!betslip!! action with proper callback, events !!betslip.add!!, !!betslip.remove!! will trigger the !!betslip!! callback.


IMPORTANT: Mesagess prefixed with Product and Platform are system reserved messages and therefore they will be ignored


=Message exchange==
=====Product -> Platfrom====


```
lang=javascript
Gateway.sendMessage({
    action : 'betslip.add',
}, origin)
```


Data object must contain name of action. Origin param is the origin of sender. That origin must be enabled in platform gateway in order to process the message. If origin is obeyed origin will be set to ‘*’,


=====Platform -> Product====


```
lang=javascript
Gateway.sendMessage(gameFrameId, {
    action : 'betslip.add',
    productId : 'LiveBetting'
}, origin)
```


Data object must contain name of action and productId prop. !!productId!! property is the unique id of the product to whom message is dispatched. Origin param is the origin of sender. That origin must be enabled in product gateway in order to process the message. If origin is obeyed origin will be set to ‘*’.




IMPORTANT: !!productId!! prop must be an ID of game to which is dispatched


==Unsubscribe
Unsubscribe format:
```
lang=javascript
Gateway.unsubscribe({
   action : 'betslip.add’
})
```


Unsubscribe will remove registered action and its callback.


==Clear subscription
```
lang=javascript
Gateway.clearSubscriptions()
```


This will remove all subscribed actions and callbacks.


==Running tests
To run unit tests on whole library run:
```
lang=javascript
npm test
```


==Publishing
This library can be published to npm.nsoft.ba registry. To publish run command:
```
lang=javascript
npm publish
```


When publishing, npm will automatically run tests.
It is very important that you set valid version in package before publishing.
