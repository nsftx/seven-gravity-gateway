require=function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){b.exports=a("./src/master_gateway")},{"./src/master_gateway":5}],2:[function(a,b,c){b.exports=a("./src/slave_gateway")},{"./src/slave_gateway":9}],3:[function(a,b,c){var d={resetFrameSize:function(a){var b=document.getElementById(a);b&&(b.style.height="0px")},resize:function(a,b){var c=document.getElementById(a);c&&(c.style.height=b.data.height+"px")},getViewData:function(){return{top:window.document.body.scrollTop,left:window.document.body.scrollLeft,totalHeight:window.innerHeight,totalWidth:window.innerWidth}}};b.exports=d},{}],4:[function(a,b,c){var d=[{type:"Animation Start",eventName:["animationstart","webkitAnimationStart"]},{type:"Animation Iteration",eventName:["animationiteration","webkitAnimationIteration"]},{type:"Animation End",eventName:["animationend","webkitAnimationEnd"]},{type:"Input",eventName:"input"},{type:"Resize",eventName:"resize"},{type:"Click",eventName:"click"},{type:"Orientation Change",eventName:"orientationchange"},{type:"Print",eventName:["afterprint","beforeprint"]},{type:"Ready State Change",eventName:"readystatechange"},{type:"Touch Start",eventName:"touchstart"},{type:"Touch End",eventName:"touchend"},{type:"Touch Cancel",eventName:"touchcancel"},{type:"Transition Start",eventName:["transitionstart","webkitTransitionStart","MSTransitionStart","oTransitionStart","otransitionstart"]},{type:"Transition Iteration",eventName:["transitioniteration","webkitTransitionIteration","MSTransitionIteration","oTransitionIteration","otransitioniteration"]},{type:"Transition End",eventName:["transitionend","webkitTransitionEnd","MSTransitionEnd","oTransitionEnd","otransitionend"]}],e=200,f=null,g={eventName:null,DOMReady:!1,handleContentChange:function(){if(!this.DOMReady)return!1;var a={action:this.eventName,width:window.innerWidth,height:this.getContentHeight()+this.getElementOffset(document.body)};this.eventCallback(a)},getContentHeight:function(){var a=0,b=document.querySelectorAll("body > *");return b.length?(Array.prototype.forEach.call(b,function(b){a+=b.offsetHeight+this.getElementOffset(b)}.bind(this)),a):0},getElementOffset:function(a){var b=getComputedStyle(a),c=0;return c+=parseInt(b.getPropertyValue("margin-top")),c+=parseInt(b.getPropertyValue("margin-bottom")),c+=parseInt(b.getPropertyValue("padding-top")),c+=parseInt(b.getPropertyValue("padding-bottom"))},listenDOMReady:function(){window.addEventListener("DOMContentLoaded",function(){this.DOMReady=!0}.bind(this))},init:function(a,b){this.eventCallback=a,this.eventName=b,this.addContentListeners(),this.listenDOMReady(),window.MutationObserver||window.WebKitMutationObserver?this.setupMutationObserver():this.runDirtyCheck()},addContentListeners:function(){d.forEach(function(a){Array.isArray(a.eventName)?a.eventName.forEach(function(a){window.addEventListener(a,this.handleContentChange)}.bind(this)):window.addEventListener(a.eventName,this.handleContentChange.bind(this))}.bind(this))},setupMutationObserver:function(){var a,b=window.MutationObserver||window.WebKitMutationObserver,c={childList:!0,subtree:!0,characterData:!0,attributes:!0},d=document.querySelector("body");a=new b(this.handleContentChange.bind(this)),a.observe(d,c)},runDirtyCheck:function(){f=setInterval(function(){this.handleContentChange()}.bind(this),e)}};b.exports=g},{}],5:[function(a,b,c){function d(a){var b=!0;for(var c in a)a[c].frameId&&"string"==typeof a[c].frameId?a[c].data&&"object"==typeof a[c].data||(i.out("error","[GW] Master:","data property is invalid or missing for "+c),b=!1):(i.out("error","[GW] Master:","frameId property is invalid or missing for "+c),b=!1);return b}function e(a){return a.products&&"object"==typeof a.products?!!d(a.products)&&(i.out("info","[GW] Master:","Initializing"),!0):(i.out("error","[GW] Master:","products object is invalid or missing"),!1)}var f=a("./messaging/master"),g=a("./pub_sub"),h=a("./content_handler/master_handler"),i=a("./utils/utils").logger,j=a("./utils/utils").throttle,k={initialized:!1,products:{},config:null,allowedOrigins:null,msgSender:"Master",setAllowedDomains:function(){this.config&&this.config.allowedOrigins?this.allowedOrigins=this.config.allowedOrigins:this.allowedOrigins="*"},enableScrollMsg:function(a){window.addEventListener("scroll",j(function(){this.sendMessage(a,{action:"Master.Scroll",data:h.getViewData(a)})}.bind(this),100))},checkProductScroll:function(){for(var a in this.products)this.products[a].scroll&&this.enableScrollMsg(this.products[a].frameId)},init:function(a){this.initialized=!0,this.config=a,this.products=a.products,this.setAllowedDomains(),this.checkProductScroll(),window.addEventListener("message",this.handleMessage.bind(this))},handleMessage:function(a){if(!a.data.msgSender)return!1;if(a.data.msgSender===this.msgSender)return!1;var b=new RegExp("^Master\\.","g"),c=new RegExp("^Slave\\.","g");return c.test(a.data.action)||b.test(a.data.action)?(this.handleProtectedMessage(a),!1):"*"!==this.allowedOrigins&&this.allowedOrigins.indexOf(a.origin)===-1?(i.out("error","[GW] Master: Message origin is not allowed"),!1):(i.out("info","[GW] Master: Slave message received:",a.data),void g.publish(a.data.action,a.data))},handleProtectedMessage:function(a){if(!this.products[a.data.productId])return!1;var b=this.products[a.data.productId];"Slave.Init"===a.data.action?(i.out("info","[GW] Master:","Starting to load slave.",a.data),h.resetFrameSize(b.frameId),b.init&&b.init(a.data),b.data.action="Slave.Load",this.sendMessage(b.frameId,b.data)):"Slave.Resize"===a.data.action?(i.out("info","[GW] Master:","Resizing slave.",a.data),h.resize(b.frameId,a)):"Slave.Loaded"===a.data.action?b.loaded&&(i.out("info","[GW] Master:","Slave loaded.",a.data),b.loaded(a.data)):i.out("warn","[GW] Master:","Actions with domain `Master` or `Slave` are protected!")},subscribe:function(a,b){g.subscribe(a,b)},unsubscribe:function(a){g.unsubscribe(a)},clearSubscriptions:function(){g.clearSubscriptions()},sendMessage:function(a,b,c){var d=document.getElementById(a);return!!d&&(b.msgSender=this.msgSender,void f.sendMessage(d,b,c))}};b.exports=function(a){return a&&a.debug===!0&&(i.debug=!0),!k.initialized&&e(a)?(k.init(a),k):!!k.initialized&&k}},{"./content_handler/master_handler":3,"./messaging/master":6,"./pub_sub":8,"./utils/utils":10}],6:[function(a,b,c){b.exports={sendMessage:function(a,b,c){c=c||"*",a.contentWindow?a.contentWindow.postMessage(b,c):window.postMessage(b,c)}}},{}],7:[function(a,b,c){b.exports={sendMessage:function(a,b){b=b||"*",window.parent.postMessage(a,b)}}},{}],8:[function(a,b,c){var d=a("./utils/utils").logger,e={topics:{},subscribe:function(a,b){return a&&"function"==typeof b?(this.topics[a]=b,!0):(d.out("error","Subscribe failed - action property is invalid or missing."),!1)},unsubscribe:function(a){return this.topics[a]?(delete this.topics[a],!0):(d.out("error","Unsubscribe failed - topic "+a+" doesn´t exist"),!1)},publish:function(a,b){var c=this.checkNamespaceActions(a);return Boolean(c)?(c(b),!0):(d.out("error","Publish failed - topic "+a+" doesn´t exist"),!1)},clearSubscriptions:function(){this.topics={}},checkNamespaceActions:function(a){for(var b=this.topics.hasOwnProperty(a),c=a.lastIndexOf(".");!b&&c!==-1;)a=a.substr(0,c),c=a.lastIndexOf("."),b=this.topics.hasOwnProperty(a);return!!b&&this.topics[a]}};b.exports=e},{"./utils/utils":10}],9:[function(a,b,c){function d(a){return a.productId&&"string"==typeof a.productId?a.data&&"object"==typeof a.data?a.load&&"function"==typeof a.load?(h.out("info","[GW] Slave."+a.productId+":","Initializing"),!0):(h.out("error","[GW] Slave."+a.productId+":","load property is invalid or missing"),!1):(h.out("error","[GW] Slave."+a.productId+":","data property is invalid or missing"),!1):(h.out("error","[GW] Slave:","productId property is invalid or missing"),!1)}var e=a("./messaging/slave"),f=a("./pub_sub"),g=a("./content_handler/slave_handler"),h=a("./utils/utils").logger,i={productId:"",config:null,initialized:!1,load:null,msgSender:"Slave",setAllowedDomains:function(){this.config&&this.config.allowedOrigins?this.allowedOrigins=this.config.allowedOrigins:this.allowedOrigins="*"},init:function(a){this.initialized=!0,this.config=a,this.productId=a.productId,this.load=a.load,this.setAllowedDomains(),g.init(this.sendMessage.bind(this),"Slave.Resize"),window.addEventListener("message",this.handleMessage.bind(this)),this.startProductInitialization()},handleMessage:function(a){if(a.data.msgSender===this.msgSender)return!1;var b=new RegExp("^Slave\\.","g"),c=new RegExp("^Master\\.","g");return b.test(a.data.action)||c.test(a.data.action)?(this.handleProtectedMessage(a),!1):"*"!==this.allowedOrigins&&this.allowedOrigins.indexOf(a.origin)===-1?(h.out("error","[GW] Slave."+this.productId+": Message origin is not allowed"),!1):(h.out("info","[GW] Slave."+this.productId+": Master message received:",a.data),void f.publish(a.data.action,a.data))},startProductInitialization:function(){this.sendMessage({action:"Slave.Init",data:this.config.data})},handleProtectedMessage:function(a){"Slave.Load"===a.data.action?(h.out("info","[GW] Slave."+this.productId+":","Starting to load."),this.load(a.data)):"Master.Scroll"===a.data.action?(h.out("info","[GW] Slave."+this.productId+":","Publish Master.Scroll event.",a.data),f.publish(a.data.action,a.data)):h.out("warn","[GW] Slave."+this.productId+":","Actions with domain `Master` or `Slave` are protected!")},subscribe:function(a,b){f.subscribe(a,b)},unsubscribe:function(a){f.unsubscribe(a)},clearSubscriptions:function(){f.clearSubscriptions()},sendMessage:function(a,b){a.productId=this.productId,a.msgSender="Slave",e.sendMessage(a,b)}};b.exports=function(a){return a&&a.debug===!0&&(h.debug=!0),!i.initialized&&d(a)?(i.init(a),i):!!i.initialized&&i}},{"./content_handler/slave_handler":4,"./messaging/slave":7,"./pub_sub":8,"./utils/utils":10}],10:[function(a,b,c){var d={debug:!1,out:function(){if(this.debug){var a=Array.prototype.slice.call(arguments),b=a.splice(0,1);console[b]?console[b].apply(this,a):console.log.apply(this,a)}}},e=function(a,b){var c=Date.now();return function(){c+b-Date.now()<0&&(a(),c=Date.now())}};b.exports={logger:d,throttle:e}},{}],"seven-gravity-gateway":[function(a,b,c){b.exports={master:a("./master"),slave:a("./slave")}},{"./master":1,"./slave":2}]},{},["seven-gravity-gateway"]);