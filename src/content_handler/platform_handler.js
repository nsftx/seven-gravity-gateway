var contentHandler = {

    resetFrameSize : function(frameId) {
        var frame = document.getElementById(frameId);
        if(frame) {
            frame.style.height = '0px';
        }
    },

    resize : function(frameId, event) {
        var frame = document.getElementById(frameId);
        if(frame) {
            frame.style.height = event.data.height + 'px';
        }
    },

    getViewData : function() {
        return {
            top: window.document.body.scrollTop,
            left:  window.document.body.scrollLeft,
            totalHeight: window.innerHeight,
            totalWidth : window.innerWidth
        };
    }
};

module.exports = contentHandler;