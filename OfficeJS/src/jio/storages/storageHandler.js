var storageHandler = function(spec, my) {
    spec = spec || {};
    my = my || {};
    var that = storage( spec, my );

    that.addJob = function (storage,command) {
        my.jobManager.addJob ( job({storage:storage, command:command}), my );
    };

    return that;
};
