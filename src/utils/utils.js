var logger = {
    debug : false, //Verbosity setting
    igniteDebugTerminology: false,

    out : function(){
        //Convert to array
        if (this.igniteDebugTerminology) {
            if (typeof arguments[1] === 'string') {
                arguments[1] = arguments[1]
                    .replace('[GG]', '[IM]')
                    .replace('Master', 'Parent')
                    .replace('Slave', 'Child');
            }
            
            if (typeof arguments[2] === 'string') {
                arguments[2] = arguments[2]
                    .replace('Slave', 'Child')
                    .replace('slave', 'child')
                    .replace('Master', 'Parent')
                    .replace('master', 'parent');
            }
        }
        
        var args = Array.prototype.slice.call(arguments);
        //First argument is notification type (critical, error, log, warn, info)
        var type = args.splice(0,1);

        if (type && type[0] === 'critical') {
            console.error.apply(console, args);
            return;
        }

        if(this.debug) {
            if(console[type]) {
                console[type].apply(console, args);
            } else {
                console.log.apply(console, args);
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

var uuidv4 = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

module.exports = {
    logger : logger,
    throttle : throttle,
    uuidv4 : uuidv4
};