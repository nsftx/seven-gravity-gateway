require=function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){var d=[{type:"Animation Start",eventName:["animationstart","webkitAnimationStart"]},{type:"Animation Iteration",eventName:["animationiteration","webkitAnimationIteration"]},{type:"Animation End",eventName:["animationend","webkitAnimationEnd"]},{type:"Input",eventName:"input"},{type:"Resize",eventName:"resize"},{type:"Click",eventName:"click"},{type:"Orientation Change",eventName:"orientationchange"},{type:"Print",eventName:["afterprint","beforeprint"]},{type:"Ready State Change",eventName:"readystatechange"},{type:"Touch Start",eventName:"touchstart"},{type:"Touch End",eventName:"touchend"},{type:"Touch Cancel",eventName:"touchcancel"},{type:"Transition Start",eventName:["transitionstart","webkitTransitionStart","MSTransitionStart","oTransitionStart","otransitionstart"]},{type:"Transition Iteration",eventName:["transitioniteration","webkitTransitionIteration","MSTransitionIteration","oTransitionIteration","otransitioniteration"]},{type:"Transition End",eventName:["transitionend","webkitTransitionEnd","MSTransitionEnd","oTransitionEnd","otransitionend"]}],e=200,f=null,g={eventName:null,DOMReady:!1,init:function(a,b){this.eventCallback=a,this.eventName=b,this.addContentListeners(),this.listenDOMReady(),window.MutationObserver||window.WebKitMutationObserver?this.setupMutationObserver():this.runDirtyCheck()},handleContentChange:function(){if(!this.DOMReady)return!1;var a={action:this.eventName,width:window.innerWidth,height:this.getContentHeight()+this.getElementOffset(document.body)};this.eventCallback(a)},getContentHeight:function(){var a=0,b=document.querySelectorAll("body > *");return b.length?(Array.prototype.forEach.call(b,function(b){a+=b.offsetHeight+this.getElementOffset(b)}.bind(this)),a):0},getElementOffset:function(a){var b=getComputedStyle(a),c=0;return c+=parseInt(b.getPropertyValue("margin-top")),c+=parseInt(b.getPropertyValue("margin-bottom")),c+=parseInt(b.getPropertyValue("padding-top")),c+=parseInt(b.getPropertyValue("padding-bottom"))},listenDOMReady:function(){var a=this,b=window.setInterval(function(){"loading"!==window.document.readyState&&(clearInterval(b),a.DOMReady=!0,a.handleContentChange())},50)},addContentListeners:function(){d.forEach(function(a){Array.isArray(a.eventName)?a.eventName.forEach(function(a){window.addEventListener(a,this.handleContentChange.bind(this))}.bind(this)):window.addEventListener(a.eventName,this.handleContentChange.bind(this))}.bind(this))},setupMutationObserver:function(){var a,b=window.MutationObserver||window.WebKitMutationObserver,c={childList:!0,subtree:!0,characterData:!0,attributes:!0},d=document.querySelector("body");a=new b(this.handleContentChange.bind(this)),a.observe(d,c)},runDirtyCheck:function(){f=setInterval(function(){this.handleContentChange()}.bind(this),e)}};b.exports=g},{}],2:[function(a,b,c){function d(a,b,c){this.MODIFIER_KEYS={shiftKey:["Shift",16],ctrlKey:["Ctrl",17],altKey:["Alt",18,"AltGr",225],metaKey:["Meta",91]},this.config=a,this.eventCallback=b,this.eventName=c,this.addEventListeners()}var e=a("../utils/utils").logger;d.prototype={addEventListeners:function(){for(var a in this.config)window.addEventListener(a,this.handleEvent.bind(this))},handleEvent:function(a){var b,c=a.which||a.keyCode,d=a.key||a.keyIdentifier,f=this.config[a.type];if(!f)return e.out("info","Event "+a.type+" is not marked for propagation."),!1;for(var g=0;g<f.length;g++)if(b=String(f[g]),c=String(c),d=String(d),b.indexOf(c)!==-1||b.indexOf(d)!==-1){if(b.indexOf("+")===-1)return void this.triggerEventCallback(a);var h=this.getModifierKey(b);if(h&&a[h]===!0)return void this.triggerEventCallback(a)}e.out("info","Key "+d+" is not marked for propagation.")},getModifierKey:function(a){for(var b in this.MODIFIER_KEYS)for(var c=this.MODIFIER_KEYS[b],d=0;d<c.length;d++)if(a.indexOf(c[d])!==-1)return b},triggerEventCallback:function(a){var b={action:this.eventName,event:a.type,key:a.key||a.keyIdentifier,keyCode:a.which||a.keyCode,keyboardButton:a.code||null,shiftKey:a.shiftKey,altKey:a.altKey,metaKey:a.metaKey,ctrlKey:a.ctrlKey};this.eventCallback(b)}},b.exports=function(a,b,c){return a?new d(a,b,c):(e.out("info","No key bindings passed."),!1)}},{"../utils/utils":6}],3:[function(a,b,c){b.exports={sendMessage:function(a,b){b=b||"*",window.parent.postMessage(a,b)}}},{}],4:[function(a,b,c){var d=a("./utils/utils").logger,e={topics:{},subscribe:function(a,b){return a&&"function"==typeof b?(this.topics[a]=b,!0):(d.out("error","Subscribe failed - action property is invalid or missing."),!1)},unsubscribe:function(a){return this.topics[a]?(delete this.topics[a],!0):(d.out("error","Unsubscribe failed - topic "+a+" doesn´t exist"),!1)},publish:function(a,b){var c=this.checkNamespaceActions(a);return Boolean(c)?(c(b),!0):(d.out("error","Publish failed - topic "+a+" doesn´t exist"),!1)},clearSubscriptions:function(){this.topics={}},checkNamespaceActions:function(a){for(var b=this.topics.hasOwnProperty(a),c=a.lastIndexOf(".");!b&&c!==-1;)a=a.substr(0,c),c=a.lastIndexOf("."),b=this.topics.hasOwnProperty(a);return!!b&&this.topics[a]}};b.exports=e},{"./utils/utils":6}],5:[function(a,b,c){function d(a){return a.productId&&"string"==typeof a.productId?a.data&&"object"==typeof a.data?a.load&&"function"==typeof a.load?(h.out("info","[GG] Slave."+a.productId+":","Initializing"),!0):(h.out("error","[GG] Slave."+a.productId+":","load property is invalid or missing"),!1):(h.out("error","[GG] Slave."+a.productId+":","data property is invalid or missing"),!1):(h.out("error","[GG] Slave:","productId property is invalid or missing"),!1)}var e=a("./messaging/slave"),f=a("./pub_sub"),g=a("./content_handler/slave_handler"),h=a("./utils/utils").logger,i=a("./key_bindings/event_handler"),j={productId:"",config:null,initialized:!1,load:null,msgSender:"Slave",init:function(a){this.initialized=!0,this.config=a,this.productId=a.productId,this.load=a.load,this.setAllowedDomains(),window.addEventListener("message",this.handleMessage.bind(this)),g.init(this.sendMessage.bind(this),"Slave.Resize"),i(this.config.keyPropagation,this.sendMessage.bind(this),"Slave.Event"),this.startProductInitialization()},setAllowedDomains:function(){this.config&&this.config.allowedOrigins?this.allowedOrigins=this.config.allowedOrigins:this.allowedOrigins="*"},startProductInitialization:function(){this.sendMessage({action:"Slave.Init",data:this.config.data,keyPropagation:this.config.keyPropagation,keyListeners:this.config.keyListeners})},handleMessage:function(a){if(!a.data.msgSender||a.data.msgSender===this.msgSender)return!1;var b,c;return"*"!==this.allowedOrigins&&this.allowedOrigins.indexOf(a.origin)===-1?(h.out("error","[GG] Slave."+this.productId+": Message origin is not allowed"),!1):(b=new RegExp("^Slave\\.","g"),c=new RegExp("^Master\\.","g"),b.test(a.data.action)||c.test(a.data.action)?(this.handleProtectedMessage(a),!1):(h.out("info","[GG] Slave."+this.productId+": Master message received:",a.data),void f.publish(a.data.action,a.data)))},handleProtectedMessage:function(a){var b=a.data.action.replace(".","");b=b.charAt(0).toLowerCase()+b.slice(1),this[b]?this[b](a):h.out("warn","[GG] Slave."+this.productId+":","Actions with domain `Master` or `Slave` are protected!")},slaveLoad:function(a){h.out("info","[GG] Slave."+this.productId+":","Starting to load."),this.load(a.data)},masterScroll:function(a){h.out("info","[GG] Slave."+this.productId+":","Publish Master.Scroll event.",a.data),f.publish(a.data.action,a.data)},masterEvent:function(a){h.out("info","[GG] Slave."+this.productId+":","Publish Master.Event event.",a.data),f.publish(a.data.action,a.data)},subscribe:function(a,b){f.subscribe(a,b)},unsubscribe:function(a){f.unsubscribe(a)},clearSubscriptions:function(){f.clearSubscriptions()},sendMessage:function(a,b){a.productId=this.productId,a.msgSender="Slave",e.sendMessage(a,b)}};b.exports=function(a){return a&&a.debug===!0&&(h.debug=!0),!j.initialized&&d(a)?(j.init(a),j):!!j.initialized&&j}},{"./content_handler/slave_handler":1,"./key_bindings/event_handler":2,"./messaging/slave":3,"./pub_sub":4,"./utils/utils":6}],6:[function(a,b,c){var d={debug:!1,out:function(){if(this.debug){var a=Array.prototype.slice.call(arguments),b=a.splice(0,1);console[b]?console[b].apply(this,a):console.log.apply(this,a)}}},e=function(a,b){var c=Date.now();return function(){c+b-Date.now()<0&&(a(),c=Date.now())}};b.exports={logger:d,throttle:e}},{}],"seven-gravity-gateway/slave":[function(a,b,c){b.exports=a("./src/slave_gateway")},{"./src/slave_gateway":5}]},{},["seven-gravity-gateway/slave"]);