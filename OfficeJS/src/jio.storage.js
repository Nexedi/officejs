/**
 * Adds 3 storages to JIO.
 * - LocalStorage ('local')
 * - DAVStorage ('dav')
 * - ReplicateStorage ('replicate')
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
                var i, l, array = priv.getUserArray();
                for (i = 0, l = array.length; i < l; i+= 1) {
                    if (array[i] === that.getUserName()) {
                        that.done(false);
                        return;
                    }
                }
                that.done(true);
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
         * - getContent {boolean} default true, retrieve the file content or not
         * @method loadDocument
         */
        that.loadDocument = function () {
            // document object is {'fileName':string,'fileContent':string,
            // 'creationDate':date,'lastModified':date}

            setTimeout(function () {
                var doc = null, settings = $.extend(
                    {'getContent':true},that.cloneOptionObject());

                doc = LocalOrCookieStorage.getItem(
                    'jio/local/'+that.getStorageUserName()+'/'+
                        that.getApplicantID()+'/'+that.getFileName());
                if (!doc) {
                    that.fail({status:404,statusText:'Not Found.',
                               message:'Document "'+ that.getFileName() +
                               '" not found in localStorage.'});
                } else {
                    if (!settings.getContent) {
                        delete doc.fileContent;
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
                    that.getFileName()
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
            settings = $.extend({'getContent':true},that.cloneOptionObject()),

            // TODO check if job's features are good
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
                    doc.fileName = that.getFileName();
                    if (settings.getContent) {
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

            var newjob = {}, i = 'id', done = false, errorArray = [],
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

            var newjob = {}, res = {'status':'done'}, i = 'id',
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

            var newjob = {}, aredifferent = false, doc = {}, i = 'id',
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

            var newjob = {}, res = {'status':'done'}, i = 'id',
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

            var newjob = {}, res = {'status':'done'}, i = 'key',
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

    // add key to storageObjectType of global jio
    Jio.addStorageType('local', function (options) {
        return newLocalStorage(options);
    });
    Jio.addStorageType('dav', function (options) {
        return newDAVStorage(options);
    });
    Jio.addStorageType('replicate', function (options) {
        return newReplicateStorage(options);
    });

};

if (window.requirejs) {
    define ('JIOStorages',
            ['LocalOrCookieStorage','Base64','JIO','jQuery'],
            jio_storage_loader);
} else {
    jio_storage_loader ( LocalOrCookieStorage, Base64, JIO, jQuery );
}

}());
