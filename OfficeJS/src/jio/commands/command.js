var command = function(spec) {

    var spec = spec || {};
    var that = {};

    var id   = idHandler.nextId();
    var date = new Date();

    that.document = spec.document;

    that.getDate = function() {
        return date;
    };

    that.getId = function() {
        return id;
    };

    that.label = function() {
        return 'command';
    };

    /* 
     * Specialized commands that override this should also call `super` 
     */
    that.validate = function(handler) {
        that.validateState();
    };

    /* 
     * Delegate actual excecution the the handler object 
     */
    that.execute = function(handler) {
        handler.execute(that);        
    };

    that.executeOn = function(storage) {
    };

    /* 
     * Do not override. 
     * Override `validate()` instead 
     */
    that.validateState = function() {
        if(!that.document) {
            throw invalidCommandState(that);
        };
    };

    return that;
};
