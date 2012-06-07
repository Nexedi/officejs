var announcement = function(spec) {
    
    var spec = spec || {};
    var that = {};

    var callbacks = [];

    that.name = spec.name;

    that.add = function(callback) {
        callbacks.push(callback);
    };

    that.remove = function(callback) {
        //TODO;
    };

    that.register = function() {
        announcer.register(that);
    };

    that.unregister = function() {
        announcer.unregister(that);
    };

    that.trigger = function(args) {
        for(var i=0; i<callbacks.length; i++) {
            callbacks[i].apply(null, args);
        };
    };

    return that;
};

var announcer = (function() {

    var that = {};

    var announcements = {};
    
    that.register(name) {
        if(!announcements[name]) {
            announcements[name] = announcement();
        }
    };

    that.unregister = function(name) {
        //TODO
    };

    that.at = function(name) {
        return announcements[name];
    }; 

    that.on = function(name, callback) {
        that.register(name);
        that.at(name).add(callback);
    };

    that.trigger(name, args) {
        that.at(name).trigger(args);
    }

    return that;
}());
