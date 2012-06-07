var storage = function(spec) {

    var spec = spec || {};
    var that = {};

    that.execute = function(command) {
        command.executeOn(that);
    };

    that.executeSave = function(command) {};
    that.executeRemove = function(command) {};

    return that;
}
