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

    that.canBeRestored = function() {
        return false;
    };

    var super_done = that.done;
    that.done = function (res) {
        var i;
        if (res) {
            for (i = 0; i < res.length; i+= 1) {
                if (typeof res[i].last_modified !== 'number') {
                    res[i].last_modified =
                        new Date(res[i].last_modified).getTime();
                }
                if (typeof res[i].creation_date !== 'number') {
                    res[i].creation_date =
                        new Date(res[i].creation_date).getTime();
                }
            }
        }
        super_done(res);
    };

    return that;
};
