var removeDocument = function(spec, my) {
    var that = command(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    // Methods //
    that.getLabel = function() {
        return 'removeDocument';
    };

    that.executeOn = function(storage) {
        storage.removeDocument(that);
    };

    return that;
};
