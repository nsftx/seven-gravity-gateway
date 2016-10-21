var contentHandler = {
    resize : function(frameId, event) {
        var frame = document.getElementById(frameId);

        frame.style.height = event.data.height;
        frame.style.width = event.data.width;
    }
};

module.exports = contentHandler;