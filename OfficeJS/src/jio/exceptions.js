var jioException = function() {
    return {};
};

var invalidCommandState = function(command) {
    var that = jioException();
    that.command = command;

    return that;
};
