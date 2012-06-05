/**
 * Adds 5 storages to JIO.
 * - LocalStorage ('local')
 * - DAVStorage ('dav')
 * - ReplicateStorage ('replicate')
 * - IndexedStorage ('indexed')
 * - CryptedStorage ('crypted')
 *
 * @module JIOStorages
 */
(function () {
    var jioStorageLoader =
        function ( LocalOrCookieStorage, $, Base64, sjcl, Jio) {

    ////////////////////////////////////////////////////////////////////////////
    // Tools
    // end Tools
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Classes
    var newLocalStorage,newDAVStorage,newReplicateStorage,
    newIndexedStorage,newCryptedStorage;
    // end Classes
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Local Storage
    /**
     * JIO Local Storage. Type = 'local'.
     * It is a database located in the browser local storage.
     */
    newLocalStorage = function ( spec, my ) {
        // LocalStorage constructor

        var that = Jio.newBaseStorage( spec, my ), priv = {};

        priv.storage_user_array_name = 'jio/local_user_array';
        priv.storage_file_array_name = 'jio/local_file_name_array/' +
            that.getStorageUserName() + '/' + that.getApplicantID();

        /**
         * Returns a list of users.
         * @method getUserArray
         * @return {array} The list of users.
         */
        priv.getUserArray = function () {
            return LocalOrCookieStorage.getItem(
                priv.storage_user_array_name) || [];
        };

        /**
         * Adds a user to the user list.
         * @method addUser
         * @param  {string} user_name The user name.
         */
        priv.addUser = function (user_name) {
            var user_array = priv.getUserArray();
            user_array.push(user_name);
            LocalOrCookieStorage.setItem(priv.storage_user_array_name,
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
                priv.storage_file_array_name) || [];
        };

        /**
         * Adds a file name to the local file name array.
         * @method addFileName
         * @param  {string} file_name The new file name.
         */
        priv.addFileName = function (file_name) {
            var file_name_array = priv.getFileNameArray();
            file_name_array.push(file_name);
            LocalOrCookieStorage.setItem(priv.storage_file_array_name,
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
            LocalOrCookieStorage.setItem(priv.storage_file_array_name,
                                         new_array);
        };

        /**
         * Checks the availability of a user name set in the job.
         * It will check if the user is set in the local user object
         * @method checkNameAvailability
         */
        that.checkNameAvailability = function () {
            setTimeout(function () {
                that.done(!priv.userExists(that.getUserName()));
            }, 100);
        }; // end checkNameAvailability

        /**
         * Saves a document in the local storage.
         * It will store the file in 'jio/local/USR/APP/FILE_NAME'.
         * @method saveDocument
         */
        that.saveDocument = function () {
            // wait a little in order to simulate asynchronous saving
            setTimeout (function () {
                var doc = null, path =
                    'jio/local/'+that.getStorageUserName()+'/'+
                    that.getApplicantID()+'/'+
                    that.getFileName();

                // reading
                doc = LocalOrCookieStorage.getItem(path);
                if (!doc) {
                    // create document
                    doc = {
                        'name': that.getFileName(),
                        'content': that.getFileContent(),
                        'creation_date': Date.now(),
                        'last_modified': Date.now()
                    };
                    if (!priv.userExists(that.getStorageUserName())) {
                        priv.addUser (that.getStorageUserName());
                    }
                    priv.addFileName(that.getFileName());
                } else {
                    // overwriting
                    doc.last_modified = Date.now();
                    doc.content = that.getFileContent();
                }
                LocalOrCookieStorage.setItem(path, doc);
                return that.done();
            }, 100);
        }; // end saveDocument

        /**
         * Loads a document from the local storage.
         * It will load file in 'jio/local/USR/APP/FILE_NAME'.
         * You can add an 'options' object to the job, it can contain:
         * - metadata_only {boolean} default false, retrieve the file metadata
         *   only if true.
         * - content_only  {boolean} default false, retrieve the file content
         *   only if true.
         * @method loadDocument
         */
        that.loadDocument = function () {
            // document object is {'name':string,'content':string,
            // 'creation_date':date,'last_modified':date}

            setTimeout(function () {
                var doc = null, settings = that.cloneOptionObject();

                doc = LocalOrCookieStorage.getItem(
                    'jio/local/'+that.getStorageUserName()+'/'+
                        that.getApplicantID()+'/'+that.getFileName());
                if (!doc) {
                    that.fail({status:404,statusText:'Not Found.',
                               message:'Document "'+ that.getFileName() +
                               '" not found in localStorage.'});
                } else {
                    if (settings.metadata_only) {
                        delete doc.content;
                    } else if (settings.content_only) {
                        delete doc.last_modified;
                        delete doc.creation_date;
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
        that.getDocumentList = function () {
            // the list is [object,object] -> object = {'name':string,
            // 'last_modified':date,'creation_date':date}

            setTimeout(function () {
                var new_array = [], array = [], i, l, k = 'key',
                path = 'jio/local/'+that.getStorageUserName()+'/'+
                    that.getApplicantID(), file_object = {};

                array = priv.getFileNameArray();
                for (i = 0, l = array.length; i < l; i += 1) {
                    file_object =
                        LocalOrCookieStorage.getItem(path+'/'+array[i]);
                    if (file_object) {
                        new_array.push ({
                            'name':file_object.name,
                            'creation_date':file_object.creation_date,
                            'last_modified':file_object.last_modified});
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
        that.removeDocument = function () {
            setTimeout (function () {
                var path = 'jio/local/'+
                    that.getStorageUserName()+'/'+
                    that.getApplicantID()+'/'+
                    that.getFileName();
                // deleting
                LocalOrCookieStorage.deleteItem(path);
                priv.removeFileName(that.getFileName());
                return that.done();
            }, 100);
        };
        return that;
    };
    // end Local Storage
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // DAVStorage
    newDAVStorage = function ( spec, my ) {
        var that = Jio.newBaseStorage( spec, my );

        that.mkcol = function ( options ) {
            // create folders in dav storage, synchronously
            // options : contains mkcol list
            // options.url : the davstorage url
            // options.path: if path=/foo/bar then creates url/dav/foo/bar
            // options.success: the function called if success
            // options.user_name: the user name
            // options.password: the password

            // TODO this method is not working !!!

            var settings = $.extend ({
                'success':function(){},'error':function(){}},options),
            split_path = ['split_path'], tmp_path = 'temp/path';

            // if pathstep is not defined, then split the settings.path
            // and do mkcol recursively
            if (!settings.pathsteps) {
                settings.pathsteps = 1;
                that.mkcol(settings);
            } else {
                split_path = settings.path.split('/');
                // // check if the path is terminated by '/'
                // if (split_path[split_path.length-1] == '') {
                //     split_path.length --;
                // }
                // check if the pathstep is lower than the longer
                if (settings.pathsteps >= split_path.length-1) {
                    return settings.success();
                }
                split_path.length = settings.pathsteps + 1;
                settings.pathsteps++;
                tmp_path = split_path.join('/');
                // alert(settings.url + tmp_path);
                $.ajax ( {
                    url: settings.url + tmp_path,
                    type: 'MKCOL',
                    async: true,
                    headers: {'Authorization': 'Basic '+Base64.encode(
                        settings.user_name + ':' +
                            settings.password ), Depth: '1'},
                    // xhrFields: {withCredentials: 'true'}, // cross domain
                    success: function () {
                        // done
                        that.mkcol(settings);
                    },
                    error: function (type) {
                        // alert(JSON.stringify(type));
                        // switch (type.status) {
                        // case 405: // Method Not Allowed
                        //     // already exists
                        //     t.mkcol(settings);
                        //     break;
                        // default:
                            settings.error();
                        //     break;
                        // }
                    }
                } );
            }
        };

        that.checkNameAvailability = function () {
            // checks the availability of the [job.user_name].
            // if the name already exists, it is not available.
            // this.job.storage: the storage informations.
            // this.job.storage.url: the dav storage url.
            // this.job.user_name: the name we want to check.
            // this.job.storage.user_name: the user name.
            // this.job.storage.password: the user password.

            $.ajax ( {
                url: that.getStorageURL() + '/dav/' +
                    that.getStorageUserName() + '/',
                async: true,
                type: 'PROPFIND',
                dataType: 'xml',
                headers: {'Authorization': 'Basic '+Base64.encode(
                    that.getStorageUserName() + ':' +
                        that.getStoragePassword() ), Depth: '1'},
                success: function (xmlData) {
                    that.done(false);
                },
                error: function (type) {
                    if (type.status === 404) {
                        that.done(true);
                    } else {
                        type.message = 'Cannot check availability of "' +
                            that.getUserName() + '" into DAVStorage.';
                        that.fail(type);
                    }
                }
            } );
        };

        that.saveDocument = function () {
            // Save a document in a DAVStorage
            // this.job.storage: the storage informations.
            // this.job.storage.user_name: the user name.
            // this.job.storage.password: the user password.
            // this.job.applicant.ID: the applicant ID.
            // this.job.name: the document name.
            // this.job.content: the document content.

            // TODO if path of /dav/user/applic does not exists, it won't work!
            //// save on dav
            $.ajax ( {
                url: that.getStorageURL() + '/dav/' +
                    that.getStorageUserName() + '/' +
                    that.getApplicantID() + '/' +
                    that.getFileName(),
                type: 'PUT',
                data: that.getFileContent(),
                async: true,
                dataType: 'text', // TODO is it necessary ?
                headers: {'Authorization':'Basic '+Base64.encode(
                    that.getStorageUserName()+':'+that.getStoragePassword())},
                // xhrFields: {withCredentials: 'true'}, // cross domain
                success: function () {
                    that.done();
                },
                error: function (type) {
                    type.message = 'Cannot save "' + that.getFileName() +
                        '" into DAVStorage.';
                    that.fail(type);
                }
            } );
            //// end saving on dav
        };

        that.loadDocument = function () {
            // Load a document from a DAVStorage. It returns a document object
            // containing all information of the document and its content.
            // this.job.name: the document name we want to load.
            // this.job.storage: the storage informations.
            // this.job.storage.url: the dav storage url.
            // this.job.storage.userName: the user name.
            // this.job.storage.password: the user password.
            // this.job.options.getContent: if true, also get the file content.

            // document object is {'name':string,'content':string,
            // 'creation_date':date,'last_modified':date}

            var doc = {},
            settings = that.cloneOptionObject(),
            getContent = function () {
                $.ajax ( {
                    url: that.getStorageURL() + '/dav/' +
                        that.getStorageUserName() + '/' +
                        that.getApplicantID() + '/' +
                        that.getFileName(),
                    type: "GET",
                    async: true,
                    dataType: 'text', // TODO is it necessary ?
                    headers: {'Authorization':'Basic '+Base64.encode(
                        that.getStorageUserName() + ':' +
                            that.getStoragePassword() )},
                    // xhrFields: {withCredentials: 'true'}, // cross domain
                    success: function (content) {
                        doc.content = content;
                        that.done(doc);
                    },
                    error: function (type) {
                        if (type.status === 404) {
                            type.message = 'Document "' +
                                that.getFileName() +
                                '" not found in localStorage.';
                        } else {
                            type.message =
                                'Cannot load "' + that.getFileName() +
                                '" from DAVStorage.';
                        }
                        that.fail(type);
                    }
                } );
            };
            doc.name = that.getFileName();
            if (settings.content_only) {
                getContent();
                return;
            }
            // Get properties
            $.ajax ( {
                url: that.getStorageURL() + '/dav/' +
                    that.getStorageUserName() + '/' +
                    that.getApplicantID() + '/' +
                    that.getFileName(),
                type: "PROPFIND",
                async: true,
                dataType: 'xml',
                headers: {'Authorization':'Basic '+Base64.encode(
                    that.getStorageUserName() + ':' +
                        that.getStoragePassword() )},
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
                    if (!settings.metadata_only) {
                        getContent();
                    } else {
                        that.done(doc);
                    }
                },
                error: function (type) {
                    type.message = 'Cannot load "' + that.getFileName() +
                        '" informations from DAVStorage.';
                    that.fail(type);
                }
            } );
        };

        that.getDocumentList = function () {
            // Get a document list from a DAVStorage. It returns a document
            // array containing all the user documents informations.
            // this.job.storage: the storage informations.
            // this.job.storage.url: the dav storage url.
            // this.job.storage.user_name: the user name.
            // this.job.storage.password: the user password.
            // this.job.applicant.ID: the applicant id.

            // the list is [object,object] -> object = {'name':string,
            // 'last_modified':date,'creation_date':date}

            var document_array = [], file = {}, path_array = [];

            $.ajax ( {
                url: that.getStorageURL() + '/dav/' +
                    that.getStorageUserName() + '/' +
                    that.getApplicantID() + '/',
                async: true,
                type: 'PROPFIND',
                dataType: 'xml',
                headers: {'Authorization': 'Basic '+Base64.encode(
                    that.getStorageUserName() + ':' +
                        that.getStoragePassword() ), Depth: '1'},
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

        that.removeDocument = function () {
            // Remove a document from a DAVStorage.
            // this.job.name: the document name we want to remove.
            // this.job.storage: the storage informations.
            // this.job.storage.url: the dav storage url.
            // this.job.storage.user_name: the user name.
            // this.job.storage.password: the user password.
            // this.job.applicant.ID: the applicant id.

            $.ajax ( {
                url: that.getStorageURL() + '/dav/' +
                    that.getStorageUserName() + '/' +
                    that.getApplicantID() + '/' +
                    that.getFileName(),
                type: "DELETE",
                async: true,
                headers: {'Authorization':'Basic '+Base64.encode(
                    that.getStorageUserName() + ':' +
                        that.getStoragePassword() )},
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
    // end DAVStorage
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // ReplicateStorage
    newReplicateStorage = function ( spec, my ) {
        var that = Jio.newBaseStorage( spec, my ), priv = {};

        priv.storageArray = that.getStorageArray();
        // TODO Add a tests that check if there is no duplicate storages.
        priv.length = priv.storageArray.length;
        priv.return_value_array = [];
        priv.max_tries = that.getMaxTries();

        that.setMaxTries (1);

        priv.execJobsFromStorageArray = function (callback) {
            var newjob = {}, i;
            for (i = 0; i < priv.storageArray.length; i += 1) {
                newjob = that.cloneJob();
                newjob.max_tries = priv.max_tries;
                newjob.storage = priv.storageArray[i];
                newjob.callback = callback;
                that.addJob ( newjob ) ;
            }
        };

        that.checkNameAvailability = function () {
            // Checks the availability of the [job.user_name].
            // if the name already exists in a storage, it is not available.
            // this.job.user_name: the name we want to check.
            // this.job.storage.storageArray: An Array of storages.

            var i = 'id', done = false, error_array = [],
            res = {'status':'done'}, callback = function (result) {
                priv.return_value_array.push(result);
                if (!done) {
                    if (result.status === 'fail') {
                        res.status = 'fail';
                        error_array.push(result.error);
                    } else {
                        if (result.return_value === false) {
                            that.done (false);
                            done = true;
                            return;
                        }
                    }
                    if (priv.return_value_array.length ===
                        priv.length) {
                        if (res.status === 'fail') {
                            that.fail (
                                {status:207,
                                 statusText:'Multi-Status',
                                 message:'Some check availability of "' +
                                 that.getUserName() + '" requests have failed.',
                                 array:error_array});
                        } else {
                            that.done (true);
                        }
                        done = true;
                        return;
                    }
                }
            };
            priv.execJobsFromStorageArray(callback);
        };
        that.saveDocument = function () {
            // Save a single document in several storages.
            // If a storage failed to save the document.
            // this.job.storage: the storage informations.
            // this.job.storage.user_name: the user name.
            // this.job.storage.password: the user password.
            // this.job.applicant.ID: the applicant ID.
            // this.job.name: the document name.
            // this.job.content: the document content.

            var res = {'status':'done'}, i = 'id',
            done = false, error_array = [],
            callback = function (result) {
                priv.return_value_array.push(result);
                if (!done) {
                    if (result.status !== 'fail') {
                        that.done ();
                        done = true;
                    } else {
                        error_array.push(result.error);
                        if (priv.return_value_array.length ===
                            priv.length) {
                            that.fail (
                                {status:207,
                                 statusText:'Multi-Status',
                                 message:'All save "' + that.getFileName() +
                                 '" requests have failed.',
                                 array:error_array});
                        }
                    }
                }
            };
            priv.execJobsFromStorageArray(callback);
        };

        that.loadDocument = function () {
            // Load a document from several storages. It returns a document
            // object containing all information of the document and its
            // content. TODO will popup a window which will help us to choose
            // the good file if the files are different.
            // this.job.name: the document name we want to load.
            // this.job.storage: the storage informations.
            // this.job.storage.user_name: the user name.
            // this.job.storage.password: the user password.
            // this.job.options.getContent: if true, also get the file content.

            var doc = {}, i = 'id',
            done = false, error_array = [],
            res = {'status':'done'}, callback = function (result) {
                priv.return_value_array.push(result);
                if (!done) {
                    if (result.status !== 'fail') {
                        that.done (result.return_value);
                        done = true;
                    } else {
                        error_array.push(result.error);
                        if (priv.return_value_array.length ===
                            priv.length) {
                            that.fail (
                                {status:207,
                                 statusText:'Multi-Status',
                                 message:'All load "' + that.getFileName() +
                                 '" requests have failed.',
                                 array:error_array});
                        }
                    }
                }
            };
            priv.execJobsFromStorageArray(callback);
        };

        that.getDocumentList = function () {
            // Get a document list from several storages. It returns a document
            // array containing all the user documents informations.
            // this.job.storage: the storage informations.
            // this.job.storage.user_name: the user name.
            // this.job.storage.password: the user password.
            // this.job.applicant.ID: the applicant id.

            var res = {'status':'done'}, i = 'id',
            done = false, error_array = [],
            callback = function (result) {
                priv.return_value_array.push(result);
                if (!done) {
                    if (result.status !== 'fail') {
                        that.done (result.return_value);
                        done = true;
                    } else {
                        error_array.push(result.error);
                        if (priv.return_value_array.length ===
                            priv.length) {
                            that.fail (
                                {status:207,
                                 statusText:'Multi-Status',
                                 message:'All get document list requests'+
                                 ' have failed',
                                 array:error_array});
                        }
                    }
                }
            };
            priv.execJobsFromStorageArray(callback);
        };

        that.removeDocument = function () {
            // Remove a document from several storages.
            // this.job.name: the document name we want to remove.
            // this.job.storage: the storage informations.
            // this.job.storage.user_name: the user name.
            // this.job.storage.password: the user password.
            // this.job.applicant.ID: the applicant id.

            var res = {'status':'done'}, i = 'key',
            done = false, error_array = [],
            callback = function (result) {
                priv.return_value_array.push(result);
                if (!done) {
                    if (result.status !== 'fail') {
                        that.done ();
                        done = true;
                    } else {
                        error_array.push(result.error);
                        if (priv.return_value_array.length ===
                            priv.length) {
                            that.fail (
                                {status:207,
                                 statusText:'Multi-Status',
                                 message:'All remove "' + that.getFileName() +
                                 '" requests have failed.',
                                 array:error_array});
                        }
                    }
                }
            };
            priv.execJobsFromStorageArray(callback);
        };
        return that;
    };
    // end ReplicateStorage
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Indexed Storage
    /**
     * JIO Indexed Storage. Type = 'indexed'.
     * It retreives files metadata from another storage and keep them
     * in a cache so that we can work faster.
     */
    newIndexedStorage = function ( spec, my ) {
        // IndexedStorage constructor

        var that = Jio.newBaseStorage( spec, my ), priv = {};

        priv.storage_array_name = 'jio/indexed_storage_array';
        priv.storage_file_array_name = 'jio/indexed_file_array/'+
            JSON.stringify (that.getSecondStorage()) + '/' +
            that.getApplicantID();


        /**
         * Check if the indexed storage array exists.
         * @method indexedStorageArrayExists
         * @return {boolean} true if exists, else false
         */
        priv.indexedStorageArrayExists = function () {
            return (LocalOrCookieStorage.getItem(
                priv.storage_array_name) ? true : false);
        };

        /**
         * Returns a list of indexed storages.
         * @method getIndexedStorageArray
         * @return {array} The list of indexed storages.
         */
        priv.getIndexedStorageArray = function () {
            return LocalOrCookieStorage.getItem(
                priv.storage_array_name) || [];
        };

        /**
         * Adds a storage to the indexed storage list.
         * @method addIndexedStorage
         * @param  {object} storage The new indexed storage.
         */
        priv.addIndexedStorage = function (storage) {
            var indexed_storage_array = priv.getIndexedStorageArray();
            indexed_storage_array.push(JSON.stringify (storage));
            LocalOrCookieStorage.setItem(priv.storage_array_name,
                                         indexed_storage_array);
        };

        /**
         * Checks if a storage exists in the indexed storage list.
         * @method isAnIndexedStorage
         * @param  {object} storage The storage to find.
         * @return {boolean} true if found, else false
         */
        priv.isAnIndexedStorage = function (storage) {
            var json_storae = JSON.stringify (storage),i,l,
            array = priv.getIndexedStorageArray();
            for (i = 0, l = array.length; i < l; i+= 1) {
                if (JSON.stringify(array[i]) === json_storae) {
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
                priv.storage_file_array_name) ? true : false);
        };

        /**
         * Returns the file from the indexed storage but not there content.
         * @method getFileArray
         * @return {array} All the existing file.
         */
        priv.getFileArray = function () {
            return LocalOrCookieStorage.getItem(
                priv.storage_file_array_name) || [];
        };

        /**
         * Sets the file array list.
         * @method setFileArray
         * @param  {array} file_array The array containing files.
         */
        priv.setFileArray = function (file_array) {
            return LocalOrCookieStorage.setItem(
                priv.storage_file_array_name,
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
            LocalOrCookieStorage.setItem(priv.storage_file_array_name,
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
            LocalOrCookieStorage.setItem(priv.storage_file_array_name,
                                         new_array);
        };

        /**
         * Updates the storage.
         * It will retreive all files from a storage. It is an asynchronous task
         * so the update can be on going even if IndexedStorage has already
         * returned the result.
         * @method update
         */
        priv.update = function (callback) {
            // retreive list before, and then retreive all files
            var getlist_callback = function (result) {
                if (result.status === 'done') {
                    if (!priv.isAnIndexedStorage(that.getSecondStorage())) {
                        priv.addIndexedStorage(that.getSecondStorage());
                    }
                    priv.setFileArray(result.return_value);
                }
            },
            newjob = {
                storage: that.getSecondStorage(),
                applicant: {ID:that.getApplicantID()},
                method: 'getDocumentList',
                max_tries: 3,
                callback: getlist_callback
            };
            that.addJob ( newjob );
        };

        /**
         * Checks the availability of a user name set in the job.
         * @method checkNameAvailability
         */
        that.checkNameAvailability = function () {
            var new_job = that.cloneJob();
            priv.update();
            new_job.storage = that.getSecondStorage();
            new_job.callback = function (result) {
                if (result.status === 'done') {
                    that.done(result.return_value);
                } else {
                    that.fail(result.error);
                }
            };
            that.addJob( new_job );
        }; // end checkNameAvailability

        /**
         * Saves a document.
         * @method saveDocument
         */
        that.saveDocument = function () {
            var new_job = that.cloneJob();
            new_job.storage = that.getSecondStorage();
            new_job.callback = function (result) {
                if (result.status === 'done') {
                    if (!priv.isFileIndexed(that.getFileName())) {
                        priv.addFile({name:that.getFileName(),
                                      last_modified:0,
                                      creation_date:0});
                    }
                    priv.update();
                    that.done();
                } else {
                    that.fail(result.error);
                }
            };
            that.addJob ( new_job );
        }; // end saveDocument

        /**
         * Loads a document.
         * job.options.metadata_only {boolean}
         * job.options.content_only  {boolean}
         * @method loadDocument
         */
        that.loadDocument = function () {
            var file_array, i, l, new_job,
            loadCallback = function (result) {
                if (result.status === 'done') {
                    // if (file_array[i].last_modified !==
                    //     result.return_value.last_modified ||
                    //     file_array[i].creation_date !==
                    //     result.return_value.creation_date) {
                    //     // the file in the index storage is different than
                    //     // the one in the second storage. priv.update will
                    //     // take care of refresh the indexed storage
                    // }
                    that.done(result.return_value);
                } else {
                    that.fail(result.error);
                }
            },
            secondLoadDocument = function () {
                new_job = that.cloneJob();
                new_job.storage = that.getSecondStorage();
                new_job.callback = loadCallback;
                that.addJob ( new_job );
            },
            settings = that.cloneOptionObject();
            priv.update();
            if (settings.metadata_only) {
                setTimeout(function () {
                    if (priv.fileArrayExists()) {
                        file_array = priv.getFileArray();
                        for (i = 0, l = file_array.length; i < l; i+= 1) {
                            if (file_array[i].name === that.getFileName()) {
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
        that.getDocumentList = function () {
            var id;
            priv.update();
            id = setInterval(function () {
                if (priv.fileArrayExists()) {
                    that.done(priv.getFileArray());
                    clearInterval(id);
                }
            },100);
        }; // end getDocumentList

        /**
         * Removes a document.
         * @method removeDocument
         */
        that.removeDocument = function () {
            var new_job = that.cloneJob();
            new_job.storage = that.getSecondStorage();
            new_job.callback = function (result) {
                if (result.status === 'done') {
                    priv.removeFile(that.getFileName());
                    priv.update();
                    that.done();
                } else {
                    that.fail(result.error);
                }
            };
            that.addJob(new_job);
        };
        return that;
    };
    // end Indexed Storage
    ////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////
    // Crypted Storage
    /**
     * JIO Crypted Storage. Type = 'crypted'.
     * It will encrypt the file and its metadata stringified by JSON.
     */
    newCryptedStorage = function ( spec, my ) {
        // CryptedStorage constructor

        var that = Jio.newBaseStorage( spec, my ), priv = {};

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
         * Checks the availability of a user name set in the job.
         * @method checkNameAvailability
         */
        that.checkNameAvailability = function () {
            var new_job = that.cloneJob();
            new_job.storage = that.getSecondStorage();
            new_job.callback = function (result) {
                if (result.status === 'done') {
                    that.done(result.return_value);
                } else {
                    that.fail(result.error);
                }
            };
            that.addJob( new_job );
        }; // end checkNameAvailability

        /**
         * Saves a document.
         * @method saveDocument
         */
        that.saveDocument = function () {
            var new_job, new_file_name, newfilecontent,
            _1 = function () {
                priv.encrypt(that.getFileName(),function(res) {
                    new_file_name = res;
                    _2();
                });
            },
            _2 = function () {
                priv.encrypt(that.getFileContent(),function(res) {
                    newfilecontent = res;
                    _3();
                });
            },
            _3 = function () {
                new_job = that.cloneJob();
                new_job.name = new_file_name;
                new_job.content = newfilecontent;
                new_job.storage = that.getSecondStorage();
                new_job.callback = function (result) {
                    if (result.status === 'done') {
                        that.done();
                    } else {
                        that.fail(result.error);
                    }
                };
                that.addJob ( new_job );
            };
            _1();
        }; // end saveDocument

        /**
         * Loads a document.
         * job.options.metadata_only {boolean}
         * job.options.content_only  {boolean}
         * @method loadDocument
         */
        that.loadDocument = function () {
            var new_job, new_file_name, option = that.cloneOptionObject(),
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
                new_job.callback = loadCallback;
                that.addJob ( new_job );
            },
            loadCallback = function (result) {
                if (result.status === 'done') {
                    result.return_value.name = that.getFileName();
                    if (option.metadata_only) {
                        that.done(result.return_value);
                    } else {
                        priv.decrypt (result.return_value.content,function(res){
                            if (typeof res === 'object') {
                                that.fail({status:0,statusText:'Decrypt Fail',
                                           message:'Unable to decrypt'});
                            } else {
                                result.return_value.content = res;
                                // content only: the second storage should
                                // manage content_only option, so it is not
                                // necessary to manage it.
                                that.done(result.return_value);
                            }
                        });
                    }
                } else {
                    // NOTE : we can re create an error object instead of
                    // keep the old ex:status=404,message="document 1y59gyl8g
                    // not found in localStorage"...
                    that.fail(result.error);
                }
            };
            _1();
        }; // end loadDocument

        /**
         * Gets a document list.
         * @method getDocumentList
         */
        that.getDocumentList = function () {
            var new_job, i, l, cpt = 0, array, ok = true,
            _1 = function () {
                new_job = that.cloneJob();
                new_job.storage = that.getSecondStorage();
                new_job.callback = getListCallback;
                that.addJob ( new_job );
            },
            getListCallback = function (result) {
                if (result.status === 'done') {
                    array = result.return_value;
                    for (i = 0, l = array.length; i < l; i+= 1) {
                        // cpt--;
                        priv.decrypt (array[i].name,
                                      lastCallback,i,'name');
                        // priv.decrypt (array[i].content,
                        //               lastCallback,i,'content');
                    }
                } else {
                    that.fail(result.error);
                }
            },
            lastCallback = function (res,index,key) {
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
                new_job.callback = removeCallback;
                that.addJob(new_job);
            },
            removeCallback = function (result) {
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
    // end Crypted Storage
    ////////////////////////////////////////////////////////////////////////////

    // add key to storageObjectType of global jio
    Jio.addStorageType('local', newLocalStorage);
    Jio.addStorageType('dav', newDAVStorage);
    Jio.addStorageType('replicate', newReplicateStorage);
    Jio.addStorageType('indexed', newIndexedStorage);
    Jio.addStorageType('crypted', newCryptedStorage);
};

if (window.requirejs) {
    define ('JIOStorages',
            ['LocalOrCookieStorage','jQuery','Base64','SJCL','JIO'],
            jioStorageLoader);
} else {
    jioStorageLoader ( LocalOrCookieStorage, jQuery, Base64, sjcl, JIO);
}

}());
