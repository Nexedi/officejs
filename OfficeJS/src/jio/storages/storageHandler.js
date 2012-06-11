var storageHandler = function(spec, my) {
    var that = storage(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    priv.storage_a = spec.storagelist || [];

    // Methods //
    /**
     * It is called before the execution.
     * Override this function.
     * @method beforeExecute
     * @param  {object} command The command.
     * @param  {object} option Some options.
     */
    that.beforeExecute = function(command,option) {};

    /**
     * Execute the command according to this storage.
     * @method execute
     * @param  {object} command The command.
     * @param  {object} option Some options.
     */
    that.execute = function(command,option) {
        var i;
        that.validate(command);
        that.beforeExecute(command,option);
        for(i = 0; i < priv.storage_a.length; i++) {
            priv.storage_a[i].execute(command);
        }
        that.afterExecute(command,option);
    };

    /**
     * Is is called after the execution.
     * Override this function.
     * @method afterExecute
     * @param  {object} command The command.
     * @param  {object} option Some options.
     */
    that.afterExecute = function(command,option) {
        that.done();
    };

    /**
     * Returns a serialized version of this storage
     * @method serialized
     * @return {object} The serialized storage.
     */
    that.serialized = function() {
        return {type:priv.type,
                storagelist:priv.storagelist};
    };

    return that;
};
