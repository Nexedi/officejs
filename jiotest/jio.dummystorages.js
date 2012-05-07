
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
    var DummyStorageAllOk = function ( args ) {
        this.job = args.job;
    };
    DummyStorageAllOk.prototype = {
        checkNameAvailability: function () {
            // The [job.userName] IS available.

            var t = this;

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                t.done(true);
            }, 100);
        }, // end userNameAvailable

        saveDocument: function () {
            // Tells us that the document is saved.

            var t = this;

            // wait a little in order to simulate asynchronous saving
            setTimeout (function () {
                t.done();
            }, 100);
        }, // end saveDocument

        loadDocument: function () {
            // Returns a document object containing all information of the
            // document and its content.
            
            // document object is {'fileName':string,'fileContent':string,
            // 'creationDate':date,'lastModified':date}

            var t = this;

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                var doc = {
                    'fileContent': 'content',
                    'fileName': 'file',
                    'creationDate': 10000,
                    'lastModified': 15000};
                t.done(doc);
            }, 100);
        }, // end loadDocument

        getDocumentList: function () {
            // It returns a document array containing all the user documents
            // informations, but not their content.

            // the list is [object,object] -> object = {'fileName':string,
            // 'lastModified':date,'creationDate':date}

            var t = this;

            setTimeout(function () {
                var list = [
                    {'fileName':'file',
                     'creationDate':10000,
                     'lastModified':15000},
                    {'fileName':'memo',
                     'creationDate':20000,
                     'lastModified':25000
                    }];
                t.done(list);
            }, 100);
        }, // end getDocumentList

        removeDocument: function () {
            // Remove a document from the storage.

            var t = this;

            setTimeout (function () {
                t.done();
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
    var DummyStorageAllFail = function ( args ) {
        this.job = args.job;
    };
    DummyStorageAllFail.prototype = {
        checkNameAvailability: function () {
            // Fails to check [job.userName].

            var t = this;

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                t.fail('Cannot check name availability.',0);
            }, 100);
        }, // end userNameAvailable

        saveDocument: function () {
            // Tells us that the document is not saved.

            var t = this;

            // wait a little in order to simulate asynchronous saving
            setTimeout (function () {
                t.fail('Unable to save document.',0);
            }, 100);
        }, // end saveDocument

        loadDocument: function () {
            // Returns a document object containing nothing.
            
            // document object is {'fileName':string,'fileContent':string,
            // 'creationDate':date,'lastModified':date}

            var t = this;

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                t.fail('Unable to load document.',0);
            }, 100);
        }, // end loadDocument

        getDocumentList: function () {
            // It returns nothing.

            // the list is [object,object] -> object = {'fileName':string,
            // 'lastModified':date,'creationDate':date}

            var t = this;

            setTimeout(function () {
                t.fail('Cannot get document list.',0);
            }, 100);
        }, // end getDocumentList

        removeDocument: function ( job, jobendcallback ) {
            // Remove a document from the storage.

            // returns {'status':string,'message':string,'isRemoved':boolean}
            // in the jobendcallback arguments.

            var t = this;

            setTimeout (function () {
                t.fail('Unable to remove anything.',0);
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
    var DummyStorageAllNotFound = function ( args ) {
        this.job = args.job;
    };
    DummyStorageAllNotFound.prototype = {
        checkNameAvailability: function () {
            // [job.userName] not found, so the name is available.

            var t = this;

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                t.done(true);
            }, 100);
        }, // end userNameAvailable

        saveDocument: function () {
            // Document does not exists yet, create it.

            var t = this;

            // wait a little in order to simulate asynchronous saving
            setTimeout (function () {
                t.done();
            }, 100);
        }, // end saveDocument

        loadDocument: function ( job, jobendcallback ) {
            // Returns a document object containing nothing.
            
            // document object is {'fileName':string,'fileContent':string,
            // 'creationDate':date,'lastModified':date}

            var t = this;

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                t.fail('Document not found.',404);
            }, 100);
        }, // end loadDocument

        getDocumentList: function ( job, jobendcallback) {
            // It returns nothing.

            // the list is [object,object] -> object = {'fileName':string,
            // 'lastModified':date,'creationDate':date}

            var t = this;

            setTimeout(function () {
                t.fail('User collection not found.',404);
            }, 100);
        }, // end getDocumentList

        removeDocument: function ( job, jobendcallback ) {
            // Remove a document from the storage.

            // returns {'status':string,'message':string,'isRemoved':boolean}
            // in the jobendcallback arguments.

            var t = this;

            setTimeout (function () {
                t.done();
            }, 100);
        }
    };

    // add key to storageObjectType of global jio
    Jio.addStorageType('dummyallnotfound', function (options) {
        return new DummyStorageAllNotFound(options);
    });

    // end Dummy Storage All Not Found
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Dummy Storage 4 : all 3 tries
    var DummyStorageAll3Tries = function ( args ) {
        this.job = args.job;
    };
    DummyStorageAllNotFound.prototype = {
        checkNameAvailability: function () {
            // [job.userName] not found, so the name is available.

            var t = this;

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                t.done(true);
            }, 100);
        }, // end userNameAvailable

        saveDocument: function () {
            // Document does not exists yet, create it.

            var t = this;

            // wait a little in order to simulate asynchronous saving
            setTimeout (function () {
                t.done();
            }, 100);
        }, // end saveDocument

        loadDocument: function () {
            // Returns a document object containing nothing.
            
            // document object is {'fileName':string,'fileContent':string,
            // 'creationDate':date,'lastModified':date}

            var t = this;

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                t.fail('Document not found.',404);
            }, 100);
        }, // end loadDocument

        getDocumentList: function () {
            // It returns nothing.

            // the list is [object,object] -> object = {'fileName':string,
            // 'lastModified':date,'creationDate':date}

            var t = this;

            setTimeout(function () {
                t.fail('User collection not found.',404);
            }, 100);
        }, // end getDocumentList

        removeDocument: function () {
            // Remove a document from the storage.

            // returns {'status':string,'message':string,'isRemoved':boolean}
            // in the jobendcallback arguments.

            var t = this;

            setTimeout (function () {
                t.done();
            }, 100);
        }
    };

    // add key to storageObjectType of global jio
    Jio.addStorageType('dummyall3tries', function (options) {
        return new DummyStorageAll3Tries(options);
    });

    // end Dummy Storage All 3 Tries
    ////////////////////////////////////////////////////////////////////////////

})( JIO );
