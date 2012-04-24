
;(function ( $ ) {
    
    // TODO do we realy need to check dependencies ?
    // test dependencies
    try {
        if ($.jio && Base64) {}
        else {return false;}
    } catch (e) {
        $.error('jio.js and base64.js '+
                ' are required by jio.storage.js');
        return false;
    };

    ////////////////////////////////////////////////////////////////////////////
    // private vars
    var jioAttributeObject = $.jio('getJioAttributes');
    // end private vars
    ////////////////////////////////////////////////////////////////////////////
    
    ////////////////////////////////////////////////////////////////////////////
    // Tools

    // end Tools
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Local Storage
    var LocalStorage = function ( options ) {
        // LocalStorage constructor
        // initializes the local storage for jio and create user if necessary.

        this.userName = options.storage.userName;
    };
    LocalStorage.prototype = {
        checkNameAvailability: function ( job ) {
            // checks the availability of the [job.userName].
            // if the name already exists, it is not available.
            // job: the job object
            // job.userName: the name we want to check.

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                var available = true;
                var localStor = jioAttributeObject.localStorage.getAll();
                for (var k in localStor) {
                    var splitk = k.split('/');
                    if (splitk[0] === 'jio' && splitk[1] === job.userName) {
                        available = false;
                        break;
                    }
                }
                if (!available) {
                    job.status = 'done';
                    job.message = ''+ job.userName + ' is not available.';
                    job.isAvailable = false;
                    $.jio('publish',{'event': 'job_done',
                                     'job': job});
                } else {
                    job.status = 'done';
                    job.message = ''+ job.userName + ' is available.';
                    job.isAvailable = true;
                    $.jio('publish',{'event': 'job_done',
                                     'job': job});
                }
            }, 100);
        }, // end userNameAvailable

        saveDocument: function ( job ) {
            // Save a document in the local storage
            // job : the job object
            // job.options : the save options object
            // job.options.overwrite : true -> overwrite
            // job.options.force : true -> save even if jobdate < existingdate
            //                             or overwrite: false

            var settings = $.extend({'overwrite':true,
                                     'force':false},job.options);
            var t = this;
            // wait a little in order to simulate asynchronous saving
            setTimeout (function () {
                // reading
                var doc = jioAttributeObject.localStorage.getItem(
                    'jio/local/'+job.storage.userName+'/'+job.applicant.ID+'/'+
                        job.fileName);
                if (!doc) { // create document
                    doc = {
                        'fileName': job.fileName,
                        'fileContent': job.fileContent,
                        'creationDate': Date.now (),
                        'lastModified': Date.now ()
                    }
                    // writing
                    jioAttributeObject.localStorage.setItem(
                        'jio/local/'+job.storage.userName+'/'+job.applicant.ID+'/'+
                            job.fileName, doc);
                    job.status = 'done';
                    job.message = 'Document saved.';
                    job.isSaved = true;
                    $.jio('publish',{'event':'job_done',
                                     'job':job});
                    return true;
                }
                if ( settings.overwrite || settings.force ) { // overwrite
                    if ( ! settings.force ) { // force write
                        // checking modification date
                        if ( doc.lastModified >= job.lastModified ) {
                            // date problem!
                            job.status = 'fail';
                            job.message = 'Modification date is earlier than ' +
                                'existing modification date.';
                            job.isSaved = false;
                            $.jio('publish',{'event':'job_fail',
                                             'job':job});
                            return false;
                        }
                    }
                    doc.lastModified = Date.now();
                    doc.fileContent = job.fileContent;
                    // writing
                    jioAttributeObject.localStorage.setItem(
                        'jio/local/'+job.storage.userName+'/'+job.applicant.ID+'/'+
                            job.fileName, doc);
                    job.status = 'done';
                    job.message = 'Document saved';
                    job.isSaved = true;
                    $.jio('publish',{'event':'job_done',
                                     'job':job});
                    return true;
                }
                // already exists
                job.status = 'fail';
                job.message = 'Document already exists.';
                job.errno = 403;
                job.isSaved = false;
                $.jio('publish',{'event':'job_fail',
                                 'job': job});
                return false;
            }, 100);
        }, // end saveDocument

        loadDocument: function ( job ) {
            // load a document in the storage, copy the content into the job
            // job : the job
            
            var t = this;
            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                var doc = jioAttributeObject.localStorage.getItem(
                    'jio/local/'+job.storage.userName+'/'+job.applicant.ID+'/'+
                        job.fileName);
                if (!doc) {
                    job.status = 'fail';
                    job.errno = 404;
                    job.message = 'Document not found.';
                    $.jio('publish',{'event':'job_fail',
                                     'job':job});
                } else {
                    job.status = 'done';
                    job.message = 'Document loaded.';
                    job.fileContent = doc.fileContent;
                    $.jio('publish',{'event':'job_done',
                                     'job':job});
                }
            }, 100);
        }, // end loadDocument

        getDocumentList: function (job) {
            var t = this;
            setTimeout(function () {
                var localStor = jioAttributeObject.localStorage.getAll();
                job.list = [];
                for (var k in localStor) {
                    var splitk = k.split('/');
                    if (splitk[0] === 'jio' &&
                        splitk[1] === 'local' &&
                        splitk[2] === job.storage.userName &&
                        splitk[3] === job.applicant.ID) {
                        // TODO error here
                        console.log (JSON.stringify (localStor[k]));
                        job.list.push ({
                            'fileName':localStor[k].fileName,
                            'creationDate':localStor[k].creationDate,
                            'lastModified':localStor[k].lastModified});
                    }
                }
                console.log (JSON.stringify (job.list));
                job.status = 'done';
                job.message = 'List received.';
                $.jio('publish',{'event':'job_done',
                                 'job':job});
            }, 100);
        }, // end getDocumentList

        removeDocument: function ( job ) {
            var t = this;
            setTimeout (function () {
                var doc = jioAttributeObject.localStorage.getItem(
                    'jio/local/'+job.storage.userName+'/'+job.applicant.ID+'/'+
                        job.fileName);
                if (!doc) {
                    // job.status = 'fail';
                    // job.errno = 404;
                    // job.message = 'Document not found.';
                    // job.isRemoved = false;
                    // $.jio('publish',{'event':'job_fail',
                    //                  'job':job});
                    job.status = 'done';
                    job.message = 'Document already removed.';
                    job.isRemoved = true;
                    $.jio('publish',{'event':'job_done',
                                     'job':job});
                } else {
                    jioAttributeObject.localStorage.deleteItem(
                        'jio/local/'+
                            job.storage.userName+'/'+job.applicant.ID+'/'+
                            job.fileName);
                    job.status = 'done';
                    job.message = 'Document removed.';
                    job.isRemoved = true;
                    $.jio('publish',{'event':'job_done',
                                     'job':job});
                }
            }, 100);
        }
    };

    // add key to storageObject
    $.jio('addStorageType',{'type':'local','creator':function (options) {
        return new LocalStorage(options);
    }});

    // end Local Storage
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // DAVStorage
    var DAVStorage = function ( options ) {

    };
    DAVStorage.prototype = {
        mkcol: function ( options ) {
            // create folders in dav storage, synchronously
            // options : contains mkcol list
            // options.location : the davstorage locations
            // options.path : if path=/foo/bar then creates location/dav/foo/bar
            
            var settings = $.extend ({},options);
            if (options.location && options.path) {
                var ok = false;
                $.ajax ( {
                    url: options.location + '/dav/' + options.path,
                    type: 'MKCOL',
                    async: false,
                    // xhrFields: {withCredentials: 'true'}, // cross domain
                    success: function () {
                        // done
                        console.log ('ok');
                        ok = true;
                    },
                    error: function (type) {
                        switch (type.status) {
                        case 405: // Method Not Allowed
                            ok = true; // already done
                            break;
                        }
                        console.log ('error?');
                    }
                } );
                return ok;
            } else {
                return false;
            }
        },
        checkNameAvailability: function ( job ) {
            $.ajax ( {
                url: job.storage.location + '/dav/' + job.userName,
                type: "HEAD",
                async: true,
                // xhrFields: {withCredentials: 'true'}, // cross domain
                success: function () {
                    job.status = 'done';
                    job.message = job.userName + ' is not available.';
                    job.isAvailable = false;
                    $.jio('publish',{'event':'job_done',
                                     'job':job});
                },
                error: function (type) {
                    switch (type.status) {
                    case 301:   // Moved Permanantly
                        job.status = 'done';
                        job.message = job.userName + ' is not available.';
                        job.isAvailable = false;
                        $.jio('publish',{'event':'job_done',
                                         'job':job});
                        break;
                    case 404:   // Not Found
                        // TODO always returning 404 !! Why ??
                        console.warn ('always returning 404 ?');
                        job.status = 'done';
                        job.message = job.userName + ' is available.';
                        job.isAvailable = true;
                        $.jio('publish',{'event':'job_done',
                                         'job':job});
                        break;
                    default:
                        job.status = 'fail';
                        job.message = 'Cannot check if ' + job.userName +
                            ' is available.';
                        job.isAvailable = false;
                        job.errno = type.status;
                        // $.error ( type.status ': Fail while trying to check ' +
                        //           job.userName );
                        $.jio('publish',{'event':'job_fail',
                                         'job':job});
                        break;
                    }
                }
            });
        },
        saveDocument: function ( job ) {
            var settings = $.extend ({'overwrite':true,
                                      'force':false},job.options);
            // TODO if path of ../dav/user/applic does not exists, it won't work !!
            var saveOnDav = function () {
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
                        job.status = 'done';
                        job.message = 'Document saved.';
                        job.isSaved = true;
                        $.jio('publish',{'event':'job_done',
                                         'job':job});
                    },
                    error: function (type) {
                        job.status = 'fail';
                        job.message = 'Cannot save document.';
                        job.errno = type.status;
                        job.isSaved = false;
                        $.jio('publish',{'event':'job_fail',
                                         'job':job});
                    }
                } );
                //// end saving on dav
            };
            // if force, do not check anything, just save
            if (settings.force) {
                return saveOnDav();
            }
            //// start loading document 
            $.ajax ( {
                url: job.storage.location + '/dav/' +
                    job.storage.userName + '/' +
                    job.applicant.ID + '/' +
                    job.fileName,
                type: 'GET',
                async: true,
                headers: {'Authorization':'Basic '+Base64.encode(
                    job.storage.userName + ':' + job.storage.password )},
                // xhrFields: {withCredentials: 'true'}, // cross domain
                success: function (content) {      // TODO content ?
                    // TODO merge files

                    // Document already exists
                    if (settings.overwrite) { // overwrite
                        // TODO check date !!!
                        return saveOnDav();
                    }
                    // do not overwrite
                    job.status = 'fail';
                    job.message = 'Document already exists.';
                    job.errno = 302;
                    job.isSaved = false;
                    $.jio('publish',{'event':'job_fail',
                                     'job':job});
                    return false;
                },
                error: function (type) {
                    switch (type.status) {
                    case 404:   // Document not found
                        // we can save on it
                        return saveOnDav();
                    default:    // Unknown error
                        job.status = 'fail';
                        job.message = 'Unknown error.';
                        job.errno = type.status;
                        job.isSaved = false;
                        $.jio('publish',{'event':'job_fail',
                                         'job':job});
                        return false;
                    }
                }
            } );
            //// end loading document
        },
        loadDocument: function ( job ) {
            // load the document into davstorage

            // TODO check if job's features are good
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
                    job.status = 'done';
                    job.message = 'Document loaded.';
                    job.fileContent = content;
                    $.jio('publish',{'event':'job_done',
                                     'job':job});
                },
                error: function (type) {
                    switch (type.status) {
                    case 404:
                        job.message = 'Document not found.'; break;
                    default:
                        job.message = 'Cannot load "' + job.fileName + '".'; break;
                    }
                    job.status = 'fail';
                    job.errno = type.status;
                    $.jio('publish',{'event':'job_fail',
                                     'job':job});
                }
            } );
        },
        getDocumentList: function ( job ) {
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
                    var documentArrayList = [];
                    $("D\\:response",xmlData).each(function(i,data) {
                        if(i>0) { // exclude parent folder
                            var file = {};
                            var pathArray = ($($("D\\:href",
                                          xmlData).get(i)).text()).split('/');
                            file.fileName = (pathArray[pathArray.length-1] ?
                                             pathArray[pathArray.length-1] :
                                             pathArray[pathArray.length-2]+'/');
                            if (file.fileName === '.htaccess' ||
                                file.fileName === '.htpasswd')
                                return;
                            file.lastModified = $($("lp1\\:getlastmodified",
                                                    xmlData).get(i)).text();
                            file.creationDate = $($("lp1\\:creationdate",
                                                    xmlData).get(i)).text();
                            documentArrayList.push (file);
                        }
                    });
                    job.status = 'done';
                    job.message = 'List received.';
                    job.list = documentArrayList;
                    $.jio('publish',{'event':'job_done',
                                     'job':job});
                },
                error: function (type) {
                    job.status = 'fail';
                    job.message = 'Cannot get list.';
                    job.errno = type.status;
                    $.jio('publish',{'event':'job_fail',
                                     'job':job});
                }
            } );
        },
        removeDocument: function ( job ) {
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
                    job.status = 'done';
                    job.message = 'Document removed.';
                    job.isRemoved = true;
                    $.jio('publish',{'event':'job_done',
                                     'job':job});
                },
                error: function (type) {
                    switch (type.status) {
                    case 404:
                        job.status = 'done';
                        job.message = 'Document already removed.';
                        job.errno = type.status;
                        $.jio('publish',{'event':'job_done',
                                         'job':job});
                        break;
                    default:
                        job.status = 'fail';
                        job.message = 'Cannot remove "' + job.fileName + '".';
                        job.errno = type.status;
                        $.jio('publish',{'event':'job_fail',
                                         'job':job});
                        break;
                    }
                }
            } );
        }
    };

    // add key to storageObject
    $.jio('addStorageType',{'type':'dav','creator':function (options) {
        return new DAVStorage(options);
    }});

    // end DAVStorage
    ////////////////////////////////////////////////////////////////////////////

})( jQuery );
