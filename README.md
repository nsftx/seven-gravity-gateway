=Seven Gravity Gateway=

This component serves as communication layer between master and slave frames. Gateway supports cross and same origin communication between frames on same page.

=Install=

You can install this package with **npm**:

`npm install seven-gravity-gateway --save`

Seven Gravity Gateway component consists of 2 files:
 - master
 - slave


To use this component in web browser load it from `dist` directory in `node_modules`:

=Load module =

You can load module for use in browser or as node module.


====In browser use====

For use in browser we can load it using embedded require module loader:

Master gateway:

```
lang=javascript
var masterGateway = require('master');
```
Slave gateway:

```
lang=javascript
var slaveGateway = require('slave');
```

====As node module====

To load both modules:
```
lang=javascript
require('seven-gravity-gateway')
```

Result with be object with `master` and `slave` properties

We can load separately `master` or `slave` module by requiring:

For master:
```
lang=javascript
require('seven-gravity-gateway/master')
```

For slave:
```
lang=javascript
require('seven-gravity-gateway/slave')
```

==Usage=

Component is initialized by calling the module and passing the proper config object.

=====Master gateway=====

Config:
|Name|Description|Type|Required|
|products|Object with details for all products|object|Y|
|allowedOrigins|Array of allowed URIs which are allowed to exchange messages. Default value is '*'|array|N|
|debug|Debug messages setting|bool|N|


```
lang=javascript
var master= masterGateway({
    allowedOrigins : [],
    debug : bool,
    products : {
         productId: {
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

`products` property must be an object with next properties:

|Name|Description|Type|Required|
|frameId|DOM id where game frame is located|string|Y|
|data|data passed to product to run the product load phase.|object|Y|
|init|Callback which will be triggered when product is ready for load. It will be triggered when product is ready for load.|function|N|
|loaded|Callback which will trigger when product is loaded|function|N|
|scroll|Notify slave frame about scroll event in parent frame|bool|N|

Init and loaded methods can be used to indicate that product is in loading phase. e.g. start the loader on init and remove the loader on loaded event.


=====Slave gateway====

```
lang=javascript
var slave = slaveGateway({
    productId : string,
    data : object,
    load: function,
    allowedOrigins : array,
    debug : bool
});
```
Config:
|Name|Description|Type|Required|
|productId|must be an unique identifier of the product(unique game ID).|string|Y|
|data|Data which will be passed to platform on init(config, routes...) |object|Y|
|load|Callback which will be triggered when product starts to load|function|Y|
|allowedOrigins|Array of allowed URIs|array|N|
|debug|Debug messages setting|bool|N|

==== Scrolling ====

In order to notify product about scroll event in parent frame, `scroll``must be set to `true` in products object of master's configuration.

To receive scroll messages slave gateway must subscribe to message 'Master.Scroll' with proper callback.

==== Loaded Callback ====

If product needs to inform the parent frame that it has been successfully loaded `Slave.Loaded` msg should be dispatched to parent frame.


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

IMPORTANT: Mesagess prefixed with Master and Slave are system reserved messages and therefore they will be ignored

=====Keybinding propagation=====

In order to dispatch the events from slave to master, slave needs to pass `keyPropagation` property in init stage as part of `data` node.

`keyPropagation` has next format:

```
keyPropagation : {
  {$eventType} : [keyCode or key]
},
```

Array of bindings which will be propagated can be written as list of:

 - keyCodes(85 for u)
 - keys(letter 'u')
 - combined ["u", 73].

Key and letter combinations must be provided with + sign - e.g. `Ctrl+u` or `17+85` or combined `Ctrl+85`.

Format of dispatched message is:

```
{
  "action": "Slave.Event",
  "event": "keyup",
  "key": "u",
  "keyCode": 85,
  "keyboardButton": "KeyU",
  "shiftKey": false,
  "altKey": false,
  "metaKey": false,
  "ctrlKey": false,
  "productId": "LiveBetting",
  "msgSender": "Slave"
}
```

In order to dispatch the events from master to slave, slave needs to pass `keyListeners` prop in configuration declaring which keys he wants to listen. Format is the same.

(NOTE) It is advised to use the keyCodes for key binding definition

=====Message exchange====

**Master -> Slave**

```
lang=javascript
Gateway.sendMessage(frameId, {
    action : 'betslip.add',
    productId : $productId
}, origin)
```

Object must contain name of action and productId property. `productId` property is the unique id of the product to which message is dispatched. Origin param is the origin of sender. That origin must be enabled in slave gateway in order to process the message. If origin is obeyed origin will be set to ‘*’.

**Slave -> Master**

```
lang=javascript
Gateway.sendMessage({
    action : 'betslip.add',
}, origin)
```

Object must contain name of action. Origin param is the origin of sender. That origin must be enabled in platform gateway in order to process the message. If origin is obeyed origin will be set to ‘*’,

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