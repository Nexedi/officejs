/**
 * JIO Local Storage. Type = 'local'.
 * It is a database located in the browser local storage.
 */
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
