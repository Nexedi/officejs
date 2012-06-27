/*! JIO Storage - v0.1.0 - 2012-06-27
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
                that.fail({status:404,statusText:'Not Found.',
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
        for (i = 0; i < priv.nb_storage; i+= 1) {
            var newcommand = command.clone();
            var newstorage = that.newStorage(priv.storagelist[i]);
            newcommand.onResponseDo (onResponseDo);
            newcommand.onFailDo (onFailDo);
            newcommand.onDoneDo (onDoneDo);
            that.addJob (newstorage, newcommand);
        }
        command.setMaxRetry (1);
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

    var is_valid_storage = spec.storage || false;

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
    priv.encrypt = function (data,callback,index) {
        // end with a callback in order to improve encrypt to an
        // asynchronous encryption.
        var tmp = sjcl.encrypt (priv.username+':'+
                                priv.password, data,
                                priv.encrypt_param_object);
        callback(JSON.parse(tmp).ct,index);
    };
    priv.decrypt = function (data,callback,index,key) {
        var tmp, param = $.extend(true,{},priv.decrypt_param_object);
        param.ct = data || '';
        param = JSON.stringify (param);
        try {
            tmp = sjcl.decrypt (priv.username+':'+
                                priv.password,
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
        var new_file_name, new_file_content,
        _1 = function () {
            priv.encrypt(command.getPath(),function(res) {
                new_file_name = res;
                _2();
            });
        },
        _2 = function () {
            priv.encrypt(command.getContent(),function(res) {
                new_file_content = res;
                _3();
            });
        },
        _3 = function () {
            var settings = command.cloneOption(), newcommand;
            settings.onResponse = function (){};
            settings.onDone = function () { that.done(); };
            settings.onFail = function (r) { that.fail(r); };
            newcommand = that.newCommand(
                'saveDocument',
                {path:new_file_name,content:new_file_content,option:settings});
            that.addJob (
                that.newStorage( priv.secondstorage_spec ),
                newcommand );
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
            var settings = command.cloneOption(), newcommand;
            settings.onResponse = function(){};
            settings.onFail = loadOnFail;
            settings.onDone = loadOnDone;
            newcommand = that.newCommand (
                'loadDocument',
                {path:new_file_name,option:settings});
            that.addJob (
                that.newStorage ( priv.secondstorage_spec ), newcommand );
        },
        loadOnDone = function (result) {
            result.name = command.getPath();
            if (command.getOption('metadata_only')) {
                that.done(result);
            } else {
                priv.decrypt (result.content, function(res){
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
        loadOnFail = function (error) {
            // NOTE : we can re create an error object instead of
            // keep the old ex:status=404,message="document 1y59gyl8g
            // not found in localStorage"...
            that.fail(error);
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
            var newcommand = command.clone();
            newcommand.onResponseDo (getListOnResponse);
            newcommand.onDoneDo (function(){});
            newcommand.onFailDo (function(){});
            that.addJob (
                that.newStorage ( priv.secondstorage_spec ), newcommand );
        },
        getListOnResponse = function (result) {
            if (result.status.isDone()) {
                array = result.value;
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
                    ok = false;
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
    that.removeDocument = function (command) {
        var new_file_name,
        _1 = function () {
            priv.encrypt(command.getPath(),function(res) {
                new_file_name = res;
                _2();
            });
        },
        _2 = function () {
            var cloned_option = command.cloneOption();
            cloned_option.onResponse = removeOnResponse;
            cloned_option.onFail = function () {};
            cloned_option.onDone = function () {};
            that.addJob(that.newStorage(priv.secondstorage_spec),
                        that.newCommand(
                            'removeDocument',
                            {path:new_file_name,
                             option:cloned_option}));
        },
        removeOnResponse = function (result) {
            if (result.status.isDone()) {
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

var newConflictManagerStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'handler' ), priv = {};
    spec = spec || {};
    my = my || {};

    priv.username = spec.username || '';
    var storage_exists = (spec.storage?true:false);
    priv.secondstorage_spec = spec.storage || {type:'base'};
    priv.secondstorage_string = JSON.stringify (priv.secondstorage_spec);

    var local_namespace = 'jio/conflictmanager/'+priv.username+'/'+
        priv.secondstorage_string+'/';

    var super_serialized = that.serialized;
    that.serialized = function () {
        var o = super_serialized();
        o.username = priv.username;
        o.storage = priv.secondstorage_spec;
        return o;
    };

    that.validateState = function () {
        if (priv.username && storage_exists) {
            return '';
        }
        return 'Need at least two parameter: "username" and "storage".';
    };

    priv.removeValuesFromArrayWhere = function (array,fun) {
        var i, newarray = [];
        for (i = 0; i < array.length; i+= 1) {
            if (!fun(array[i])) {
                newarray.push(array[i]);
            }
        }
        return newarray;
    };

    priv.loadMetadataFromDistant = function (command,path,onDone,onFail) {
        var cloned_option = command.cloneOption ();
        cloned_option.metadata_only = false;
        cloned_option.onResponse = function () {};
        cloned_option.onFail = onFail;
        cloned_option.onDone = onDone;
        var newcommand = that.newCommand(
            'loadDocument',{path:path,
                            option:cloned_option});
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      newcommand );
    };

    priv.saveMetadataToDistant = function (command,path,content,onDone,onFail) {
        var cloned_option = command.cloneOption ();
        cloned_option.onResponse = function () {};
        cloned_option.onFail = onFail;
        cloned_option.onDone = onDone;
        var newcommand = that.newCommand(
            'saveDocument',{path:path,
                            content:JSON.stringify (content),
                            option:cloned_option});
        newcommand.setMaxRetry (0); // inf
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      newcommand );
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
     * Save a document and can manage conflicts.
     * @method saveDocument
     */
    that.saveDocument = function (command) {
        var o = {}, am = priv.newAsyncModule(),
        metadata_file_name = command.getPath() + '.metadata',
        local_metadata_file_name = local_namespace + metadata_file_name,
        local_file_metadata = {}, // local file.metadata
        command_file_metadata = {}, // distant file.metadata
        previous_revision = 0,
        is_a_new_file = false,
        local_file_hash = hex_sha256 (command.getContent()),
        now = new Date();

        o.updateLocalMetadata = function () {
            var new_owner_object = {revision:0,hash:'',
                                    last_modified:0,
                                    creation_date:now.getTime()};
            local_file_metadata =
                LocalOrCookieStorage.getItem (local_metadata_file_name);
            if ( local_file_metadata ) {
                // if metadata already exists
                if ( !local_file_metadata.owner[priv.username] ) {
                    local_file_metadata.owner[priv.username] =
                        new_owner_object;
                }
            } else {
                local_file_metadata = {
                    winner: {},
                    owner: {},
                    conflict_list: []
                };
                local_file_metadata.winner = {
                    revision:0,owner:priv.username,hash:''};
                local_file_metadata.owner[priv.username] =
                    new_owner_object;
            }
            am.call(o,'checkForConflicts');
        };
        o.loadMetadataFromDistant = function () {
            priv.loadMetadataFromDistant (
                command,metadata_file_name,
                function (result) {
                    command_file_metadata = JSON.parse (result.content);
                    am.call(o,'checkForConflicts');
                },function (error) {
                    if (error.status === 404) {
                        command_file_metadata = local_file_metadata;
                        is_a_new_file = true;
                        am.call(o,'checkForConflicts');
                    } else {
                        am.call(o,'fail',[error]);
                    }
                });
        };
        o.checkForConflicts = function () {
            var updateMetadataCommon = function () {
                var original_creation_date;

                if (is_a_new_file || !command_file_metadata.owner[
                    command_file_metadata.winner.owner]) {
                    original_creation_date = now.getTime();
                } else {
                    original_creation_date = command_file_metadata.owner[
                        command_file_metadata.winner.owner].
                        creation_date || now.getTime();
                }

                if (command_file_metadata.owner[priv.username]) {
                    previous_revision = command_file_metadata.owner[
                        priv.username].revision;
                } else {
                    command_file_metadata.owner[priv.username] = {};
                }
                command_file_metadata.owner[priv.username].
                    last_modified = now.getTime();
                command_file_metadata.owner[priv.username].
                    creation_date = original_creation_date;
                command_file_metadata.owner[priv.username].hash =
                    local_file_hash;
            };
            var updateCommandMetadataNotOnConflict = function () {
                updateMetadataCommon ();
                command_file_metadata.winner.owner = priv.username;
                command_file_metadata.winner.revision ++;
                command_file_metadata.winner.hash = local_file_hash;
                command_file_metadata.owner[priv.username].revision =
                    command_file_metadata.winner.revision;
            };
            var updateCommandMetadataOnConflict = function () {
                updateMetadataCommon ();
                command_file_metadata.owner[priv.username].revision ++;
            };
            // if this is a new file
            if (is_a_new_file) {
                updateCommandMetadataNotOnConflict();
                LocalOrCookieStorage.setItem (local_metadata_file_name,
                                              command_file_metadata);
                am.wait(o,'done',1);
                am.call(o,'saveMetadata');
                am.call(o,'saveRevision');
                return;
            }
            // if no conflict
            if (local_file_metadata.winner.revision ===
                command_file_metadata.winner.revision &&
                local_file_metadata.winner.hash ===
                command_file_metadata.winner.hash) {
                // OK! Now, update distant metadata, store them and save
                updateCommandMetadataNotOnConflict();
                LocalOrCookieStorage.setItem (local_metadata_file_name,
                                              command_file_metadata);
                am.wait(o,'done',1);
                am.call(o,'saveMetadata');
                am.call(o,'saveRevision');
            } else {
                // if conflict
                var conflict_object = {
                    label: 'revision',
                    path: command.getPath(),
                    method: 'saveDocument',
                    owner: priv.username,
                    conflict_owner: {
                        name: command_file_metadata.winner.owner,
                        revision: command_file_metadata.winner.revision,
                        hash: command_file_metadata.winner.hash}
                },
                // gen hash
                conflict_hash = hex_sha256 (JSON.stringify (
                    conflict_object));
                conflict_object.hash = conflict_hash;
                // browse known conflict list
                var i, known_conflict_list =
                    command.getOption('known_conflict_list') || [];
                var compare_fun = function (v) {
                    return (v.hash === conflict_hash);
                };
                for (i = 0; i < known_conflict_list.length; i+= 1) {
                    // if known conflict
                    if (known_conflict_list[i].hash ===
                        conflict_hash) {
                        command_file_metadata.conflict_list =
                            priv.removeValuesFromArrayWhere(
                                command_file_metadata.conflict_list,
                                compare_fun);
                        updateCommandMetadataNotOnConflict();
                        am.wait(o,'done',1);
                        am.call(o,'saveMetadata');
                        am.call(o,'saveRevision');
                        return;
                    }
                }
                updateCommandMetadataOnConflict();
                // if unknown conflict
                command_file_metadata.conflict_list.push (conflict_object);
                am.neverCall(o,'done');
                am.call(o,'saveMetadata');
                am.call(o,'saveRevision');
                am.call(o,'fail',[
                    {status:0,statusText:'Revision Conflict',
                     message:'Someone has already modified this document.'}]);
                var onConflict = command.getOption('onConflict') ||
                    function (){};
                onConflict(conflict_object);
            }
        };
        o.saveMetadata = function () {
            priv.saveMetadataToDistant (
                command,metadata_file_name,command_file_metadata,
                function () {
                    am.call(o,'done');
                },function (error) {
                    am.call(o,'fail',[error]);
                });
        };
        o.saveRevision = function () {
            var cloned_option = command.cloneOption ();
            cloned_option.onResponse = function () {};
            cloned_option.onFail = function (error) {
                am.call(o,'fail',[error]);
            };
            cloned_option.onDone = function () {
                am.call(o,'deletePreviousRevision');
            };
            var newcommand = that.newCommand(
                'saveDocument',
                {path:command.getPath() + '.' +
                 command_file_metadata.owner[priv.username].revision +
                 '.' + priv.username,
                 content:command.getContent(),
                 option:cloned_option});
            newcommand.setMaxRetry (0); // inf
            that.addJob ( that.newStorage (priv.secondstorage_spec),
                          newcommand );
        };
        o.deletePreviousRevision = function () {
            if ( previous_revision !== 0 && (
                !command_file_metadata.owner[priv.username] ||
                    previous_revision !==
                    command_file_metadata.owner[
                        priv.username].revision ) ) {
                var cloned_option = command.cloneOption ();
                cloned_option.onResponse = function () {};
                cloned_option.onFail = function (error) {
                    am.call(o,'fail',[error]);
                };
                cloned_option.onDone = function () {
                    am.call(o,'done');
                };
                var newcommand = that.newCommand(
                    'removeDocument',
                    {path:command.getPath() + '.' +
                     previous_revision + '.' + priv.username,
                     option:cloned_option});
                newcommand.setMaxRetry (0); // inf
                that.addJob ( that.newStorage (priv.secondstorage_spec),
                              newcommand );
            } else {
                am.call(o,'done');
            }
        };
        o.fail = function (error) {
            am.neverCall(o,'fail');
            am.neverCall(o,'done');
            command.setMaxRetry(1);
            that.fail(error);
        };
        o.done = function () {
            am.neverCall(o,'done');
            am.neverCall(o,'fail');
            that.done();
        };
        am.wait(o,'checkForConflicts',1);
        am.call(o,'loadMetadataFromDistant');
        am.call(o,'updateLocalMetadata');
    };

    /**
     * Load a document from several storages, and send the first retreived
     * document.
     * @method loadDocument
     */
    that.loadDocument = function (command) {
        var o = {}, am = priv.newAsyncModule(),
        metadata_file_name = command.getPath() + '.metadata',
        local_metadata_file_name = local_namespace + metadata_file_name,
        command_file_metadata = {}, // distant file.metadata
        owner = '', loaded_file;

        o.loadMetadataFromDistant = function () {
            priv.loadMetadataFromDistant (
                command,metadata_file_name,
                function (result) {
                    command_file_metadata = JSON.parse (result.content);
                    owner = command.getOption('owner');
                    am.wait(o,'done',1);
                    // if owner
                    if (owner) {
                        am.call(o,'loadOwner');
                    } else {
                        // if no owner
                        am.call(o,'loadWinner');
                    }
                    am.call(o,'updateLocalMetadata');
                },function (error) {
                    am.end();
                    am.call(o,'fail',[error]);
                });
        };
        o.updateLocalMetadata = function () {
            LocalOrCookieStorage.setItem (local_metadata_file_name,
                                          command_file_metadata);
            am.call(o,'done');
        };
        o.loadWinner = function () {
            var cloned_option = command.cloneOption ();
            cloned_option.onResponse = function () {};
            cloned_option.onFail = function (error) {
                am.call(o,'fail',[error]);
                am.end();
            };
            cloned_option.onDone = function (result) {
                loaded_file = result;
                loaded_file.name = command.getPath();
                am.call(o,'done');
            };
            var newcommand = that.newCommand(
                'loadDocument',
                {path:command.getPath() + '.' +
                 command_file_metadata.winner.revision +
                 '.' + command_file_metadata.winner.owner,
                 option:cloned_option});
            that.addJob ( that.newStorage (priv.secondstorage_spec),
                          newcommand );
        };
        o.loadOwner = function () {
            var cloned_option = command.cloneOption ();
            cloned_option.onResponse = function () {};
            cloned_option.onFail = function (error) {
                am.end();
                am.call(o,'fail',[error]);
            };
            cloned_option.onDone = function (result) {
                loaded_file = result;
                loaded_file.name = command.getPath();
                am.call(o,'done');
            };
            if (!command_file_metadata.owner[owner]) {
                cloned_option.onFail ({status:404,
                                       statusText:'Not Found',
                                       message:'Document not found.'});
                return;
            }
            var newcommand = that.newCommand(
                'loadDocument',
                {path:command.getPath() + '.' +
                 command_file_metadata.owner[owner].revision +
                 '.' + owner,
                 option:cloned_option});
            that.addJob ( that.newStorage (priv.secondstorage_spec),
                          newcommand );
        };
        o.fail = function (error) {
            am.neverCall(o,'fail');
            am.neverCall(o,'done');
            command.setMaxRetry(1);
            that.fail(error);
        };
        o.done = function () {
            am.neverCall(o,'done');
            am.neverCall(o,'fail');
            that.done(loaded_file);
        };
        am.call(o,'loadMetadataFromDistant');
    };

    /**
     * Get a document list from several storages, and returns the first
     * retreived document list.
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        var o = {}, am = priv.newAsyncModule(),
        command_file_metadata_list = [], // distant files metadata
        result_list = [],
        nb_loaded_file = 0;
        o.retreiveList = function () {
            var cloned_option = command.cloneOption ();
            cloned_option.metadata_only = false;
            cloned_option.onResponse = function () {};
            cloned_option.onFail = function (error) {
                am.call(o,'fail',[error]);
            };
            cloned_option.onDone = function (result) {
                var i;
                for (i = 0; i < result.length; i+= 1) {
                    var splitname = result[i].name.split('.') || [];
                    var content_object;
                    var doc = {};
                    if (splitname[splitname.length-1] === 'metadata') {
                        try {
                            content_object = JSON.parse (result[i].content);
                        } catch (e) {
                            continue;
                        }
                        result_list.push(content_object);
                        splitname.length --;
                        doc.name = splitname.join('.');
                        doc.creation_date = content_object.owner[
                            content_object.winner.owner].creation_date;
                        doc.last_modified = content_object.owner[
                            content_object.winner.owner].last_modified;
                        command_file_metadata_list.push(doc);
                    }
                }
                if (command.getOption('metadata_only')) {
                    am.call(o,'done',[command_file_metadata_list]);
                } else {
                    if (result.length === 0) {
                        return that.done([]);
                    }
                    am.wait(o,'done',command_file_metadata_list.length-1);
                    for (i = 0; i < command_file_metadata_list.length; i+= 1) {
                        LocalOrCookieStorage.setItem (
                            command_file_metadata_list[i].name + '.metadata',
                            result_list[i]);
                        am.call(o,'loadFile',[
                            command_file_metadata_list[i],
                            result_list[i].winner.revision,
                            result_list[i].winner.owner]);
                    }
                    that.end();
                }
            };
            var newcommand = that.newCommand(
                'getDocumentList',
                {path:command.getPath(),
                 option:cloned_option});
            that.addJob ( that.newStorage (priv.secondstorage_spec),
                          newcommand );
        };
        o.loadFile = function (doc,revision,owner) {
            var cloned_option = command.cloneOption ();
            cloned_option.onResponse = function () {};
            cloned_option.onFail = function (error) {
                am.call(o,'fail',[error]);
                am.end();
            };
            cloned_option.onDone = function (result) {
                doc.content = result.content;
                am.call(o,'done',[command_file_metadata_list]);
            };
            var newcommand = that.newCommand(
                'loadDocument',
                {path:doc.name + '.' + revision + '.' + owner,
                 option:cloned_option});
            that.addJob ( that.newStorage (priv.secondstorage_spec),
                          newcommand );
        };
        o.fail = function (error) {
            am.neverCall(o,'fail');
            am.neverCall(o,'done');
            command.setMaxRetry(1);
            that.fail(error);
        };
        o.done = function (value) {
            am.neverCall(o,'done');
            am.neverCall(o,'fail');
            that.done(value);
        };
        am.call(o,'retreiveList');
    };

    /**
     * Remove a document from several storages.
     * @method removeDocument
     */
    that.removeDocument = function (command) {
        var o = {}, am = priv.newAsyncModule(),
        metadata_file_name = command.getPath() + '.metadata',
        local_metadata_file_name = local_namespace + metadata_file_name,
        local_file_metadata = {},
        command_file_metadata = {}, // distant file.metadata
        previous_revision = 0,
        is_a_new_file = false;

        o.updateLocalMetadata = function () {
            var new_owner_object = {revision:0,hash:'',
                                    last_modified:0,
                                    creation_date:0};
            local_file_metadata =
                LocalOrCookieStorage.getItem (local_metadata_file_name);
            if ( local_file_metadata ) {
                // if metadata already exists
                if ( !local_file_metadata.owner[priv.username] ) {
                    local_file_metadata.owner[priv.username] =
                        new_owner_object;
                }
            } else {
                local_file_metadata = {
                    winner: {},
                    owner: {},
                    conflict_list: []
                };
                local_file_metadata.winner = {
                    revision:0,owner:priv.username,hash:''};
                local_file_metadata.owner[priv.username] =
                    new_owner_object;
            }
            am.call(o,'checkForConflicts');
        };
        o.loadMetadataFromDistant = function () {
            priv.loadMetadataFromDistant (
                command,metadata_file_name,
                function (result) {
                    command_file_metadata = JSON.parse (result.content);
                    am.call(o,'checkForConflicts');
                },function (error) {
                    if (error.status === 404) {
                        command_file_metadata = local_file_metadata;
                        is_a_new_file = true;
                        am.call(o,'checkForConflicts');
                        return;
                    }
                    am.call(o,'fail',[error]);
                    am.end();
                });
        };
        o.checkForConflicts = function () {
            var updateMetadataCommon = function () {
                if (command_file_metadata.owner[priv.username]) {
                    previous_revision = command_file_metadata.owner[
                        priv.username].revision;
                    delete command_file_metadata.owner[priv.username];
                }
            };
            var updateCommandMetadataNotOnConflict = function () {
                updateMetadataCommon();
                command_file_metadata.winner.owner = priv.username;
                command_file_metadata.winner.revision = 0;
                command_file_metadata.winner.hash = '';
            };
            var updateCommandMetadataOnConflict = function () {
                updateMetadataCommon ();
            };
            // if this is a new file
            if (is_a_new_file) {
                LocalOrCookieStorage.deleteItem (local_metadata_file_name);
                return am.call(o,'done');
            }
            // if no conflict
            if (local_file_metadata.winner.revision ===
                command_file_metadata.winner.revision &&
                local_file_metadata.winner.hash ===
                command_file_metadata.winner.hash) {
                // OK! Now, update distant metadata, store them and remove
                updateCommandMetadataNotOnConflict();
                LocalOrCookieStorage.setItem (local_metadata_file_name,
                                              command_file_metadata);
                am.wait(o,'done',1);
                am.call(o,'saveMetadata');
                am.call(o,'removeRevision');
            } else {
                // if conflict
                var conflict_object = {
                    label: 'revision',
                    path: command.getPath(),
                    method: 'removeDocument',
                    owner: priv.username,
                    conflict_owner: {
                        name: command_file_metadata.winner.owner,
                        revision: command_file_metadata.winner.revision,
                        hash: command_file_metadata.winner.hash}
                },
                // gen hash
                conflict_hash = hex_sha256 (JSON.stringify (
                    conflict_object));
                conflict_object.hash = conflict_hash;
                // browse known conflict list
                var i, known_conflict_list =
                    command.getOption('known_conflict_list') || [];
                var compare_fun = function (v) {
                    return (v.hash === conflict_hash);
                };
                for (i = 0; i < known_conflict_list.length; i+= 1) {
                    // if known conflict
                    if (known_conflict_list[i].hash ===
                        conflict_hash) {
                        command_file_metadata.conflict_list =
                            priv.removeValuesFromArrayWhere(
                                command_file_metadata.conflict_list,
                                compare_fun);
                        updateCommandMetadataNotOnConflict();
                        am.wait(o,'done',1);
                        am.call(o,'saveMetadata');
                        am.call(o,'removeRevision');
                        return;
                    }
                }
                updateCommandMetadataOnConflict();
                // if unknown conflict
                command_file_metadata.conflict_list.push (conflict_object);
                am.neverCall(o,'done');
                am.call(o,'saveMetadata');
                // am.call(o,'removeRevision');
                am.call(o,'fail',[
                    {status:0,statusText:'Revision Conflict',
                     message:'Someone has already modified this document.'}]);
                var onConflict = command.getOption('onConflict') ||
                    function (){};
                onConflict(conflict_object);
            }
        };
        o.saveMetadata = function () {
            priv.saveMetadataToDistant (
                command,metadata_file_name,command_file_metadata,
                function () {
                    am.call(o,'done');
                },function (error) {
                    am.call(o,'fail',[error]);
                    am.end();
                });
        };
        o.removeRevision = function () {
            if ( previous_revision !== 0 && (
                !command_file_metadata.owner[priv.username] ||
                    previous_revision !==
                    command_file_metadata.owner[
                        priv.username].revision ) ) {
                var cloned_option = command.cloneOption ();
                cloned_option.onResponse = function () {};
                cloned_option.onFail = function (error) {
                    am.call(o,'fail',[error]);
                    am.end();
                };
                cloned_option.onDone = function () {
                    am.call(o,'done');
                };
                var newcommand = that.newCommand(
                    'removeDocument',
                    {path:command.getPath() + '.' +
                     previous_revision + '.' + priv.username,
                     option:cloned_option});
                newcommand.setMaxRetry (0); // inf
                that.addJob ( that.newStorage (priv.secondstorage_spec),
                              newcommand );
            } else {
                am.call(o,'done');
            }
        };
        o.fail = function (error) {
            am.neverCall(o,'fail');
            am.neverCall(o,'done');
            command.setMaxRetry(1);
            that.fail(error);
        };
        o.done = function () {
            am.neverCall(o,'done');
            am.neverCall(o,'fail');
            that.done();
        };
        am.wait(o,'checkForConflicts',1);
        am.call(o,'loadMetadataFromDistant');
        am.call(o,'updateLocalMetadata');
    };

    return that;
};
Jio.addStorageType('conflictmanager', newConflictManagerStorage);

}( LocalOrCookieStorage, jQuery, Base64, sjcl, hex_sha256, jio ));
