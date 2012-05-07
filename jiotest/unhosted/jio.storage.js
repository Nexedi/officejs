
// Adds 3 storages for Jio
// type:
//     - local
//     - dav
//     - replicate
;(function ( Jio ) {
    
    ////////////////////////////////////////////////////////////////////////////
    // globals
    var jioGlobalObj = Jio.getGlobalObject(),
    // end globals
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Tools
    checkJioDependencies = function() {
        var retval = true,
        err = function (name) {
            console.error ('Fail to load ' + name);
            retval = false;
        };
        try { if (!Base64) { err('Base64'); } }
        catch (e) { err('Base64'); }
        return retval;
    },
    // end Tools
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Classes
    LocalStorage,DAVStorage,ReplicateStorage;
    // end Classes
    ////////////////////////////////////////////////////////////////////////////
    
    // check dependencies
    if (!checkJioDependencies()) { return; }

    ////////////////////////////////////////////////////////////////////////////
    // Local Storage
    LocalStorage = function ( args ) {
        // LocalStorage constructor
        
        this.job = args.job;
    };
    LocalStorage.prototype = {
        checkNameAvailability: function () {
            // checks the availability of the [job.userName].
            // if the name already exists, it is not available.
            // this.job.userName: the name we want to check.

            var t = this, localStor = null,
            k = 'key', splitk = ['splitedkey'];

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                localStor = jioGlobalObj.localStorage.getAll();
                for (k in localStor) {
                    splitk = k.split('/');
                    if (splitk[0] === 'jio' &&
                        splitk[1] === 'local' &&
                        splitk[2] === t.job.userName) {
                        return t.done(false);
                    }
                }
                return t.done(true);
            }, 100);
        }, // end userNameAvailable

        saveDocument: function () {
            // Save a document in the local storage
            // this.job.fileName: the document name.
            // this.job.fileContent: the document content.
            // this.job.storage: the storage information.
            // this.job.storage.userName: the user name
            // this.job.applicant.ID: the applicant id.

            var t = this, doc = null;
            // wait a little in order to simulate asynchronous saving
            setTimeout (function () {
                // reading
                doc = jioGlobalObj.localStorage.getItem(
                    'jio/local/'+t.job.storage.userName+'/'+
                        t.job.applicant.ID+'/'+
                        t.job.fileName);
                if (!doc) {
                    // create document
                    doc = {
                        'fileName': t.job.fileName,
                        'fileContent': t.job.fileContent,
                        'creationDate': Date.now(),
                        'lastModified': Date.now()
                    }
                } else {
                    // overwriting
                    doc.lastModified = Date.now();
                    doc.fileContent = t.job.fileContent;
                }
                jioGlobalObj.localStorage.setItem(
                    'jio/local/'+t.job.storage.userName+'/'+
                        t.job.applicant.ID+'/'+
                        t.job.fileName, doc);
                return t.done();
            }, 100);
        }, // end saveDocument

        loadDocument: function () {
            // Load a document from the storage. It returns a document object
            // containing all information of the document and its content.
            // this.job.fileName : the document name we want to load.
            // this.job.options.getContent: if true, also get the file content.
            
            // document object is {'fileName':string,'fileContent':string,
            // 'creationDate':date,'lastModified':date}

            var t = this, doc = null, settings = $.extend(
                {'getContent':true},this.job.options);
            
            // wait a little in order to simulate asynchronous operation 
            setTimeout(function () {
                doc = jioGlobalObj.localStorage.getItem(
                    'jio/local/'+t.job.storage.userName+'/'+
                        t.job.applicant.ID+'/'+t.job.fileName);
                if (!doc) {
                    t.fail('Document not found.',404);
                } else {
                    if (!settings.getContent) {
                        delete doc.fileContent;
                    }
                    t.done(doc);
                }
            }, 100);
        }, // end loadDocument

        getDocumentList: function () {
            // Get a document list from the storage. It returns a document
            // array containing all the user documents informations, but not
            // their content.
            // this.job.storage: the storage informations.
            // this.job.storage.userName: the userName.
            // this.job.storage.applicant.ID: the applicant ID.

            // the list is [object,object] -> object = {'fileName':string,
            // 'lastModified':date,'creationDate':date}

            var t = this, list = [], localStor = null, k = 'key',
            splitk = ['splitedkey'];
            
            setTimeout(function () {
                localStor = jioGlobalObj.localStorage.getAll();
                for (k in localStor) {
                    splitk = k.split('/');
                    if (splitk[0] === 'jio' &&
                        splitk[1] === 'local' &&
                        splitk[2] === t.job.storage.userName &&
                        splitk[3] === t.job.applicant.ID) {
                        fileObject = JSON.parse(localStor[k]);
                        list.push ({
                            'fileName':fileObject.fileName,
                            'creationDate':fileObject.creationDate,
                            'lastModified':fileObject.lastModified});
                    }
                }
                t.done(list);
            }, 100);
        }, // end getDocumentList

        removeDocument: function () {
            // Remove a document from the storage.
            // this.job.storage.userName: the userName.
            // this.job.applicant.ID: the applicant ID.
            // this.job.fileName: the document name.

            var t = this;
            
            setTimeout (function () {
                // deleting
                jioGlobalObj.localStorage.deleteItem(
                    'jio/local/'+
                        t.job.storage.userName+'/'+t.job.applicant.ID+
                        '/'+t.job.fileName);
                return t.done();
            }, 100);
        }
    },

    // end Local Storage
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // DAVStorage
    DAVStorage = function ( args ) {
        this.job = args.job;
    };
    DAVStorage.prototype = {
        mkcol: function ( options ) {
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
            splitpath = ['splitedpath'], tmppath = 'temp/path', t = this;

            // if pathstep is not defined, then split the settings.path
            // and do mkcol recursively
            if (!settings.pathsteps) {
                settings.pathsteps = 1;
                this.mkcol(settings);
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
                alert(settings.location + tmppath);
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
                        t.mkcol(settings);
                    },
                    error: function (type) {
                        alert(JSON.stringify(type));
                        switch (type.status) {
                        // case 405: // Method Not Allowed
                        //     // already exists
                        //     t.mkcol(settings);
                        //     break;
                        default:
                            settings.error();
                            break;
                        }
                    }
                } );
            }
        },
        checkNameAvailability: function () {
            // checks the availability of the [job.userName].
            // if the name already exists, it is not available.
            // this.job.storage: the storage informations.
            // this.job.storage.location: the dav storage location.
            // this.job.userName: the name we want to check.
            // this.job.storage.userName: the user name.
            // this.job.storage.password: the user password.

            var t = this;

            $.ajax ( {
                url: t.job.storage.location + '/dav/' + t.job.userName + '/',
                async: true,
                type: 'PROPFIND',
                dataType: 'xml',
                headers: {'Authorization': 'Basic '+Base64.encode(
                    t.job.storage.userName + ':' +
                        t.job.storage.password ), Depth: '1'},
                success: function (xmlData) {
                    t.done(false);
                },
                error: function (type) {
                    switch(type.status){
                    case 404:
                        t.done(true);
                        break;
                    default:
                        t.fail('Cannot check if ' + t.job.userName +
                               ' is available.',type.status);
                        break;
                    }
                }
            } );
        },
        saveDocument: function () {
            // Save a document in a DAVStorage
            // this.job.storage: the storage informations.
            // this.job.storage.userName: the user name.
            // this.job.storage.password: the user password.
            // this.job.applicant.ID: the applicant ID.
            // this.job.fileName: the document name.
            // this.job.fileContent: the document content.
            
            var t = this;
            
            // TODO if path of /dav/user/applic does not exists, it won't work!
            //// save on dav
            $.ajax ( {
                url: t.job.storage.location + '/dav/' +
                    t.job.storage.userName + '/' + 
                    t.job.applicant.ID + '/' +
                    t.job.fileName,
                type: 'PUT',
                data: t.job.fileContent,
                async: true,
                dataType: 'text', // TODO is it necessary ?
                headers: {'Authorization':'Basic '+Base64.encode(
                    t.job.storage.userName + ':' + t.job.storage.password )},
                // xhrFields: {withCredentials: 'true'}, // cross domain
                success: function () {
                    t.done();
                },
                error: function (type) {
                    t.fail('Cannot save document.',type.status);
                }
            } );
            //// end saving on dav
        },
        loadDocument: function () {
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

            var t = this, doc = {},
            settings = $.extend({'getContent':true},this.job.options),

            // TODO check if job's features are good
            getContent = function () {
                $.ajax ( {
                    url: t.job.storage.location + '/dav/' +
                        t.job.storage.userName + '/' +
                        t.job.applicant.ID + '/' +
                        t.job.fileName,
                    type: "GET",
                    async: true,
                    dataType: 'text', // TODO is it necessary ?
                    headers: {'Authorization':'Basic '+Base64.encode(
                        t.job.storage.userName + ':' +
                            t.job.storage.password )},
                    // xhrFields: {withCredentials: 'true'}, // cross domain
                    success: function (content) {
                        doc.fileContent = content;
                        t.done(doc);
                    },
                    error: function (type) {
                        var message;
                        switch (type.status) {
                        case 404:
                            message = 'Document not found.'; break;
                        default:
                            message = 'Cannot load "' + job.fileName + '".';
                            break;
                        }
                        t.fail(message,type.status);
                    }
                } );
            }
            // Get properties
            $.ajax ( {
                url: t.job.storage.location + '/dav/' +
                    t.job.storage.userName + '/' +
                    t.job.applicant.ID + '/' +
                    t.job.fileName,
                type: "PROPFIND",
                async: true,
                dataType: 'xml',
                headers: {'Authorization':'Basic '+Base64.encode(
                    t.job.storage.userName + ':' +
                        t.job.storage.password )},
                success: function (xmlData) {
                    doc.lastModified = (
                        new Date($($("lp1\\:getlastmodified",
                                     xmlData).get(0)).text())).getTime();
                    doc.creationDate = (
                        new Date($($("lp1\\:creationdate",
                                     xmlData).get(0)).text())).getTime();
                    doc.fileName = t.job.fileName;
                    if (settings.getContent) {
                        getContent();
                    } else {
                        t.done(doc);
                    }
                },
                error: function (type) {
                    t.fail('Cannot get document informations.',type.status);
                }
            } );
        },
        getDocumentList: function () {
            // Get a document list from a DAVStorage. It returns a document
            // array containing all the user documents informations, but their
            // content.
            // this.job.storage: the storage informations.
            // this.job.storage.location: the dav storage location.
            // this.job.storage.userName: the user name.
            // this.job.storage.password: the user password.
            // this.job.applicant.ID: the applicant id.
            
            // the list is [object,object] -> object = {'fileName':string,
            // 'lastModified':date,'creationDate':date}

            var t = this, documentArrayList = [], file = {}, pathArray = [];

            $.ajax ( {
                url: t.job.storage.location + '/dav/' + 
                    t.job.storage.userName + '/' + t.job.applicant.ID + '/',
                async: true,
                type: 'PROPFIND',
                dataType: 'xml',
                headers: {'Authorization': 'Basic '+Base64.encode(
                    t.job.storage.userName + ':' +
                        t.job.storage.password ), Depth: '1'},
                success: function (xmlData) {
                    $("D\\:response",xmlData).each(function(i,data) {
                        if(i>0) { // exclude parent folder
                            file = {};
                            pathArray = ($($("D\\:href",
                                             xmlData).get(i)).text()).split('/');
                            file.fileName = (pathArray[pathArray.length-1] ?
                                             pathArray[pathArray.length-1] :
                                             pathArray[pathArray.length-2]+'/');
                            if (file.fileName === '.htaccess' ||
                                file.fileName === '.htpasswd') { return; }
                            file.lastModified = (
                                new Date($($("lp1\\:getlastmodified",
                                             xmlData).get(i)).text())).getTime();
                            file.creationDate = (
                                new Date($($("lp1\\:creationdate",
                                             xmlData).get(i)).text())).getTime();
                            documentArrayList.push (file);
                        }
                    });
                    t.done(documentArrayList);
                },
                error: function (type) {
                    t.fail('Cannot get list.',type.status);
                }
            } );
        },
        removeDocument: function ( job, jobendcallback ) {
            // Remove a document from a DAVStorage.
            // this.job.fileName: the document name we want to remove.
            // this.job.storage: the storage informations.
            // this.job.storage.location: the dav storage location.
            // this.job.storage.userName: the user name.
            // this.job.storage.password: the user password.
            // this.job.applicant.ID: the applicant id.

            var t = this;

            $.ajax ( {
                url: t.job.storage.location + '/dav/' +
                    t.job.storage.userName + '/' +
                    t.job.applicant.ID + '/' +
                    t.job.fileName,
                type: "DELETE",
                async: true,
                headers: {'Authorization':'Basic '+Base64.encode(
                    t.job.storage.userName + ':' +
                        t.job.storage.password )},
                // xhrFields: {withCredentials: 'true'}, // cross domain
                success: function () {
                    t.done();
                },
                error: function (type) {
                    switch (type.status) {
                    case 404:
                        t.done();
                        break;
                    default:
                        t.fail('Cannot remove "' + t.job.fileName + '".',type.status);
                        break;
                    }
                }
            } );
        }
    },
    // end DAVStorage
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // ReplicateStorage
    ReplicateStorage = function ( args ) {
        // TODO Add a tests that check if there is no duplicate storages.
        this.queue = args.queue;
        this.job = args.job;
        this.id = null;
        this.length = args.job.storage.storageArray.length;
        this.returnsValuesArray = [];
    };
    ReplicateStorage.prototype = {
        checkNameAvailability: function () {
            // Checks the availability of the [job.userName].
            // if the name already exists in a storage, it is not available.
            // this.job.userName: the name we want to check.
            // this.job.storage.storageArray: An Array of storages.

            var t = this, newjob = {}, isavailable = true,
            res = {'status':'done'}, i = 'ind';
            
            for (i in t.job.storage.storageArray) {
                newjob = $.extend({},t.job);
                newjob.storage = t.job.storage.storageArray[i];
                newjob.callback = function (result) {
                    t.returnsValuesArray.push(result);
                    if (result.status === 'fail') {
                        res.status = 'fail';
                    }
                    if (!result.isAvailable) { isavailable = false; }
                    if (t.returnsValuesArray.length === t.length) {
                        // if this is the last callback
                        t.done(isavailable);
                    }
                };
                this.queue.createJob ( newjob ) ;
            }
        },
        saveDocument: function () {
            // Save a single document in several storages.
            // If a storage failed to save the document, it modify the job in
            // in order to invoke it sometime later.
            // job: the job object
            // job.options: the save options object
            // job.options.overwrite: true -> overwrite
            // job.options.force: true -> save even if jobdate < existingdate
            //                            or overwrite: false
            // jobendcallback: the function called at the end of the job.

            // returns {'status':string,'message':string,'isSaved':boolean,
            // 'resultArray':Array} in the jobendcallback arguments.

            // TODO
        },
        loadDocument: function () {
            // TODO
        },
        getDocumentList: function () {
            // TODO
        },
        removeDocument: function () {
            // TODO
        }
    };
    
    // end ReplicateStorage
    ////////////////////////////////////////////////////////////////////////////

    // add key to storageObjectType of global jio
    Jio.addStorageType('local', function (options) {
        return new LocalStorage(options);
    });
    // add key to storageObject
    Jio.addStorageType('dav', function (options) {
        return new DAVStorage(options);
    });
    // add key to storageObject
    Jio.addStorageType('replicate', function (options) {
        return new ReplicateStorage(options);
    });


    
})( JIO );
