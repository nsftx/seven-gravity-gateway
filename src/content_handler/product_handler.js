var OBSERVED_EVENTS = [
    {type: 'Animation Start',       eventName : ['animationstart','webkitAnimationStart']},
    {type: 'Animation Iteration',   eventName : ['animationiteration','webkitAnimationIteration']},
    {type: 'Animation End',         eventName : ['animationend','webkitAnimationEnd']},
    {type: 'Input',                 eventName : 'input'},
    {type: 'Resize',                eventName : 'resize'},
    {type: 'Mouse Up',              eventName : 'mouseup'},
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

window.onload = function() {
    attachEventListeners();

    if (window.MutationObserver || window.WebKitMutationObserver){
        setupMutationObserver();
    } else {
        runDirtyCheck();
    }
};

function attachEventListeners() {
    OBSERVED_EVENTS.forEach(function(eventObj) {
        if(Array.isArray(eventObj.eventName)) {
            eventObj.eventName.forEach(function(event) {
                window.addEventListener(event, handleEvent);
            })
        } else {
            window.addEventListener(eventObj.eventName, handleEvent);
        }
    })
}

function handleEvent() {
    console.log('Resize triggered');
}

function setupMutationObserver() {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
        mutationConfig = {
            childList : true,
            subtree : true,
            characterData : true,
            attributes : true
        },
        observer,
        target = document.querySelector('body');

    observer = new MutationObserver(handleEvent);
    observer.observe(target, mutationConfig);
}

function runDirtyCheck() {
    intervalTimer = setinterval(function() {
        handleEvent();
    }, INTERVAL_DURATION)
}