var saveCommand = function(spec) {

    var spec = spec || {};
    var that = command(spec);

    that.label = function() {
        return 'saveCommand';
    };

    that.executeOn = function(storage) {
        storage.executeSave(that);
    };

    return that;
};
