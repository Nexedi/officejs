var saveDocument = function(spec, my) {
    var that = command(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    var content = spec.content;
    // Methods //
    that.label = function() {
        return 'saveDocument';
    };

    that.getContent = function() {
        return content;
    };

    /**
     * Validates the storage handler.
     * @param  {object} handler The storage handler
     */
    var super_validate = that.validate;
    that.validate = function(handler) {
        if (typeof content !== 'string') {
            throw invalidCommandState({command:that,message:'No data to save'});
        }
        super_validate(handler);
    };

    that.executeOn = function(storage) {
        storage.saveDocument(that);
    };

    return that;
};
