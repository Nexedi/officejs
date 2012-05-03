
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
    LocalStorage = function ( options ) {
        // LocalStorage constructor
        // initializes the local storage for jio and create user if necessary.

        this.userName = options.storage.userName;
    };
    LocalStorage.prototype = {
        checkNameAvailability: function ( job , jobendcallback) {
            // checks the availability of the [job.userName].
            // if the name already exists, it is not available.
            // job: the job object
            // job.userName: the name we want to check.
            // jobendcallback : the function called at the end of the job.

            // returns {'status':string,'message':string,'isAvailable':boolean}
            // in the jobendcallback arguments.

            var available = true, localStor = null,
            k = 'key', splitk = ['splitedkey'];
            
            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                localStor = jioGlobalObj.localStorage.getAll();
                for (k in localStor) {
                    splitk = k.split('/');
                    if (splitk[0] === 'jio' &&
                        splitk[1] === 'local' &&
                        splitk[2] === job.userName) {
                        available = false;
                        break;
                    }
                }
                if (!available) {
                    job.status = 'done';
                    jobendcallback(job);
                    job.callback({'status':'done',
                                  'message':''+job.userName+
                                  ' is not available.',
                                  'isAvailable':false});
                } else {
                    job.status = 'done';
                    jobendcallback(job);
                    job.callback({'status':'done',
                                  'message':''+job.userName+
                                  ' is available.',
                                  'isAvailable':true});
                }
            }, 100);
        }, // end userNameAvailable

        saveDocument: function ( job, jobendcallback ) {
            // Save a document in the local storage
            // job : the job object
            // job.options : the save options object
            // job.options.overwrite : true -> overwrite
            // job.options.force : true -> save even if jobdate < existingdate
            //                             or overwrite: false
            // jobendcallback : the function called at the end of the job.

            // returns {'status':string,'message':string,'isSaved':boolean}
            // in the jobendcallback arguments.

            var settings = $.extend({
                'overwrite':true,'force':false},job.options),
            res = {}, doc = null;
            // wait a little in order to simulate asynchronous saving
            setTimeout (function () {
                // reading
                doc = jioGlobalObj.localStorage.getItem(
                    'jio/local/'+job.storage.userName+'/'+job.applicant.ID+'/'+
                        job.fileName);
                if (!doc) { // create document
                    doc = {
                        'fileName': job.fileName,
                        'fileContent': job.fileContent,
                        'creationDate': job.date,
                        'lastModified': job.date
                    }
                    // writing
                    jioGlobalObj.localStorage.setItem(
                        'jio/local/'+job.storage.userName+'/'+job.applicant.ID+'/'+
                            job.fileName, doc);
                    // return
                    res.status = job.status = 'done';
                    res.message = 'Document saved.';
                    res.isSaved = true;
                    jobendcallback(job);
                    job.callback(res);
                    return;
                }
                if ( settings.overwrite || settings.force ) {
                    // if it doesn't force writing
                    // checking modification date
                    if ( ! settings.force &&
                         doc.lastModified >= job.date ) {
                        // date problem!
                        // return
                        res.status = job.status = 'fail';
                        res.message = 'Document is older than the'+
                            ' existing one.';
                        res.isSaved = false;
                        jobendcallback(job);
                        job.callback(res);
                        return;
                    } 
                    // overwriting
                    doc.lastModified = job.date;
                    doc.fileContent = job.fileContent;
                    // writing
                    jioGlobalObj.localStorage.setItem(
                        'jio/local/'+job.storage.userName+'/'+job.applicant.ID+'/'+
                            job.fileName, doc);
                    // return
                    res.status = job.status = 'done';
                    res.message = 'Document saved';
                    res.isSaved = true;
                    jobendcallback(job);
                    job.callback(res);
                    return;
                }
                // already exists
                res.status = job.status = 'fail';
                res.message = 'Document already exists.';
                res.errno = 403;
                res.isSaved = false;
                jobendcallback(job);
                job.callback(res);
                return;
            }, 100);
        }, // end saveDocument

        loadDocument: function ( job, jobendcallback ) {
            // Load a document from the storage. It returns a document object
            // containing all information of the document and its content.
            // job : the job object
            // job.fileName : the document name we want to load.
            // jobendcallback : the function called at the end of the job.
            
            // returns {'status':string,'message':string,'document':object}
            // in the jobendcallback arguments.
            // document object is {'fileName':string,'fileContent':string,
            // 'creationDate':date,'lastModified':date}

            var t = this, res = {}, doc = null;
            
            // wait a little in order to simulate asynchronous operation 
            setTimeout(function () {
                doc = jioGlobalObj.localStorage.getItem(
                    'jio/local/'+job.storage.userName+'/'+job.applicant.ID+'/'+
                        job.fileName);
                if (!doc) {
                    res.status = job.status = 'fail';
                    res.errno = 404;
                    res.message = 'Document not found.';
                    jobendcallback(job);
                    job.callback(res);
                } else {
                    res.status = job.status = 'done';
                    res.message = 'Document loaded.';
                    res.document = {
                        'fileContent': doc.fileContent,
                        'fileName': doc.fileName,
                        'creationDate': doc.creationDate,
                        'lastModified': doc.lastModified};
                    jobendcallback(job);
                    job.callback(res);
                }
            }, 100);
        }, // end loadDocument

        getDocumentList: function ( job, jobendcallback) {
            // Get a document list from the storage. It returns a document
            // array containing all the user documents informations, but not
            // their content.
            // job : the job object
            // jobendcallback : the function called at the end of the job.

            // returns {'status':string,'message':string,'list':array}
            // in the jobendcallback arguments.
            // the list is [object,object] -> object = {'fileName':string,
            // 'lastModified':date,'creationDate':date}

            var t = this, res = {}, localStor = null, k = 'key',
            splitk = ['splitedkey'];
            
            setTimeout(function () {
                localStor = jioGlobalObj.localStorage.getAll();
                res.list = [];
                for (k in localStor) {
                    splitk = k.split('/');
                    if (splitk[0] === 'jio' &&
                        splitk[1] === 'local' &&
                        splitk[2] === job.storage.userName &&
                        splitk[3] === job.applicant.ID) {
                        fileObject = JSON.parse(localStor[k]);
                        res.list.push ({
                            'fileName':fileObject.fileName,
                            'creationDate':fileObject.creationDate,
                            'lastModified':fileObject.lastModified});
                    }
                }
                res.status = job.status = 'done';
                res.message = 'List received.';
                jobendcallback(job);
                job.callback(res);
            }, 100);
        }, // end getDocumentList

        removeDocument: function ( job, jobendcallback ) {
            // Remove a document from the storage.
            // job : the job object
            // jobendcallback : the function called at the end of the job.

            // returns {'status':string,'message':string,'isRemoved':boolean}
            // in the jobendcallback arguments.

            var t = this, res = {}, doc = null;
            
            setTimeout (function () {
                doc = jioGlobalObj.localStorage.getItem(
                    'jio/local/'+job.storage.userName+'/'+job.applicant.ID+'/'+
                        job.fileName);
                // already deleted
                if (!doc) {
                    res.status = job.status = 'done';
                    res.message = 'Document already removed.';
                    res.isRemoved = true;
                    jobendcallback(job);
                    job.callback(res);
                    return;
                }
                // deleting
                jioGlobalObj.localStorage.deleteItem(
                    'jio/local/'+
                        job.storage.userName+'/'+job.applicant.ID+'/'+
                        job.fileName);
                res.status = job.status = 'done';
                res.message = 'Document removed.';
                res.isRemoved = true;
                jobendcallback(job);
                job.callback(res);
                return;
            }, 100);
        }
    },

    // end Local Storage
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // DAVStorage
    DAVStorage = function ( options ) {

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
        checkNameAvailability: function ( job, jobendcallback ) {
            // checks the availability of the [job.userName].
            // if the name already exists, it is not available.
            // job: the job object.
            // job.userName: the name we want to check.
            // jobendcallback: the function called at the end of the job.

            // returns {'status':string,'message':string,'isAvailable':boolean}
            // in the jobendcallback arguments.
            
            var res = {};

            $.ajax ( {
                url: job.storage.location + '/dav/' + job.storage.userName + '/',
                async: true,
                type: 'PROPFIND',
                dataType: 'xml',
                headers: {'Authorization': 'Basic '+Base64.encode(
                    job.storage.userName + ':' +
                        job.storage.password ), Depth: '1'},
                success: function (xmlData) {
                    res.status = job.status = 'done';
                    res.message = job.userName + ' is not available.';
                    res.isAvailable = false;
                    jobendcallback(job);
                    job.callback(res);
                },
                error: function (type) {
                    switch(type.status){
                    case 404:
                        res.status = job.status = 'done';
                        res.message = job.userName + ' is available.';
                        res.isAvailable = true;
                        break;
                    default:
                        res.status = job.status = 'fail';
                        res.message = 'Cannot check if ' + job.userName +
                            ' is available.';
                        res.isAvailable = false;
                        break;
                    }
                    res.errno = type.status;
                    jobendcallback(job);
                    job.callback(res);
                }
            } );
        },
        saveDocument: function ( job, jobendcallback ) {
            // Save a document in a DAVStorage
            // job: the job object
            // job.options: the save options object
            // job.options.overwrite: true -> overwrite
            // job.options.force: true -> save even if jobdate < existingdate
            //                            or overwrite: false
            // jobendcallback: the function called at the end of the job.

            // returns {'status':string,'message':string,'isSaved':boolean}
            // in the jobendcallback arguments.

            var settings = $.extend ({
                'overwrite':true,'force':false},job.options), res = {},
            t = this, tmpjob = {},
            // TODO if path of /dav/user/applic does not exists, it won't work!
            saveOnDav = function () {
                //// save on dav
                $.ajax ( {
                    url: job.storage.location + '/dav/' +
                        job.storage.userName + '/' + 
                        job.applicant.ID + '/' +
                        job.fileName,
                    type: 'PUT',
                    data: job.fileContent,
                    async: true,
                    dataType: 'text', // TODO is it necessary ?
                    headers: {'Authorization':'Basic '+Base64.encode(
                        job.storage.userName + ':' + job.storage.password )},
                    // xhrFields: {withCredentials: 'true'}, // cross domain
                    success: function () {
                        res.status = job.status = 'done';
                        res.message = 'Document saved.';
                        res.isSaved = true;
                        jobendcallback(job);
                        job.callback(res);
                    },
                    error: function (type) {
                        res.status = job.status = 'fail';
                        res.message = 'Cannot save document.';
                        res.errno = type.status;
                        res.isSaved = false;
                        jobendcallback(job);
                        job.callback(res);
                    }
                } );
                //// end saving on dav
            };
            // if force, do not check anything, just save
            if (settings.force) {
                return saveOnDav();
            }

            //// start loading document
            tmpjob = $.extend({},job);
            tmpjob.callback = function(result) {
                if(result.status === 'fail') {
                    switch (result.errno) {
                    case 404:   // Document not found
                        // TODO MKCOL
                        // // we can save on it
                        // t.mkcol({ // create col if not exist
                        //     userName:job.storage.userName,
                        //     password:job.storage.password,
                        //     location:job.storage.location,
                        //     path:'/dav/'+job.storage.userName+'/'+
                        //         job.applicant.ID,
                        //     success:function(){
                        //         // and finaly save document
                        //         saveOnDav()
                        //     },
                        //     error:function(){
                        //         res.status = job.status = 'fail';
                        //         res.message = 'Cannot create document.';
                        //         res.errno = type.status;
                        //         res.isSaved = false;
                        //         jobendcallback(job);
                        //         job.callback(res);
                        //     }});
                        saveOnDav();
                        break;
                    default:
                        res.status = job.status = 'fail';
                        res.message = 'Unknown error.';
                        res.errno = type.status;
                        res.isSaved = false;
                        jobendcallback(job);
                        job.callback(res);
                        break;
                    }
                } else { // done
                    // TODO merge files
                    // Document already exists
                    if (settings.overwrite) { // overwrite
                        if (result.document.lastModified >= job.date) {
                            // date ploblem !
                            res.status = job.status = 'fail';
                            res.message = 'Document is older than the '+
                                'existing one.';
                            res.isSaved = false;
                            jobendcallback(job);
                            job.callback(res);
                            return;
                        }
                        return saveOnDav();
                    }
                    // do not overwrite
                    res.status = job.status = 'fail';
                    res.message = 'Document already exists.';
                    res.errno = 403;
                    res.isSaved = false;
                    jobendcallback(job);
                    job.callback(res);
                }
            };
            this.loadDocument(tmpjob,function(){});
            //// end loading document
        },
        loadDocument: function ( job, jobendcallback ) {
            // Load a document from a DAVStorage. It returns a document object
            // containing all information of the document and its content.
            // job: the job object
            // job.fileName: the document name we want to load.
            // jobendcallback: the function called at the end of the job.
            
            // returns {'status':string,'message':string,'document':object}
            // in the jobendcallback arguments.
            // document object is {'fileName':string,'fileContent':string,
            // 'creationDate':date,'lastModified':date}

            // TODO check if job's features are good
            var res = {'document':{}},
            getContent = function () {
                $.ajax ( {
                    url: job.storage.location + '/dav/' +
                        job.storage.userName + '/' +
                        job.applicant.ID + '/' +
                        job.fileName,
                    type: "GET",
                    async: true,
                    dataType: 'text', // TODO is it necessary ?
                    headers: {'Authorization':'Basic '+Base64.encode(
                        job.storage.userName + ':' +
                            job.storage.password )},
                    // xhrFields: {withCredentials: 'true'}, // cross domain
                    success: function (content) {
                        res.status = job.status = 'done';
                        res.message = 'Document loaded.';
                        res.document.fileContent = content;
                        jobendcallback(job);
                        job.callback(res);
                    },
                    error: function (type) {
                        switch (type.status) {
                        case 404:
                            res.message = 'Document not found.'; break;
                        default:
                            res.message = 'Cannot load "' + job.fileName + '".';
                            break;
                        }
                        res.status = job.status = 'fail';
                        res.errno = type.status;
                        jobendcallback(job);
                        job.callback(res);
                    }
                } );
            }
            // Get properties
            $.ajax ( {
                url: job.storage.location + '/dav/' +
                    job.storage.userName + '/' +
                    job.applicant.ID + '/' +
                    job.fileName,
                type: "PROPFIND",
                async: true,
                dataType: 'xml',
                headers: {'Authorization':'Basic '+Base64.encode(
                    job.storage.userName + ':' +
                        job.storage.password )},
                success: function (xmlData) {
                    res.document.lastModified = (
                        new Date($($("lp1\\:getlastmodified",
                                     xmlData).get(0)).text())).getTime();
                    res.document.creationDate = (
                        new Date($($("lp1\\:creationdate",
                                     xmlData).get(0)).text())).getTime();
                    res.document.fileName = job.fileName;
                    getContent();
                },
                error: function (type) {
                    res.status = job.status = 'fail';
                    res.message = 'Cannot get document informations.';
                    res.errno = type.status;
                    jobendcallback(job);
                    job.callback(res);
                }
            } );
        },
        getDocumentList: function ( job, jobendcallback ) {
            // Get a document list from a DAVStorage. It returns a document
            // array containing all the user documents informations, but their
            // content.
            // job: the job object
            // jobendcallback: the function called at the end of the job.

            // returns {'status':string,'message':string,'list':array}
            // in the jobendcallback arguments.
            // the list is [object,object] -> object = {'fileName':string,
            // 'lastModified':date,'creationDate':date}

            var res = {}, documentArrayList = [], file = {}, pathArray = [];

            $.ajax ( {
                url: job.storage.location + '/dav/' + 
                    job.storage.userName + '/' + job.applicant.ID + '/',
                async: true,
                type: 'PROPFIND',
                dataType: 'xml',
                headers: {'Authorization': 'Basic '+Base64.encode(
                    job.storage.userName + ':' +
                        job.storage.password ), Depth: '1'},
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
                    res.status = job.status = 'done';
                    res.message = 'List received.';
                    res.list = documentArrayList;
                    jobendcallback(job);
                    job.callback(res);
                },
                error: function (type) {
                    res.status = job.status = 'fail';
                    res.message = 'Cannot get list.';
                    res.errno = type.status;
                    jobendcallback(job);
                    job.callback(res);
                }
            } );
        },
        removeDocument: function ( job, jobendcallback ) {
            // Remove a document from a DAVStorage.
            // job: the job object
            // jobendcallback: the function called at the end of the job.

            // returns {'status':string,'message':string,'isRemoved':boolean}
            // in the jobendcallback arguments.
            
            var res = {};

            $.ajax ( {
                url: job.storage.location + '/dav/' +
                    job.storage.userName + '/' +
                    job.applicant.ID + '/' +
                    job.fileName,
                type: "DELETE",
                async: true,
                headers: {'Authorization':'Basic '+Base64.encode(
                    job.storage.userName + ':' +
                        job.storage.password )},
                // xhrFields: {withCredentials: 'true'}, // cross domain
                success: function () {
                    res.status = job.status = 'done';
                    res.message = 'Document removed.';
                    res.isRemoved = true;
                    jobendcallback(job);
                    job.callback(res);
                },
                error: function (type) {
                    switch (type.status) {
                    case 404:
                        res.stauts = job.status = 'done';
                        res.message = 'Document already removed.';
                        res.errno = type.status;
                        res.isRemoved = true;
                        break;
                    default:
                        res.status = job.status = 'fail';
                        res.message = 'Cannot remove "' + job.fileName + '".';
                        res.isRemoved = false;
                        res.errno = type.status;
                        break;
                    }
                    jobendcallback(job);
                    job.callback(res);
                }
            } );
        }
    },

    // end DAVStorage
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // ReplicateStorage
    ReplicateStorage = function ( options ) {
        this.queue = options.queue;
        this.id = null;
        this.length = options.storage.storageArray.length;
        this.returnsValuesArray = [];
    };
    ReplicateStorage.prototype = {
        checkNameAvailability: function ( job, jobendcallback ) {
            // Checks the availability of the [job.userName].
            // if the name already exists in a storage, it is not available.
            // job: the job object.
            // job.userName: the name we want to check.
            // job.storage.storageArray: An Array of storages.
            // jobendcallback: the function called at the end of the job.

            // returns {'status':string,'message':string,'isAvailable':boolean,
            // 'resultArray':Array} in the jobendcallback arguments.
            var t = this, newjob = {}, isavailable = true,
            res = {'status':'done'}, i = 'ind';
            
            for (i in job.storage.storageArray) {
                newjob = $.extend({},job);
                newjob.storage = job.storage.storageArray[i];
                newjob.callback = function (result){
                    t.returnsValuesArray.push(result);
                    if (result.status === 'fail') {
                        res.status = 'fail';
                    }
                    if (!result.isAvailable) { isavailable = false; }
                    if (t.returnsValuesArray.length === t.length) {
                        // if this is the last callback
                        job.status = res.status;
                        res.resultArray = t.returnsValuesArray;
                        res.isAvailable = isavailable;
                        jobendcallback(job);
                        job.callback(res);
                    }
                };
                this.queue.createJob ( newjob );
            }
        },
        saveDocument: function ( job, jobendcallback ) {
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
        loadDocument: function ( job, jobendcallback ) {
            // TODO
        },
        getDocumentList: function ( job, jobendcallback ) {
            // TODO
        },
        removeDocument: function ( job, jobendcallback ) {
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
