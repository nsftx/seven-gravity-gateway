function getDocumentMaxHeight() {
    return Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );
}

var contentHandler = {
    resize : function(frameId, event) {
        var frame = document.getElementById(frameId);

        frame.style.height = event.data.height;
        frame.style.width = event.data.width;
    },

    checkScrollContent : function() {
        var documentHeight = getDocumentMaxHeight();

        //Return boolean if scrollable content got to the end
        return window.innerHeight + window.document.body.scrollTop === documentHeight;
    }
};

module.exports = contentHandler;