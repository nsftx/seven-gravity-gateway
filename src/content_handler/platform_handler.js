var iframes;

window.onload = function() {
  iframes =  document.getElementsByTagName('iframe');
};

module.exports = {
    cacheDOM : function() {
        iframes =  document.getElementsByTagName('iframe');
    },

    resize : function(event) {
        for (var i = 0; i < iframes.length; i++) {
            if (iframes[i].contentWindow === event.source) {
                iframes[i].style.height = event.data.windowHeight;
                iframes[i].style.width = event.data.windowWidth;
            }
        }
    }
};