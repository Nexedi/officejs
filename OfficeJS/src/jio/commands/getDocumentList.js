var getDocumentList = function(spec, my) {
    var that = command(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    // Methods //
    that.getLabel = function() {
        return 'getDocumentList';
    };

    that.executeOn = function(storage) {
        storage.getDocumentList(that);
    };

    return that;
};
