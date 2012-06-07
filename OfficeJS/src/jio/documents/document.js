var document = function(spec) {

    var spec = spec || {};
    var that = {};

    var name = spec.name;
    var content = spec.content;

    that.getName = function() {
        return name;
    };

    that.getContent = function() {
        return content;
    };
}
