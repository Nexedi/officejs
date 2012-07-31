var loadDocument = function(spec, my) {
    var that = command(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    // Methods //
    that.getLabel = function() {
        return 'loadDocument';
    };

    that.executeOn = function(storage) {
        storage.loadDocument(that);
    };

    that.canBeRestored = function() {
        return false;
    };

    var super_success = that.success;
    that.success = function (res) {
        if (res) {
            if (typeof res.last_modified !== 'number') {
                res.last_modified=new Date(res.last_modified).getTime();
            }
            if (typeof res.creation_date !== 'number') {
                res.creation_date=new Date(res.creation_date).getTime();
            }
        }
        super_success(res);
    };
    return that;
};
