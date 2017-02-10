require=function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){var d={resetFrameSize:function(a){var b=document.getElementById(a);b&&(b.style.height="0px")},resize:function(a,b){var c=document.getElementById(a);c&&(c.style.height=b.data.height+"px")},getViewData:function(){return{top:window.document.body.scrollTop,left:window.document.body.scrollLeft,totalHeight:window.innerHeight,totalWidth:window.innerWidth}}};b.exports=d},{}],2:[function(a,b,c){function d(a,b,c){this.MODIFIER_KEYS={shiftKey:["Shift",16],ctrlKey:["Ctrl",17],altKey:["Alt",18,"AltGr",225],metaKey:["Meta",91]},this.config=a,this.eventCallback=b,this.eventName=c,this.addEventListeners()}var e=a("../utils/utils").logger;d.prototype={addEventListeners:function(){for(var a in this.config)window.addEventListener(a,this.handleEvent.bind(this))},handleEvent:function(a){var b,c=a.which||a.keyCode,d=a.key||a.keyIdentifier,f=this.config[a.type];if(!f)return e.out("info","Event "+a.type+" is not marked for propagation."),!1;for(var g=0;g<f.length;g++)if(b=String(f[g]),c=String(c),d=String(d),b.indexOf(c)!==-1||b.indexOf(d)!==-1){if(b.indexOf("+")===-1)return void this.triggerEventCallback(a);var h=this.getModifierKey(b);if(h&&a[h]===!0)return void this.triggerEventCallback(a)}e.out("info","Key "+d+" is not marked for propagation.")},getModifierKey:function(a){for(var b in this.MODIFIER_KEYS)for(var c=this.MODIFIER_KEYS[b],d=0;d<c.length;d++)if(a.indexOf(c[d])!==-1)return b},triggerEventCallback:function(a){var b={action:this.eventName,event:a.type,key:a.key||a.keyIdentifier,keyCode:a.which||a.keyCode,keyboardButton:a.code||null,shiftKey:a.shiftKey,altKey:a.altKey,metaKey:a.metaKey,ctrlKey:a.ctrlKey};this.eventCallback(b)}},b.exports=function(a,b,c){return a?new d(a,b,c):(e.out("info","No key bindings passed."),!1)}},{"../utils/utils":6}],3:[function(a,b,c){function d(a){var b=!0;for(var c in a)a[c].frameId&&"string"==typeof a[c].frameId?a[c].data&&"object"==typeof a[c].data||(i.out("error","[GW] Master:","data property is invalid or missing for "+c),b=!1):(i.out("error","[GW] Master:","frameId property is invalid or missing for "+c),b=!1);return b}function e(a){return a.products&&"object"==typeof a.products?!!d(a.products)&&(i.out("info","[GW] Master:","Initializing"),!0):(i.out("error","[GW] Master:","products object is invalid or missing"),!1)}var f=a("./messaging/master"),g=a("./pub_sub"),h=a("./content_handler/master_handler"),i=a("./utils/utils").logger,j=a("./utils/utils").throttle,k=a("./key_bindings/event_handler"),l={initialized:!1,products:{},config:null,allowedOrigins:null,msgSender:"Master",init:function(a){this.initialized=!0,this.config=a,this.products=a.products,this.setAllowedDomains(),this.checkProductScroll(),window.addEventListener("message",this.handleMessage.bind(this))},setAllowedDomains:function(){this.config&&this.config.allowedOrigins?this.allowedOrigins=this.config.allowedOrigins:this.allowedOrigins="*"},checkProductScroll:function(){for(var a in this.products)this.products[a].scroll&&this.enableScrollMsg(this.products[a].frameId)},handleMessage:function(a){if(!a.data.msgSender||a.data.msgSender===this.msgSender)return!1;var b,c;return"*"!==this.allowedOrigins&&this.allowedOrigins.indexOf(a.origin)===-1?(i.out("error","[GW] Master: Message origin is not allowed"),!1):(b=new RegExp("^Master\\.","g"),c=new RegExp("^Slave\\.","g"),c.test(a.data.action)||b.test(a.data.action)?(this.handleProtectedMessage(a),!1):(i.out("info","[GW] Master: Slave message received:",a.data),void g.publish(a.data.action,a.data)))},handleProtectedMessage:function(a){if(!this.products[a.data.productId])return!1;var b=this.products[a.data.productId],c=a.data.action.replace(".","");c=c.charAt(0).toLowerCase()+c.slice(1),this[c]?this[c](a,b):i.out("warn","[GW] Master:","Actions with domain `Master` or `Slave` are protected!")},slaveInit:function(a,b){i.out("info","[GW] Master:","Starting to load slave.",a.data),h.resetFrameSize(b.frameId),b.init&&b.init(a.data),a.data.keyListeners&&k(a.data.keyListeners,this.sendMessage.bind(this,b.frameId),"Master.Event"),b.data.action="Slave.Load",this.sendMessage(b.frameId,b.data)},slaveResize:function(a,b){i.out("info","[GW] Master:","Resizing slave.",a.data),h.resize(b.frameId,a)},slaveLoaded:function(a,b){return!!b.loaded&&(i.out("info","[GW] Master:","Slave loaded.",a.data),void b.loaded(a.data))},slaveEvent:function(a){i.out("info","[GW] Master:","Slave.Event event received.",a.data),g.publish(a.data.action,a.data)},enableScrollMsg:function(a){window.addEventListener("scroll",j(function(){this.sendMessage(a,{action:"Master.Scroll",data:h.getViewData(a)})}.bind(this),100))},subscribe:function(a,b){g.subscribe(a,b)},unsubscribe:function(a){g.unsubscribe(a)},clearSubscriptions:function(){g.clearSubscriptions()},sendMessage:function(a,b,c){var d=document.getElementById(a);return d?(b.msgSender=this.msgSender,void f.sendMessage(d,b,c)):(i.out("warn","[GW] Master:","Frame "+a+" is non existent."),!1)}};b.exports=function(a){return a&&a.debug===!0&&(i.debug=!0),!l.initialized&&e(a)?(l.init(a),l):!!l.initialized&&l}},{"./content_handler/master_handler":1,"./key_bindings/event_handler":2,"./messaging/master":4,"./pub_sub":5,"./utils/utils":6}],4:[function(a,b,c){b.exports={sendMessage:function(a,b,c){c=c||"*",a.contentWindow?a.contentWindow.postMessage(b,c):window.postMessage(b,c)}}},{}],5:[function(a,b,c){var d=a("./utils/utils").logger,e={topics:{},subscribe:function(a,b){return a&&"function"==typeof b?(this.topics[a]=b,!0):(d.out("error","Subscribe failed - action property is invalid or missing."),!1)},unsubscribe:function(a){return this.topics[a]?(delete this.topics[a],!0):(d.out("error","Unsubscribe failed - topic "+a+" doesn´t exist"),!1)},publish:function(a,b){var c=this.checkNamespaceActions(a);return Boolean(c)?(c(b),!0):(d.out("error","Publish failed - topic "+a+" doesn´t exist"),!1)},clearSubscriptions:function(){this.topics={}},checkNamespaceActions:function(a){for(var b=this.topics.hasOwnProperty(a),c=a.lastIndexOf(".");!b&&c!==-1;)a=a.substr(0,c),c=a.lastIndexOf("."),b=this.topics.hasOwnProperty(a);return!!b&&this.topics[a]}};b.exports=e},{"./utils/utils":6}],6:[function(a,b,c){var d={debug:!1,out:function(){if(this.debug){var a=Array.prototype.slice.call(arguments),b=a.splice(0,1);console[b]?console[b].apply(this,a):console.log.apply(this,a)}}},e=function(a,b){var c=Date.now();return function(){c+b-Date.now()<0&&(a(),c=Date.now())}};b.exports={logger:d,throttle:e}},{}],"seven-gravity-gateway/master":[function(a,b,c){b.exports=a("./src/master_gateway")},{"./src/master_gateway":3}]},{},["seven-gravity-gateway/master"]);