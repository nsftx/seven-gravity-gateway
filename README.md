=Seven Gravity Gateway=

This component serves as communication layer between master and slave frames. Gateway supports cross and same origin communication between frames on same page.

=Install=

You can install this package with **npm**:

`npm install seven-gravity-gateway --save`


=Load module =

You can load module for use in browser or as node module.


==In browser use==

For use in browser we can load it using embedded require module loader:

Master gateway:

```
lang=javascript
var Gateway = require('master');
```
Slave gateway:

```
lang=javascript
var Gateway = require('slave');
```

==As node module==

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

=Usage=

Component is initialized by calling the module and passing the proper config object.

==Master gateway==

Config:
|Name|Description|Type|Required|
|products|Object with details for all products|object|Y|
|allowedOrigins|Array of allowed URIs which are allowed to exchange messages. Default value is '*'|array|N|
|debug|Debug messages setting|bool|N|


```
lang=javascript
Gateway({
    allowedOrigins : [],
    debug : bool,
    products : {
         productId: {
  	        frameId : frameId,
	        data : {},
	        init : function,
 	        load : function,
                loaded : function
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

Init and loaded methods can be used to indicate that product is in loading phase. e.g. start the loader on init and remove the loader on loaded event.


==Slave gateway==

```
lang=javascript
Gateway({
    productId : string,
    data : object,
    load: function,
    allowedOrigins : array,
    debug : bool,
    worker : object
    eventPropagation : object
    eventListeners : object
});
```
Config:
|Name|Description|Type|Required|
|productId|must be an unique identifier of the product(unique game ID).|string|Y|
|data|Data which will be passed to platform on init(config, routes...) |object|Y|
|load|Callback which will be triggered when product starts to load|function|Y|
|allowedOrigins|Array of allowed URIs|array|N|
|debug|Debug messages setting|bool|N|
|worker|Optional web worker configuration|object|N|
|eventPropagation|Events which will be propagated to master frame|object|N|
|eventListeners|Events which are required from master frame|object|N|

`worker` property recieves obect with configuration:

```
worker: {
  src : string | Worker instance,
  plugins : array
}
```

Worker src accepts string or Worker instance. Installed web worker will receive all messages except `Resize` event. Configuration accepts optional `plugins` property which accepts array of supported plugins. 

====Plugins

Gateway comes with predefined plugins which can be used only in combination with worker. In order to initialize the worker => plugin communication plugin reference needs to be passed inside worker plugin array.  Storage plugin can be included from dist file as simple script. Example:

```
lang=html

<script src="../../node_modules/seven-gravity-gateway/dist/slave.js"></script>
```

```
lang=javascript
var storagePlugin = require('seven-gravity-gateway/plugin-storage');

Gateway({
  ...
  worker : {
    src : path / instance
    plugins : [storagePlugin]
  }
})
```

===== Storage Plugin

Currently only one plugin is supported and it is storage plugin. Storage plugin servers for storage manipulation from worker because `localStorage` and `sessionStorage` are undefined in Web Worker context. Plugin allows manipulation with `localStorage` and `sessionStorage`

Storage plugin has same methods as [[ https://developer.mozilla.org/en-US/docs/Web/API/Storage | Storage Web API ]] in addition with `isSuppored` method. :

  - key
  - getItem
  - setItem
  - removeItem
  - clear
  - isSuppored

Storage API is consumed with `Plugin.Storage.$methodName` - method name is capitalized

Example of usage:

```
lang=javascript

//Worker context

self.postMessage({
  action: 'Plugin.Storage.GetItem',
  keyName: 'dummy',
  driver :'localStorage',
});
```

Worker will recieve message from plugin with data

```
{
  action: 'Plugin.Storage.GetItem',
  keyName: 'dummy',
  keyValue: '$value,
  driver: 'localStorage'
}
```

==Subscription==

Gateway uses pub/sub pattern to handle events and actions.

NOTE: action names are case sensitive, meaning that ‘betslip.Add’ and ‘Betslip.Add’ actions are different.

Subscription format:
```
lang=javascript
{gatewayInstance}.subscribe('betslip.add',function)
```

It is possible to use namespaced subscriptions. e.g. If one of the products subscribes to !!betslip.*!! action with proper callback, events !!betslip.add!!, !!betslip.remove!! will trigger the !!betslip.*!! callback. It is possible to subscribe using !!*!! wildcard, meaning that every message will trigger registered callback.

IMPORTANT: Mesagess prefixed with Master and Slave are system reserved messages and therefore they will be ignored

==Event propagation==

In order to dispatch the events from slave to master, slave needs to pass `eventPropagation` property in init stage.

`eventPropagation` has next format:

```
eventPropagation : {
  {$eventType} : array || bool // array only for keyboard events
},
```

Only !!keyup!!, !!keydown!!, !!keypress!!, !!scroll!! and !!click!! events are supported.

Array of bindings which will be propagated can be written as list of:

 - keyCodes(85 for u)
 - keys(letter 'u')
 - combined ["u", 73].

Key and letter combinations must be provided with + sign - e.g. `Ctrl+u` or `17+85` or combined `Ctrl+85`.

In order to dispatch the events from master to slave, slave needs to pass `eventListeners` prop in configuration declaring which keys he wants to listen. Format is the same.

(NOTE) It is advised to use the keyCodes for key binding definition for sake of normalization across browsers.

==Message exchange==

**Master -> Slave**

```
lang=javascript
{gatewayInstance}.sendMessage(frameId, {
    action : 'betslip.add',
    productId : $productId
}, origin)
```

Object must contain name of action and productId property. `productId` property is the unique id of the product to which message is dispatched. Origin param is the origin of sender. That origin must be enabled in slave gateway in order to process the message. If origin is obeyed origin will be set to ‘*’.

**Slave -> Master**

```
lang=javascript
{gatewayInstance}.sendMessage({
    action : 'betslip.add',
}, origin)
```

Object must contain name of action. Origin param is the origin of sender. That origin must be enabled in platform gateway in order to process the message. If origin is obeyed origin will be set to ‘*’,

==Unsubscribe==

Unsubscribe format:
```
lang=javascript
{gatewayInstance}.unsubscribe('betslip.add’)
```

Unsubscribe will remove subscribed event and all registered callbacks.

=====3.3.5. Single listener unsubscribe

Single listener can be unsubscribed if the subscription is referenced in variable by calling `remove` method. e.g.

```
lang=javascript
var betslipAdd = Gateway.subscribe('Betslip.Add', callback);

betslipAdd.remove(); //This will remove only this listener
```

==Clear subscription==
```
lang=javascript
{gatewayInstance}.clearSubscriptions()
```

This will remove all subscribed actions and callbacks.

=Running tests
To run unit tests on whole library run:
```
lang=javascript
npm test
```

=Publishing
This library can be published to npm.nsoft.ba registry. To publish run command:
```
lang=javascript
npm publish
```

When publishing, npm will automatically run tests.
It is very important that you set valid version in package before publishing.