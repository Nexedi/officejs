
// Adds 3 dummy storages for Jio
// type:
//     - dummyallok
//     - dummyallfail
//     - dummyallnotfound
;(function ( Jio ) {
    
    // check dependencies
    var errorDependencies=function(){$.error('Cannot find Jio');};
    try{if (!Jio){
        errorDependencies();return;
    }} catch (e){
        errorDependencies();return;}

    ////////////////////////////////////////////////////////////////////////////
    // globals
    var jioGlobalObj = Jio.getGlobalObject();
    // end globals
    ////////////////////////////////////////////////////////////////////////////
    
    ////////////////////////////////////////////////////////////////////////////
    // Dummy Storage 1 : all ok
    var DummyStorageAllOk = function ( options ) {
    };
    DummyStorageAllOk.prototype = {
        checkNameAvailability: function ( job , jobendcallback) {
            // The [job.userName] IS available.
            // job: the job object
            // job.userName: the name we want to check.
            // jobendcallback : the function called at the end of the job.

            // returns {'status':string,'message':string,'isAvailable':boolean}
            // in the jobendcallback arguments.

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                job.status = 'done';
                jobendcallback(job);
                job.callback({'status':'done',
                              'message':''+job.userName+' is available.',
                              'isAvailable':true});
            }, 100);
        }, // end userNameAvailable

        saveDocument: function ( job, jobendcallback ) {
            // Tells us that the document is saved.
            // job : the job object
            // job.options : the save options object
            // jobendcallback : the function called at the end of the job.

            // returns {'status':string,'message':string,'isSaved':boolean}
            // in the jobendcallback arguments.

            // wait a little in order to simulate asynchronous saving
            setTimeout (function () {
                var res = {};
                res.status = job.status = 'done';
                res.message = 'Document saved.';
                res.isSaved = true;
                jobendcallback(job);
                job.callback(res);
            }, 100);
        }, // end saveDocument

        loadDocument: function ( job, jobendcallback ) {
            // Returns a document object containing all information of the
            // document and its content.
            // job : the job object
            // job.fileName : the document name we want to load.
            // jobendcallback : the function called at the end of the job.
            
            // returns {'status':string,'message':string,'document':object}
            // in the jobendcallback arguments.
            // document object is {'fileName':string,'fileContent':string,
            // 'creationDate':date,'lastModified':date}

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                var res = {};
                res.status = job.status = 'done';
                res.message = 'Document loaded.';
                res.document = {
                    'fileContent': 'content',
                    'fileName': 'file',
                    'creationDate': 10000,
                    'lastModified': 15000};
                jobendcallback(job);
                job.callback(res);
            }, 100);
        }, // end loadDocument

        getDocumentList: function ( job, jobendcallback) {
            // It returns a document array containing all the user documents
            // informations, but not their content.
            // job : the job object
            // jobendcallback : the function called at the end of the job.

            // returns {'status':string,'message':string,'list':array}
            // in the jobendcallback arguments.
            // the list is [object,object] -> object = {'fileName':string,
            // 'lastModified':date,'creationDate':date}

            setTimeout(function () {
                var res = {};
                res.list = [
                    {'fileName':'file',
                     'creationDate':10000,
                     'lastModified':15000},
                    {'fileName':'memo',
                     'creationDate':20000,
                     'lastModified':25000
                    }];
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

            setTimeout (function () {
                var res = {};
                res.status = job.status = 'done';
                res.message = 'Document removed.';
                res.isRemoved = true;
                jobendcallback(job);
                job.callback(res);
            }, 100);
        }
    };

    // add key to storageObjectType of global jio
    Jio.addStorageType('dummyallok', function (options) {
        return new DummyStorageAllOk(options);
    });

    // end Dummy Storage All Ok
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Dummy Storage 2 : all fail
    var DummyStorageAllFail = function ( options ) {
    };
    DummyStorageAllFail.prototype = {
        checkNameAvailability: function ( job , jobendcallback) {
            // Fails to check [job.userName].
            // job: the job object
            // job.userName: the name we want to check.
            // jobendcallback : the function called at the end of the job.

            // returns {'status':string,'message':string,'isAvailable':boolean}
            // in the jobendcallback arguments.

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                job.status = 'fail';
                jobendcallback(job);
                job.callback({'status':'fail',
                              'message':'Cannot check name availability',
                              'isAvailable':false});
            }, 100);
        }, // end userNameAvailable

        saveDocument: function ( job, jobendcallback ) {
            // Tells us that the document is not saved.
            // job : the job object
            // job.options : the save options object
            // jobendcallback : the function called at the end of the job.

            // returns {'status':string,'message':string,'isSaved':boolean}
            // in the jobendcallback arguments.

            // wait a little in order to simulate asynchronous saving
            setTimeout (function () {
                var res = {};
                res.status = job.status = 'fail';
                res.message = 'Unable to save document.';
                res.errno = 0;
                res.isSaved = false;
                jobendcallback(job);
                job.callback(res);
            }, 100);
        }, // end saveDocument

        loadDocument: function ( job, jobendcallback ) {
            // Returns a document object containing nothing.
            // job : the job object
            // job.fileName : the document name we want to load.
            // jobendcallback : the function called at the end of the job.
            
            // returns {'status':string,'message':string,'document':object}
            // in the jobendcallback arguments.
            // document object is {'fileName':string,'fileContent':string,
            // 'creationDate':date,'lastModified':date}

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                var res = {};
                res.status = job.status = 'fail';
                res.message = 'Unable to load document.';
                res.errno = 0;
                res.document = {};
                jobendcallback(job);
                job.callback(res);
            }, 100);
        }, // end loadDocument

        getDocumentList: function ( job, jobendcallback) {
            // It returns nothing.
            // job : the job object
            // jobendcallback : the function called at the end of the job.

            // returns {'status':string,'message':string,'list':array}
            // in the jobendcallback arguments.
            // the list is [object,object] -> object = {'fileName':string,
            // 'lastModified':date,'creationDate':date}

            setTimeout(function () {
                var res = {};
                res.status = job.status = 'fail';
                res.message = 'Cannot get document list.';
                res.errno = 0;
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

            setTimeout (function () {
                var res = {};
                res.status = job.status = 'fail';
                res.message = 'Unable to remove anything.';
                res.isRemoved = false;
                jobendcallback(job);
                job.callback(res);
            }, 100);
        }
    };

    // add key to storageObjectType of global jio
    Jio.addStorageType('dummyallfail', function (options) {
        return new DummyStorageAllFail(options);
    });

    // end Dummy Storage All Fail
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Dummy Storage 3 : all not found
    var DummyStorageAllNotFound = function ( options ) {
    };
    DummyStorageAllNotFound.prototype = {
        checkNameAvailability: function ( job , jobendcallback) {
            // [job.userName] not found, so the name is available.
            // job: the job object
            // job.userName: the name we want to check.
            // jobendcallback : the function called at the end of the job.

            // returns {'status':string,'message':string,'isAvailable':boolean}
            // in the jobendcallback arguments.

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                job.status = 'done';
                jobendcallback(job);
                job.callback({'status':'done',
                              'message':''+job.userName+' is available.',
                              'isAvailable':true});
            }, 100);
        }, // end userNameAvailable

        saveDocument: function ( job, jobendcallback ) {
            // Document does not exists yet, create it.
            // job : the job object
            // job.options : the save options object
            // jobendcallback : the function called at the end of the job.

            // returns {'status':string,'message':string,'isSaved':boolean}
            // in the jobendcallback arguments.

            // wait a little in order to simulate asynchronous saving
            setTimeout (function () {
                var res = {};
                res.status = job.status = 'done';
                res.message = 'Document saved.';
                res.isSaved = true;
                jobendcallback(job);
                job.callback(res);
            }, 100);
        }, // end saveDocument

        loadDocument: function ( job, jobendcallback ) {
            // Returns a document object containing nothing.
            // job : the job object
            // job.fileName : the document name we want to load.
            // jobendcallback : the function called at the end of the job.
            
            // returns {'status':string,'message':string,'document':object}
            // in the jobendcallback arguments.
            // document object is {'fileName':string,'fileContent':string,
            // 'creationDate':date,'lastModified':date}

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                var res = {};
                res.status = job.status = 'fail';
                res.message = 'Document not found.';
                res.errno = 404;
                res.document = {};
                jobendcallback(job);
                job.callback(res);
            }, 100);
        }, // end loadDocument

        getDocumentList: function ( job, jobendcallback) {
            // It returns nothing.
            // job : the job object
            // jobendcallback : the function called at the end of the job.

            // returns {'status':string,'message':string,'list':array}
            // in the jobendcallback arguments.
            // the list is [object,object] -> object = {'fileName':string,
            // 'lastModified':date,'creationDate':date}

            setTimeout(function () {
                var res = {};
                res.status = job.status = 'fail';
                res.message = 'User collection not found.';
                res.errno = 404;
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

            setTimeout (function () {
                var res = {};
                res.status = job.status = 'done';
                res.message = 'Document already removed.';
                res.isRemoved = true;
                jobendcallback(job);
                job.callback(res);
            }, 100);
        }
    };

    // add key to storageObjectType of global jio
    Jio.addStorageType('dummyallnotfound', function (options) {
        return new DummyStorageAllNotFound(options);
    });

    // end Dummy Storage All Not Found
    ////////////////////////////////////////////////////////////////////////////

})( JIO );
