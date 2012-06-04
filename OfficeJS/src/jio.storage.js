/**
 * Adds 4 storages to JIO.
 * - LocalStorage ('local')
 * - DAVStorage ('dav')
 * - ReplicateStorage ('replicate')
 * - IndexedStorage ('indexed')
 *
 * @module JIOStorages
 */
(function () {
var jio_storage_loader = function ( LocalOrCookieStorage, Base64, Jio, $) {

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

        priv.storage_user_array_name = 'jio/localuserarray';
        priv.storage_file_array_name = 'jio/localfilenamearray/' +
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
         * @param  {string} username The user name.
         */
        priv.addUser = function (username) {
            var userarray = priv.getUserArray();
            userarray.push(username);
            LocalOrCookieStorage.setItem(priv.storage_user_array_name,
                                         userarray);
        };

        /**
         * checks if a user exists in the user array.
         * @method userExists
         * @param  {string} username The user name
         * @return {boolean} true if exist, else false
         */
        priv.userExists = function (username) {
            var userarray = priv.getUserArray(), i, l;
            for (i = 0, l = userarray.length; i < l; i += 1) {
                if (userarray[i] === username) {
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
         * @param  {string} filename The new file name.
         */
        priv.addFileName = function (filename) {
            var filenamearray = priv.getFileNameArray();
            filenamearray.push(filename);
            LocalOrCookieStorage.setItem(priv.storage_file_array_name,
                                         filenamearray);
        };

        /**
         * Removes a file name from the local file name array.
         * @method removeFileName
         * @param  {string} filename The file name to remove.
         */
        priv.removeFileName = function (filename) {
            var i, l, array = priv.getFileNameArray(), newarray = [];
            for (i = 0, l = array.length; i < l; i+= 1) {
                if (array[i] !== filename) {
                    newarray.push(array[i]);
                }
            }
            LocalOrCookieStorage.setItem(priv.storage_file_array_name,
                                         newarray);
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
         * It will store the file in 'jio/local/USR/APP/FILENAME'.
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
                        'fileName': that.getFileName(),
                        'fileContent': that.getFileContent(),
                        'creationDate': Date.now(),
                        'lastModified': Date.now()
                    };
                    if (!priv.userExists()){
                        priv.addUser (that.getStorageUserName());
                    }
                    priv.addFileName(that.getFileName());
                } else {
                    // overwriting
                    doc.lastModified = Date.now();
                    doc.fileContent = that.getFileContent();
                }
                LocalOrCookieStorage.setItem(path, doc);
                return that.done();
            }, 100);
        }; // end saveDocument

        /**
         * Loads a document from the local storage.
         * It will load file in 'jio/local/USR/APP/FILENAME'.
         * You can add an 'options' object to the job, it can contain:
         * - metadata_only {boolean} default false, retrieve the file metadata
         *   only if true.
         * - content_only  {boolean} default false, retrieve the file content
         *   only if true.
         * @method loadDocument
         */
        that.loadDocument = function () {
            // document object is {'fileName':string,'fileContent':string,
            // 'creationDate':date,'lastModified':date}

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
                        delete doc.fileContent;
                    } else if (settings.content_only) {
                        delete doc.lastModified;
                        delete doc.creationDate;
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
            // the list is [object,object] -> object = {'fileName':string,
            // 'lastModified':date,'creationDate':date}

            setTimeout(function () {
                var newarray = [], array = [], i, l, k = 'key',
                path = 'jio/local/'+that.getStorageUserName()+'/'+
                    that.getApplicantID(), fileObject = {};

                array = priv.getFileNameArray();
                for (i = 0, l = array.length; i < l; i += 1) {
                    fileObject =
                        LocalOrCookieStorage.getItem(path+'/'+array[i]);
                    newarray.push ({
                        'fileName':fileObject.fileName,
                        'creationDate':fileObject.creationDate,
                        'lastModified':fileObject.lastModified});
                }
                that.done(newarray);
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
            // options.location : the davstorage locations
            // options.path: if path=/foo/bar then creates location/dav/foo/bar
            // options.success: the function called if success
            // options.userName: the username
            // options.password: the password

            // TODO this method is not working !!!

            var settings = $.extend ({
                'success':function(){},'error':function(){}},options),
            splitpath = ['splitedpath'], tmppath = 'temp/path';

            // if pathstep is not defined, then split the settings.path
            // and do mkcol recursively
            if (!settings.pathsteps) {
                settings.pathsteps = 1;
                that.mkcol(settings);
            } else {
                splitpath = settings.path.split('/');
                // // check if the path is terminated by '/'
                // if (splitpath[splitpath.length-1] == '') {
                //     splitpath.length --;
                // }
                // check if the pathstep is lower than the longer
                if (settings.pathsteps >= splitpath.length-1) {
                    return settings.success();
                }
                splitpath.length = settings.pathsteps + 1;
                settings.pathsteps++;
                tmppath = splitpath.join('/');
                // alert(settings.location + tmppath);
                $.ajax ( {
                    url: settings.location + tmppath,
                    type: 'MKCOL',
                    async: true,
                    headers: {'Authorization': 'Basic '+Base64.encode(
                        settings.userName + ':' +
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
            // checks the availability of the [job.userName].
            // if the name already exists, it is not available.
            // this.job.storage: the storage informations.
            // this.job.storage.location: the dav storage location.
            // this.job.userName: the name we want to check.
            // this.job.storage.userName: the user name.
            // this.job.storage.password: the user password.

            $.ajax ( {
                url: that.getStorageLocation() + '/dav/' +
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
            // this.job.storage.userName: the user name.
            // this.job.storage.password: the user password.
            // this.job.applicant.ID: the applicant ID.
            // this.job.fileName: the document name.
            // this.job.fileContent: the document content.

            // TODO if path of /dav/user/applic does not exists, it won't work!
            //// save on dav
            $.ajax ( {
                url: that.getStorageLocation() + '/dav/' +
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
            // this.job.fileName: the document name we want to load.
            // this.job.storage: the storage informations.
            // this.job.storage.location: the dav storage location.
            // this.job.storage.userName: the user name.
            // this.job.storage.password: the user password.
            // this.job.options.getContent: if true, also get the file content.

            // document object is {'fileName':string,'fileContent':string,
            // 'creationDate':date,'lastModified':date}

            var doc = {},
            settings = that.cloneOptionObject(),
            getContent = function () {
                $.ajax ( {
                    url: that.getStorageLocation() + '/dav/' +
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
                        doc.fileContent = content;
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
            doc.fileName = that.getFileName();
            if (settings.content_only) {
                getContent();
                return;
            }
            // Get properties
            $.ajax ( {
                url: that.getStorageLocation() + '/dav/' +
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
                    // doc.lastModified =
                    $(xmlData).find(
                        'lp1\\:getlastmodified, getlastmodified'
                    ).each( function () {
                        doc.lastModified = $(this).text();
                    });
                    $(xmlData).find(
                        'lp1\\:creationdate, creationdate'
                    ).each( function () {
                        doc.creationDate = $(this).text();
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
            // this.job.storage.location: the dav storage location.
            // this.job.storage.userName: the user name.
            // this.job.storage.password: the user password.
            // this.job.applicant.ID: the applicant id.

            // the list is [object,object] -> object = {'fileName':string,
            // 'lastModified':date,'creationDate':date}

            var documentArrayList = [], file = {}, pathArray = [];

            $.ajax ( {
                url: that.getStorageLocation() + '/dav/' +
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
                                pathArray = $(this).text().split('/');
                                file.fileName =
                                    (pathArray[pathArray.length-1] ?
                                     pathArray[pathArray.length-1] :
                                     pathArray[pathArray.length-2]+'/');
                            });
                            if (file.fileName === '.htaccess' ||
                                file.fileName === '.htpasswd') { return; }
                            $(data).find(
                                'lp1\\:getlastmodified, getlastmodified'
                            ).each(function () {
                                file.lastModified = $(this).text();
                            });
                            $(data).find(
                                'lp1\\:creationdate, creationdate'
                            ).each(function () {
                                file.creationDate = $(this).text();
                            });
                            documentArrayList.push (file);
                        }
                    });
                    that.done(documentArrayList);
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
            // this.job.fileName: the document name we want to remove.
            // this.job.storage: the storage informations.
            // this.job.storage.location: the dav storage location.
            // this.job.storage.userName: the user name.
            // this.job.storage.password: the user password.
            // this.job.applicant.ID: the applicant id.

            $.ajax ( {
                url: that.getStorageLocation() + '/dav/' +
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
        priv.returnsValuesArray = [];
        priv.maxtries = that.getMaxTries();

        that.setMaxTries (1);

        priv.execJobsFromStorageArray = function (callback) {
            var newjob = {}, i;
            for (i = 0; i < priv.storageArray.length; i += 1) {
                newjob = that.cloneJob();
                newjob.maxtries = priv.maxtries;
                newjob.storage = priv.storageArray[i];
                newjob.callback = callback;
                that.addJob ( newjob ) ;
            }
        };

        that.checkNameAvailability = function () {
            // Checks the availability of the [job.userName].
            // if the name already exists in a storage, it is not available.
            // this.job.userName: the name we want to check.
            // this.job.storage.storageArray: An Array of storages.

            var i = 'id', done = false, errorArray = [],
            res = {'status':'done'}, callback = function (result) {
                priv.returnsValuesArray.push(result);
                if (!done) {
                    if (result.status === 'fail') {
                        res.status = 'fail';
                        errorArray.push(result.error);
                    } else {
                        if (result.return_value === false) {
                            that.done (false);
                            done = true;
                            return;
                        }
                    }
                    if (priv.returnsValuesArray.length ===
                        priv.length) {
                        if (res.status === 'fail') {
                            that.fail (
                                {status:207,
                                 statusText:'Multi-Status',
                                 message:'Some check availability of "' +
                                 that.getUserName() + '" requests have failed.',
                                 array:errorArray});
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
            // this.job.storage.userName: the user name.
            // this.job.storage.password: the user password.
            // this.job.applicant.ID: the applicant ID.
            // this.job.fileName: the document name.
            // this.job.fileContent: the document content.

            var res = {'status':'done'}, i = 'id',
            done = false, errorArray = [],
            callback = function (result) {
                priv.returnsValuesArray.push(result);
                if (!done) {
                    if (result.status !== 'fail') {
                        that.done ();
                        done = true;
                    } else {
                        errorArray.push(result.error);
                        if (priv.returnsValuesArray.length ===
                            priv.length) {
                            that.fail (
                                {status:207,
                                 statusText:'Multi-Status',
                                 message:'All save "' + that.getFileName() +
                                 '" requests have failed.',
                                 array:errorArray});
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
            // this.job.fileName: the document name we want to load.
            // this.job.storage: the storage informations.
            // this.job.storage.location: the dav storage location.
            // this.job.storage.userName: the user name.
            // this.job.storage.password: the user password.
            // this.job.options.getContent: if true, also get the file content.

            var doc = {}, i = 'id',
            done = false, errorArray = [],
            res = {'status':'done'}, callback = function (result) {
                priv.returnsValuesArray.push(result);
                if (!done) {
                    if (result.status !== 'fail') {
                        that.done (result.return_value);
                        done = true;
                    } else {
                        errorArray.push(result.error);
                        if (priv.returnsValuesArray.length ===
                            priv.length) {
                            that.fail (
                                {status:207,
                                 statusText:'Multi-Status',
                                 message:'All load "' + that.getFileName() +
                                 '" requests have failed.',
                                 array:errorArray});
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
            // this.job.storage.location: the dav storage location.
            // this.job.storage.userName: the user name.
            // this.job.storage.password: the user password.
            // this.job.applicant.ID: the applicant id.

            var res = {'status':'done'}, i = 'id',
            done = false, errorArray = [],
            callback = function (result) {
                priv.returnsValuesArray.push(result);
                if (!done) {
                    if (result.status !== 'fail') {
                        that.done (result.return_value);
                        done = true;
                    } else {
                        errorArray.push(result.error);
                        if (priv.returnsValuesArray.length ===
                            priv.length) {
                            that.fail (
                                {status:207,
                                 statusText:'Multi-Status',
                                 message:'All get document list requests'+
                                 ' have failed',
                                 array:errorArray});
                        }
                    }
                }
            };
            priv.execJobsFromStorageArray(callback);
        };

        that.removeDocument = function () {
            // Remove a document from several storages.
            // this.job.fileName: the document name we want to remove.
            // this.job.storage: the storage informations.
            // this.job.storage.location: the dav storage location.
            // this.job.storage.userName: the user name.
            // this.job.storage.password: the user password.
            // this.job.applicant.ID: the applicant id.

            var res = {'status':'done'}, i = 'key',
            done = false, errorArray = [],
            callback = function (result) {
                priv.returnsValuesArray.push(result);
                if (!done) {
                    if (result.status !== 'fail') {
                        that.done ();
                        done = true;
                    } else {
                        errorArray.push(result.error);
                        if (priv.returnsValuesArray.length ===
                            priv.length) {
                            that.fail (
                                {status:207,
                                 statusText:'Multi-Status',
                                 message:'All remove "' + that.getFileName() +
                                 '" requests have failed.',
                                 array:errorArray});
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

        priv.storage_array_name = 'jio/indexedstoragearray';
        priv.storage_file_array_name = 'jio/indexedfilearray/'+
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
            var indexedstoragearray = priv.getIndexedStorageArray();
            indexedstoragearray.push(JSON.stringify (storage));
            LocalOrCookieStorage.setItem(priv.storage_array_name,
                                         indexedstoragearray);
        };

        /**
         * Checks if a storage exists in the indexed storage list.
         * @method isAnIndexedStorage
         * @param  {object} storage The storage to find.
         * @return {boolean} true if found, else false
         */
        priv.isAnIndexedStorage = function (storage) {
            var jsonstorage = JSON.stringify (storage),i,l,
            array = priv.getIndexedStorageArray();
            for (i = 0, l = array.length; i < l; i+= 1) {
                if (JSON.stringify(array[i]) === jsonstorage) {
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
         * @param  {array} filearray The array containing files.
         */
        priv.setFileArray = function (filearray) {
            return LocalOrCookieStorage.setItem(
                priv.storage_file_array_name,
                filearray);
        };

        /**
         * Checks if the file already exists in the array.
         * @method isFileIndexed
         * @param  {string} filename The file we want to find.
         * @return {boolean} true if found, else false
         */
        priv.isFileIndexed = function (filename) {
            var i, l, array = priv.getFileArray();
            for (i = 0, l = array.length; i < l; i+= 1) {
                if (array[i].fileName === filename){
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
            var filearray = priv.getFileArray();
            filearray.push(file);
            LocalOrCookieStorage.setItem(priv.storage_file_array_name,
                                         filearray);
        };

        /**
         * Removes a file from the local file array.
         * @method removeFile
         * @param  {string} filename The file to remove.
         */
        priv.removeFile = function (filename) {
            var i, l, array = priv.getFileArray(), newarray = [];
            for (i = 0, l = array.length; i < l; i+= 1) {
                if (array[i].fileName !== filename) {
                    newarray.push(array[i]);
                }
            }
            LocalOrCookieStorage.setItem(priv.storage_file_array_name,
                                         newarray);
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
                maxtries: 3,
                callback: getlist_callback
            };
            that.addJob ( newjob );
        };

        /**
         * Checks the availability of a user name set in the job.
         * @method checkNameAvailability
         */
        that.checkNameAvailability = function () {
            var newjob = that.cloneJob();
            priv.update();
            newjob.storage = that.getSecondStorage();
            newjob.callback = function (result) {
                if (result.status === 'done') {
                    that.done(result.return_value);
                } else {
                    that.fail(result.error);
                }
            };
            that.addJob( newjob );
        }; // end checkNameAvailability

        /**
         * Saves a document.
         * @method saveDocument
         */
        that.saveDocument = function () {
            var newjob = that.cloneJob();
            newjob.storage = that.getSecondStorage();
            newjob.callback = function (result) {
                if (result.status === 'done') {
                    if (!priv.isFileIndexed(that.getFileName())) {
                        priv.addFile({fileName:that.getFileName(),
                                      lastModified:0,
                                      creationDate:0});
                    }
                    priv.update();
                    that.done();
                } else {
                    that.fail(result.error);
                }
            };
            that.addJob ( newjob );
        }; // end saveDocument

        /**
         * Loads a document.
         * job.options.metadata_only {boolean}
         * job.options.content_only  {boolean}
         * @method loadDocument
         */
        that.loadDocument = function () {
            var filearray, i, l, newjob,
            loadcallback = function (result) {
                if (result.status === 'done') {
                    // if (filearray[i].lastModified !==
                    //     result.return_value.lastModified ||
                    //     filearray[i].creationDate !==
                    //     result.return_value.creationDate) {
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
                newjob = that.cloneJob();
                newjob.storage = that.getSecondStorage();
                newjob.callback = loadcallback;
                console.log (newjob);
                that.addJob ( newjob );
            },
            settings = that.cloneOptionObject();
            priv.update();
            if (settings.metadata_only) {
                setTimeout(function () {
                    if (priv.fileArrayExists()) {
                        filearray = priv.getFileArray();
                        for (i = 0, l = filearray.length; i < l; i+= 1) {
                            if (filearray[i].fileName === that.getFileName()) {
                                return that.done(filearray[i]);
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
            var newjob = that.cloneJob();
            newjob.storage = that.getSecondStorage();
            newjob.callback = function (result) {
                if (result.status === 'done') {
                    priv.removeFile(that.getFileName());
                    priv.update();
                    that.done();
                } else {
                    that.fail(result.error);
                }
            };
            that.addJob(newjob);
        };
        return that;
    };
    // end Indexed Storage
    ////////////////////////////////////////////////////////////////////////////

    // add key to storageObjectType of global jio
    Jio.addStorageType('local', newLocalStorage);
    Jio.addStorageType('dav', newDAVStorage);
    Jio.addStorageType('replicate', newReplicateStorage);
    Jio.addStorageType('indexed', newIndexedStorage);
};

if (window.requirejs) {
    define ('JIOStorages',
            ['LocalOrCookieStorage','Base64','JIO','jQuery'],
            jio_storage_loader);
} else {
    jio_storage_loader ( LocalOrCookieStorage, Base64, JIO, jQuery );
}

}());
