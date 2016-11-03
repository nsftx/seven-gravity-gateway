var contentHandler = {
    resize : function(frameId, event) {
        var frame = document.getElementById(frameId);

        frame.height = event.data.height;
        frame.width = event.data.width ;
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