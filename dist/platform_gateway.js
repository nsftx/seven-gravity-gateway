require=function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){var d={resetFrameSize:function(a){var b=document.getElementById(a);b&&(b.style.height="0px")},resize:function(a,b){var c=document.getElementById(a);c&&(c.style.height=b.data.height+"px")},getViewData:function(){return{top:window.document.body.scrollTop,left:window.document.body.scrollLeft,totalHeight:window.innerHeight,totalWidth:window.innerWidth}}};b.exports=d},{}],2:[function(a,b,c){b.exports={sendMessage:function(a,b,c){c=c||"*",a.contentWindow?a.contentWindow.postMessage(b,c):window.postMessage(b,c)}}},{}],3:[function(a,b,c){function d(a){var b=!0;for(var c in a)a[c].frameId&&"string"==typeof a[c].frameId?a[c].data&&"object"==typeof a[c].data?a[c].init&&"function"==typeof a[c].init||(i.out("error","[G] Platform:","init property is invalid or missing for game "+c),b=!1):(i.out("error","[G] Platform:","data property is invalid or missing for game "+c),b=!1):(i.out("error","[G] Platform:","frameId property is invalid or missing for game "+c),b=!1);return b}function e(a){return a.products&&"object"==typeof a.products?!!d(a.products)&&(i.out("info","[G] Platform:","Initializing"),!0):(i.out("error","[G] Platform:","products object is invalid or missing"),!1)}var f=a("./messaging/platform"),g=a("./pub_sub"),h=a("./content_handler/platform_handler"),i=a("./utils/logger"),j={initialized:!1,products:{},config:null,allowedOrigins:null,setAllowedDomains:function(){this.config&&this.config.allowedOrigins?this.allowedOrigins=this.config.allowedOrigins:this.allowedOrigins="*"},enableScrollMsg:function(a){window.addEventListener("scroll",function(){this.sendMessage(a,{action:"Product.Scroll",data:h.getViewData(a)})}.bind(this))},checkProductScroll:function(){for(var a in this.products)this.products[a].scroll&&this.enableScrollMsg(this.products[a].frameId)},init:function(a){this.initialized=!0,this.config=a,this.products=a.products,this.setAllowedDomains(),this.checkProductScroll(),window.addEventListener("message",this.handleMessage.bind(this))},handleMessage:function(a){var b=new RegExp("^Product\\.","g"),c=new RegExp("^Platform\\.","g");return b.test(a.data.action)||c.test(a.data.action)?(this.handleProtectedMessage(a),!1):"*"!==this.allowedOrigins&&this.allowedOrigins.indexOf(a.origin)===-1?(i.out("error","[G] Platform: Message origin is not allowed"),!1):(i.out("info","[G] Platform - Product message received:",a.data),void g.publish(a.data.action,a.data))},handleProtectedMessage:function(a){if(!this.products[a.data.productId])return!1;var b=this.products[a.data.productId];"Product.Init"===a.data.action?(i.out("info","[G] Platform:","Starting to load product.",a.data),h.resetFrameSize(b.frameId),b.init(a.data.data),b.data.action="Product.Load",this.sendMessage(b.frameId,b.data)):"Product.Resize"===a.data.action?(i.out("info","[G] Platform:","Resizing product.",a.data),h.resize(b.frameId,a)):"Product.Loaded"===a.data.action?b.loaded&&(i.out("info","[G] Platform:","Product loaded.",a.data),b.loaded()):i.out("warn","[G] Product:","Actions with domain `Product` or `Platform` are protected!")},subscribe:function(a,b){g.subscribe(a,b)},unsubscribe:function(a){g.unsubscribe(a)},clearSubscriptions:function(){g.clearSubscriptions()},sendMessage:function(a,b,c){var d=document.getElementById(a);return!!d&&void f.sendMessage(d,b,c)}};b.exports=function(a){return a&&a.debugMode===!0&&(i.debugMode=!0),!j.initialized&&e(a)?(j.init(a),j):!!j.initialized&&j}},{"./content_handler/platform_handler":1,"./messaging/platform":2,"./pub_sub":4,"./utils/logger":5}],4:[function(a,b,c){var d=a("./utils/logger"),e={topics:{},subscribe:function(a,b){return a&&"function"==typeof b?(this.topics[a]=b,!0):(d.out("error","Subscribe failed - action property is invalid or missing."),!1)},unsubscribe:function(a){return this.topics[a]?(delete this.topics[a],!0):(d.out("error","Unsubscribe failed - topic "+a+" doesn´t exist"),!1)},publish:function(a,b){var c=this.checkNamespaceActions(a);return Boolean(c)?(c(b),!0):(d.out("error","Publish failed - topic "+a+" doesn´t exist"),!1)},clearSubscriptions:function(){this.topics={}},checkNamespaceActions:function(a){for(var b=this.topics.hasOwnProperty(a),c=a.lastIndexOf(".");!b&&c!==-1;)a=a.substr(0,c),c=a.lastIndexOf("."),b=this.topics.hasOwnProperty(a);return!!b&&this.topics[a]}};b.exports=e},{"./utils/logger":5}],5:[function(a,b,c){var d={debugMode:!1,out:function(){if(this.debugMode){var a=Array.prototype.slice.call(arguments),b=a.splice(0,1);console[b]?console[b].apply(this,a):console.log.apply(this,a)}}};b.exports=d},{}],platform_gateway:[function(a,b,c){b.exports=a("./src/platform_gateway")},{"./src/platform_gateway":3}]},{},["platform_gateway"]);