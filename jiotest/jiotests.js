
//// clear jio localstorage
for (var k in LocalOrCookieStorage.getAll()) {
    var splitk = k.split('/');
    if ( splitk[0] === 'jio' )
        LocalOrCookieStorage.deleteItem(k);
}
//// end clear jio localstorage

//// Tools
var getXML = function (url) {
    var tmp = '';
    $.ajax({'url':url,async:false,
            dataType:'text',success:function(xml){tmp=xml}});
    return tmp;
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
    o.jio = JIO.createNew();
    ok ( o.jio, 'a new jio -> 1');

    o.jio2 = JIO.createNew();
    ok ( o.jio2, 'another new jio -> 2');

    ok ( JIO.addStorageType('qunit', function(){}) ,
         "adding storage type.");

    deepEqual ( o.jio.isReady(), true, '1 must be not ready');

    ok ( o.jio2.id !== o.jio.id, '1 and 2 must be different');

    deepEqual ( o.jio.stop(), true, '1 must be stopped');

    o.jio2.stop();

});

test ( 'Jio Publish/Sububscribe/Unsubscribe methods', function () {
    // Test the Publisher, Subscriber of a single jio.
    // It is just testing if these function are working correctly.
    // The test publishes an event, waits a little, and check if the
    // event has been received by the callback of the previous
    // subscribe. Then, the test unsubscribe the callback function from
    // the event, and publish the same event. If it receives the event,
    // the unsubscribe method is not working correctly.

    var o = {};
    o.jio = JIO.createNew();

    var spy1 = this.spy();

    // Subscribe the pubsub_test event.
    o.callback = o.jio.subscribe('pubsub_test',spy1);
    // And publish the event.
    o.jio.publish('pubsub_test');
    ok (spy1.calledOnce, 'subscribing & publishing, event called once');
    
    o.jio.unsubscribe('pubsub_test',spy1);
    o.jio.publish('pubsub_test');
    ok (spy1.calledOnce, 'unsubscribing, same event not called twice');
    
    o.jio.stop();
});

module ( 'Jio Dummy Storages' );

test ('All tests', function () {
    // Tests all dummy storages from jio.dummystorages.js
    // It is simple tests, but they will be used by replicate storage later
    // for sync operation.

    var o = {}, clock = this.sandbox.useFakeTimers(), t = this,
    mytest = function (message,method,retmethod,value){
        o.f = function (result) {
            deepEqual (result[retmethod],value,message);};
        t.spy(o,'f');
        o.jio[method]({'userName':'Dummy','fileName':'file',
                       'fileContent':'content','callback':o.f});
        clock.tick(510);
        if (!o.f.calledOnce)
            ok(false, 'no response / too much results');
    };
    // All Ok Dummy Storage
    o.jio = JIO.createNew({'type':'dummyallok','userName':'Dummy'},
                          {'ID':'jiotests'});
    mytest('check name availability OK','checkNameAvailability',
           'isAvailable',true);
    mytest('save document OK','saveDocument','isSaved',true);
    mytest('load document OK','loadDocument','document',
           {'fileName':'file','fileContent':'content',
            'lastModified':15000,'creationDate':10000});
    mytest('get document list OK','getDocumentList','list',
           [{'fileName':'file','creationDate':10000,'lastModified':15000},
            {'fileName':'memo','creationDate':20000,'lastModified':25000}]);
    mytest('remove document OK','removeDocument','isRemoved',true);
    o.jio.stop();
    
    // All Fail Dummy Storage
    o.jio = JIO.createNew({'type':'dummyallfail','userName':'Dummy'},
                          {'ID':'jiotests'});
    mytest('check name availability FAIL','checkNameAvailability',
           'isAvailable',false);
    mytest('save document FAIL','saveDocument','isSaved',false);
    mytest('load document FAIL','loadDocument','document',{});
    mytest('get document list FAIL','getDocumentList','list',undefined);
    mytest('remove document FAIL','removeDocument','isRemoved',false);
    o.jio.stop();

    // All Not Found Dummy Storage
    o.jio = JIO.createNew({'type':'dummyallnotfound','userName':'Dummy'},
                          {'ID':'jiotests'});
    mytest('check name availability NOT FOUND','checkNameAvailability',
           'isAvailable',true);
    mytest('save document NOT FOUND','saveDocument','isSaved',true);
    mytest('load document NOT FOUND','loadDocument','document',{});
    mytest('get document list NOT FOUND','getDocumentList','list',undefined);
    mytest('remove document NOT FOUND','removeDocument','isRemoved',true);
    o.jio.stop();
});

module ( 'Jio Job Managing' );

test ('Add 2 same jobs', function () {
    // Check possibilities when adding 2 same jobs.
    
    var o = {}, clock = this.sandbox.useFakeTimers(), id = 0;

    // Test if the second job write over the first one
    o.jio = JIO.createNew({'type':'dummyallok','userName':'dummy'},
                          {'ID':'jiotests'});
    id = o.jio.id;
    o.jio.saveDocument({'fileName':'file','fileContent':'content'});
    clock.tick(10);
    o.jio.saveDocument({'fileName':'file','fileContent':'content'});
    deepEqual(LocalOrCookieStorage.getItem(
        'jio/jobObject/'+id)['1'].date,10,
              'The first job date have to be equal to the second job date.');
    o.jio.stop();
    clock.tick(-10);
    
    // Test if the second job doesn't erase the first ongoing one
    o.jio = JIO.createNew({'type':'dummyallok','userName':'dummy'},
                          {'ID':'jiotests'});
    id = o.jio.id;
    o.jio.saveDocument({'fileName':'file','fileContent':'content'});
    clock.tick(200);
    o.jio.saveDocument({'fileName':'file','fileContent':'content'});
    ok(LocalOrCookieStorage.getItem(
        'jio/jobObject/'+id)['2'] &&
       LocalOrCookieStorage.getItem(
           'jio/jobObject/'+id)['1'].status === 'ongoing',
       'The second job must not overwrite the first ongoing one.');
    ok(LocalOrCookieStorage.getItem(
        'jio/jobObject/'+id)['2'].status === 'wait' &&
       LocalOrCookieStorage.getItem(
           'jio/jobObject/'+id)['2'].waitingFor &&
       LocalOrCookieStorage.getItem(
           'jio/jobObject/'+id)['2'].waitingFor.jobID === '1',
       'The second job must be waiting for the first to end');
    o.jio.stop();
});

test ('Restore a previous waiting job', function () {
    ok(false,'not implemented yet');
});

module ( 'Jio LocalStorage' );

test ('Check name availability', function () {
    // Test if LocalStorage can check the availabality of a name.
    // We remove MrCheckName from local storage, and checking must return true.
    // We now add MrCheckName to local storage, and checking must return false.

    var o = {}, clock = this.sandbox.useFakeTimers(), t = this,
    mytest = function (value){
        o.f = function (result) {
            deepEqual(result.isAvailable,value,'checking name availabality');};
        t.spy(o,'f');
        o.jio.checkNameAvailability(
            {'userName':'MrCheckName','callback': o.f});
        clock.tick(510);
        if (!o.f.calledOnce)
            ok(false, 'no response / too much results');
    };

    // new jio
    o.jio = JIO.createNew({'type':'local','userName':'noname'},
                          {"ID":'noid'});

    // name must be available
    LocalOrCookieStorage.deleteItem ('jio/local/MrCheckName/jiotests/file');
    mytest(true);

    // name must be unavailable
    LocalOrCookieStorage.setItem ('jio/local/MrCheckName/jiotests/file',{});
    mytest(false);

    o.jio.stop();
});

test ('Document save', function () {
    // Test if LocalStorage can save documents.
    // We launch a saving to localstorage and we check if the file is
    // realy saved. Then save again and check if 

    var o = {}, clock = this.sandbox.useFakeTimers(), t = this,
    mytest = function (message,value,lm,cd,tick){
        var tmp;
        o.f = function (result) {
            deepEqual(result.isSaved,value,message);};
        t.spy(o,'f');
        o.jio.saveDocument(
            {'fileName':'file','fileContent':'content','callback': o.f});
        if (tick === undefined) { clock.tick(510); }
        else { clock.tick(tick); }
        if (!o.f.calledOnce)
            ok(false, 'no response / too much results');
        else {
            // check content
            tmp = LocalOrCookieStorage.getItem ('jio/local/MrSaveName/jiotests/file');
            deepEqual (tmp,{'fileName':'file','fileContent':'content',
                            'lastModified':lm,'creationDate':cd},'check content');
        }
    };

    o.jio = JIO.createNew({'type':'local','userName':'MrSaveName'},
                          {"ID":'jiotests'});
    LocalOrCookieStorage.deleteItem ('jio/local/MrSaveName/jiotests/file');
    // save and check document existence
    clock.tick(200);
    mytest('saving document',true,200,200);       // value, lastmodified, creationdate
    
    // re-save and check modification date
    // 710 = 200 + 510 ms (clock tick)
    mytest('saving again',true,710,200);

    // re-save and check modification date
    // 1220 = 710 + 510 ms (clock tick)
    clock.tick(-1000);
    mytest('saving a older document',false,710,200,1510);

    o.jio.stop();
});

test ('Document load', function () {
    // Test if LocalStorage can load documents.
    // We launch a loading from localstorage and we check if the file is
    // realy loaded.

    var o = {}, clock = this.sandbox.useFakeTimers(), t = this,
    doc = {},
    mytest = function (res,value){
        o.f = function (result) {
            deepEqual(result[res],value,'loading document');};
        t.spy(o,'f');
        o.jio.loadDocument(
            {'fileName':'file','callback': o.f});
        clock.tick(510);
        if (!o.f.calledOnce)
            ok(false, 'no response / too much results');
    };
    o.jio = JIO.createNew({'type':'local','userName':'MrLoadName'},
                          {"ID":'jiotests'});
    // load a non existing file
    LocalOrCookieStorage.deleteItem ('jio/local/MrLoadName/jiotests/file');
    mytest ('status','fail');
    
    // re-load file after saving it manually
    doc = {'fileName':'file','fileContent':'content',
           'lastModified':1234,'creationDate':1000};
    LocalOrCookieStorage.setItem ('jio/local/MrLoadName/jiotests/file',doc);
    mytest ('document',doc);

    o.jio.stop();
});

test ('Get document list', function () {
    // Test if LocalStorage can get a list of documents.
    // We create 2 documents inside localStorage to check them.

    var o = {}, clock = this.sandbox.useFakeTimers(), t = this,
    doc1 = {}, doc2 = {},
    mytest = function (value){
        o.f = function (result) {
            var objectifyDocumentArray = function (array) {
                var obj = {}, k;
                for (k in array) {obj[array[k].fileName] = array[k];}
                return obj;
            };
            deepEqual (objectifyDocumentArray(result.list),
                       objectifyDocumentArray(value),'getting list');
        };
        t.spy(o,'f');
        o.jio.getDocumentList({'callback': o.f});
        clock.tick(510);
        if (!o.f.calledOnce)
            ok(false, 'no response / too much results');
    };
    o.jio = JIO.createNew({'type':'local','userName':'MrListName'},
                          {"ID":'jiotests'});
    doc1 = {'fileName':'file','fileContent':'content',
            'lastModified':1,'creationDate':0};
    doc2 = {'fileName':'memo','fileContent':'test',
            'lastModified':5,'creationDate':2};
    LocalOrCookieStorage.setItem ('jio/local/MrListName/jiotests/file',doc1);
    LocalOrCookieStorage.setItem ('jio/local/MrListName/jiotests/memo',doc2);
    delete doc1.fileContent;
    delete doc2.fileContent;
    mytest ([doc1,doc2]);

    o.jio.stop();
});

test ('Document remove', function () {
    // Test if LocalStorage can remove documents.
    // We launch a remove from localstorage and we check if the file is
    // realy removed.

    var o = {}, clock = this.sandbox.useFakeTimers(), t = this,
    mytest = function (){
        o.f = function (result) {
            deepEqual(result.isRemoved,true,'removing document');};
        t.spy(o,'f');
        o.jio.removeDocument(
            {'fileName':'file','callback': o.f});
        clock.tick(510);
        if (!o.f.calledOnce)
            ok(false, 'no response / too much results');
        else {
            // check if the file is still there
            var tmp = LocalOrCookieStorage.getItem ('jio/local/MrRemoveName/jiotests/file');
            ok (!tmp, 'check no content');
        }
    };
    o.jio = JIO.createNew({'type':'local','userName':'MrRemoveName'},
                          {"ID":'jiotests'});
    // test removing a file
    LocalOrCookieStorage.setItem ('jio/local/MrRemoveName/jiotests/file',{});
    mytest ();

    o.jio.stop();
});

module ('Jio DAVStorage');

test ('Check name availability', function () {
    // Test if DavStorage can check the availabality of a name.
    
    var o = {}, clock = this.sandbox.useFakeTimers(), t = this,
    mytest = function (value,errno) {
        var server = t.sandbox.useFakeServer();
        server.respondWith ("PROPFIND",
                            "https://ca-davstorage:8080/dav/davcheck/",
                            [errno, {'Content-Type': 'text/xml' },
                             '']);
        o.f = function (result) {
            deepEqual (result.isAvailable,value,'checking name availability');};
        t.spy(o,'f');
        o.jio.checkNameAvailability({'userName':'davcheck','callback':o.f});
        clock.tick(500);
        server.respond();
        if (!o.f.calledOnce)
            ok(false, 'no response / too much results');
    };
    
    o.jio = JIO.createNew({'type':'dav','userName':'davcheck',
                           'password':'checkpwd',
                           'location':'https://ca-davstorage:8080'},
                          {'ID':'jiotests'});
    // 404 error, the name does not exist, name is available.
    mytest (true,404);
    // 200 error, responding ok, the name already exists, name is not available.
    mytest (false,200);
    // 405 error, random error, name is not available by default.
    mytest (false,405);

    o.jio.stop();
});

test ('Document load', function () {
    // Test if DavStorage can load documents.

    var davload = getXML('responsexml/davload'),
    o = {}, clock = this.sandbox.useFakeTimers(), t = this,
    mytest = function (message,doc,errprop,errget) {
        var server = t.sandbox.useFakeServer();
        server.respondWith (
            "PROPFIND","https://ca-davstorage:8080/dav/davload/jiotests/file",
            [errprop,{'Content-Type':'text/xml; charset="utf-8"'},
             davload]);
        server.respondWith (
            "GET","https://ca-davstorage:8080/dav/davload/jiotests/file",
            [errget,{},'content']);
        o.f = function (result) {
            deepEqual (result.document,doc,message);};
        t.spy(o,'f');
        o.jio.loadDocument({'fileName':'file','callback':o.f});
        clock.tick(500);
        server.respond();
        if (!o.f.calledOnce)
            ok(false, 'no response / too much results');
    };
    o.jio = JIO.createNew({'type':'dav','userName':'davload',
                           'password':'checkpwd',
                           'location':'https://ca-davstorage:8080'},
                          {'ID':'jiotests'});
    // note: http errno:
    //     200 OK       
    //     201 Created  
    //     204 No Content
    //     207 Multi Status
    //     403 Forbidden
    //     404 Not Found
    // load an inexistant document.
    mytest ('load inexistant document',{},404,404);
    // load a document.
    mytest ('load document',{'fileName':'file','fileContent':'content',
                             'lastModified':1335953199000,
                             'creationDate':1335953202000},207,200);
    o.jio.stop();
});

test ('Document save', function () {
    // Test if DavStorage can save documents.

    var davsave = getXML('responsexml/davsave'),
    o = {}, clock = this.sandbox.useFakeTimers(), t = this,
    mytest = function (message,value,errnoput,errnoprop,
                       overwrite,force,tick) {
        var server = t.sandbox.useFakeServer();
        server.respondWith (
            // lastmodified = 7000, creationdate = 5000
            "PROPFIND","https://ca-davstorage:8080/dav/davsave/jiotests/file",
            [errnoprop,{'Content-Type':'text/xml; charset="utf-8"'},
             davsave]);
        server.respondWith ("PUT",
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
        //                     "https://ca-davstorage:8080/dav/davsave/jiotests",
        //                     [200,{},'']);
        o.f = function (result) {
            deepEqual (result.isSaved,value,message);};
        t.spy(o,'f');
        o.jio.saveDocument({'fileName':'file','fileContent':'content',
                            'options':{'force':force,'overwrite':overwrite},
                            'callback':o.f});
        clock.tick(500);
        server.respond();
        if (!o.f.calledOnce)
            ok(false, 'no response / too much results');
    };
    o.jio = JIO.createNew({'type':'dav','userName':'davsave',
                           'password':'checkpwd',
                           'location':'https://ca-davstorage:8080'},
                          {'ID':'jiotests'});
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
    mytest('create document',true,201,404);
    // the document is already exists, it is younger than the one we want
    // to save.
    mytest('younger than the one we want to save',
           false,204,207,true,false);
    // the document is already exists, it is the youngest but we want to
    // force overwriting
    mytest('youngest but force overwrite',
           true,204,207,true,true);
    clock.tick(8000);
    // the document already exists, we want to overwrite it
    mytest('overwrite document',
           true,204,207,true);
    // the document already exists, we don't want to overwrite it
    mytest('do not overwrite document',
           false,204,207,false);
    o.jio.stop();
});

test ('Get Document List', function () {
    // Test if DavStorage can get a list a document.

    var davlist = getXML('responsexml/davlist'),
    o = {}, clock = this.sandbox.useFakeTimers(), t = this,
    mytest = function (message,value,errnoprop) {
        var server = t.sandbox.useFakeServer();
        server.respondWith (
            "PROPFIND",'https://ca-davstorage:8080/dav/davlist/jiotests/',
            [errnoprop,{'Content-Type':'text/xml; charset="utf-8"'},
             davlist]);
        o.f = function (result) {
            var objectifyDocumentArray = function (array) {
                var obj = {};
                for (var k in array) {obj[array[k].fileName] = array[k];}
                return obj;
            };
            deepEqual (objectifyDocumentArray(result.list),
                       objectifyDocumentArray(value),message);
        };
        t.spy(o,'f');
        o.jio.getDocumentList({'callback':o.f});
        clock.tick(500);
        server.respond();
        if (!o.f.calledOnce)
            ok(false, 'no response / too much results');
    };
    o.jio = JIO.createNew({'type':'dav','userName':'davlist',
                           'password':'checkpwd',
                           'location':'https://ca-davstorage:8080'},
                          {'ID':'jiotests'});
    mytest('fail to get list',undefined,404);
    mytest('getting list',[{'fileName':'file','creationDate':1335962911000,
                            'lastModified':1335962907000},
                           {'fileName':'memo','creationDate':1335894073000,
                            'lastModified':1335955713000}],207);
    o.jio.stop();
});

test ('Remove document', function () {
    // Test if DavStorage can remove documents.

    var o = {}, clock = this.sandbox.useFakeTimers(), t = this,
    mytest = function (message,value,errnodel) {
        var server = t.sandbox.useFakeServer();
        server.respondWith (
            "DELETE","https://ca-davstorage:8080/dav/davremove/jiotests/file",
            [errnodel,{},'']);
        o.f = function (result) {
            deepEqual (result.isRemoved,value,message);};
        t.spy(o,'f');
        o.jio.removeDocument({'fileName':'file','callback':o.f});
        clock.tick(500);
        server.respond();
        if (!o.f.calledOnce)
            ok(false, 'no response / too much results');
    };
    o.jio = JIO.createNew({'type':'dav','userName':'davremove',
                           'password':'checkpwd',
                           'location':'https://ca-davstorage:8080'},
                          {'ID':'jiotests'});
    
    mytest('remove document',true,204)
    mytest('remove an already removed document',true,404)
    o.jio.stop();
});

module ('Jio ReplicateStorage');

test ('Check name availability', function () {
    // Tests the replicate storage
    // method : checkNameAvailability
    // It will test all the possibilities that could cause a server,
    // like synchronisation problem...

    var o = {}, clock = this.sandbox.useFakeTimers(), t = this,
    mytest = function (message,value) {
        o.f = function (result) {
            deepEqual (result.isAvailable,value,message)};
        t.spy(o,'f');
        o.jio.checkNameAvailability({'userName':'Dummy','callback':o.f});
        clock.tick(1000);
        if (!o.f.calledOnce)
            ok(false,'no respose / too much results');
    };
    // DummyStorageAllOK,OK
    o.jio = JIO.createNew({'type':'replicate','storageArray':[
        {'type':'dummyallok'},{'type':'dummyallok'}]},
                          {'ID':'jiotests'});
    mytest('DummyStoragesAllOK,OK : name available',true);
    o.jio.stop();
    // DummyStorageAllOK,Fail
    o.jio = JIO.createNew({'type':'replicate','storageArray':[
        {'type':'dummyallok'},{'type':'dummyallfail'}]},
                          {'ID':'jiotests'});
    mytest('DummyStoragesAllOK,Fail : name not available',false);
    o.jio.stop();
    // DummyStorageAllFail,OK
    o.jio = JIO.createNew({'type':'replicate','storageArray':[
        {'type':'dummyallfail'},{'type':'dummyallok'}]},
                          {'ID':'jiotests'});
    mytest('DummyStoragesAllFail,OK : name not available',false);
    o.jio.stop();
    // DummyStorageAllFail,Fail
    o.jio = JIO.createNew({'type':'replicate','storageArray':[
        {'type':'dummyallfail'},{'type':'dummyallfail'}]},
                          {'ID':'jiotests'});
    mytest('DummyStoragesAllFail,Fail : name not available',false);
    o.jio.stop();
});

// test ('Document load', function () {
//     // Test if DavStorage can load documents.

//     var o = {}; var clock = this.sandbox.useFakeTimers(); var t = this;
//     var mytest = function (message,doc) {
//         o.f = function (result) {
//             deepEqual (result.document,doc,message);};
//         t.spy(o,'f');
//         o.jio.loadDocument({'fileName':'file','callback':o.f});
//         clock.tick(1000);
//         server.respond();
//         if (!o.f.calledOnce)
//             ok(false, 'no response / too much results');
//     };
//     o.jio = JIO.createNew({'type':'replicate','userName':'Dummy'},
//                           {'ID':'jiotests'});
    
//     o.jio.stop();
// });