(function () { var thisfun = function(loader) {
    var JIO = loader.JIO,
    LocalOrCookieStorage = loader.LocalOrCookieStorage,
    sjcl = loader.sjcl,
    Base64 = loader.Base64,
    $ = loader.jQuery;

//// clear jio localstorage
(function () {
    var k, storageObject = LocalOrCookieStorage.getAll();
    for (k in storageObject) {
        var splitk = k.split('/');
        if ( splitk[0] === 'jio' ) {
            LocalOrCookieStorage.deleteItem(k);
        }
    }
}());
//// end clear jio localstorage

//// Tools
var getXML = function (url) {
    var tmp = '';
    $.ajax({'url':url,async:false,
            dataType:'text',success:function(xml){tmp=xml;}});
    return tmp;
},
objectifyDocumentArray = function (array) {
    var obj = {}, k;
    for (k = 0; k < array.length; k += 1) {
        obj[array[k].name] = array[k];
    }
    return obj;
},
addFileToLocalStorage = function (user,appid,file) {
    var i, l, found = false, filenamearray,
    userarray = LocalOrCookieStorage.getItem('jio/local_user_array') || [];
    for (i = 0, l = userarray.length; i < l; i+= 1) {
        if (userarray[i] === user) { found = true; }
    }
    if (!found) {
        userarray.push(user);
        LocalOrCookieStorage.setItem('jio/local_user_array',userarray);
        LocalOrCookieStorage.setItem(
            'jio/local_file_name_array/'+user+'/'+appid,[file.name]);
    } else {
        filenamearray =
            LocalOrCookieStorage.getItem(
                'jio/local_file_name_array/'+user+'/'+appid) || [];
        filenamearray.push(file.name);
        LocalOrCookieStorage.setItem(
            'jio/local_file_name_array/'+user+'/'+appid,
            filenamearray);
        LocalOrCookieStorage.setItem(
            'jio/local/'+user+'/'+appid+'/'+file.name,
            file);
    }
    LocalOrCookieStorage.setItem(
        'jio/local/'+user+'/'+appid+'/'+file.name,
        file);
},
removeFileFromLocalStorage = function (user,appid,file) {
    var i, l, newarray = [],
    filenamearray =
        LocalOrCookieStorage.getItem(
            'jio/local_file_name_array/'+user+'/'+appid) || [];
    for (i = 0, l = filenamearray.length; i < l; i+= 1) {
        if (filenamearray[i] !== file.name) {
            newarray.push(filenamearray[i]);
        }
    }
    LocalOrCookieStorage.setItem('jio/local_file_name_array/'+user+'/'+appid,
                                 newarray);
    LocalOrCookieStorage.deleteItem(
        'jio/local/'+user+'/'+appid+'/'+file.name);
};
//// end tools

//// QUnit Tests ////

module ('Jio Global tests');

test ( "Jio simple methods", function () {
    // Test Jio simple methods
    // It checks if we can create several instance of jio at the same
    // time. Checks if they don't overlap informations, if they are
    // started and stopped correctly and if they are ready when they
    // have to be ready.

    var o = {};
    o.jio = JIO.newJio();
    ok ( o.jio, 'a new jio -> 1');

    o.jio2 = JIO.newJio();
    ok ( o.jio2, 'another new jio -> 2');

    JIO.addStorageType('qunit', function(){});

    ok ( o.jio2.getId() !== o.jio.getId(), '1 and 2 must be different');

    o.jio.stop();
    o.jio2.stop();

});

// test ( 'Jio Publish/Sububscribe/Unsubscribe methods', function () {
//     // Test the Publisher, Subscriber of a single jio.
//     // It is just testing if these function are working correctly.
//     // The test publishes an event, waits a little, and check if the
//     // event has been received by the callback of the previous
//     // subscribe. Then, the test unsubscribe the callback function from
//     // the event, and publish the same event. If it receives the event,
//     // the unsubscribe method is not working correctly.

//     var o = {};
//     o.jio = JIO.newJio();

//     var spy1 = this.spy();

//     // Subscribe the pubsub_test event.
//     o.callback = o.jio.subscribe('pubsub_test',spy1);
//     // And publish the event.
//     o.jio.publish('pubsub_test');
//     ok (spy1.calledOnce, 'subscribing & publishing, event called once');

//     o.jio.unsubscribe('pubsub_test',spy1);
//     o.jio.publish('pubsub_test');
//     ok (spy1.calledOnce, 'unsubscribing, same event not called twice');

//     o.jio.stop();
// });

module ( 'Jio Dummy Storages' );

test ('All tests', function () {
    // Tests all dummy storages from jio.dummystorages.js
    // It is simple tests, but they will be used by replicate storage later
    // for sync operation.

    var o = {}; o.t = this; o.clock = o.t.sandbox.useFakeTimers();
    o.spy = function(res,value,message,fun) {
        fun = fun || 'f';
        o[fun] = function(result) {
            if (res === 'status') {
                deepEqual (result.status.getLabel(),value,message);
            } else {
                deepEqual (result.value,value,message);
            }
        };
        o.t.spy(o,fun);
    };
    o.tick = function (tick,fun) {
        fun = fun || 'f';
        o.clock.tick(tick || 1000);
        if (!o[fun].calledOnce) {
            if (o[fun].called) {
                ok(false, 'too much results (o.' + fun +')');
            } else {
                ok(false, 'no response (o.' + fun +')');
            }
        }
    };
    // All Ok Dummy Storage
    o.jio = JIO.newJio({'type':'dummyallok'});
    // save
    o.spy('status','done','dummyallok saving');
    o.jio.saveDocument('file','content',{onResponse:o.f,max_retry:1});
    o.tick();
    // load
    o.spy('value',{name:'file',content:'content',last_modified:15000,
                   creation_date:10000},'dummyallok loading');
    o.jio.loadDocument('file',{onResponse:o.f,max_retry:1});
    o.tick();
    // remove
    o.spy('status','done','dummyallok removing');
    o.jio.removeDocument('file',{onResponse:o.f,max_retry:1});
    o.tick();
    // get list
    o.spy ('value',[{name:'file',content:'filecontent',last_modified:15000,
                     creation_date:10000},
                    {name:'memo',content:'memocontent',last_modified:25000,
                     creation_date:20000}],'dummyallok getting list');
    o.jio.getDocumentList('.',{onResponse:o.f,metadata_only:false,max_retry:1});
    o.tick();
    o.jio.stop();


    o.jio = JIO.newJio({'type':'dummyallok'});
    // save
    o.spy('status','done','dummyallok saving','f');
    o.spy('status','done','dummyallok saving','f2');
    o.spy('status','done','dummyallok saving','f3');
    o.jio.saveDocument('file','content',{onResponse:o.f,max_retry:1});
    o.jio.saveDocument('file2','content2',{onResponse:o.f2,max_retry:1});
    o.jio.saveDocument('file3','content3',{onResponse:o.f3,max_retry:1});
    o.tick(undefined, 'f');
    o.tick(0, 'f2');
    o.tick(0, 'f3');
    // load
    o.spy('value',{name:'file',content:'content',last_modified:15000,
                   creation_date:10000},'dummyallok loading');
    o.jio.loadDocument('file',{onResponse:o.f,max_retry:1});
    o.tick();
    // remove
    o.spy('status','done','dummyallok removing');
    o.jio.removeDocument('file',{onResponse:o.f,max_retry:1});
    o.tick();
    // get list
    o.spy ('value',[{name:'file',content:'filecontent',last_modified:15000,
                     creation_date:10000},
                    {name:'memo',content:'memocontent',last_modified:25000,
                     creation_date:20000}],'dummyallok getting list');
    o.jio.getDocumentList('.',{onResponse:o.f,metadata_only:false,max_retry:1});
    o.tick();
    o.jio.stop();


    // All Fail Dummy Storage
    o.jio = JIO.newJio({'type':'dummyallfail'});
    // save
    o.spy ('status','fail','dummyallfail saving');
    o.jio.saveDocument('file','content',{onResponse:o.f,max_retry:1});
    o.tick();
    // load
    o.spy ('status','fail','dummyallfail loading');
    o.jio.loadDocument('file',{onResponse:o.f,max_retry:1});
    o.tick();
    // remove
    o.spy ('status','fail','dummyallfail removing');
    o.jio.removeDocument('file',{onResponse:o.f,max_retry:1});
    o.tick();
    // get list
    o.spy ('status','fail','dummyallfail getting list');
    o.jio.getDocumentList('.',{onResponse:o.f,max_retry:1});
    o.tick();
    o.jio.stop();

    // All Not Found Dummy Storage
    o.jio = JIO.newJio({'type':'dummyallnotfound'});
    // save
    o.spy('status','done','dummyallnotfound saving');
    o.jio.saveDocument('file','content',{onResponse:o.f,max_retry:1});
    o.tick();
    // load
    o.spy('status','fail','dummyallnotfound loading');
    o.jio.loadDocument('file',{onResponse:o.f,max_retry:1});
    o.tick();
    // remove
    o.spy('status','done','dummyallnotfound removing');
    o.jio.removeDocument('file',{onResponse:o.f,max_retry:1});
    o.tick();
    // get list
    o.spy('status','fail','dummyallnotfound getting list');
    o.jio.getDocumentList ('.',{onResponse:o.f,max_retry:1});
    o.tick();
    o.jio.stop();
});

module ( 'Jio Job Managing' );

test ('Simple Job Elimination', function () {
    var o = {}, id = 0;
    o.f1 = this.spy(); o.f2 = this.spy();

    o.jio = JIO.newJio({type:'dummyallok',applicationname:'jiotests'});
    id = o.jio.getId();
    o.jio.saveDocument('file','content',{onResponse:o.f1,max_retry:1});
    ok(LocalOrCookieStorage.getItem('jio/job_array/'+id)[0],
       'job creation');
    o.jio.removeDocument('file',{onResponse:o.f2,max_retry:1});
    o.tmp = LocalOrCookieStorage.getItem('jio/job_array/'+id)[0];
    deepEqual(o.tmp.command.label,'removeDocument','job elimination');
});

test ('Simple Job Replacement', function () {
    // Test if the second job write over the first one

    var o = {};
    o.clock = this.sandbox.useFakeTimers();
    o.id = 0;
    o.f1 = function (result) {
        o.status = result.status.getLabel();
    };
    this.spy(o,'f1');
    o.f2 = this.spy();

    o.jio = JIO.newJio({type:'dummyallok',applicationname:'jiotests'});
    o.id = o.jio.getId();
    o.jio.saveDocument('file','content',{onResponse:o.f1,max_retry:1});
    o.clock.tick(10);
    o.jio.saveDocument('file','content',{onResponse:o.f2,max_retry:1});
    deepEqual(LocalOrCookieStorage.getItem(
        'jio/job_array/'+o.id)[0].date,10,
              'The first job date have to be equal to the second job date.');
    o.clock.tick(1000);
    deepEqual([o.f1.calledOnce,o.status],[true,'fail'],
       'callback for the first save request -> result fail');
    ok(o.f2.calledOnce,'second callback is called once');
    o.jio.stop();

});

test ('Simple Job Waiting', function () {
    // Test if the second job doesn't erase the first on going one

    var o = {};
    o.clock = this.sandbox.useFakeTimers();
    o.id = 0;
    o.f3 = this.spy(); o.f4 = this.spy();

    o.jio = JIO.newJio({type:'dummyallok',applicationname:'jiotests'});
    o.id = o.jio.getId();
    o.jio.saveDocument('file','content',{onResponse:o.f3,max_retry:1});
    o.clock.tick(200);
    o.jio.saveDocument('file','content1',{onResponse:o.f4,max_retry:1});
    o.tmp0 = LocalOrCookieStorage.getItem('jio/job_array/'+o.id)[0];
    o.tmp1 = LocalOrCookieStorage.getItem('jio/job_array/'+o.id)[1];
    ok(o.tmp1 && o.tmp0.status.label === 'on going',
       'The second job must not overwrite the first on going one.');
    ok(o.tmp1.status.label === 'wait' &&
       o.tmp1.status.waitforjob &&
       JSON.stringify(o.tmp1.status.waitforjob) ===
       JSON.stringify ([1]),
       'The second job must be waiting for the first to end');
    o.clock.tick(1000);
    ok(o.f3.calledOnce,'first request passed');
    ok(o.f4.calledOnce,'restore waiting job');
    o.jio.stop();
});

test ('Simple Time Waiting' , function () {
    // Test if the job that have fail wait until a certain moment to restart.
    // It will use the dummyall3tries, which will work after the 3rd try.

    var o = {}, clock = this.sandbox.useFakeTimers(), id = 0;
    o.f = function (result) {
        o.res = (result.status.getLabel() === 'done');
    };
    this.spy(o,'f');
    o.jio = JIO.newJio({type:'dummyall3tries',applicationname:'jiotests'});
    o.jio.saveDocument('file','content',{onResponse:o.f,max_retry:3});
    clock.tick(100000);
    ok(o.f.calledOnce,'callback called once.');
    ok(o.res,'job done.');
    o.jio.stop();
});

module ( 'Jio Restore');

test ('Restore old Jio', function() {
    var o = {};
    o.clock = this.sandbox.useFakeTimers();
    o.f = function(result) {
        ok(false,'must never be called!');
    };
    o.clock.tick(0);
    this.spy(o,'f');
    o.jio = JIO.newJio({type:'dummyall3tries',applicationname:'jiotests'});
    o.id = o.jio.getId();
    o.jio.saveDocument('file','content',{onResponse:o.f,max_retry:3});
    o.clock.tick(1000);
    o.jio.close();
    o.jio = JIO.newJio({type:'dummyallok',applicationname:'jiotests'});
    o.clock.tick(11000);        // 10 sec
    deepEqual(LocalOrCookieStorage.getItem('jio/job_array/'+o.id),null,
              'job array list must be empty');
    o.tmp1 = LocalOrCookieStorage.getItem('jio/job_array/'+o.jio.getId());
    if (o.tmp1.length > 0) {
        deepEqual([o.tmp1[0].command.label,o.tmp1[0].command.path,
                   o.tmp1[0].command.content],
                  ['saveDocument','file','content'],
                  'job is restored' + o.jio.getId());
    } else {
        ok (false, 'The recovered job must exists');
    }
});

module ( 'Jio LocalStorage' );

test ('Document save', function () {
    // Test if LocalStorage can save documents.
    // We launch a saving to localstorage and we check if the file is
    // realy saved. Then save again and check if

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.spy = function(res,value,message) {
        o.f = function(result) {
            if (res === 'status') {
                deepEqual (result.status.getLabel(),value,message);
            } else {
                deepEqual (result.value,value,message);
            }
        };
        o.t.spy(o,'f');
    };
    o.tick = function (value, tick) {
        o.clock.tick(tick || 1000);
        if (!o.f.calledOnce) {
            if (o.f.called) {
                ok(false, 'too much results');
            } else {
                ok(false, 'no response');
            }
        }
        if (!o.f.calledOnce) {
            if (o.f.called) {
                ok(false, 'too much results');
            } else {
                ok(false, 'no response');
            }
        }
        o.tmp =
            LocalOrCookieStorage.getItem ('jio/local/MrSaveName/jiotests/file');
        if (o.tmp) {
            o.tmp.lmcd = (o.tmp.last_modified === o.tmp.creation_date);
            delete o.tmp.last_modified;
            delete o.tmp.creation_date;
            deepEqual (o.tmp,{name:'file',content:'content',lmcd:value},
                       'check saved document');
        } else {
            ok (false, 'document is not saved!');
        }
    };

    o.jio = JIO.newJio({type:'local',username:'MrSaveName',
                        applicationname:'jiotests'});
    // save and check document existence
    o.spy('status','done','saving document');
    o.jio.saveDocument('file','content',{onResponse:o.f,max_retry:1});
    o.tick(true);

    o.spy('status','done','saving document');
    o.jio.saveDocument('file','content',{onResponse:o.f,max_retry:1});
    o.tick(false);

    o.jio.stop();
});

test ('Document load', function () {
    // Test if LocalStorage can load documents.
    // We launch a loading from localstorage and we check if the file is
    // realy loaded.

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.spy = function(res,value,message) {
        o.f = function(result) {
            if (res === 'status') {
                deepEqual (result.status.getLabel(),value,message);
            } else {
                deepEqual (result.value,value,message);
            }
        };
        o.t.spy(o,'f');
    };
    o.tick = function (value, tick) {
        o.clock.tick(tick || 1000);
        if (!o.f.calledOnce) {
            if (o.f.called) {
                ok(false, 'too much results');
            } else {
                ok(false, 'no response');
            }
        }
    };

    o.jio = JIO.newJio({type:'local',username:'MrLoadName',
                        applicationname:'jiotests'});
    // save and check document existence
    o.doc = {name:'file',content:'content',
             last_modified:1234,creation_date:1000};

    o.spy('status','fail','loading document failure');
    o.jio.loadDocument('file',{onResponse:o.f,max_retry:1});
    o.tick();

    addFileToLocalStorage('MrLoadName','jiotests',o.doc);
    o.spy('value',o.doc,'loading document success');
    o.jio.loadDocument('file',{onResponse:o.f,max_retry:1});
    o.tick();

    o.jio.stop();
});

test ('Get document list', function () {
    // Test if LocalStorage can get a list of documents.
    // We create 2 documents inside localStorage to check them.

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.mytest = function (value){
        o.f = function (result) {
            deepEqual (objectifyDocumentArray(result.value),
                       objectifyDocumentArray(value),'getting list');
        };
        o.t.spy(o,'f');
        o.jio.getDocumentList('.',{onResponse: o.f,max_retry:1});
        o.clock.tick(1000);
        if (!o.f.calledOnce) {
            if (o.f.called) {
                ok(false, 'too much results');
            } else {
                ok(false, 'no response');
            }
        }
    };
    o.jio = JIO.newJio({type:'local',username:'MrListName',
                        applicationname:'jiotests'});
    o.doc1 = {name:'file',content:'content',
              last_modified:1,creation_date:0};
    o.doc2 = {name:'memo',content:'test',
              last_modified:5,creation_date:2};
    addFileToLocalStorage ('MrListName','jiotests',o.doc1);
    addFileToLocalStorage ('MrListName','jiotests',o.doc2);
    delete o.doc1.content;
    delete o.doc2.content;
    o.mytest ([o.doc1,o.doc2]);

    o.jio.stop();
});

test ('Document remove', function () {
    // Test if LocalStorage can remove documents.
    // We launch a remove from localstorage and we check if the file is
    // realy removed.

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.mytest = function (){
        o.f = function (result) {
            deepEqual(result.status.getLabel(),'done','removing document');
        };
        o.t.spy(o,'f');
        o.jio.removeDocument('file',{onResponse: o.f,max_retry:1});
        o.clock.tick(1000);
        if (!o.f.calledOnce) {
            ok(false, 'no response / too much results');
        } else {
            // check if the file is still there
            o.tmp = LocalOrCookieStorage.getItem (
                'jio/local/MrRemoveName/jiotests/file');
            ok (!o.tmp, 'check no content');
        }
    };
    o.jio = JIO.newJio({type:'local',username:'MrRemoveName',
                        applicationname:'jiotests'});
    // test removing a file
    addFileToLocalStorage ('MrRemoveName','jiotests',{name:'file'});
    o.mytest ();

    o.jio.stop();
});

module ('Jio DAVStorage');

test ('Document load', function () {
    // Test if DavStorage can load documents.

    var o = {};
    o.davload = getXML('responsexml/davload'),
    o.clock = this.sandbox.useFakeTimers();
    o.t = this;
    o.mytest = function (message,doc,errprop,errget) {
        var server = o.t.sandbox.useFakeServer();
        server.respondWith (
            "PROPFIND","https://ca-davstorage:8080/dav/davload/jiotests/file",
            [errprop,{'Content-Type':'text/xml; charset="utf-8"'},
             o.davload]);
        server.respondWith (
            "GET","https://ca-davstorage:8080/dav/davload/jiotests/file",
            [errget,{},'content']);
        o.f = function (result) {
            deepEqual (result.value,doc,message);
        };
        o.t.spy(o,'f');
        o.jio.loadDocument('file',{onResponse:o.f,max_retry:1});
        o.clock.tick(1000);
        server.respond();
        if (!o.f.calledOnce) {
            if (o.f.called) {
                ok(false, 'too much results');
            } else {
                ok(false, 'no response');
            }
        }
    };
    o.jio = JIO.newJio({type:'dav',username:'davload',
                        password:'checkpwd',
                        url:'https://ca-davstorage:8080',
                        applicationname:'jiotests'});
    // note: http errno:
    //     200 OK
    //     201 Created
    //     204 No Content
    //     207 Multi Status
    //     403 Forbidden
    //     404 Not Found
    // load an inexistant document.
    o.mytest ('load inexistant document',undefined,404,404);
    // load a document.
    o.mytest ('load document',{name:'file',content:'content',
                               last_modified:1335953199000,
                               creation_date:1335953202000},207,200);
    o.jio.stop();
});

test ('Document save', function () {
    // Test if DavStorage can save documents.

    var o = {};
    o.davsave = getXML('responsexml/davsave');
    o.clock = this.sandbox.useFakeTimers();
    o.t = this;
    o.mytest = function (message,value,errnoput,errnoprop) {
        var server = o.t.sandbox.useFakeServer();
        server.respondWith (
            // lastmodified = 7000, creationdate = 5000
            "PROPFIND","https://ca-davstorage:8080/dav/davsave/jiotests/file",
            [errnoprop,{'Content-Type':'text/xml; charset="utf-8"'},
             o.davsave]);
        server.respondWith (
            "PUT",
            "https://ca-davstorage:8080/dav/davsave/jiotests/file",
            [errnoput, {'Content-Type':'x-www-form-urlencoded'},
             'content']);
        server.respondWith (
            "GET","https://ca-davstorage:8080/dav/davsave/jiotests/file",
            [errnoprop===207?200:errnoprop,{},'content']);
        // server.respondWith ("MKCOL","https://ca-davstorage:8080/dav",
        //                     [200,{},'']);
        // server.respondWith ("MKCOL","https://ca-davstorage:8080/dav/davsave",
        //                     [200,{},'']);
        // server.respondWith ("MKCOL",
        //                    "https://ca-davstorage:8080/dav/davsave/jiotests",
        //                     [200,{},'']);
        o.f = function (result) {
            deepEqual (result.status.getLabel(),value,message);
        };
        o.t.spy(o,'f');
        o.jio.saveDocument('file','content',{onResponse:o.f,max_retry:1});
        o.clock.tick(1000);
        server.respond();
        if (!o.f.calledOnce) {
            if (o.f.called) {
                ok(false, 'too much results');
            } else {
                ok(false, 'no response');
            }
        }
    };
    o.jio = JIO.newJio({type:'dav',username:'davsave',
                        password:'checkpwd',
                        url:'https://ca-davstorage:8080',
                        applicationname:'jiotests'});
    // note: http errno:
    //     200 OK
    //     201 Created
    //     204 No Content
    //     207 Multi Status
    //     403 Forbidden
    //     404 Not Found
    // // the path does not exist, we want to create it, and save the file.
    // mytest('create path if not exists, and create document',
    //        true,201,404);
    // the document does not exist, we want to create it
    o.mytest('create document','done',201,404);
    o.clock.tick(8000);
    // the document already exists, we want to overwrite it
    o.mytest('overwrite document','done',204,207);
    o.jio.stop();
});

test ('Get Document List', function () {
    // Test if DavStorage can get a list a document.

    var o = {};
    o.davlist = getXML('responsexml/davlist');
    o.clock = this.sandbox.useFakeTimers();
    o.t = this;
    o.mytest = function (message,value,errnoprop) {
        var server = o.t.sandbox.useFakeServer();
        server.respondWith (
            "PROPFIND",'https://ca-davstorage:8080/dav/davlist/jiotests/',
            [errnoprop,{'Content-Type':'text/xml; charset="utf-8"'},
             o.davlist]);
        o.f = function (result) {
            if (result.status.getLabel() === 'fail') {
                deepEqual (result.value, value, message);
            } else {
                deepEqual (objectifyDocumentArray(result.value),
                           objectifyDocumentArray(value),message);
            }
        };
        o.t.spy(o,'f');
        o.jio.getDocumentList('.',{onResponse:o.f,max_retry:1});
        o.clock.tick(1000);
        server.respond();
        if (!o.f.calledOnce) {
            if (o.f.called) {
                ok(false, 'too much results');
            } else {
                ok(false, 'no response');
            }
        }
    };
    o.jio = JIO.newJio({type:'dav',username:'davlist',
                        password:'checkpwd',
                        url:'https://ca-davstorage:8080',
                        applicationname:'jiotests'});
    o.mytest('fail to get list',undefined,404);
    o.mytest('getting list',[{name:'file',creation_date:1335962911000,
                              last_modified:1335962907000},
                             {name:'memo',creation_date:1335894073000,
                              last_modified:1335955713000}],207);
    o.jio.stop();
});

test ('Remove document', function () {
    // Test if DavStorage can remove documents.

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.mytest = function (message,value,errnodel) {
        var server = o.t.sandbox.useFakeServer();
        server.respondWith (
            "DELETE","https://ca-davstorage:8080/dav/davremove/jiotests/file",
            [errnodel,{},'']);
        o.f = function (result) {
            deepEqual (result.status.getLabel(),value,message);
        };
        o.t.spy(o,'f');
        o.jio.removeDocument('file',{onResponse:o.f,max_retry:1});
        o.clock.tick(1000);
        server.respond();
        if (!o.f.calledOnce) {
            if (o.f.called) {
                ok(false, 'too much results');
            } else {
                ok(false, 'no response');
            }
        }
    };
    o.jio = JIO.newJio({type:'dav',username:'davremove',
                        password:'checkpwd',
                        url:'https://ca-davstorage:8080',
                        appliactionname:'jiotests'});

    o.mytest('remove document','done',204);
    o.mytest('remove an already removed document','done',404);
    o.jio.stop();
});

module ('Jio ReplicateStorage');

test ('Document load', function () {
    // Test if ReplicateStorage can load several documents.

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.mytest = function (message,doc) {
        o.f = function (result) {
            deepEqual (result.value,doc,message);};
        o.t.spy(o,'f');
        o.jio.loadDocument('file',{onResponse:o.f,max_retry:3});
        o.clock.tick(100000);
        if (!o.f.calledOnce) {
            if (o.f.called) {
                ok(false, 'too much results');
            } else {
                ok(false, 'no response');
            }
        }
    };
    o.jio = JIO.newJio({type:'replicate',storagelist:[
        {type:'dummyallok',username:'1'},
        {type:'dummyallok',username:'2'}]});
    o.mytest('DummyStorageAllOK,OK: load same file',{
        name:'file',content:'content',
        last_modified:15000,
        creation_date:10000});
    o.jio.stop();

    o.jio = JIO.newJio({type:'replicate',storagelist:[
        {type:'dummyall3tries'},
        {type:'dummyallok'}]});
    o.mytest('DummyStorageAllOK,3tries: load 2 different files',{
        name:'file',content:'content',
        last_modified:15000,
        creation_date:10000});

    o.jio.stop();
});

test ('Document save', function () {
    // Test if ReplicateStorage can save several documents.

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.mytest = function (message,value) {
        o.f = function (result) {
            deepEqual (result.status.getLabel(),value,message);
        };
        o.t.spy(o,'f');
        o.jio.saveDocument('file','content',{onResponse:o.f,max_retry:3});
        o.clock.tick(500);
        if (!o.f.calledOnce) {
            if (o.f.called) {
                ok(false, 'too much results');
            } else {
                ok(false, 'no response');
            }
        }
    };
    o.jio = JIO.newJio({type:'replicate',storagelist:[
        {type:'dummyallok',username:'1'},
        {type:'dummyallok',username:'2'}]});
    o.mytest('DummyStorageAllOK,OK: save a file.','done');
    o.jio.stop();

    o.jio = JIO.newJio({type:'replicate',storagelist:[
        {type:'dummyall3tries',username:'1'},
        {type:'dummyallok',username:'2'}]});
    o.mytest('DummyStorageAll3Tries,OK: save a file.','done');
    o.jio.stop();
});

test ('Get Document List', function () {
    // Test if ReplicateStorage can get several list.

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.mytest = function (message,value) {
        o.f = function (result) {
            deepEqual (objectifyDocumentArray(result.value),
                       objectifyDocumentArray(value),message);
        };
        o.t.spy(o,'f');
        o.jio.getDocumentList('.',{onResponse:o.f,max_retry:3});
        o.clock.tick(100000);
        if (!o.f.calledOnce) {
            if (o.f.called) {
                ok(false, 'too much results');
            } else {
                ok(false, 'no response');
            }
        }
    };
    o.jio = JIO.newJio({type:'replicate',storagelist:[
        {type:'dummyall3tries',username:'1'},
        {type:'dummyallok',username:'2'}]});
    o.doc1 = {name:'file',
              last_modified:15000,creation_date:10000};
    o.doc2 = {name:'memo',
              last_modified:25000,creation_date:20000};
    o.mytest('DummyStorageAllOK,3tries: get document list.',
             [o.doc1,o.doc2]);
    o.jio.stop();

    o.jio = JIO.newJio({type:'replicate',storagelist:[
        {type:'dummyall3tries',username:'3'},
        {type:'dummyall3tries',username:'4'}]});
    o.mytest('DummyStorageAll3tries,3tries: get document list.',
             [o.doc1,o.doc2]);
    o.jio.stop();
});

test ('Remove document', function () {
    // Test if ReplicateStorage can remove several documents.

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.mytest = function (message,value) {
        o.f = function (result) {
            deepEqual (result.status.getLabel(),value,message);
        };
        o.t.spy(o,'f');
        o.jio.removeDocument('file',{onResponse:o.f,max_retry:3});
        o.clock.tick(10000);
        if (!o.f.calledOnce) {
            if (o.f.called) {
                ok(false, 'too much results');
            } else {
                ok(false, 'no response');
            }
        }
    };
    o.jio = JIO.newJio({type:'replicate',storagelist:[
        {type:'dummyallok',username:'1'},
        {type:'dummyall3tries',username:'2'}]});
    o.mytest('DummyStorageAllOK,3tries: remove document.','done');
    o.jio.stop();
});

module ('Jio IndexedStorage');

test ('Document load', function () {
    var o = {}; o.clock = this.sandbox.useFakeTimers();
    o.jio = JIO.newJio({type:'indexed',storage:{type:'dummyall3tries'}});
    // loading must take long time with dummyall3tries
    o.f = this.spy();
    o.jio.loadDocument('memo',{max_retry:3,onResponse:o.f,metadata_only:true});
    o.clock.tick(1000);
    ok(!o.f.called,'Callback must not be called');
    // wait long time too retreive list
    o.clock.tick(100000);

    // now we can test if the document metadata are loaded faster.
    o.doc = {name:'memo',last_modified:25000,creation_date:20000};
    o.f2 = function (result) {
        deepEqual (result.value,o.doc,'Document metadata retrieved');
    };
    this.spy(o,'f2');
    o.jio.loadDocument('memo',{max_retry:3,onResponse:o.f2,metadata_only:true});
    o.clock.tick(1000);
    if (!o.f2.calledOnce) {
        ok (false, 'no response / too much results');
    }

    // test a simple document loading
    o.doc2 = {name:'file',last_modified:17000,
              creation_date:11000,content:'content2'};
    o.f3 = function (result) {
        deepEqual (result.value,o.doc2,'Simple document loading');
    };
    this.spy(o,'f3');
    o.jio.loadDocument('file',{max_retry:3,onResponse:o.f3});
    o.clock.tick(100000);
    if (!o.f3.calledOnce) {
        ok (false, 'no response / too much results');
    }
    o.jio.stop();
});

test ('Document save', function () {
    var o = {}; o.clock = this.sandbox.useFakeTimers();
    o.jio = JIO.newJio({type:'indexed',
                        storage:{type:'dummyall3tries',
                                 username:'indexsave'}});
    o.f = function (result) {
        deepEqual (result.status.getLabel(),'done','document save');
    };
    this.spy(o,'f');
    o.jio.saveDocument('file','content',{max_retry:3,onResponse:o.f});
    o.clock.tick(100000);
    if (!o.f.calledOnce){
        ok (false, 'no response / too much results');
    }
    o.jio.stop();
});

test ('Get document list', function () {
    var o = {}; o.clock = this.sandbox.useFakeTimers();
    o.jio = JIO.newJio({type:'indexed',
                        storage:{type:'dummyall3tries',
                                 username:'indexgetlist'}});
    o.doc1 = {name:'file',last_modified:15000,creation_date:10000};
    o.doc2 = {name:'memo',last_modified:25000,creation_date:20000};
    // getting list must take long time with dummyall3tries
    o.f = this.spy();
    o.jio.getDocumentList('.',{max_retry:3,onResponse:o.f});
    o.clock.tick(1000);
    ok(!o.f.called,'Callback must not be called');
    // wail long time too retreive list
    o.clock.tick(100000);
    // now we can test if the document list is loaded faster
    o.f2 = function (result) {
        deepEqual (result.value,[o.doc1,o.doc2],'get document list');
    };
    this.spy(o,'f2');
    o.jio.getDocumentList('.',{max_retry:3,onResponse:o.f2});
    o.clock.tick(1000)
    if (!o.f2.calledOnce) {
        ok (false, 'no response / too much results');
    }
});

test ('Remove document', function () {
    var o = {}; o.clock = this.sandbox.useFakeTimers();
    o.jio = JIO.newJio({type:'indexed',
                        storage:{type:'dummyall3tries',
                                 username:'indexremove'}});
    o.f = function (result) {
        deepEqual (result.status.getLabel(),'done','document remove');
    };
    this.spy(o,'f');
    o.jio.removeDocument('file',{max_retry:3,onResponse:o.f});
    o.clock.tick(100000);
    if (!o.f.calledOnce){
        ok (false, 'no response / too much results');
    }
    o.jio.stop();
});

module ('Jio CryptedStorage');

test ('Document save' , function () {
    var o = {}, clock = this.sandbox.useFakeTimers();
    o.jio=JIO.newJio({type:'crypt',
                      username:'cryptsave',
                      password:'mypwd',
                      storage:{type:'local',
                               username:'cryptsavelocal',
                               applicationname:'jiotests'}});
    o.f = function (result) {
        deepEqual (result.status.getLabel(),'done','save ok');
    };
    this.spy(o,'f');
    o.jio.saveDocument('testsave','contentoftest',{
        max_retry:1,onResponse:o.f});
    clock.tick(1000);
    if (!o.f.calledOnce) {
        ok (false, 'no response / too much results');
    }
    // encrypt 'testsave' with 'cryptsave:mypwd' password
    o.tmp = LocalOrCookieStorage.getItem(
        'jio/local/cryptsavelocal/jiotests/rZx5PJxttlf9QpZER/5x354bfX54QFa1');
    if (o.tmp) {
        delete o.tmp.last_modified;
        delete o.tmp.creation_date;
    }
    deepEqual (o.tmp,
               {name:'rZx5PJxttlf9QpZER/5x354bfX54QFa1',
                content:'upZkPIpitF3QMT/DU5jM3gP0SEbwo1n81rMOfLE'},
               'Check if the document is realy encrypted');
    o.jio.stop();
});

test ('Document Load' , function () {
    var o = {}, clock = this.sandbox.useFakeTimers();
    o.jio=JIO.newJio({type:'crypt',
                      username:'cryptload',
                      password:'mypwd',
                      storage:{type:'local',
                               username:'cryptloadlocal',
                               applicationname:'jiotests'}});
    o.f = function (result) {
        if (result.status.isDone()) {
            deepEqual (result.value,
                       {name:'testload',
                        content:'contentoftest',
                        last_modified:500,
                        creation_date:500},
                       'load ok');
        } else {
            ok (false ,'cannot load');
        }
    };
    this.spy(o,'f');
    // encrypt 'testload' with 'cryptload:mypwd' password
    // and 'contentoftest' with 'cryptload:mypwd'
    o.doc = {name:'hiG4H80pwkXCCrlLl1X0BD0BfWLZwDUX',
             content:'kSulH8Qo105dSKHcY2hEBXWXC9b+3PCEFSm1k7k',
             last_modified:500,creation_date:500};
    addFileToLocalStorage('cryptloadlocal','jiotests',o.doc);
    o.jio.loadDocument('testload',{
        max_retry:1,onResponse:o.f});
    clock.tick(1000);
    if (!o.f.calledOnce) {
        ok (false, 'no response / too much results');
    }
    o.jio.stop();
});

test ('Get Document List', function () {
    var o = {}, clock = this.sandbox.useFakeTimers();
    o.jio=JIO.newJio({type:'crypt',
                      username:'cryptgetlist',
                      password:'mypwd',
                      storage:{type:'local',
                               username:'cryptgetlistlocal',
                               applicationname:'jiotests'}});
    o.f = function (result) {
        if (result.status.isDone()) {
            deepEqual (objectifyDocumentArray(result.return_value),
                       objectifyDocumentArray(o.doc_list),'Getting list');
        } else {
            console.warn (result);
            ok (false, 'Cannot get list');
        }
    };
    this.spy(o,'f');
    o.doc_list = [
        {name:'testgetlist1',last_modified:500,creation_date:200},
        {name:'testgetlist2',last_modified:300,creation_date:300}
    ];
    o.doc_encrypt_list = [
        {name:'541eX0WTMDw7rqIP7Ofxd1nXlPOtejxGnwOzMw',
         content:'/4dBPUdmLolLfUaDxPPrhjRPdA',
         last_modified:500,creation_date:200},
        {name:'541eX0WTMDw7rqIMyJ5tx4YHWSyxJ5UjYvmtqw',
         content:'/4FBALhweuyjxxD53eFQDSm4VA',
         last_modified:300,creation_date:300}
    ];
    // encrypt with 'cryptgetlist:mypwd' as password
    LocalOrCookieStorage.setItem(
        'jio/local_file_name_array/cryptgetlistlocal/jiotests',
        [o.doc_encrypt_list[0].name,o.doc_encrypt_list[1].name]);
    LocalOrCookieStorage.setItem(
        'jio/local/cryptgetlistlocal/jiotests/'+o.doc_encrypt_list[0].name,
        o.doc_encrypt_list[0]);
    LocalOrCookieStorage.setItem(
        'jio/local/cryptgetlistlocal/jiotests/'+o.doc_encrypt_list[1].name,
        o.doc_encrypt_list[1]);
    o.jio.getDocumentList({max_retry:1,onResponse:o.f});
    clock.tick (3000);
    if (!o.f.calledOnce) {
        if (o.f.called) {
            ok (false, 'too much results');
        } else {
            ok (false, 'no response');
        }
    }
    clock.tick(1000);
    o.jio.stop();
});

test ('Remove document', function () {
    var o = {}, clock = this.sandbox.useFakeTimers();
    o.jio=JIO.newJio({type:'crypt',
                      username:'cryptremove',
                      password:'mypwd',
                      storage:{type:'local',
                               username:'cryptremovelocal',
                               applicationname:'jiotests'}});
    o.f = function (result) {
        deepEqual (result.status.getLabel(),'done','Document remove');
    };
    this.spy(o,'f');
    // encrypt with 'cryptremove:mypwd' as password
    o.doc = {name:'JqCLTjyxQqO9jwfxD/lyfGIX+qA',
             content:'LKaLZopWgML6IxERqoJ2mUyyO',
             last_modified:500,creation_date:500};
    o.jio.removeDocument('file',{max_retry:1,onResponse:o.f});
    clock.tick(1000);
    if (!o.f.calledOnce){
        ok (false, 'no response / too much results');
    }
    o.jio.stop();
});


module ('Jio ConflictManagerStorage');

test ('Simple methods', function () {
    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.spy = function(res,value,message,before) {
        o.f = function(result) {
            if (res === 'status') {
                deepEqual (result.status.getLabel(),value,message);
            } else {
                if (before) { before (result[res]); }
                deepEqual (result[res],value,message);
            }
        };
        o.t.spy(o,'f');
    };
    o.tick = function (value, tick) {
        o.clock.tick(tick || 1000);
        if (!o.f.calledOnce) {
            if (o.f.called) {
                ok(false, 'too much results');
            } else {
                ok(false, 'no response');
            }
        }
    };
    o.jio = JIO.newJio({type:'conflictmanager',
                        username:'methods',
                        storage:{type:'local',
                                 username:'conflictmethods',
                                 applicationname:'jiotests'}});
    o.spy('status','done','saving "file.doc" with owner "methods".');
    o.jio.saveDocument('file.doc','content1methods',
                       {onResponse:o.f,max_retry:1});
    o.tick();

    o.spy('value',{name:'file.doc',content:'content1methods'},
          'loading document.',function (o) {
              if (!o) { return; }
              if (o.last_modified) {
                  delete o.last_modified;
                  delete o.creation_date;
              }
          });
    o.jio.loadDocument('file.doc',{onResponse:o.f,max_retry:1});
    o.tick();

    o.spy('value',[{name:'file.doc'}],
          'getting list.',function (a) {
              var i;
              if (!a) { return; }
              for (i = 0; i < a.length; i+= 1) {
                  delete a[i].last_modified;
                  delete a[i].creation_date;
              }
          });
    o.jio.getDocumentList('.',{onResponse:o.f,max_retry:1});
    o.tick();

    o.spy('status','done','removing document');
    o.jio.removeDocument('file.doc',{onResponse:o.f,max_retry:1});
    o.tick();

    o.spy('status','fail','loading document fail.');
    o.jio.loadDocument('file.doc',{onResponse:o.f,max_retry:1});
    o.tick();

    o.jio.stop();
});

test ('Remove Errors', function () {
    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.spy = function(res,value,message,function_name) {
        function_name = function_name || 'f';
        o[function_name] = function(result) {
            if (res === 'status') {
                deepEqual (result.status.getLabel(),value,message);
            } else {
                deepEqual (result[res],value,message);
            }
        };
        o.t.spy(o,function_name);
    };
    o.tick = function (tick, function_name) {
        function_name = function_name || 'f'
        o.clock.tick(tick || 1000);
        if (!o[function_name].calledOnce) {
            if (o[function_name].called) {
                ok(false, 'too much results');
            } else {
                ok(false, 'no response');
            }
        }
    };
    o.jio_1 = JIO.newJio({type:'conflictmanager',
                          username:'1',
                          storage:{type:'local',
                                   username:'conflictrevision',
                                   applicationname:'jiotests'}});
    o.jio_2 = JIO.newJio({type:'conflictmanager',
                          username:'2',
                          storage:{type:'local',
                                   username:'conflictrevision',
                                   applicationname:'jiotests'}});
    o.spy ('status','fail','removing unexistant "file.doc" owner "1",'+
           ' error');
    o.jio_1.removeDocument('file.doc',{onResponse:o.f,max_retry:1});
    o.tick();

    o.spy ('status','done','saving "file.doc" owner "1",'+
           ' ok');
    o.jio_1.saveDocument('file.doc','content1',{onResponse:o.f,max_retry:1});
    o.tick();

    o.spy ('status','fail','removing existant "file.doc" owner "2",'+
           ' error');
    o.jio_2.removeDocument('file.doc',{onResponse:o.f,max_retry:1});
    o.tick();

    o.spy ('status','fail','removing existant "file.doc" owner "2",'+
           ' error');
    o.jio_2.removeDocument('file.doc',{onResponse:o.f,max_retry:1});
    o.tick();

    o.spy ('status','done','removing existant "file.doc" owner "1",'+
           ' error');
    o.jio_1.removeDocument('file.doc',{onResponse:o.f,max_retry:1});
    o.tick();

    o.spy ('status','done','saving "file.doc" owner "2",'+
           ' ok');
    o.jio_2.saveDocument('file.doc','content1',{onResponse:o.f,max_retry:1});
    o.tick();

    o.spy ('status','done','loading "file.doc" owner "1",'+
           ' ok');
    o.jio_1.loadDocument('file.doc',{onResponse:o.f,max_retry:1});
    o.tick();

    o.spy ('status','done','removing "file.doc" owner "1",'+
           ' ok');
    o.jio_1.removeDocument('file.doc',{onResponse:o.f,max_retry:1});
    o.tick();

    o.jio_2.stop();
    o.jio_1.stop();
});

test ('Revision Conflicts' , function () {
    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.spy = function(res,value,message,function_name) {
        function_name = function_name || 'f';
        o[function_name] = function(result) {
            if (res === 'status') {
                deepEqual (result.status.getLabel(),value,message);
            } else {
                deepEqual (result[res],value,message);
            }
        };
        o.t.spy(o,function_name);
    };
    o.tick = function (tick, function_name) {
        function_name = function_name || 'f'
        o.clock.tick(tick || 1000);
        if (!o[function_name].calledOnce) {
            if (o[function_name].called) {
                ok(false, 'too much results');
            } else {
                ok(false, 'no response');
            }
        }
    };
    o.jio_me = JIO.newJio({type:'conflictmanager',
                           username:'me',
                           storage:{type:'local',
                                    username:'conflictrevision',
                                    applicationname:'jiotests'}});
    o.jio_him = JIO.newJio({type:'conflictmanager',
                            username:'him',
                            storage:{type:'local',
                                     username:'conflictrevision',
                                     applicationname:'jiotests'}});

    o.spy('status','done','saving "file.doc" with owner "me",'+
          ' first revision, no conflict.');
    o.jio_me.saveDocument('file.doc','content1me',{onResponse:o.f,max_retry:1});
    o.tick();

    o.spy('status','done','saving "file.doc" with owner "me",'+
          ' second revision, no conflict.');
    o.jio_me.saveDocument('file.doc','content2me',{onResponse:o.f,max_retry:1});
    o.tick();

    o.spy('status','done','loading "file.doc" with owner "him",'+
          ' last revision, no conflict.');
    o.jio_him.loadDocument('file.doc',{onResponse:o.f,max_retry:1});
    o.tick();

    o.spy('status','done','saving "file.doc" with owner "him",'+
          ' next revision, no conflict.');
    o.jio_him.saveDocument('file.doc','content1him',
                           {onResponse:o.f,max_retry:1});
    o.tick();

    o.spy('status','fail','saving "file.doc" with owner "me",'+
          ' third revision, conflict!');
    o.c = function (conflict_object) {
        o.co = conflict_object;
        ok (true,'onConflict callback called once');
    };
    o.t.spy(o,'c');
    o.jio_me.saveDocument('file.doc','content3me',{
        onResponse:o.f,max_retry:1,onConflict:o.c});
    o.tick(undefined,'f');
    o.tick(0,'c');
    if (!o.co) { return ok(false,'impossible to continue the tests'); }
    o.co = undefined;

    o.spy('status','fail',"don't solve anything,"+
          ' save "file.doc" with owner "me", forth revision, conflict!');
    o.c = function (conflict_object) {
        o.co = conflict_object;
        ok (true,'onConflict callback called once');
    };
    o.t.spy(o,'c');
    o.jio_me.saveDocument('file.doc','content4me',{
        onResponse:o.f,max_retry:1,onConflict:o.c});
    o.tick();
    o.tick(0,'c');
    if (!o.co) { return ok(false,'impossible to continue the tests'); }

    o.spy('status','done','solving conflict and save "file.doc" with owner'+
          ' "me", forth revision, no conflict.');
    o.jio_me.saveDocument('file.doc','content4me',{
        onResponse:o.f,max_retry:1,known_conflict_list:[o.co]});
    o.tick();

    o.spy('status','done','removing "file.doc" with owner "me",'+
          ' no conflict.');
    o.c = o.t.spy();
    o.jio_me.removeDocument('file.doc',{onResponse:o.f,max_retry:1,
                                        onConflict:o.c});
    o.tick();
    if (o.c.called) { ok(false, 'conflict callback called!'); }

    o.spy('status','fail','saving "file.doc" with owner "him",'+
          ' any revision, conflict!');
    o.c = function (conflict_object) {
        o.co = conflict_object;
        ok (true,'onConflict callback called once');
    };
    o.t.spy(o,'c');
    o.jio_him.saveDocument('file.doc','content4him',{
        onResponse:o.f,max_retry:1,onConflict:o.c});
    o.tick();
    o.tick(0,'c');

    o.jio_me.stop();
    o.jio_him.stop();
});

test ('Solving Conflict Conflicts' , function () {
    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.spy = function(res,value,message,function_name) {
        function_name = function_name || 'f';
        o[function_name] = function(result) {
            if (res === 'status') {
                deepEqual (result.status.getLabel(),value,message);
            } else {
                deepEqual (result[res],value,message);
            }
        };
        o.t.spy(o,function_name);
    };
    o.tick = function (tick, function_name) {
        function_name = function_name || 'f'
        o.clock.tick(tick || 1000);
        if (!o[function_name].calledOnce) {
            if (o[function_name].called) {
                ok(false, 'too much results');
            } else {
                ok(false, 'no response');
            }
        }
    };
    o.jio_you = JIO.newJio({type:'conflictmanager',
                            username:'you',
                            storage:{type:'local',
                                     username:'conflictrevision',
                                     applicationname:'jiotests'}});
    o.jio_her = JIO.newJio({type:'conflictmanager',
                            username:'her',
                            storage:{type:'local',
                                     username:'conflictrevision',
                                     applicationname:'jiotests'}});

    o.spy('status','done','saving "file.doc" with owner "you",'+
          ' first revision, no conflict.');
    o.jio_you.saveDocument('file.doc','content1you',
                           {onResponse:o.f,max_retry:1});
    o.tick();

    o.spy('status','done','loading "file.doc" with owner "her",'+
          ' last revision, no conflict.');
    o.jio_her.loadDocument('file.doc',{onResponse:o.f,max_retry:1});
    o.tick();

    o.spy('status','done','saving "file.doc" with owner "her",'+
          ' next revision, no conflict.');
    o.jio_her.saveDocument('file.doc','content1her',
                           {onResponse:o.f,max_retry:1});
    o.tick();

    o.spy('status','fail','saving "file.doc" with owner "you",'+
          ' second revision, conflict!');
    o.c = function (conflict_object) {
        o.co = conflict_object;
        ok (true,'onConflict callback called once');
    };
    o.t.spy(o,'c');
    o.jio_you.saveDocument('file.doc','content3you',{
        onResponse:o.f,max_retry:1,onConflict:o.c});
    o.tick();
    o.tick(0,'c');
    if (!o.co) { return ok(false,'impossible to continue the tests'); }

    o.spy('status','done','saving "file.doc" with owner "her",'+
          ' next revision, no conflict.');
    o.jio_her.saveDocument('file.doc','content2her',
                           {onResponse:o.f,max_retry:1});
    o.tick();

    o.spy('status','fail','solving conflict and save "file.doc" with owner'+
          ' "you", fith revision, conflict!');
    o.c = function (conflict_object) {
        o.co = conflict_object;
        ok (true, 'onConflict callback called once');
    };
    o.t.spy(o,'c');
    o.jio_you.saveDocument('file.doc','content4you',{
        onResponse:o.f,max_retry:1,known_conflict_list:[o.co],onConflict:o.c});
    o.co = undefined;
    o.tick();
    o.tick(0,'c');
    if (!o.co) { return ok(false,'impossible to continue the tests'); }

    o.spy('status','done','solving conflict and save "file.doc" with owner'+
          ' "you", forth revision, no conflict.');
    o.jio_you.saveDocument('file.doc','content5you',{
        onResponse:o.f,max_retry:1,known_conflict_list:[o.co]});
    o.tick();

    o.jio_you.stop();
    o.jio_her.stop();
});

};                              // end thisfun

if (window.requirejs) {
    require.config ({
        paths: {
            jiotestsloader: './jiotests.loader',

            LocalOrCookieStorage: './testlocalorcookiestorage',
            jQueryAPI: '../lib/jquery/jquery',
            jQuery: '../js/jquery.requirejs_module',
            JIO: '../src/jio',
            Base64API: '../lib/base64/base64',
            Base64: '../js/base64.requirejs_module',
            JIODummyStorages: '../src/jio.dummystorages',
            JIOStorages: '../src/jio.storage',
            SJCLAPI:'../lib/sjcl/sjcl.min',
            SJCL:'../js/sjcl.requirejs_module'
        }
    });
    require(['jiotestsloader'],thisfun);
} else {
    thisfun ({LocalOrCookieStorage:LocalOrCookieStorage,
              JIO:jio,
              sjcl:sjcl,
              Base64:Base64,
              jQuery:jQuery});
}

}());
