var storageHandler = function(spec) {

    var spec = spec || {};
    var that = {};

    var storages = spec.storages || [];

    that.execute = function(command) {
        that.validate(command);
        that.doExecute(command);
    };

    that.doExecute = function(command) {
        for(var i=0; i<storages.length; i++) {
            storages[i].execute(command);
        }
    };

    that.validate = function(command) {
        command.validate(that);
    };

    return that;
};
