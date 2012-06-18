var storageHandler = function(spec, my) {
    spec = spec || {};
    my = my || {};
    var that = storage( spec, my );
    log ('new storageHandler spec: '+JSON.stringify (spec));

    that.newCommand = function (method, spec) {
        var o = spec || {};
        o.label = method;
        return command (o, my);
    };

    that.newStorage = function (spec) {
        var o = spec || {};
        return jioNamespace.storage (o, my);
    };

    that.addJob = function (storage,command) {
        log ('storageHandler ' + that.getType() +
             ' addJob (storage, command): ' +
             JSON.stringify (storage.serialized()) + ', ' +
             JSON.stringify (command.serialized()));
        my.jobManager.addJob ( job({storage:storage, command:command}, my) );
    };

    return that;
};
