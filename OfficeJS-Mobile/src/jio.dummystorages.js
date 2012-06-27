
// Adds 3 dummy storages to JIO
// type:
//     - dummyallok
//     - dummyallfail
//     - dummyallnotfound
//     - dummyall3tries
(function () { var jioDummyStorageLoader = function ( Jio ) {

    ////////////////////////////////////////////////////////////////////////////
    // Dummy Storage 1 : all ok
    var newDummyStorageAllOk = function ( spec, my ) {
        var that = Jio.newBaseStorage( spec, my );
        that.checkNameAvailability = function () {
            // The [job.userName] IS available.

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                that.done(true);
            }, 100);
        }; // end userNameAvailable

        that.saveDocument = function () {
            // Tells us that the document is saved.

            // wait a little in order to simulate asynchronous saving
            setTimeout (function () {
                that.done();
            }, 100);
        }; // end saveDocument

        that.loadDocument = function () {
            // Returns a document object containing all information of the
            // document and its content.

            // document object is {'name':string,'content':string,
            // 'creation_date':date,'last_modified':date}

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                var doc = {
                    'content': 'content',
                    'name': 'file',
                    'creation_date': 10000,
                    'last_modified': 15000};
                that.done(doc);
            }, 100);
        }; // end loadDocument

        that.getDocumentList = function () {
            // It returns a document array containing all the user documents
            // informations, but not their content.

            // the list is [object,object] -> object = {'name':string,
            // 'last_modified':date,'creation_date':date}

            setTimeout(function () {
                var list = [
                    {'name':'file',
                     'creation_date':10000,
                     'last_modified':15000},
                    {'name':'memo',
                     'creation_date':20000,
                     'last_modified':25000
                    }];
                that.done(list);
            }, 100);
        }; // end getDocumentList

        that.removeDocument = function () {
            // Remove a document from the storage.

            setTimeout (function () {
                that.done();
            }, 100);
        };
        return that;
    },
    // end Dummy Storage All Ok
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Dummy Storage 2 : all fail
    newDummyStorageAllFail = function ( spec, my ) {
        var that = Jio.newBaseStorage( spec, my );

        that.checkNameAvailability = function () {
            // Fails to check [job.userName].

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                that.fail({status:0,statusText:'Unknown Error',
                           message:'Unknown error.'});
            }, 100);
        }; // end userNameAvailable

        that.saveDocument = function () {
            // Tells us that the document is not saved.

            // wait a little in order to simulate asynchronous saving
            setTimeout (function () {
                that.fail({status:0,statusText:'Unknown Error',
                           message:'Unknown error.'});
            }, 100);
        }; // end saveDocument

        that.loadDocument = function () {
            // Returns a document object containing nothing.

            // document object is {'name':string,'content':string,
            // 'creation_date':date,'last_modified':date}

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                that.fail({status:0,statusText:'Unknown Error',
                           message:'Unknown error.'});
            }, 100);
        }; // end loadDocument

        that.getDocumentList = function () {
            // It returns nothing.

            // the list is [object,object] -> object = {'name':string,
            // 'last_modified':date,'creation_date':date}

            setTimeout(function () {
                that.fail({status:0,statusText:'Unknown Error',
                           message:'Unknown error.'});
            }, 100);
        }; // end getDocumentList

        that.removeDocument = function () {
            // Remove a document from the storage.

            // returns {'status':string,'message':string,'isRemoved':boolean}
            // in the jobendcallback arguments.

            setTimeout (function () {
                that.fail({status:0,statusText:'Unknown Error',
                           message:'Unknown error.'});
            }, 100);
        };
        return that;
    },
    // end Dummy Storage All Fail
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Dummy Storage 3 : all not found
    newDummyStorageAllNotFound = function ( spec, my ) {
        var that = Jio.newBaseStorage( spec, my );

        that.checkNameAvailability = function () {
            // [job.userName] not found, so the name is available.

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                that.done(true);
            }, 100);
        }; // end userNameAvailable

        that.saveDocument = function () {
            // Document does not exists yet, create it.

            // wait a little in order to simulate asynchronous saving
            setTimeout (function () {
                that.done();
            }, 100);
        }; // end saveDocument

        that.loadDocument = function () {
            // Returns a document object containing nothing.

            // document object is {'name':string,'content':string,
            // 'creation_date':date,'last_modified':date}

            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                that.fail({status:404,statusText:'Not Found',
                           message:'Document "'+ that.getFileName() +
                           '" not found.'});
            }, 100);
        }; // end loadDocument

        that.getDocumentList = function () {
            // It returns nothing.

            // the list is [object,object] -> object = {'name':string,
            // 'last_modified':date,'creation_date':date}

            setTimeout(function () {
                that.fail({status:404,statusText:'Not Found',
                           message:'User list not found.'});
            }, 100);
        }; // end getDocumentList

        that.removeDocument = function () {
            // Remove a document from the storage.

            // returns {'status':string,'message':string,'isRemoved':boolean}
            // in the jobendcallback arguments.

            setTimeout (function () {
                that.done();
            }, 100);
        };
        return that;
    },
    // end Dummy Storage All Not Found
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Dummy Storage 4 : all 3 tries
    newDummyStorageAll3Tries = function ( spec, my ) {
        var that = Jio.newBaseStorage( spec, my ), priv = {};

        priv.doJob = function (if_ok_return) {
            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                priv.Try3OKElseFail (that.cloneJob().tries,if_ok_return);
            }, 100);
        };
        priv.Try3OKElseFail = function (tries,if_ok_return) {
            if ( tries === 3 ) {
                return that.done(if_ok_return);
            }
            if ( tries < 3 ) {
                return that.fail({message:'' + (3 - tries) + ' tries left.'});
            }
            if ( tries > 3 ) {
                return that.fail({message:'Too much tries.'});
            }
        };

        that.checkNameAvailability = function () {
            priv.doJob (true);
        }; // end userNameAvailable

        that.saveDocument = function () {
            priv.doJob ();
        }; // end saveDocument

        that.loadDocument = function () {
            priv.doJob ({
                'content': 'content2',
                'name': 'file',
                'creation_date': 11000,
                'last_modified': 17000
            });
        }; // end loadDocument

        that.getDocumentList = function () {
            priv.doJob([{'name':'file',
                         'creation_date':10000,
                         'last_modified':15000},
                        {'name':'memo',
                         'creation_date':20000,
                         'last_modified':25000}
                       ]);
        }; // end getDocumentList

        that.removeDocument = function () {
            priv.doJob();
        }; // end removeDocument

        return that;
    };
    // end Dummy Storage All 3 Tries
    ////////////////////////////////////////////////////////////////////////////

    // add key to storageObjectType of global jio
    Jio.addStorageType('dummyallok', newDummyStorageAllOk);
    Jio.addStorageType('dummyallfail', newDummyStorageAllFail);
    Jio.addStorageType('dummyallnotfound', newDummyStorageAllNotFound);
    Jio.addStorageType('dummyall3tries', newDummyStorageAll3Tries);

};

if (window.requirejs) {
    define ('JIODummyStorages',['JIO'], jioDummyStorageLoader);
} else {
    jioDummyStorageLoader ( JIO );
}

}());
