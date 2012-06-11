var command = function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    priv.path      = spec.path || '';
    priv.option    = spec.option || {};
    priv.respond   = priv.option.onResponse || function(){};
    priv.done      = priv.option.onDone || function(){};
    priv.fail      = priv.option.onFail || function(){};
    priv.end       = function() {};

    // Methods //
    /**
     * Returns the label of the command.
     * @method getLabel
     * @return {string} The label.
     */
    that.getLabel = function() {
        return 'command';
    };

    /**
     * Returns the path of the command.
     * @method getPath
     * @return {string} The path of the command.
     */
    that.getPath = function() {
        return priv.path;
    };

    /**
     * Returns the value of an option.
     * @method getOption
     * @param  {string} optionname The option name.
     * @return The option value.
     */
    that.getOption = function(optionname) {
        return priv.option[optionname];
    };

    /**
     * Validates the storage.
     * Override this function.
     * @param  {object} handler The storage handler
     */
    that.validate = function(handler) {
        that.validateState();
    };

    /**
     * Delegate actual excecution the storage handler.
     * @param {object} handler The storage handler.
     */
    that.execute = function(handler) {
        that.validate(handler);
        handler.execute(that);
    };

    /**
     * Execute the good method from the storage.
     * Override this function.
     * @method executeOn
     * @param  {object} storage The storage.
     */
    that.executeOn = function(storage) {};

    /*
     * Do not override.
     * Override `validate()' instead
     */
    that.validateState = function() {
        if (priv.path === '') {
            throw invalidCommandState({command:that,message:'Path is empty'});
        }
    };

    that.done = function(return_value) {
        console.log ('test');
        priv.done(return_value);
        priv.respond({status:doneStatus(),value:return_value});
        priv.end();
    };

    that.fail = function(return_error) {
        priv.fail(return_error);
        priv.respond({status:failStatus(),error:return_error});
        priv.end();
    };

    that.onEndDo = function(fun) {
        priv.end = fun;
    };

    /**
     * Returns a serialized version of this command.
     * Override this function.
     * @method serialized
     * @return {object} The serialized command.
     */
    that.serialized = function() {
        return {label:that.getLabel(),
                path:priv.path,
                option:priv.option};
    };

    return that;
};
