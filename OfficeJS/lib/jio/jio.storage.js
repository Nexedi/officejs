/*! JIO Storage - v0.1.0 - 2012-06-14
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

    priv.isTheLast = function () {
        return (priv.return_value_array.length === priv.nb_storage);
    };

    priv.doJob = function (command,errormessage) {
        var done = false, error_array = [], i,
        onResponseDo = function (result) {
            console.log ('respond');
            priv.return_value_array.push(result);
        },
        onFailDo = function (result) {
            if (!done) {
                console.log ('fail');
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
                console.log ('done');
                done = true;
                that.done (result);
            }
        };
        command.setMaxRetry (1);
        for (i = 0; i < priv.nb_storage; i+= 1) {
            var newcommand = command.clone();
            var newstorage = Jio.storage(priv.storagelist[i], my);
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

}( LocalOrCookieStorage, jQuery, Base64, sjcl, jio ));
