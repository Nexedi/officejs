var newIndexStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'handler' ), priv = {};

    var validatestate_secondstorage = spec.storage || false;
    priv.secondstorage_spec = spec.storage || {type:'base'};
    priv.secondstorage_string = JSON.stringify (priv.secondstorage_spec);

    var storage_array_name = 'jio/indexed_storage_array';
    var storage_file_array_name = 'jio/indexed_file_array/'+
        priv.secondstorage_string;

    var super_serialized = that.serialized;
    that.serialized = function () {
        var o = super_serialized();
        o.storage = priv.secondstorage_spec;
        return o;
    };

    that.validateState = function () {
        if (!validatestate_secondstorage) {
            return 'Need at least one parameter: "storage" '+
                'containing storage specifications.';
        }
        return '';
    };

    /**
     * Check if the indexed storage array exists.
     * @method isStorageArrayIndexed
     * @return {boolean} true if exists, else false
     */
    priv.isStorageArrayIndexed = function () {
        return (LocalOrCookieStorage.getItem(
            storage_array_name) ? true : false);
    };

    /**
     * Returns a list of indexed storages.
     * @method getIndexedStorageArray
     * @return {array} The list of indexed storages.
     */
    priv.getIndexedStorageArray = function () {
        return LocalOrCookieStorage.getItem(
            storage_array_name) || [];
    };

    /**
     * Adds a storage to the indexed storage list.
     * @method indexStorage
     * @param  {object/json} storage The new indexed storage.
     */
    priv.indexStorage = function (storage) {
        var indexed_storage_array = priv.getIndexedStorageArray();
        indexed_storage_array.push(typeof storage === 'string'? storage:
                                   JSON.stringify (storage));
        LocalOrCookieStorage.setItem(storage_array_name,
                                     indexed_storage_array);
    };

    /**
     * Checks if a storage exists in the indexed storage list.
     * @method isAnIndexedStorage
     * @param  {object/json} storage The storage to find.
     * @return {boolean} true if found, else false
     */
    priv.isAnIndexedStorage = function (storage) {
        var json_storage = (typeof storage === 'string'?storage:
                            JSON.stringify(storage)),
        i,l,array = priv.getIndexedStorageArray();
        for (i = 0, l = array.length; i < l; i+= 1) {
            if (JSON.stringify(array[i]) === json_storage) {
                return true;
            }
        }
        return false;
    };

    /**
     * Checks if the file array exists.
     * @method fileArrayExists
     * @return {boolean} true if exists, else false
     */
    priv.fileArrayExists = function () {
        return (LocalOrCookieStorage.getItem (
            storage_file_array_name) ? true : false);
    };

    /**
     * Returns the file from the indexed storage but not there content.
     * @method getFileArray
     * @return {array} All the existing file.
     */
    priv.getFileArray = function () {
        return LocalOrCookieStorage.getItem(
            storage_file_array_name) || [];
    };

    /**
     * Sets the file array list.
     * @method setFileArray
     * @param  {array} file_array The array containing files.
     */
    priv.setFileArray = function (file_array) {
        return LocalOrCookieStorage.setItem(
            storage_file_array_name,
            file_array);
    };

    /**
     * Checks if the file already exists in the array.
     * @method isFileIndexed
     * @param  {string} file_name The file we want to find.
     * @return {boolean} true if found, else false
     */
    priv.isFileIndexed = function (file_name) {
        var i, l, array = priv.getFileArray();
        for (i = 0, l = array.length; i < l; i+= 1) {
            if (array[i].name === file_name){
                return true;
            }
        }
        return false;
    };

    /**
     * Adds a file to the local file array.
     * @method addFile
     * @param  {object} file The new file.
     */
    priv.addFile = function (file) {
        var file_array = priv.getFileArray();
        file_array.push(file);
        LocalOrCookieStorage.setItem(storage_file_array_name,
                                     file_array);
    };

    /**
     * Removes a file from the local file array.
     * @method removeFile
     * @param  {string} file_name The file to remove.
     */
    priv.removeFile = function (file_name) {
        var i, l, array = priv.getFileArray(), new_array = [];
        for (i = 0, l = array.length; i < l; i+= 1) {
            if (array[i].name !== file_name) {
                new_array.push(array[i]);
            }
        }
        LocalOrCookieStorage.setItem(storage_file_array_name,
                                     new_array);
    };

    /**
     * Updates the storage.
     * It will retreive all files from a storage. It is an asynchronous task
     * so the update can be on going even if IndexedStorage has already
     * returned the result.
     * @method update
     */
    priv.update = function () {
        // retreive list before, and then retreive all files
        var getlist_onSuccess = function (result) {
            if (!priv.isAnIndexedStorage(priv.secondstorage_string)) {
                priv.indexStorage(priv.secondstorage_string);
            }
            priv.setFileArray(result);
        };
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      that.newCommand ('getDocumentList',
                                       {path:'.',
                                        option:{success:getlist_onSuccess,
                                                max_retry: 3}}) );
    };

    /**
     * Saves a document.
     * @method saveDocument
     */
    that.saveDocument = function (command) {
        var newcommand = command.clone();
        newcommand.onSuccessDo (function (result) {
            if (!priv.isFileIndexed(command.getPath())) {
                priv.addFile({name:command.getPath(),
                              last_modified:0,creation_date:0});
            }
            priv.update();
            that.success();
        });
        newcommand.onErrorDo (function (result) {
            that.error(result);
        });
        that.addJob ( that.newStorage(priv.secondstorage_spec),
                      newcommand );
    }; // end saveDocument

    /**
     * Loads a document.
     * @method loadDocument
     */
    that.loadDocument = function (command) {
        var file_array, i, l, new_job,
        loadOnSuccess = function (result) {
            // if (file_array[i].last_modified !==
            //     result.return_value.last_modified ||
            //     file_array[i].creation_date !==
            //     result.return_value.creation_date) {
            //     // the file in the index storage is different than
            //     // the one in the second storage. priv.update will
            //     // take care of refresh the indexed storage
            // }
            that.success(result);
        },
        loadOnError = function (result) {
            that.error(result);
        },
        secondLoadDocument = function () {
            var newcommand = command.clone();
            newcommand.onErrorDo (loadOnError);
            newcommand.onSuccessDo (loadOnSuccess);
            that.addJob ( that.newStorage(priv.secondstorage_spec),
                          newcommand );
        };
        priv.update();
        if (command.getOption('metadata_only')) {
            setTimeout(function () {
                if (priv.fileArrayExists()) {
                    file_array = priv.getFileArray();
                    for (i = 0, l = file_array.length; i < l; i+= 1) {
                        if (file_array[i].name === command.getPath()) {
                            return that.success(file_array[i]);
                        }
                    }
                } else {
                    secondLoadDocument();
                }
            },100);
        } else {
            secondLoadDocument();
        }
    }; // end loadDocument

    /**
     * Gets a document list.
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        var id, newcommand, timeout = false;
        priv.update();
        if (command.getOption('metadata_only')) {
            id = setInterval(function () {
                if (timeout) {
                    that.error({status:0,statusText:'Timeout',
                                message:'The request has timed out.'});
                    clearInterval(id);
                }
                if (priv.fileArrayExists()) {
                    that.success(priv.getFileArray());
                    clearInterval(id);
                }
            },100);
            setTimeout (function () {
                timeout = true;
            }, 10000);           // 10 sec
        } else {
            newcommand = command.clone();
            newcommand.onSuccessDo (function (result) {
                that.success(result);
            });
            newcommand.onErrorDo (function (result) {
                that.error(result);
            });
            that.addJob ( that.newStorage (priv.secondstorage_spec),
                          newcommand );
        }
    }; // end getDocumentList

    /**
     * Removes a document.
     * @method removeDocument
     */
    that.removeDocument = function (command) {
        var newcommand = command.clone();
        newcommand.onSuccessDo (function (result) {
            priv.removeFile(command.getPath());
            priv.update();
            that.success();
        });
        newcommand.onErrorDo (function (result) {
            that.error(result);
        });
        that.addJob( that.newStorage(priv.secondstorage_spec),
                     newcommand );
    };
    return that;
};
Jio.addStorageType ('indexed', newIndexStorage);
