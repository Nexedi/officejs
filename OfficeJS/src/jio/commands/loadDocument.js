var loadDocument = function(spec, my) {
    var that = command(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    // Methods //
    that.label = function() {
        return 'loadDocument';
    };

    that.executeOn = function(storage) {
        storage.loadDocument(that);
    };

    return that;
};
