var job = function(spec) {
    
    var spec = spec || {};
    var that = {};

    var command = spec.command;

    that.getCommand = function() {
        return command;
    };

    that.serialized = function() {
        return command.serialized();
    };

    return that;
};
