var idHandler = (function() {

    var that = {};
    var id = 0;

    that.nextId = function() {
        id = id + 1;
        return id;
    };
    
    return that;
}());
