require=function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){b.exports={sendMessage:function(a,b,c){c=c||"*",a.contentWindow?a.contentWindow.postMessage(b,c):window.postMessage(b,c)}}},{}],2:[function(a,b,c){var d=a("./messaging/platform"),e=a("./pub_sub"),f=function(){function a(){this.pubSub=new e,this.groupId="default",this.msgOrigin="platform",window.addEventListener("message",function(a){a.origin!==this.msgOrigin&&this.pubSub.publish(a)}.bind(this))}var b=!1;return a.prototype.subscribe=function(a){this.pubSub.subscribe(a)},a.prototype.unsubscribe=function(a){this.pubSub.unsubscribe(a)},a.prototype.clearSubscriptions=function(){this.pubSub.clearSubscriptions()},a.prototype.sendMessage=function(a,b,c){b.origin=this.msgOrigin,d.sendMessage(a,b,c)},{getInstance:function(){return!b&&(b=!0,new a)}}}();b.exports=f},{"./messaging/platform":1,"./pub_sub":3}],3:[function(a,b,c){function d(){this.topics={}}d.prototype.checkNamespaceActions=function(a){for(var b=this.topics.hasOwnProperty(a),c=a.lastIndexOf(".");!b&&c!==-1;)a=a.substr(0,c),c=a.lastIndexOf("."),b=this.topics.hasOwnProperty(a);return!!b&&this.topics[a]},d.prototype.subscribe=function(a){return!(!a.action||"function"!=typeof a.callback)&&(this.topics[a.action]=a.callback,!0)},d.prototype.unsubscribe=function(a){return!!this.topics[a.action]&&(delete this.topics[a.action],!0)},d.prototype.publish=function(a){var b=this.checkNamespaceActions(a.action);return!!Boolean(b)&&(b(a),!0)},d.prototype.clearSubscriptions=function(){this.topics={}},b.exports=d},{}],platform_gateway:[function(a,b,c){b.exports=a("../src/platform_gateway")},{"../src/platform_gateway":2}]},{},["platform_gateway"]);