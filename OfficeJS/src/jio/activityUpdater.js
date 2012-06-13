var activityUpdater = (function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    priv.id = spec.id || 0;
    priv.interval = 400;
    priv.interval_id = null;
    // Methods //
    priv.touch = function() {
        LocalOrCookieStorage.setItem ('jio/id/'+priv.id, Date.now());
    };
    that.setId = function(id) {
        priv.id = id;
    };
    that.setIntervalDelay = function(ms) {
        priv.interval = ms;
    };
    that.getIntervalDelay = function() {
        return priv.interval;
    };
    that.start = function() {
        if (!priv.interval_id) {
            priv.touch();
            priv.interval_id = setInterval(function() {
                priv.touch();
            }, priv.interval);
        }
    };
    that.stop = function() {
        if (priv.interval_id !== null) {
            clearInterval(priv.interval_id);
            priv.interval_id = null;
        }
    };
    return that;
}());

