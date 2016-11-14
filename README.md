=Seven Gravity Gateway=


This component serves as communication layer between products and platform frames. Gateway supports cross and same origin communication between product included as iframe and platform.


=Install=


You can install this package with **npm**:


`npm install seven-gravity-gateway --save`


Seven Gravity Gateway component consists of 2 files:
 - master_gateway
 - slave_gateway


To use this component in web browser load it from !!dist!! directory in !!node_modules!!:




=Load module =


You can load module in your code using embedded require module loader:


Master gateway:


```
lang=javascript
var gateway = require('master_gateway');
```
Slave gateway:


```
lang=javascript
var gateway = require('slave_gateway');
```


==Usage=


Component is initialized by calling the module and passing the proper config object.


=====Master gateway=====


```
lang=javascript
var masterGateway = gateway({
    allowedOrigins : [],
    debug : bool,
    products : {
        ‘LiveBetting’: {
  	        frameId : frameId,
	        data : {},
	        init : function,
 	        load : function,
                loaded : function
	        scroll : bool
         }
    }
);
```


Config:
|Name|Description|Type|Required|
|products|Object with details for all products|array|Y|
|allowedOrigins|Array of allowed URIs which are allowed to exchange messages|array|N|
|debug|Debug messages setting|bool|N|


!!allowedOrigins!! If obeyed default value will be set to '*'. This prop is not required by Master and Slave gateway, but it's highly recommend.

!!products!! object contains configuration for all products. Products object must have next format: productId -> object

|Name|Description|Type|Required|
|frameId|DOM elememnt id where game frame is located|string|Y|
|data|prop passed to product to initialize product load phase.|object|Y|
|init|Callback which will be triggered when product is ready for load |function|Y|
|loaded|Callback which will trigger when product is loaded|function|N|
|scroll|Notify slave frame about scroll event in parent frame|bool|N|

!!init!! Is required callback which will be triggered when product is ready for load. In this step product can pass necessary data for initialization(e.g. Url, token, configuration…).

=====Slave gateway====


```
lang=javascript
var slaveGateway = gateway({
    productId : string,
    data : object,
    load: function,
    allowedOrigins : array,
    debug : bool
});
```
Config:
|Name|Description|Type|Required|
|productId|Product id|string|Y|
|data|Data which will be passed to platform on init(config, token...) |object|Y|
|load|Callback which will be triggered when product is ready for load|function|Y|
|allowedOrigins|Array of allowed URIs|array|N|
|debug|Debug messages setting|bool|N|

IMPORTANT: !!productId!!  must be an unique identifier of the product(unique game ID).

In order to receive scroll messages gateway must subscribe to message 'Master.Scroll'. Also scroll must be set to true in platform gateway.

In order to notify Platform about !!loaded!! event message should be sent to Platform frame in next format:

```
lang=javascript

slaveGateway.sendMessage({
    action : 'Slave.Loaded'
})
```


=====Subscription=====


Gateway uses pub/sub pattern to handle events and actions.


NOTE: action names are case sensitive, meaning that ‘betslip.Add’ and ‘Betslip.Add’ actions are different.


Subscription format:


```
lang=javascript
Gateway.subscribe('betslip.add',function)
```


It is possible to use namespaced subscriptions. e.g. If one of the products subscribes to !!betslip!! action with proper callback, events !!betslip.add!!, !!betslip.remove!! will trigger the !!betslip!! callback.


IMPORTANT: Mesagess prefixed with Product and Platform are system reserved messages and therefore they will be ignored


=====Message exchange====

=====Slave -> Master====


```
lang=javascript
Gateway.sendMessage({
    action : 'betslip.add',
}, origin)
```


Data object must contain name of action. Origin param is the origin of sender. That origin must be enabled in platform gateway in order to process the message. If origin is obeyed origin will be set to ‘*’,


=====Master -> Slave====


```
lang=javascript
Gateway.sendMessage(gameFrameId, {
    action : 'betslip.add',
    productId : 'LiveBetting'
}, origin)
```


Data object must contain name of action and productId prop. !!productId!! property is the unique id of the product to whom message is dispatched. Origin param is the origin of sender. That origin must be enabled in slave gateway in order to process the message. If origin is obeyed origin will be set to ‘*’.




IMPORTANT: !!productId!! prop must be an ID of game to which is dispatched


====Unsubscribe
Unsubscribe format:
```
lang=javascript
Gateway.unsubscribe('betslip.add’)
```


Unsubscribe will remove registered action and its callback.


====Clear subscription
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
