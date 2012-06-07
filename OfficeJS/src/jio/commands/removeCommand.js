var removeCommand = function(spec) {

    var spec = spec || {};
    var that = command(spec);

    that.label = function() {
        return 'removeCommand';
    };

    that.executeOn = function(storage) {
        storage.executeRemove(that);
    };

    return that;
};
