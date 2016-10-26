var logger = {
    debugMode : false, //Verbosity setting

    out : function() {
        if(this.debugMode) {
            //Convert to array
            var args = Array.prototype.slice.call(arguments);
            //First argument is notification type (log, error, warn, info)
            var type = args.splice(0,1);

            if(console[type]) {
                console[type](args);
            } else {
                console.log(args);
            }
        }
    }
};

module.exports = logger;