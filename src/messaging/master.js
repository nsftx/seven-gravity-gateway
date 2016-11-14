module.exports = {

    sendMessage : function(productFrame, data, domain) {
        domain = domain || '*';

        if(!productFrame.contentWindow) {
            window.postMessage(data, domain);
        } else {
            productFrame.contentWindow.postMessage(data, domain);
        }
    }
};