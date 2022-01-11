var config = {
    treshold: 100,
    prefix: 'space',
    regex: {
        pattern: /^[A-Za-z0-9.\-%]$/,
        flags: 'i'
    }
};
var scanResult = {
    code: '',
    finished: false
}; // Code to be passed to ticket check
var currentTime = 0; // time current key is received (time based scanning)
var previousKey = {
    receivedAt: null,
    event: null
};
var previousEventReceived = Date.now();  // time when previous event was received (time based scanning)
var difference = 0;

function processKeyEvent(e) {
    var whitelistedKeys = new RegExp(config.regex.pattern, config.regex.flags); // Array of key codes whose values wont't be concat with ticketId (enter, shift, space, arrow down)
    var isPrefixTriggered = isPrefixBased(e);

    currentTime = Date.now();
    difference = currentTime - previousEventReceived;
    previousEventReceived = currentTime;

    // Too much difference between characters - which means that this is not scan mode.
    // First time, difference is equal to current time, so we will extract that from check.
    // We also prevent scan trigger if somone holds key (e.repeat).
    // Last flag is when space is trigered as first char, we want to enter in scan mode 
    if ((difference > config.treshold 
        && difference !== currentTime 
        && !isPrefixTriggered)
        || e.repeat) {
        scanResult.code = '';
        previousKey.receivedAt = currentTime;
        previousKey.event = e;
        scanResult.finished = false;
        return scanResult;
    }

    // let's add previous char to list of scanned codes if time passed
    // before previous and current is below treshold
    // this will happen if scan barcode without space prefix
    if (scanResult.code.length === 0
        && !isPrefixTriggered
        && (previousKey.event && (currentTime - previousKey.receivedAt) < (config.treshold * 2))
        && whitelistedKeys.test(previousKey.event.key)
    ) {
        scanResult.code += previousKey.event.key;
        previousKey.event = null;
        previousKey.receivedAt = 0;
    }

    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    // we need moove focus out of any input to body so we don't enter 
    // codes from scaner but we don't know if first char is from scan so don't move focus when first code is entered
    if (scanResult.code.length !== 0 && document.activeElement && document.activeElement.tagName.toLocaleLowerCase() !== 'body') {
        document.activeElement.blur();
    }

    if (whitelistedKeys.test(e.key)) {
        scanResult.code += e.key;
        previousKey.event = null;
    }

    if (e.key.toLowerCase() === 'enter') {
        previousEventReceived = 0;

        if (scanResult.code.length) {
            scanResult.finished = true;
        }
    }
    return scanResult;
}

function isPrefixBased(e) {
    return e.code.toLowerCase() === config.prefix;
}

function Scan() {
    // This is intentional
}

Scan.prototype.setUpOnce = function(slave) {
    window.document.addEventListener('keydown', function(e) {
        var result = processKeyEvent(e);
        if (result.finished) {
            slave.emit({
                action: 'Slave.ScanFinished',
                data: {
                    code: result.code
                }
            });
            scanResult.code = '';
            scanResult.finished = false;
        }
    });
};

Scan.prototype.onLoad = function(slave, loadData) {
    config = Object.assign({}, config, loadData.data.barcodeScan || {});
};

module.exports = Scan;
