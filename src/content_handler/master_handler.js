var contentHandler = {

    resetFrameSize : function(frameId) {
        requestAnimationFrame(function() {
            var frame = document.getElementById(frameId);
            if(frame) {
                frame.style.height = '0px';
            }
        })
    },

    resize : function(frameId, event) {
        requestAnimationFrame(function() {
            var frame = document.getElementById(frameId);
            if(frame) {
                frame.style.height = event.data.height + 'px';
            }
        })

    }
};

module.exports = contentHandler;