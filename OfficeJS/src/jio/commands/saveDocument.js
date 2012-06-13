var saveDocument = function(spec, my) {
    var that = command(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    priv.content = spec.content;
    // Methods //
    that.getLabel = function() {
        return 'saveDocument';
    };

    that.getContent = function() {
        return priv.content;
    };

    /**
     * Validates the storage handler.
     * @param  {object} handler The storage handler
     */
    var super_validate = that.validate;
    that.validate = function(handler) {
        if (typeof priv.content !== 'string') {
            throw invalidCommandState({command:that,message:'No data to save'});
        }
        super_validate(handler);
    };

    that.executeOn = function(storage) {
        storage.saveDocument(that);
    };

    var super_serialized = that.serialized;
    that.serialized = function() {
        var o = super_serialized();
        o.content = priv.content;
        return o;
    };

    return that;
};
