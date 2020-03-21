var OBSERVED_EVENTS = [
        {type: 'Animation Start',       eventName : ['animationstart','webkitAnimationStart']},
        {type: 'Animation Iteration',   eventName : ['animationiteration','webkitAnimationIteration']},
        {type: 'Animation End',         eventName : ['animationend','webkitAnimationEnd']},
        {type: 'Resize',                eventName : 'resize'},
        {type: 'Input',                 eventName : 'input'},
        {type: 'Click',                 eventName : 'click'},
        {type: 'Orientation Change',    eventName : 'orientationchange'},
        {type: 'Print',                 eventName : ['afterprint', 'beforeprint']},
        {type: 'Ready State Change',    eventName : 'readystatechange'},
        {type: 'Touch Start',           eventName : 'touchstart'},
        {type: 'Touch End',             eventName : 'touchend'},
        {type: 'Touch Cancel',          eventName : 'touchcancel'},
        {type: 'Transition Start',      eventName : ['transitionstart','webkitTransitionStart','MSTransitionStart','oTransitionStart','otransitionstart']},
        {type: 'Transition Iteration',  eventName : ['transitioniteration','webkitTransitionIteration','MSTransitionIteration','oTransitionIteration','otransitioniteration']},
        {type: 'Transition End',        eventName : ['transitionend','webkitTransitionEnd','MSTransitionEnd','oTransitionEnd','otransitionend']}
    ],
    INTERVAL_DURATION = 200;

var contentHandler = {

    eventName : null,

    DOMReady : false,

    intervalTimer: null,

    currentWidth : 0,

    currentHeight : 0,

    bodyOffset: 0,

    init: function(eventCb, eventName) {
        this.eventCallback = eventCb;
        this.eventName = eventName;

        this.addContentListeners();
        this.listenDOMReady();

        if (window.MutationObserver || window.WebKitMutationObserver){
            this.setupMutationObserver();
        } else {
            this.runDirtyCheck();
        }
    },

    handleContentChange : function() {
        if(!this.DOMReady) {
            return false;
        }

        var windowWidth = window.innerWidth,
            windowHeight,
            data;

        // Calculate bodyOffset(margin + padding). Calculate it on every change
        this.getBodyOffset();
        windowHeight = this.getContentHeight() + bodyOffset;

        // Check to prevent unnecessary message dispatch even if size didn't change
        if(windowWidth !== this.currentWidth || windowHeight !== this.currentHeight) {
            this.currentWidth = windowWidth;
            this.currentHeight = windowHeight;
            data = {
                action : this.eventName,
                width : windowWidth,
                height : windowHeight
            };
            this.eventCallback(data);
        }
    },

    getBodyOffset() {
        this.bodyOffset = this.getElementOffset(document.body);
    },

    //Get offset height of iframe content
    getContentHeight : function() {
        var contentHeight = 0,
            bodyChildNodes = document.querySelectorAll('body > *');

        //If iframe's body has no child nodes
        if(!bodyChildNodes.length) {
            return 0;
        }

        //Convert HTML collection to array and calc the first level child nodes height sum
        Array.prototype.forEach.call(bodyChildNodes, function(element){
            contentHeight += element.scrollHeight + this.getElementOffset(element);
        }.bind(this));

        return contentHeight;
    },

    getElementOffset : function(element) {
        //Get body margin and padding
        var styles = getComputedStyle(element);
        var contentHeight = 0;
        if (!styles) { //Firefox returns null when style can’t be retrieved
            return 0;
        }
        contentHeight += parseInt(styles.getPropertyValue('margin-top'));
        contentHeight += parseInt(styles.getPropertyValue('margin-bottom'));
        contentHeight += parseInt(styles.getPropertyValue('padding-top'));
        contentHeight += parseInt(styles.getPropertyValue('padding-bottom'));

        return contentHeight;
    },

    listenDOMReady : function() {
        var self = this;
        var readyInterval = window.setInterval(function () {
            if(window.document.readyState !== 'loading') {
                clearInterval(readyInterval);
                self.DOMReady = true;
                self.handleContentChange();
            }
        }, 5);
    },

    addContentListeners : function() {
        OBSERVED_EVENTS.forEach(function(event) {
            if(Array.isArray(event.eventName)) {
                event.eventName.forEach(function(event) {
                    window.addEventListener(event, this.handleContentChange.bind(this));
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
        this.intervalTimer = setInterval(function() {
            this.handleContentChange();
        }.bind(this), INTERVAL_DURATION);

    }
};

module.exports= contentHandler;
