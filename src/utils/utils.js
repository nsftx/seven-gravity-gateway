var logger = {
    debug : false, //Verbosity setting

    out : function(){
        if(this.debug) {
            //Convert to array
            var args = Array.prototype.slice.call(arguments);
            //First argument is notification type (log, error, warn, info)
            var type = args.splice(0,1);

            if(console[type]) {
                console[type].apply(this, args);
            } else {
                console.log.apply(this, args);
            }
        }
    }
};

var throttle = function(fn, wait) {
    var time = Date.now();
    return function() {
        if ((time + wait - Date.now()) < 0) {
            fn();
            time = Date.now();
        }
    };
};


module.exports = {
    logger : logger,
    throttle : throttle
};