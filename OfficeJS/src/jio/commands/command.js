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
    priv.respond   = priv.option.onResponse || function(){};
    priv.done      = priv.option.onDone || function(){};
    priv.fail      = priv.option.onFail || function(){};
    priv.retry     = function() {
        that.setMaxRetry(-1);
        that.fail({status:0,statusText:'Fail Retry',
                   message:'Impossible to retry.'});
    };
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

    that.getTried = function() {
        return priv.tried;
    };

    that.setMaxRetry = function(max_retry) {
        priv.option.max_retry = max_retry;
    };

    /**
     * Delegate actual excecution the storage handler.
     * @param {object} handler The storage handler.
     */
    that.execute = function(handler) {
        that.validate(handler);
        priv.tried ++;
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
        priv.respond({status:doneStatus(),value:return_value});
        priv.done(return_value);
        priv.end();
    };

    that.fail = function(return_error) {
        if (priv.option.max_retry === 0 || priv.tried < priv.option.max_retry) {
            priv.retry();
        } else {
            priv.respond({status:failStatus(),error:return_error});
            priv.fail(return_error);
            priv.end();
        }
    };

    that.onResponseDo = function (fun) {
        priv.respond = fun;
    };

    that.onDoneDo = function (fun) {
        priv.done = fun;
    };

    that.onFailDo = function (fun) {
        priv.fail = fun;
    };

    that.onEndDo = function (fun) {
        priv.end = fun;
    };

    that.onRetryDo = function (fun) {
        priv.retry = fun;
    };

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
                option:priv.option};
    };

    that.canBeRestored = function() {
        return true;
    };

    that.clone = function () {
        return command(that.serialized(), my);
    };

    return that;
};
