/*! JIO Storage - v0.1.0 - 2012-08-02
* Copyright (c) 2012 Nexedi; Licensed  */

(function(LocalOrCookieStorage, $, Base64, sjcl, hex_sha256, Jio) {

var newLocalStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'base' ), priv = {};

    priv.username = spec.username || '';
    priv.applicationname = spec.applicationname || 'untitled';

    var storage_user_array_name = 'jio/local_user_array';
    var storage_file_array_name = 'jio/local_file_name_array/' +
        priv.username + '/' + priv.applicationname;

    var super_serialized = that.serialized;
    that.serialized = function() {
        var o = super_serialized();
        o.applicationname = priv.applicationname;
        o.username = priv.username;
        return o;
    };

    that.validateState = function() {
        if (priv.username) {
            return '';
        }
        return 'Need at least one parameter: "username".';
    };

    /**
     * Returns a list of users.
     * @method getUserArray
     * @return {array} The list of users.
     */
    priv.getUserArray = function () {
        return LocalOrCookieStorage.getItem(
            storage_user_array_name) || [];
    };

    /**
     * Adds a user to the user list.
     * @method addUser
     * @param  {string} user_name The user name.
     */
    priv.addUser = function (user_name) {
        var user_array = priv.getUserArray();
        user_array.push(user_name);
        LocalOrCookieStorage.setItem(storage_user_array_name,
                                     user_array);
    };

    /**
     * checks if a user exists in the user array.
     * @method userExists
     * @param  {string} user_name The user name
     * @return {boolean} true if exist, else false
     */
    priv.userExists = function (user_name) {
        var user_array = priv.getUserArray(), i, l;
        for (i = 0, l = user_array.length; i < l; i += 1) {
            if (user_array[i] === user_name) {
                return true;
            }
        }
        return false;
    };

    /**
     * Returns the file names of all existing files owned by the user.
     * @method getFileNameArray
     * @return {array} All the existing file paths.
     */
    priv.getFileNameArray = function () {
        return LocalOrCookieStorage.getItem(
            storage_file_array_name) || [];
    };

    /**
     * Adds a file name to the local file name array.
     * @method addFileName
     * @param  {string} file_name The new file name.
     */
    priv.addFileName = function (file_name) {
        var file_name_array = priv.getFileNameArray();
        file_name_array.push(file_name);
        LocalOrCookieStorage.setItem(storage_file_array_name,
                                     file_name_array);
    };

    /**
     * Removes a file name from the local file name array.
     * @method removeFileName
     * @param  {string} file_name The file name to remove.
     */
    priv.removeFileName = function (file_name) {
        var i, l, array = priv.getFileNameArray(), new_array = [];
        for (i = 0, l = array.length; i < l; i+= 1) {
            if (array[i] !== file_name) {
                new_array.push(array[i]);
            }
        }
        LocalOrCookieStorage.setItem(storage_file_array_name,
                                     new_array);
    };

    /**
     * Saves a document in the local storage.
     * It will store the file in 'jio/local/USR/APP/FILE_NAME'.
     * @method saveDocument
     */
    that.saveDocument = function (command) {
        // wait a little in order to simulate asynchronous saving
        setTimeout (function () {
            var doc = null, path =
                'jio/local/'+priv.username+'/'+
                priv.applicationname+'/'+
                command.getPath();

            // reading
            doc = LocalOrCookieStorage.getItem(path);
            if (!doc) {
                // create document
                doc = {
                    'name': command.getPath(),
                    'content': command.getContent(),
                    'creation_date': Date.now(),
                    'last_modified': Date.now()
                };
                if (!priv.userExists(priv.username)) {
                    priv.addUser (priv.username);
                }
                priv.addFileName(command.getPath());
            } else {
                // overwriting
                doc.last_modified = Date.now();
                doc.content = command.getContent();
            }
            LocalOrCookieStorage.setItem(path, doc);
            that.success ();
        });
    }; // end saveDocument

    /**
     * Loads a document from the local storage.
     * It will load file in 'jio/local/USR/APP/FILE_NAME'.
     * You can add an 'options' object to the job, it can contain:
     * - metadata_only {boolean} default false, retrieve the file metadata
     *   only if true.
     * @method loadDocument
     */
    that.loadDocument = function (command) {
        // document object is {'name':string,'content':string,
        // 'creation_date':date,'last_modified':date}

        setTimeout(function () {
            var doc = null;

            doc = LocalOrCookieStorage.getItem(
                'jio/local/'+priv.username+'/'+
                    priv.applicationname+'/'+command.getPath());
            if (!doc) {
                that.error ({status:404,statusText:'Not Found.',
                             message:'Document "'+ command.getPath() +
                             '" not found in localStorage.'});
            } else {
                if (command.getOption('metadata_only')) {
                    delete doc.content;
                }
                that.success (doc);
            }
        });
    }; // end loadDocument

    /**
     * Gets a document list from the local storage.
     * It will retreive an array containing files meta data owned by
     * the user.
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        // the list is [object,object] -> object = {'name':string,
        // 'last_modified':date,'creation_date':date}

        setTimeout(function () {
            var new_array = [], array = [], i, l, k = 'key',
            path = 'jio/local/'+priv.username+'/'+ priv.applicationname,
            file_object = {};

            array = priv.getFileNameArray();
            for (i = 0, l = array.length; i < l; i += 1) {
                file_object =
                    LocalOrCookieStorage.getItem(path+'/'+array[i]);
                if (file_object) {
                    if (command.getOption('metadata_only')) {
                        new_array.push ({
                            name:file_object.name,
                            creation_date:file_object.creation_date,
                            last_modified:file_object.last_modified});
                    } else {
                        new_array.push ({
                            name:file_object.name,
                            content:file_object.content,
                            creation_date:file_object.creation_date,
                            last_modified:file_object.last_modified});
                    }
                }
            }
            that.success (new_array);
        });
    }; // end getDocumentList

    /**
     * Removes a document from the local storage.
     * It will also remove the path from the local file array.
     * @method removeDocument
     */
    that.removeDocument = function (command) {
        setTimeout (function () {
            var path = 'jio/local/'+
                priv.username+'/'+
                priv.applicationname+'/'+
                command.getPath();
            // deleting
            LocalOrCookieStorage.deleteItem(path);
            priv.removeFileName(command.getPath());
            that.success ();
        });
    };
    return that;
};
Jio.addStorageType('local', newLocalStorage);

var newDAVStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'base' ), priv = {};

    priv.username = spec.username || '';
    priv.applicationname = spec.applicationname || 'untitled';
    priv.url = spec.url || '';
    priv.password = spec.password || ''; // TODO : is it secured ?

    var super_serialized = that.serialized;
    that.serialized = function() {
        var o = super_serialized();
        o.username = priv.username;
        o.applicationname = priv.applicationname;
        o.url = priv.url;
        o.password = priv.password; // TODO : not realy secured...
        return o;
    };

    /**
     * If some other parameters is needed, it returns an error message.
     * @method validateState
     * @return {string} '' -> ok, 'message' -> error
     */
    that.validateState = function() {
        if (priv.username && priv.url) {
            return '';
        }
        return 'Need at least 2 parameters: "username" and "url".';
    };

    priv.newAsyncModule = function () {
        var async = {};
        async.call = function (obj,function_name,arglist) {
            obj._wait = obj._wait || {};
            if (obj._wait[function_name]) {
                obj._wait[function_name]--;
                return function () {};
            }
            // ok if undef or 0
            arglist = arglist || [];
            return obj[function_name].apply(obj[function_name],arglist);
        };
        async.neverCall = function (obj,function_name) {
            obj._wait = obj._wait || {};
            obj._wait[function_name] = -1;
        };
        async.wait = function (obj,function_name,times) {
            obj._wait = obj._wait || {};
            obj._wait[function_name] = times;
        };
        async.end = function () {
            async.call = function(){};
        };
        return async;
    };

    /**
     * Saves a document in the distant dav storage.
     * @method saveDocument
     */
    that.saveDocument = function (command) {

        // TODO if path of /dav/user/applic does not exists, it won't work!
        //// save on dav
        $.ajax ( {
            url: priv.url + '/dav/' +
                priv.username + '/' +
                priv.applicationname + '/' +
                command.getPath(),
            type: 'PUT',
            data: command.getContent(),
            async: true,
            dataType: 'text', // TODO is it necessary ?
            headers: {'Authorization':'Basic '+Base64.encode(
                priv.username+':'+priv.password)},
            // xhrFields: {withCredentials: 'true'}, // cross domain
            success: function () {
                that.success();
            },
            error: function (type) {
                type.message = 'Cannot save "' + command.getPath() +
                    '" into DAVStorage.';
                that.retry(type);
            }
        } );
        //// end saving on dav
    };

    /**
     * Loads a document from a distant dav storage.
     * @method loadDocument
     */
    that.loadDocument = function (command) {
        var doc = {},
        getContent = function () {
            $.ajax ( {
                url: priv.url + '/dav/' +
                    priv.username + '/' +
                    priv.applicationname + '/' +
                    command.getPath(),
                type: "GET",
                async: true,
                dataType: 'text', // TODO is it necessary ?
                headers: {'Authorization':'Basic '+Base64.encode(
                    priv.username + ':' + priv.password )},
                // xhrFields: {withCredentials: 'true'}, // cross domain
                success: function (content) {
                    doc.content = content;
                    that.success(doc);
                },
                error: function (type) {
                    if (type.status === 404) {
                        type.message = 'Document "' +
                            command.getPath() +
                            '" not found in localStorage.';
                        that.error(type);
                    } else {
                        type.message =
                            'Cannot load "' + command.getPath() +
                            '" from DAVStorage.';
                        that.retry(type);
                    }
                }
            } );
        };
        doc.name = command.getPath(); // TODO : basename
        // NOTE : if (command.getOption('content_only') { return getContent(); }
        // Get properties
        $.ajax ( {
            url: priv.url + '/dav/' +
                priv.username + '/' +
                priv.applicationname + '/' +
                command.getPath(),
            type: "PROPFIND",
            async: true,
            dataType: 'xml',
            headers: {'Authorization':'Basic '+Base64.encode(
                priv.username + ':' + priv.password )},
            success: function (xmlData) {
                // doc.last_modified =
                $(xmlData).find(
                    'lp1\\:getlastmodified, getlastmodified'
                ).each( function () {
                    doc.last_modified = $(this).text();
                });
                $(xmlData).find(
                    'lp1\\:creationdate, creationdate'
                ).each( function () {
                    doc.creation_date = $(this).text();
                });
                if (!command.getOption('metadata_only')) {
                    getContent();
                } else {
                    that.success(doc);
                }
            },
            error: function (type) {
                type.message = 'Cannot load "' + command.getPath() +
                    '" informations from DAVStorage.';
                if (type.status === 404) {
                    that.error(type);
                } else {
                    that.retry(type);
                }
            }
        } );
    };

    /**
     * Gets a document list from a distant dav storage.
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        var document_array = [], file = {}, path_array = [],
        am = priv.newAsyncModule(), o = {};

        o.getContent = function (file) {
            $.ajax ( {
                url: priv.url + '/dav/' +
                    priv.username + '/' +
                    priv.applicationname + '/' +
                    file.name,
                type: "GET",
                async: true,
                dataType: 'text', // TODO : is it necessary ?
                headers: {'Authorization':'Basic '+
                          Base64.encode(priv.username +':'+
                                        priv.password)},
                success: function (content) {
                    file.content = content;
                    // WARNING : files can be disordered because
                    // of asynchronous action
                    document_array.push (file);
                    am.call(o,'success');
                },
                error: function (type) {
                    type.message = 'Cannot get a document '+
                        'content from DAVStorage.';
                    am.call(o,'error',[type]);
                }
            });
        };
        o.getDocumentList = function () {
            $.ajax ( {
                url: priv.url + '/dav/' +
                    priv.username + '/' +
                    priv.applicationname + '/',
                async: true,
                type: 'PROPFIND',
                dataType: 'xml',
                headers: {'Authorization': 'Basic '+Base64.encode(
                    priv.username + ':' + priv.password ), Depth: '1'},
                success: function (xmlData) {
                    var response = $(xmlData).find(
                        'D\\:response, response'
                    );
                    var len = response.length;
                    am.wait(o,'success',len-2);
                    response.each( function(i,data){
                        if(i>0) { // exclude parent folder
                            file = {};
                            $(data).find('D\\:href, href').each(function(){
                                path_array = $(this).text().split('/');
                                file.name =
                                    (path_array[path_array.length-1] ?
                                     path_array[path_array.length-1] :
                                     path_array[path_array.length-2]+'/');
                            });
                            if (file.name === '.htaccess' ||
                                file.name === '.htpasswd') { return; }
                            $(data).find(
                                'lp1\\:getlastmodified, getlastmodified'
                            ).each(function () {
                                file.last_modified = $(this).text();
                            });
                            $(data).find(
                                'lp1\\:creationdate, creationdate'
                            ).each(function () {
                                file.creation_date = $(this).text();
                            });
                            if (!command.getOption ('metadata_only')) {
                                am.call(o,'getContent',[file]);
                            } else {
                                document_array.push (file);
                                am.call(o,'success');
                            }
                        }
                    });
                },
                error: function (type) {
                    type.message =
                        'Cannot get a document list from DAVStorage.';
                    if (type.status === 404) {
                        am.call(o,'error',[type]);
                    } else {
                        am.call(o,'retry',[type]);
                    }
                }
            } );
        };
        o.retry = function (error) {
            am.neverCall(o,'retry');
            am.neverCall(o,'success');
            am.neverCall(o,'error');
            that.retry(error);
        };
        o.error = function (error) {
            am.neverCall(o,'retry');
            am.neverCall(o,'success');
            am.neverCall(o,'error');
            that.error(error);
        };
        o.success = function () {
            am.neverCall(o,'retry');
            am.neverCall(o,'success');
            am.neverCall(o,'error');
            that.success(document_array);
        };
        am.call (o,'getDocumentList');
    };

    /**
     * Removes a document from a distant dav storage.
     * @method removeDocument
     */
    that.removeDocument = function (command) {

        $.ajax ( {
            url: priv.url + '/dav/' +
                priv.username + '/' +
                priv.applicationname + '/' +
                command.getPath(),
            type: "DELETE",
            async: true,
            headers: {'Authorization':'Basic '+Base64.encode(
                priv.username + ':' + priv.password )},
            // xhrFields: {withCredentials: 'true'}, // cross domain
            success: function () {
                that.success();
            },
            error: function (type) {
                if (type.status === 404) {
                    that.success();
                } else {
                    type.message = 'Cannot remove "' + that.getFileName() +
                        '" from DAVStorage.';
                    that.retry(type);
                }
            }
        } );
    };

    return that;
};
Jio.addStorageType('dav', newDAVStorage);

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

var newCryptedStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'handler' ), priv = {};

    var is_valid_storage = (spec.storage?true:false);

    priv.username = spec.username || '';
    priv.password = spec.password || '';
    priv.secondstorage_spec = spec.storage || {type:'base'};
    priv.secondstorage_string = JSON.stringify (priv.secondstorage_string);

    var super_serialized = that.serialized;
    that.serialized = function () {
        var o = super_serialized();
        o.username = priv.username;
        o.password = priv.password;
        o.storage = priv.secondstorage_string;
        return o;
    };

    that.validateState = function () {
        if (priv.username && is_valid_storage) {
            return '';
        }
        return 'Need at least two parameters: "username" and "storage".';
    };

    // TODO : IT IS NOT SECURE AT ALL!
    // WE MUST REWORK CRYPTED STORAGE!
    priv.encrypt_param_object = {
        "iv":"kaprWwY/Ucr7pumXoTHbpA",
        "v":1,
        "iter":1000,
        "ks":256,
        "ts":128,
        "mode":"ccm",
        "adata":"",
        "cipher":"aes",
        "salt":"K4bmZG9d704"
    };
    priv.decrypt_param_object = {
        "iv":"kaprWwY/Ucr7pumXoTHbpA",
        "ks":256,
        "ts":128,
        "salt":"K4bmZG9d704"
    };
    priv.encrypt = function (data,callback) {
        // end with a callback in order to improve encrypt to an
        // asynchronous encryption.
        var tmp = sjcl.encrypt (priv.username+':'+
                                priv.password, data,
                                priv.encrypt_param_object);
        callback(JSON.parse(tmp).ct);
    };
    priv.decrypt = function (data,callback) {
        var tmp, param = $.extend(true,{},priv.decrypt_param_object);
        param.ct = data || '';
        param = JSON.stringify (param);
        try {
            tmp = sjcl.decrypt (priv.username+':'+
                                priv.password,
                                param);
        } catch (e) {
            callback({status:0,statusText:'Decrypt Fail',
                      message:'Unable to decrypt.'});
            return;
        }
        callback(undefined,tmp);
    };

    priv.newAsyncModule = function () {
        var async = {};
        async.call = function (obj,function_name,arglist) {
            obj._wait = obj._wait || {};
            if (obj._wait[function_name]) {
                obj._wait[function_name]--;
                return function () {};
            }
            // ok if undef or 0
            arglist = arglist || [];
            setTimeout(function (){
                obj[function_name].apply(obj[function_name],arglist);
            });
        };
        async.neverCall = function (obj,function_name) {
            obj._wait = obj._wait || {};
            obj._wait[function_name] = -1;
        };
        async.wait = function (obj,function_name,times) {
            obj._wait = obj._wait || {};
            obj._wait[function_name] = times;
        };
        async.end = function () {
            async.call = function(){};
        };
        return async;
    };

    /**
     * Saves a document.
     * @method saveDocument
     */
    that.saveDocument = function (command) {
        var new_file_name, new_file_content, am = priv.newAsyncModule(), o = {};
        o.encryptFilePath = function () {
            priv.encrypt(command.getPath(),function(res) {
                new_file_name = res;
                am.call(o,'save');
            });
        };
        o.encryptFileContent = function () {
            priv.encrypt(command.getContent(),function(res) {
                new_file_content = res;
                am.call(o,'save');
            });
        };
        o.save = function () {
            var settings = command.cloneOption(), newcommand;
            settings.success = function () { that.success(); };
            settings.error = function (r) { that.error(r); };
            newcommand = that.newCommand(
                'saveDocument',
                {path:new_file_name,content:new_file_content,option:settings});
            that.addJob (
                that.newStorage( priv.secondstorage_spec ),
                newcommand );
        };
        am.wait(o,'save',1);
        am.call(o,'encryptFilePath');
        am.call(o,'encryptFileContent');
    }; // end saveDocument

    /**
     * Loads a document.
     * @method loadDocument
     */
    that.loadDocument = function (command) {
        var new_file_name, option, am = priv.newAsyncModule(), o = {};
        o.encryptFilePath = function () {
            priv.encrypt(command.getPath(),function(res) {
                new_file_name = res;
                am.call(o,'loadDocument');
            });
        };
        o.loadDocument = function () {
            var settings = command.cloneOption(), newcommand;
            settings.error = o.loadOnError;
            settings.success = o.loadOnSuccess;
            newcommand = that.newCommand (
                'loadDocument',
                {path:new_file_name,option:settings});
            that.addJob (
                that.newStorage ( priv.secondstorage_spec ), newcommand );
        };
        o.loadOnSuccess = function (result) {
            result.name = command.getPath();
            if (command.getOption('metadata_only')) {
                that.success(result);
            } else {
                priv.decrypt (result.content, function(err,res){
                    if (err) {
                        that.error(err);
                    } else {
                        result.content = res;
                        // content only: the second storage should
                        // manage content_only option, so it is not
                        // necessary to manage it.
                        that.success(result);
                    }
                });
            }
        };
        o.loadOnError = function (error) {
            // NOTE : we can re create an error object instead of
            // keep the old ex:status=404,message="document 1y59gyl8g
            // not found in localStorage"...
            that.error(error);
        };
        am.call(o,'encryptFilePath');
    }; // end loadDocument

    /**
     * Gets a document list.
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        var result_array = [], am = priv.newAsyncModule(), o = {};
        o.getDocumentList = function () {
            var settings = command.cloneOption();
            settings.success = o.getListOnSuccess;
            settings.error = o.getListOnError;
            that.addJob (
                that.newStorage ( priv.secondstorage_spec ),
                that.newCommand ( 'getDocumentList', {path:command.getPath(),
                                                      option:settings}) );
        };
        o.getListOnSuccess = function (result) {
            result_array = result;
            var i, decrypt = function (c) {
                priv.decrypt (result_array[c].name,function (err,res) {
                    if (err) {
                        am.call(o,'error',[err]);
                    } else {
                        am.call(o,'pushResult',[res,c,'name']);
                    }
                });
                if (!command.getOption('metadata_only')) {
                    priv.decrypt (result_array[c].content,function (err,res) {
                        if (err) {
                            am.call(o,'error',[err]);
                        } else {
                            am.call(o,'pushResult',[res,c,'content']);
                        }
                    });
                }
            };
            if (command.getOption('metadata_only')) {
                am.wait(o,'success',result.length-1);
            } else {
                am.wait(o,'success',result.length*2-1);
            }
            for (i = 0; i < result_array.length; i+= 1) {
                decrypt(i);
            }
        };
        o.getListOnError = function (error) {
            am.call(o,'error',[error]);
        };
        o.pushResult = function (result,index,key) {
            result_array[index][key] = result;
            am.call(o,'success');
        };
        o.error = function (error) {
            am.end();
            that.error (error);
        };
        o.success = function () {
            am.end();
            that.success (result_array);
        };
        am.call(o,'getDocumentList');
    }; // end getDocumentList

    /**
     * Removes a document.
     * @method removeDocument
     */
    that.removeDocument = function (command) {
        var new_file_name, o = {};
        o.encryptFilePath = function () {
            priv.encrypt(command.getPath(),function(res) {
                new_file_name = res;
                o.removeDocument();
            });
        };
        o.removeDocument = function () {
            var cloned_option = command.cloneOption();
            cloned_option.error = o.removeOnError;
            cloned_option.success = o.removeOnSuccess;
            that.addJob(that.newStorage(priv.secondstorage_spec),
                        that.newCommand(
                            'removeDocument',
                            {path:new_file_name,
                             option:cloned_option}));
        };
        o.removeOnSuccess = function (result) {
            that.success();
        };
        o.removeOnError = function (error) {
            that.error (error);
        };
        o.encryptFilePath();
    };
    return that;
};
Jio.addStorageType('crypt', newCryptedStorage);

var newConflictManagerStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'handler' ), priv = {};
    spec = spec || {};
    my = my || {};

    var storage_exists = (spec.storage?true:false);
    priv.secondstorage_spec = spec.storage || {type:'base'};
    priv.secondstorage_string = JSON.stringify (priv.secondstorage_spec);

    var local_namespace = 'jio/conflictmanager/'+
        priv.secondstorage_string+'/';

    var empty_fun = function (){};

    var super_serialized = that.serialized;
    that.serialized = function () {
        var o = super_serialized();
        o.storage = priv.secondstorage_spec;
        return o;
    };

    that.validateState = function () {
        if (storage_exists) {
            return '';
        }
        return 'Need at least one parameter: "storage".';
    };

    priv.getDistantMetadata = function (command,path,success,error) {
        var cloned_option = command.cloneOption ();
        cloned_option.metadata_only = false;
        cloned_option.max_retry = command.getOption('max_retry') || 3;
        cloned_option.error = error;
        cloned_option.success = success;
        var newcommand = that.newCommand(
            'loadDocument',{path:path,
                            option:cloned_option});
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      newcommand );
    };

    priv.saveMetadataToDistant = function (command,path,content,success,error) {
        var cloned_option = command.cloneOption ();
        cloned_option.error = error;
        cloned_option.success = success;
        var newcommand = that.newCommand(
            'saveDocument',{path:path,
                            content:JSON.stringify (content),
                            option:cloned_option});
        // newcommand.setMaxRetry (0); // inf
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      newcommand );
    };

    priv.saveNewRevision = function (command,path,content,success,error) {
        var cloned_option = command.cloneOption ();
        cloned_option.error = error;
        cloned_option.success = success;
        var newcommand = that.newCommand(
            'saveDocument',{path:path,
                            content:content,
                            option:cloned_option});
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      newcommand );
    };

    priv.loadRevision = function (command,path,success,error) {
        var cloned_option = command.cloneOption ();
        cloned_option.error = error;
        cloned_option.success = success;
        var newcommand = that.newCommand (
            'loadDocument',{path:path,
                            option:cloned_option});
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      newcommand );
    };

    priv.deleteAFile = function (command,path,success,error) {
        var cloned_option = command.cloneOption();
        cloned_option.max_retry = 0; // inf
        cloned_option.error = error;
        cloned_option.success = success;
        var newcommand = that.newCommand(
            'removeDocument',{path:path,
                              option:cloned_option});
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      newcommand );
    };

    priv.chooseARevision = function (metadata) {
        var tmp_last_modified = 0, ret_rev = '';
        for (var rev in metadata) {
            if (tmp_last_modified <
                metadata[rev].last_modified) {
                tmp_last_modified =
                    metadata[rev].last_modified;
                ret_rev = rev;
            }
        }
        return ret_rev;
    };

    priv.solveConflict = function (path,content,option) {
        var o = {}, am = priv.newAsyncModule(),

        command = option.command,
        metadata_file_path = path + '.metadata',
        current_revision = '',
        current_revision_file_path = '',
        metadata_file_content = null,
        on_conflict = false, conflict_object = {},
        on_remove = option.deleted,
        previous_revision = option.previous_revision,
        previous_revision_object = option.revision_remove_object || {},
        previous_revision_content_object = previous_revision_object[
            previous_revision] || {},
        now = new Date(),
        failerror;

         o.getDistantMetadata = function (){
            priv.getDistantMetadata (
                command, metadata_file_path,
                function (result) {
                    var previous_revision_number =
                        parseInt(previous_revision.split('-')[0],10);
                    metadata_file_content = JSON.parse (result.content);
                    // set current revision
                    current_revision = (previous_revision_number + 1) + '-' +
                        hex_sha256 ('' + content +
                                    previous_revision +
                                    JSON.stringify (metadata_file_content));
                    current_revision_file_path = path + '.' +
                        current_revision;
                    if (!on_remove) {
                        am.wait(o,'saveMetadataOnDistant',1);
                        am.call(o,'saveNewRevision');
                    }
                    am.call(o,'previousUpdateMetadata');
                },function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.saveNewRevision = function (){
            priv.saveNewRevision (
                command, current_revision_file_path, content,
                function (result) {
                    am.call(o,'saveMetadataOnDistant');
                }, function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.previousUpdateMetadata = function () {
            for (var prev_rev in previous_revision_object) {
                delete metadata_file_content[prev_rev];
            }
            am.call(o,'checkForConflicts');
        };
        o.checkForConflicts = function () {
            for (var rev in metadata_file_content) {
                var revision_index;
                on_conflict = true;
                failerror = {
                    status:20,
                    statusText:'Conflict',
                    message:'There is one or more conflicts'
                };
                break;
            }
            am.call(o,'updateMetadata');
        };
        o.updateMetadata = function (){
            metadata_file_content[current_revision] = {
                creation_date: previous_revision_content_object.creation_date ||
                    now.getTime(),
                last_modified: now.getTime(),
                conflict: on_conflict,
                deleted: on_remove
            };
            conflict_object =
                priv.createConflictObject(
                    command, metadata_file_content, current_revision
                );
            am.call(o,'saveMetadataOnDistant');
        };
        o.saveMetadataOnDistant = function (){
            priv.saveMetadataToDistant(
                command, metadata_file_path,metadata_file_content,
                function (result) {
                    am.call(o,'deleteAllConflictingRevision');
                    if (on_conflict) {
                        am.call(o,'error');
                    } else {
                        am.call(o,'success');
                    }
                },function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.deleteAllConflictingRevision = function (){
            for (var prev_rev in previous_revision_object) {
                priv.deleteAFile (
                    command, path+'.'+prev_rev, empty_fun, empty_fun );
            }
        };
        o.success = function (){
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            if (option.success) {option.success(current_revision);}
        };
        o.error = function (error){
            var gooderror = error || failerror || {};
            if (on_conflict) {
                gooderror.conflict_object = conflict_object;
            }
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            if (option.error) {option.error(gooderror);}
        };
        am.call(o,'getDistantMetadata');
    };

    priv.createConflictObject = function (command, metadata, revision) {
        var cloned_command = command.clone();
        var conflict_object = {
            path: command.getPath(),
            revision: revision,
            revision_object: metadata,
            getConflictRevisionList: function () {
                return this.revision_object;
            },
            solveConflict: function (content,option) {
                if (metadata[revision].deleted) {
                    option = option || content || {};
                    option.deleted = true;
                } else {
                    option = option || {};
                    option.deleted = false;
                    content = content || '';
                }
                option.previous_revision = this.revision;
                option.revision_remove_object = this.revision_object;
                option.command = cloned_command;
                return priv.solveConflict (
                    this.path, content, option
                );
            }
        };
        return conflict_object;
    };

    priv.newAsyncModule = function () {
        var async = {};
        async.call = function (obj,function_name,arglist) {
            obj._wait = obj._wait || {};
            if (obj._wait[function_name]) {
                obj._wait[function_name]--;
                return empty_fun;
            }
            // ok if undef or 0
            arglist = arglist || [];
            setTimeout(function(){
                obj[function_name].apply(obj[function_name],arglist);
            });
        };
        async.neverCall = function (obj,function_name) {
            obj._wait = obj._wait || {};
            obj._wait[function_name] = -1;
        };
        async.wait = function (obj,function_name,times) {
            obj._wait = obj._wait || {};
            obj._wait[function_name] = times;
        };
        async.end = function () {
            async.call = empty_fun;
        };
        return async;
    };

    /**
     * Save a document and can manage conflicts.
     * @method saveDocument
     */
    that.saveDocument = function (command) {
        var o = {}, am = priv.newAsyncModule(),

        metadata_file_path = command.getPath() + '.metadata',
        current_revision = '',
        current_revision_file_path = '',
        metadata_file_content = null,
        on_conflict = false, conflict_object = {},
        previous_revision = command.getOption('previous_revision'),
        previous_revision_file_path = command.getPath() + '.' +
            previous_revision,
        now = new Date(),
        failerror;

        if (!previous_revision) {
            return setTimeout(function () {
                that.error({status:0,statusText:'Parameter missing',
                            message:'Need a previous revision.'});
            });
        }

        o.getDistantMetadata = function (){
            priv.getDistantMetadata (
                command,metadata_file_path,
                function (result) {
                    var previous_revision_number =
                        parseInt(previous_revision.split('-')[0],10);
                    metadata_file_content = JSON.parse (result.content);
                    // set current revision
                    current_revision = (previous_revision_number + 1) + '-' +
                        hex_sha256 ('' + command.getContent() +
                                    previous_revision +
                                    JSON.stringify (metadata_file_content));
                    current_revision_file_path = command.getPath() + '.' +
                        current_revision;
                    am.wait(o,'saveMetadataOnDistant',1);
                    am.call(o,'saveNewRevision');
                    am.call(o,'checkForConflicts');
                },function (error) {
                    if (error.status === 404) {
                        current_revision = '1-' +
                            hex_sha256 (command.getContent());
                        current_revision_file_path = command.getPath() + '.' +
                            current_revision;
                        am.wait(o,'saveMetadataOnDistant',1);
                        am.call(o,'saveNewRevision');
                        am.call(o,'createMetadata');
                    } else {
                        am.call(o,'error',[error]);
                    }
                }
            );
        };
        o.saveNewRevision = function (){
            priv.saveNewRevision (
                command,current_revision_file_path,command.getContent(),
                function (result) {
                    am.call(o,'saveMetadataOnDistant');
                }, function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.checkForConflicts = function () {
            for (var rev in metadata_file_content) {
                if (rev !== previous_revision) {
                    on_conflict = true;
                    failerror = {
                        status:20,
                        statusText:'Conflict',
                        message:'There is one or more conflicts'
                    };
                    break;
                }
            }
            am.call(o,'updateMetadata');
        };
        o.createMetadata = function (){
            metadata_file_content = {};
            metadata_file_content[current_revision] = {
                creation_date: now.getTime(),
                last_modified: now.getTime(),
                conflict: false,
                deleted: false
            };
            am.call(o,'saveMetadataOnDistant');
        };
        o.updateMetadata = function (){
            var previous_creation_date;
            if (metadata_file_content[previous_revision]) {
                previous_creation_date = metadata_file_content[
                    previous_revision].creation_date;
                delete metadata_file_content[previous_revision];
            }
            metadata_file_content[current_revision] = {
                creation_date: previous_creation_date || now.getTime(),
                last_modified: now.getTime(),
                conflict: on_conflict,
                deleted: false
            };
            if (on_conflict) {
                conflict_object =
                    priv.createConflictObject(
                        command,
                        metadata_file_content,
                        current_revision
                    );
            }
            am.call(o,'saveMetadataOnDistant');
        };
        o.saveMetadataOnDistant = function (){
            priv.saveMetadataToDistant(
                command,metadata_file_path,metadata_file_content,
                function (result) {
                    am.call(o,'deletePreviousRevision');
                    if (on_conflict) {
                        am.call(o,'error');
                    } else {
                        am.call(o,'success');
                    }
                },function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.deletePreviousRevision = function (){
            if (previous_revision !== '0' /*&& !on_conflict*/) {
                priv.deleteAFile (
                    command, previous_revision_file_path,
                    empty_fun,empty_fun);
            }
        };
        o.success = function (){
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            that.success(current_revision);
        };
        o.error = function (error){
            var gooderror = error || failerror ||
                {status:0,statusText:'Unknown',
                 message:'Unknown error.'};
            if (on_conflict) {
                gooderror.conflict_object = conflict_object;
            }
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            that.error(gooderror);
        };
        am.call(o,'getDistantMetadata');
    };

    /**
     * Load a document from several storages, and send the first retreived
     * document.
     * @method loadDocument
     */
    that.loadDocument = function (command) {
        var o = {}, am = priv.newAsyncModule(),

        metadata_file_path = command.getPath() + '.metadata',
        current_revision = command.getOption('revision') || '',
        metadata_file_content = null,
        metadata_only = command.getOption('metadata_only'),
        on_conflict = false, conflict_object = {},
        now = new Date(),
        doc = {name:command.getPath()},
        call404 = function (message) {
            am.call(o,'error',[{
                status:404,statusText:'Not Found',
                message:message
            }]);
        };

        o.getDistantMetadata = function (){
            priv.getDistantMetadata (
                command,metadata_file_path,
                function (result) {
                    metadata_file_content = JSON.parse (result.content);
                    if (!metadata_only) {
                        am.wait(o,'success',1);
                    }
                    am.call(o,'affectMetadata');
                    am.call(o,'checkForConflicts');
                },function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.affectMetadata = function () {
            if (current_revision) {
                if (!metadata_file_content[current_revision]) {
                    return call404('Document revision does not exists.');
                }
            } else {
                current_revision = priv.chooseARevision(metadata_file_content);
            }
            doc.last_modified =
                metadata_file_content[current_revision].last_modified;
            doc.creation_date =
                metadata_file_content[current_revision].creation_date;
            doc.revision = current_revision;
            doc.revision_object = metadata_file_content;
            if (metadata_only) {
                am.call(o,'success');
            } else {
                am.call(o,'loadRevision');
            }
        };
        o.loadRevision = function (){
            if (!current_revision ||
                metadata_file_content[current_revision].deleted) {
                return call404('Document has been removed.');
            }
            priv.loadRevision (
                command, doc.name+'.'+current_revision,
                function (result) {
                    doc.content = result.content;
                    am.call(o,'success');
                }, function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.checkForConflicts = function () {
            if (metadata_file_content[current_revision].conflict) {
                on_conflict = true;
                conflict_object =
                    priv.createConflictObject(
                        command,
                        metadata_file_content,
                        current_revision
                    );
                doc.conflict_object = conflict_object;
            }
            am.call(o,'success');
        };
        o.success = function (){
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            that.success(doc);
        };
        o.error = function (error){
            var gooderror = error || {status:0,statusText:'Unknown',
                                      message:'Unknown error.'};
            if (on_conflict) {
                gooderror.conflict_object = conflict_object;
            }
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            that.error(gooderror);
        };
        am.call(o,'getDistantMetadata');
    };

    /**
     * Get a document list from several storages, and returns the first
     * retreived document list.
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        var o = {}, am = priv.newAsyncModule(),
        metadata_only = command.getOption('metadata_only'),
        result_list = [],
        nb_loaded_file = 0,
        success_count = 0, success_max = 0;
        o.retreiveList = function () {
            var cloned_option = command.cloneOption ();
            cloned_option.metadata_only = true;
            cloned_option.error = function (error) {
                am.call(o,'fail',[error]);
            };
            cloned_option.success = function (result) {
                am.call(o,'filterTheList',[result]);
            };
            var newcommand = that.newCommand(
                'getDocumentList',{
                    path:command.getPath(),option:cloned_option
                });
            that.addJob ( that.newStorage (priv.secondstorage_spec),
                          newcommand );
        };
        o.filterTheList = function (result) {
            var i;
            for (i = 0; i < result.length; i+= 1) {
                var splitname = result[i].name.split('.') || [];
                if (splitname.length > 0 &&
                    splitname[splitname.length-1] === 'metadata') {
                    success_max ++;
                    splitname.length --;
                    am.call(o,'loadMetadataFile',[splitname.join('.')]);
                }
            }
        };
        o.loadMetadataFile = function (path) {
            priv.getDistantMetadata (
                command, path+'.metadata',
                function (data) {
                    data = JSON.parse (data.content);
                    am.call(
                        o,'loadFile',
                        [path,priv.chooseARevision(data),data]
                    );
                },function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.loadFile = function (path,revision,data) {
            var doc = {
                name: path,
                last_modified:data[revision].last_modified,
                creation_date:data[revision].creation_date,
                revision:revision,
                revision_object:data
            };
            if (data[revision].conflict) {
                doc.conflict_object = priv.createConflictObject(
                    command, data, revision );
            }
            if (!metadata_only) {
                priv.loadRevision (
                    command,path+'.'+revision,
                    function (data) {
                        doc.content = data.content;
                        result_list.push(doc);
                        am.call(o,'success');
                    },function (error) {
                        am.call(o,'error',[error]);
                    });
            } else {
                result_list.push(doc);
                am.call(o,'success');
            }
        };
        o.success = function (){
            success_count ++;
            if (success_count >= success_max) {
                am.end();
                that.success(result_list);
            }
        };
        o.error = function (error){
            am.end();
            that.error(error);
        };
        am.call(o,'retreiveList');
    };

    /**
     * Remove a document from several storages.
     * @method removeDocument
     */
    that.removeDocument = function (command) {
        var o = {}, am = priv.newAsyncModule(),

        metadata_file_path = command.getPath() + '.metadata',
        current_revision = '',
        current_revision_file_path = '',
        metadata_file_content = null,
        on_conflict = false, conflict_object = {},
        previous_revision = command.getOption('revision'),
        previous_revision_file_path = command.getPath() + '.' +
            previous_revision,
        now = new Date(),
        failerror;

        if (!previous_revision) {
            return setTimeout(function () {
                that.error({status:0,statusText:'Parameter missing',
                            message:'Need a revision.'});
            });
        }

        o.getDistantMetadata = function (){
            priv.getDistantMetadata (
                command,metadata_file_path,
                function (result) {
                    var previous_revision_number =
                        parseInt(previous_revision.split('-')[0],10);
                    metadata_file_content = JSON.parse (result.content);
                    // set current revision
                    current_revision = (previous_revision_number + 1) + '-' +
                        hex_sha256 ('' + previous_revision +
                                    JSON.stringify (metadata_file_content));
                    current_revision_file_path = command.getPath() + '.' +
                        current_revision;
                    am.call(o,'checkForConflicts');
                },function (error) {
                    if (error.status === 404) {
                        am.call(o,'success',['0']);
                    } else {
                        am.call(o,'error',[error]);
                    }
                }
            );
        };
        o.checkForConflicts = function () {
            for (var rev in metadata_file_content) {
                if (rev !== previous_revision) {
                    on_conflict = true;
                    failerror = {
                        status:20,
                        statusText:'Conflict',
                        message:'There is one or more conflicts'
                    };
                    break;
                }
            }
            am.call(o,'updateMetadata');
        };
        o.updateMetadata = function (){
            var previous_creation_date;
            if (metadata_file_content[previous_revision]) {
                previous_creation_date = metadata_file_content[
                    previous_revision].creation_date;
                delete metadata_file_content[previous_revision];
            }
            metadata_file_content[current_revision] = {
                creation_date: previous_creation_date || now.getTime(),
                last_modified: now.getTime(),
                conflict: on_conflict,
                deleted: true
            };
            if (on_conflict) {
                conflict_object =
                    priv.createConflictObject(
                        command,
                        metadata_file_content,
                        current_revision
                    );
            }
            am.call(o,'saveMetadataOnDistant');
        };
        o.saveMetadataOnDistant = function (){
            priv.saveMetadataToDistant(
                command,metadata_file_path,metadata_file_content,
                function (result) {
                    am.call(o,'deletePreviousRevision');
                    if (on_conflict) {
                        am.call(o,'error');
                    } else {
                        am.call(o,'success');
                    }
                },function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.deletePreviousRevision = function (){
            if (previous_revision !== '0' /*&& !on_conflict*/) {
                priv.deleteAFile (
                    command, previous_revision_file_path,
                    empty_fun,empty_fun);
            }
        };
        o.success = function (){
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            that.success(current_revision);
        };
        o.error = function (error){
            var gooderror = error || failerror ||
                {status:0,statusText:'Unknown',
                 message:'Unknown error.'};
            if (on_conflict) {
                gooderror.conflict_object = conflict_object;
            }
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            that.error(gooderror);
        };
        am.call(o,'getDistantMetadata');
    };

    return that;
};
Jio.addStorageType('conflictmanager', newConflictManagerStorage);

}( LocalOrCookieStorage, jQuery, Base64, sjcl, hex_sha256, jio ));
