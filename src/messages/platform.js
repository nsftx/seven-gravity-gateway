module.exports = {

    notifyProduct : function(productFrame, data, domain) {
        domain = domain || '*';

        if(!productFrame.contentWindow) {
            window.postMessage(data, domain);
        } else {
            productFrame.contentWindow.postMessage(data, domain);
        }
    }
};