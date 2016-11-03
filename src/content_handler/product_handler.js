var OBSERVED_EVENTS = [
    {type: 'Animation Start',       eventName : ['animationstart','webkitAnimationStart']},
    {type: 'Animation Iteration',   eventName : ['animationiteration','webkitAnimationIteration']},
    {type: 'Animation End',         eventName : ['animationend','webkitAnimationEnd']},
    {type: 'Input',                 eventName : 'input'},
    {type: 'Resize',                eventName : 'resize'},
    {type: 'Mouse Up',              eventName : 'mouseup'},
    {type: 'Content Loaded',        eventName : 'DOMContentLoaded'},
    {type: 'Mouse Down',            eventName : 'mousedown'},
    {type: 'Orientation Change',    eventName : 'orientationchange'},
    {type: 'Print',                 eventName : ['afterprint', 'beforeprint']},
    {type: 'Ready State Change',    eventName : 'readystatechange'},
    {type: 'Touch Start',           eventName : 'touchstart'},
    {type: 'Touch End',             eventName : 'touchend'},
    {type: 'Touch Cancel',          eventName : 'touchcancel'},
    {type: 'Transition Start',      eventName : ['transitionstart','webkitTransitionStart','MSTransitionStart','oTransitionStart','otransitionstart']},
    {type: 'Transition Iteration',  eventName : ['transitioniteration','webkitTransitionIteration','MSTransitionIteration','oTransitionIteration','otransitioniteration']},
    {type: 'Transition End',        eventName : ['transitionend','webkitTransitionEnd','MSTransitionEnd','oTransitionEnd','otransitionend']}],
    INTERVAL_DURATION = 200,
    intervalTimer = null;

var contentHandler = {

    eventName : null,

    handleContentChange : function() {
        var data = {
            action : this.eventName,
            width : window.innerWidth,
            height : window.document.documentElement.offsetHeight
        };

        this.eventCallback(data);
    },

    init: function(eventCb, eventName) {
        this.eventCallback = eventCb;
        this.eventName = eventName;

        this.attachEventListeners();

        if (window.MutationObserver || window.WebKitMutationObserver){
            this.setupMutationObserver();
        } else {
            this.runDirtyCheck();
        }
    },

    attachEventListeners : function() {
        OBSERVED_EVENTS.forEach(function(event) {
            if(Array.isArray(event.eventName)) {
                event.eventName.forEach(function(event) {
                    window.addEventListener(event, this.handleContentChange);
                }.bind(this));
            } else {
                window.addEventListener(event.eventName, this.handleContentChange.bind(this));
            }
        }.bind(this));
    },

    setupMutationObserver : function() {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
            mutationConfig = {
                childList : true,
                subtree : true,
                characterData : true,
                attributes : true
            },
            observer,
            target = document.querySelector('body');

        observer = new MutationObserver(this.handleContentChange.bind(this));
        observer.observe(target, mutationConfig);
    },

    runDirtyCheck : function() {
        intervalTimer = setInterval(function() {
            this.handleContentChange();
        }.bind(this), INTERVAL_DURATION);

    }
};

module.exports= contentHandler;
