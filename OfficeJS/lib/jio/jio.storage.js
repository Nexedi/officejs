/*! JIO Storage - v0.1.0 - 2012-06-15
* Copyright (c) 2012 Nexedi; Licensed  */

(function(LocalOrCookieStorage, $, Base64, sjcl, Jio) {

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
            that.done();
        }, 100);
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
                that.fail(command,{status:404,statusText:'Not Found.',
                                   message:'Document "'+ command.getPath() +
                                   '" not found in localStorage.'});
            } else {
                if (command.getOption('metadata_only')) {
                    delete doc.content;
                }
                that.done(doc);
            }
        }, 100);
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
            that.done(new_array);
        }, 100);
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
            that.done();
        }, 100);
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
                that.done();
            },
            error: function (type) {
                type.message = 'Cannot save "' + command.getPath() +
                    '" into DAVStorage.';
                that.fail(type);
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
                    that.done(doc);
                },
                error: function (type) {
                    if (type.status === 404) {
                        type.message = 'Document "' +
                            command.getPath() +
                            '" not found in localStorage.';
                    } else {
                        type.message =
                            'Cannot load "' + command.getPath() +
                            '" from DAVStorage.';
                    }
                    that.fail(type);
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
                    that.done(doc);
                }
            },
            error: function (type) {
                type.message = 'Cannot load "' + command.getPath() +
                    '" informations from DAVStorage.';
                that.fail(type);
            }
        } );
    };

    /**
     * Gets a document list from a distant dav storage.
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        var document_array = [], file = {}, path_array = [];

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
                $(xmlData).find(
                    'D\\:response, response'
                ).each( function(i,data){
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
                        document_array.push (file);
                    }
                });
                that.done(document_array);
            },
            error: function (type) {
                type.message =
                    'Cannot get a document list from DAVStorage.';
                that.fail(type);
            }
        } );
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
                that.done();
            },
            error: function (type) {
                if (type.status === 404) {
                    that.done();
                } else {
                    type.message = 'Cannot remove "' + that.getFileName() +
                        '" from DAVStorage.';
                    that.fail(type);
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
        onResponseDo = function (result) {
            priv.return_value_array.push(result);
        },
        onFailDo = function (result) {
            if (!done) {
                error_array.push(result);
                if (priv.isTheLast()) {
                    that.fail (
                        {status:207,
                         statusText:'Multi-Status',
                         message:errormessage,
                         array:error_array});
                }
            }
        },
        onDoneDo = function (result) {
            if (!done) {
                done = true;
                that.done (result);
            }
        };
        command.setMaxRetry (1);
        for (i = 0; i < priv.nb_storage; i+= 1) {
            var newcommand = command.clone();
            var newstorage = that.newStorage(priv.storagelist[i]);
            newcommand.onResponseDo (onResponseDo);
            newcommand.onFailDo (onFailDo);
            newcommand.onDoneDo (onDoneDo);
            that.addJob (newstorage, newcommand);
        }
    };

    /**
     * Save a document in several storages.
     * @method saveDocument
     */
    that.saveDocument = function (command) {
        priv.doJob (
            command.clone(),
            'All save "'+ command.getPath() +'" requests have failed.');
    };

    /**
     * Load a document from several storages, and send the first retreived
     * document.
     * @method loadDocument
     */
    that.loadDocument = function (command) {
        priv.doJob (
            command.clone(),
            'All load "'+ command.getPath() +'" requests have failed.');
    };

    /**
     * Get a document list from several storages, and returns the first
     * retreived document list.
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        priv.doJob (
            command.clone(),
            'All get document list requests have failed.');
    };

    /**
     * Remove a document from several storages.
     * @method removeDocument
     */
    that.removeDocument = function (command) {
        priv.doJob (
            command.clone(),
            'All remove "' + command.getPath() + '" requests have failed.');
    };

    return that;
};
Jio.addStorageType('replicate', newReplicateStorage);

var newIndexStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'handler' ), priv = {};

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
        if (priv.secondstorage_string === JSON.stringify ({type:'base'})) {
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
        var getlist_onDone = function (result) {
            if (!priv.isAnIndexedStorage(priv.secondstorage_string)) {
                priv.indexStorage(priv.secondstorage_string);
            }
            priv.setFileArray(result);
        };
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      that.newCommand ('getDocumentList',
                                       {path:'.',
                                        option:{onDone:getlist_onDone,
                                                max_retry: 3}}) );
    };

    /**
     * Saves a document.
     * @method saveDocument
     */
    that.saveDocument = function (command) {
        var newcommand = command.clone();
        newcommand.onResponseDo (function(){});
        newcommand.onDoneDo (function (result) {
            if (!priv.isFileIndexed(command.getPath())) {
                priv.addFile({name:command.getPath(),
                              last_modified:0,creation_date:0});
            }
            priv.update();
            that.done();
        });
        newcommand.onFailDo (function (result) {
            that.fail(result);
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
        loadOnDone = function (result) {
            // if (file_array[i].last_modified !==
            //     result.return_value.last_modified ||
            //     file_array[i].creation_date !==
            //     result.return_value.creation_date) {
            //     // the file in the index storage is different than
            //     // the one in the second storage. priv.update will
            //     // take care of refresh the indexed storage
            // }
            that.done(result);
        },
        loadOnFail = function (result) {
            that.fail(result);
        },
        secondLoadDocument = function () {
            var newcommand = command.clone();
            newcommand.onResponseDo (function(){});
            newcommand.onFailDo (loadOnFail);
            newcommand.onDoneDo (loadOnDone);
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
                            return that.done(file_array[i]);
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
                    that.fail({status:0,statusText:'Timeout',
                               message:'The request has timed out.'});
                    clearInterval(id);
                }
                if (priv.fileArrayExists()) {
                    that.done(priv.getFileArray());
                    clearInterval(id);
                }
            },100);
            setTimeout (function () {
                timeout = true;
            }, 10000);           // 10 sec
        } else {
            newcommand = command.clone();
            newcommand.onDoneDo (function (result) {
                that.done(result);
            });
            newcommand.onFailDo (function (result) {
                that.fail(result);
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
        newcommand.onResponseDo (function(){});
        newcommand.onDoneDo (function (result) {
            priv.removeFile(command.getPath());
            priv.update();
            that.done();
        });
        newcommand.onFailDo (function (result) {
            that.fail(result);
        });
        that.addJob( that.newStorage(priv.secondstorage_spec),
                     newcommand );
    };
    return that;
};
Jio.addStorageType ('indexed', newIndexStorage);

var newCryptedStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'handler' ), priv = {};

    priv.username = spec.username || '';
    priv.password = spec.password || '';
    priv.secondstorage_spec = spec.storage || {type:'base'};

    var super_serialized = that.serialized;
    that.serialized = function () {
        var o = super_serialized();
        o.username = priv.username;
        o.password = priv.password;
        return o;
    };

    that.validateState = function () {
        if (priv.username &&
            JSON.stringify (priv.secondstorage_spec) ===
            JSON.stringify ({type:'base'})) {
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
    priv.encrypt = function (data,callback,index) {
        // end with a callback in order to improve encrypt to an
        // asynchronous encryption.
        var tmp = sjcl.encrypt (that.getStorageUserName()+':'+
                                that.getStoragePassword(), data,
                                priv.encrypt_param_object);
        callback(JSON.parse(tmp).ct,index);
    };
    priv.decrypt = function (data,callback,index,key) {
        var tmp, param = $.extend(true,{},priv.decrypt_param_object);
        param.ct = data || '';
        param = JSON.stringify (param);
        try {
            tmp = sjcl.decrypt (that.getStorageUserName()+':'+
                                that.getStoragePassword(),
                                param);
        } catch (e) {
            callback({status:0,statusText:'Decrypt Fail',
                      message:'Unable to decrypt.'},index,key);
            return;
        }
        callback(tmp,index,key);
    };

    /**
     * Saves a document.
     * @method saveDocument
     */
    that.saveDocument = function (command) {
        var new_file_name, newfilecontent,
        _1 = function () {
            priv.encrypt(command.getPath(),function(res) {
                new_file_name = res;
                _2();
            });
        },
        _2 = function () {
            priv.encrypt(command.getContent(),function(res) {
                newfilecontent = res;
                _3();
            });
        },
        _3 = function () {
            var settings = that.cloneOption(), newcommand, newstorage;
            settings.onResponse = function (){};
            settings.onDone = function () { that.done(); };
            settings.onFail = function (r) { that.fail(r); };
            newcommand = that.newCommand(
                {path:new_file_name,
                 content:newfilecontent,
                 option:settings});
            newstorage = that.newStorage( priv.secondstorage_spec );
            that.addJob ( newstorage, newcommand );
        };
        _1();
    }; // end saveDocument

    /**
     * Loads a document.
     * @method loadDocument
     */
    that.loadDocument = function (command) {
        var new_file_name, option,
        _1 = function () {
            priv.encrypt(command.getPath(),function(res) {
                new_file_name = res;
                _2();
            });
        },
        _2 = function () {
            var settings = command.cloneOption(), newcommand, newstorage;
            settings.onResponse = function(){};
            settings.onFail = loadOnFail;
            settings.onDone = loadOnDone;
            newcommand = that.newCommand (
                {path:new_file_name,
                 option:settings});
            newstorage = that.newStorage ( priv.secondstorage_spec );
            that.addJob ( newstorage, newcommand );
        },
        loadOnDone = function (result) {
            result.name = command.getPath();
            if (command.getOption('metadata_only')) {
                that.done(result);
            } else {
                priv.decrypt (result.content,function(res){
                    if (typeof res === 'object') {
                        that.fail({status:0,statusText:'Decrypt Fail',
                                   message:'Unable to decrypt'});
                    } else {
                        result.content = res;
                        // content only: the second storage should
                        // manage content_only option, so it is not
                        // necessary to manage it.
                        that.done(result);
                    }
                });
            }
        },
        loadOnFail = function (result) {
            // NOTE : we can re create an error object instead of
            // keep the old ex:status=404,message="document 1y59gyl8g
            // not found in localStorage"...
            that.fail(result);
        };
        _1();
    }; // end loadDocument

    /**
     * Gets a document list.
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        var new_job, i, l, cpt = 0, array, ok = true,
        _1 = function () {
            var newcommand = command.clone(),
            newstorage = that.newStorage ( priv.secondstorage_spec );
            newcommand.onResponseDo (getListOnResponse);
            newcommand.onDoneDo (function(){});
            newcommand.onFailDo (function(){});
            that.addJob ( new_job );
        },
        getListOnResponse = function (result) {
            if (result.status.isDone()) {
                array = result.return_value;
                for (i = 0, l = array.length; i < l; i+= 1) {
                    // cpt--;
                    priv.decrypt (array[i].name,
                                  lastOnResponse,i,'name');
                    // priv.decrypt (array[i].content,
                    //               lastOnResponse,i,'content');
                }
            } else {
                that.fail(result.error);
            }
        },
        lastOnResponse = function (res,index,key) {
            var tmp;
            cpt++;
            if (typeof res === 'object') {
                if (ok) {
                    that.fail({status:0,statusText:'Decrypt Fail',
                               message:'Unable to decrypt.'});
                }
                ok = false;
                return;
            }
            array[index][key] = res;
            if (cpt === l && ok) {
                // this is the last callback
                that.done(array);
            }
        };
        _1();
    }; // end getDocumentList

    /**
     * Removes a document.
     * @method removeDocument
     */
    that.removeDocument = function () {
        var new_job, new_file_name,
        _1 = function () {
            priv.encrypt(that.getFileName(),function(res) {
                new_file_name = res;
                _2();
            });
        },
        _2 = function () {
            new_job = that.cloneJob();
            new_job.name = new_file_name;
            new_job.storage = that.getSecondStorage();
            new_job.onResponse = removeOnResponse;
            that.addJob(new_job);
        },
        removeOnResponse = function (result) {
            if (result.status === 'done') {
                that.done();
            } else {
                that.fail(result.error);
            }
        };
        _1();
    };
    return that;
};
Jio.addStorageType('crypt', newCryptedStorage);

}( LocalOrCookieStorage, jQuery, Base64, sjcl, jio ));
