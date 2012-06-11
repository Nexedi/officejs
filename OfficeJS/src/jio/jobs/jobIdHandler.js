var jobIdHandler = (function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var id = 0;
    // Methods //
    that.nextId = function() {
        id = id + 1;
        return id;
    };

    return that;
}());
