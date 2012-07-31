var newReplicateStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'handler' ), priv = {};

    priv.return_value_array = [];
    priv.storagelist = spec.storagelist || [];
    priv.nb_storage = priv.storagelist.length;

    var super_serialized = that.serialized;
    that.serialized = function () {
        var o = super_serialized();
        o.storagelist = priv.storagelist;
        return o;
    };

    that.validateState = function () {
        if (priv.storagelist.length === 0) {
            return 'Need at least one parameter: "storagelist" '+
                'containing at least one storage.';
        }
        return '';
    };

    priv.isTheLast = function () {
        return (priv.return_value_array.length === priv.nb_storage);
    };

    priv.doJob = function (command,errormessage) {
        var done = false, error_array = [], i,
        onErrorDo = function (result) {
            priv.return_value_array.push(result);
            if (!done) {
                error_array.push(result);
                if (priv.isTheLast()) {
                    that.error (
                        {status:207,
                         statusText:'Multi-Status',
                         message:errormessage,
                         array:error_array});
                }
            }
        },
        onSuccessDo = function (result) {
            priv.return_value_array.push(result);
            if (!done) {
                done = true;
                that.success (result);
            }
        };
        for (i = 0; i < priv.nb_storage; i+= 1) {
            var newcommand = command.clone();
            var newstorage = that.newStorage(priv.storagelist[i]);
            newcommand.onErrorDo (onErrorDo);
            newcommand.onSuccessDo (onSuccessDo);
            that.addJob (newstorage, newcommand);
        }
    };

    /**
     * Save a document in several storages.
     * @method saveDocument
     */
    that.saveDocument = function (command) {
        priv.doJob (
            command,
            'All save "'+ command.getPath() +'" requests have failed.');
        that.end();
    };

    /**
     * Load a document from several storages, and send the first retreived
     * document.
     * @method loadDocument
     */
    that.loadDocument = function (command) {
        priv.doJob (
            command,
            'All load "'+ command.getPath() +'" requests have failed.');
        that.end();
    };

    /**
     * Get a document list from several storages, and returns the first
     * retreived document list.
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        priv.doJob (
            command,
            'All get document list requests have failed.');
        that.end();
    };

    /**
     * Remove a document from several storages.
     * @method removeDocument
     */
    that.removeDocument = function (command) {
        priv.doJob (
            command,
            'All remove "' + command.getPath() + '" requests have failed.');
        that.end();
    };

    return that;
};
Jio.addStorageType('replicate', newReplicateStorage);
