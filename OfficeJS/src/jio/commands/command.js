var command = function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    priv.commandlist = {'saveDocument':saveDocument,
                        'loadDocument':loadDocument,
                        'removeDocument':removeDocument,
                        'getDocumentList':getDocumentList};
    // creates the good command thanks to his label
    if (spec.label && priv.commandlist[spec.label]) {
        priv.label = spec.label;
        delete spec.label;
        return priv.commandlist[priv.label](spec, my);
    }

    priv.path      = spec.path || '';
    priv.tried     = 0;
    priv.option    = spec.option || {};
    priv.success   = priv.option.success || function (){};
    priv.error     = priv.option.error || function (){};
    priv.retry     = function() {
        that.error({status:13,statusText:'Fail Retry',
                    message:'Impossible to retry.'});
    };
    priv.end       = function() {};
    priv.on_going  = false;

    // Methods //
    /**
     * Returns a serialized version of this command.
     * Override this function.
     * @method serialized
     * @return {object} The serialized command.
     */
    that.serialized = function() {
        return {label:that.getLabel(),
                tried:priv.tried,
                max_retry:priv.max_retry,
                path:priv.path,
                option:that.cloneOption()};
    };

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

    that.canBeRetried = function () {
        return (priv.option.max_retry === 0 ||
                priv.tried < priv.option.max_retry);
    };

    that.getTried = function() {
        return priv.tried;
    };

    /**
     * Delegate actual excecution the storage handler.
     * @param {object} handler The storage handler.
     */
    that.execute = function(handler) {
        if (!priv.on_going) {
            that.validate(handler);
            priv.tried ++;
            priv.on_going = true;
            handler.execute(that);
        }
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

    that.success = function(return_value) {
        priv.on_going = false;
        priv.success (return_value);
        priv.end(doneStatus());
    };

    that.retry = function (return_error) {
        priv.on_going = false;
        if (that.canBeRetried()) {
            priv.retry();
        } else {
            that.error (return_error);
        }
    };

    that.error = function(return_error) {
        priv.on_going = false;
        priv.error(return_error);
        priv.end(failStatus());
    };

    that.end = function () {
        priv.end(doneStatus());
    };

    that.onSuccessDo = function (fun) {
        if (fun) {
            priv.success = fun;
        } else {
            return priv.success;
        }
    };

    that.onErrorDo = function (fun) {
        if (fun) {
            priv.error = fun;
        } else {
            return priv.error;
        }
    };

    that.onEndDo = function (fun) {
        priv.end = fun;
    };

    that.onRetryDo = function (fun) {
        priv.retry = fun;
    };

    /**
     * Is the command can be restored by another JIO : yes.
     * @method canBeRestored
     * @return {boolean} true
     */
    that.canBeRestored = function() {
        return true;
    };

    /**
     * Clones the command and returns it.
     * @method clone
     * @return {object} The cloned command.
     */
    that.clone = function () {
        return command(that.serialized(), my);
    };

    /**
     * Clones the command options and returns the clone version.
     * @method cloneOption
     * @return {object} The clone of the command options.
     */
    that.cloneOption = function () {
        var k, o = {};
        for (k in priv.option) {
            o[k] = priv.option[k];
        }
        return o;
    };

    return that;
};
