
;(function ( $ ) {
    
    // test dependencies
    try {
        if (Base64) {}
        else {return false;}
    } catch (e) {
        $.error('Base64 is required by jio.storage.js');
        return false;
    };

    ////////////////////////////////////////////////////////////////////////////
    // private vars
    var attr = {
        'jobMethodObject': {
            'available': {
                'start_event':'start_testingNameAvailability',
                'stop_event':'stop_testingNameAvailability',
                'func':'checkNameAvailability',
                'retvalue':'isAvailable' }, // returns 'boolean'
            'save': {
                'start_event':'start_saving',
                'stop_event':'stop_saving',
                'func':'saveDocument',
                'retvalue':'isSaved' }, // returns 'boolean'
            'load': {
                'start_event':'start_loading',
                'stop_event':'stop_loading',
                'func':'loadDocument',
                'retvalue':'fileContent' }, // returns the file content 'string'
            'getList': {
                'start_event':'start_gettingList',
                'stop_event':'stop_gettingList',
                'func':'getDocumentList',
                'retvalue':'list' }, // returns the document list 'array'
            'remove': {
                'start_event':'start_removing',
                'stop_event':'stop_removing',
                'func':'removeDocument',
                'retvalue':'isRemoved' } // returns 'boolean'
        }
    };
    // end private vars
    ////////////////////////////////////////////////////////////////////////////
    
    ////////////////////////////////////////////////////////////////////////////
    // Tools
    var objectDump = function (o) {
        // TODO DEBUG we can remove this function
        console.log (JSON.stringify(o));
    };
    var toString = function (o) {
        // TODO DEBUG we can remove this function
        return (JSON.stringify(o));
    };
    // end Tools
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
                            var nt = ($($("D\\:href",
                                          xmlData).get(i)).text()).split('/');
                            file.fileName = (nt[nt.length-1] ?
                                             nt[nt.length-1] :
                                             nt[nt.length-2]+'/');
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
    $.jio('addStorageType',{'type':'dav','creator':function (o) {
        return new DAVStorage(o);
    }});

    // end DAVStorage
    ////////////////////////////////////////////////////////////////////////////

})( jQuery );
