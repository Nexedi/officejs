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
    var d = document.createElement ('div');
    d.setAttribute('id','log');
    document.querySelector ('body').appendChild(d);
}());
//// end clear jio localstorage

//// Tools
var empty_fun = function (){},
contains = function (array,content) {
    var i;
    if (typeof array !== 'object') {
        return undefined;
    }
    for (i = 0; i < array.length || 0; i+= 1) {
        if (array[i] === content) {
            return true;
        }
    }
    return false;
},
base_tick = 30000,
basic_test_function_generator = function(o,res,value,message) {
    return function(err,val) {
        var jobstatus = (err?'fail':'done');
        switch (res) {
        case 'status':
            err = err || {}; val = err.status;
            break;
        case 'jobstatus':
            val = jobstatus;
            break;
        case 'value':
            val = err || val;
            break;
        default:
            return;
        }
        deepEqual (val,value,message);
    };
},
basic_spy_function = function(o,res,value,message,fun) {
    fun = fun || 'f';
    o[fun] = basic_test_function_generator(o,res,value,message);
    o.t.spy(o,fun);
},
basic_tick_function = function (o) {
    var tick, fun, i = 1;
    tick = 1000;
    fun = fun || 'f';
    if (typeof arguments[i] === 'number') {
        tick = arguments[i]; i++;
    }
    if (typeof arguments[i] === 'string') {
        fun = arguments[i]; i++;
    }
    o.clock.tick(tick);
    if (!o[fun].calledOnce) {
        if (o[fun].called) {
            ok(false, 'too much results (o.' + fun +')');
        } else {
            ok(false, 'no response (o.' + fun +')');
        }
    }
},
// debug function to show custumized log at the bottom of the page
my_log = function (html_string) {
    document.querySelector ('div#log').innerHTML += html_string + '<hr/>';
},
getXML = function (url) {
    var tmp = '';
    $.ajax({'url':url,async:false,
            dataType:'text',success:function(xml){tmp=xml;}});
    return tmp;
},
objectifyDocumentArray = function (array) {
    var obj = {}, k;
    for (k = 0; k < array.length; k += 1) {
        obj[array[k].id] = array[k];
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
            'jio/local_file_name_array/'+user+'/'+appid,[file._id]);
    } else {
        filenamearray =
            LocalOrCookieStorage.getItem(
                'jio/local_file_name_array/'+user+'/'+appid) || [];
        filenamearray.push(file._id);
        LocalOrCookieStorage.setItem(
            'jio/local_file_name_array/'+user+'/'+appid,
            filenamearray);
        LocalOrCookieStorage.setItem(
            'jio/local/'+user+'/'+appid+'/'+file._id,
            file);
    }
    LocalOrCookieStorage.setItem(
        'jio/local/'+user+'/'+appid+'/'+file._id,
        file);
},
removeFileFromLocalStorage = function (user,appid,file) {
    var i, l, newarray = [],
    filenamearray =
        LocalOrCookieStorage.getItem(
            'jio/local_file_name_array/'+user+'/'+appid) || [];
    for (i = 0, l = filenamearray.length; i < l; i+= 1) {
        if (filenamearray[i] !== file._id) {
            newarray.push(filenamearray[i]);
        }
    }
    LocalOrCookieStorage.setItem('jio/local_file_name_array/'+user+'/'+appid,
                                 newarray);
    LocalOrCookieStorage.deleteItem(
        'jio/local/'+user+'/'+appid+'/'+file._id);
};
//// end tools

//// QUnit Tests ////

module ('Jio Global tests');

test ( "Jio simple methods", function () {
    var clock = this.sandbox.useFakeTimers(); clock.tick(base_tick);
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

    JIO.addStorageType('qunit', empty_fun);

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
    o.clock.tick(base_tick);
    o.spy = basic_spy_function;
    o.tick = basic_tick_function;
    // All Ok Dummy Storage
    o.jio = JIO.newJio({'type':'dummyallok'});
    // save
    o.spy(o,'value',{ok:true,id:'file'},'dummyallok saving');
    o.jio.put({_id:'file',content:'content'},o.f);
    o.tick(o);
    // load
    o.spy(o,'value',{_id:'file',content:'content',_last_modified:15000,
                     _creation_date:10000},'dummyallok loading');
    o.jio.get('file',o.f);
    o.tick(o);
    // remove
    o.spy(o,'value',{ok:true,id:"file"},'dummyallok removing');
    o.jio.remove({_id:'file'},o.f);
    o.tick(o);
    // get list
    o.spy (o,'value',{
        total_rows:2,
        rows:[{
            id:'file',key:'file',
            value:{
                content:'filecontent',
                _last_modified:15000,
                _creation_date:10000
            }
        },{
            id:'memo',key:'memo',
            value:{
                content:'memocontent',
                _last_modified:25000,
                _creation_date:20000
            }
        }]
    },'dummyallok getting list');
    o.jio.allDocs({metadata_only:false},o.f);
    o.tick(o);
    o.jio.stop();


    o.jio = JIO.newJio({'type':'dummyallok'});
    // save
    o.spy(o,'value',{ok:true,id:'file'},'dummyallok saving1','f');
    o.spy(o,'value',{ok:true,id:'file2'},'dummyallok saving2','f2');
    o.spy(o,'value',{ok:true,id:'file3'},'dummyallok saving3','f3');
    o.jio.put({_id:'file',content:'content'},o.f);
    o.jio.put({_id:'file2',content:'content2'},o.f2);
    o.jio.put({_id:'file3',content:'content3'},o.f3);
    o.tick(o, 1000, 'f');
    o.tick(o, 'f2');
    o.tick(o, 'f3');
    o.jio.stop();


    // All Fail Dummy Storage
    o.jio = JIO.newJio({'type':'dummyallfail'});
    // save
    o.spy (o,'status',0,'dummyallfail saving');
    o.jio.put({_id:'file',content:'content'},o.f);
    o.tick(o);
    // load
    o.spy (o,'status',0,'dummyallfail loading');
    o.jio.get('file',o.f);
    o.tick(o);
    // remove
    o.spy (o,'status',0,'dummyallfail removing');
    o.jio.remove({_id:'file'},o.f);
    o.tick(o);
    // get list
    o.spy (o,'status',0,'dummyallfail getting list');
    o.jio.allDocs(o.f);
    o.tick(o);
    o.jio.stop();

    // All Not Found Dummy Storage
    o.jio = JIO.newJio({'type':'dummyallnotfound'});
    // save
    o.spy(o,'value',{ok:true,id:'file'},'dummyallnotfound saving');
    o.jio.put({_id:'file',content:'content'},o.f);
    o.tick(o);
    // load
    o.spy(o,'status',404,'dummyallnotfound loading')
    o.jio.get('file',o.f);
    o.tick(o);
    // remove
    o.spy(o,'value',{ok:true,id:'file'},'dummyallnotfound removing');
    o.jio.remove({_id:'file'},o.f);
    o.tick(o);
    // get list
    o.spy(o,'status',404,'dummyallnotfound getting list');
    o.jio.allDocs (o.f);
    o.tick(o);
    o.jio.stop();
});

module ( 'Jio Job Managing' );

test ('Simple Job Elimination', function () {
    var clock = this.sandbox.useFakeTimers(); clock.tick(base_tick);
    var o = {}, id = 0;
    o.f1 = this.spy(); o.f2 = this.spy();

    o.jio = JIO.newJio({type:'dummyallok',applicationname:'jiotests'});
    id = o.jio.getId();
    o.jio.put({_id:'file',content:'content'},
              {max_retry:1},o.f1);
    ok(LocalOrCookieStorage.getItem('jio/job_array/'+id)[0],
       'job creation');
    o.jio.remove({_id:'file'},{max_retry:1},o.f2);
    o.tmp = LocalOrCookieStorage.getItem('jio/job_array/'+id)[0];
    deepEqual(o.tmp.command.label,'remove','job elimination');
    o.jio.stop();
});

test ('Simple Job Replacement', function () {
    // Test if the second job write over the first one

    var o = {};
    o.clock = this.sandbox.useFakeTimers();
    o.clock.tick(base_tick);
    o.id = 0;
    o.f1 = function (err,val) {
        if (err) {
            o.err = err;
        } else {
            o.err = {status:'done'};
        }
    };
    this.spy(o,'f1');
    o.f2 = this.spy();

    o.jio = JIO.newJio({type:'dummyallok',applicationname:'jiotests'});
    o.id = o.jio.getId();
    o.jio.put({_id:'file',content:'content'},o.f1);
    o.clock.tick(10);
    o.jio.put({_id:'file',content:'content'},o.f2);
    deepEqual(LocalOrCookieStorage.getItem(
        'jio/job_array/'+o.id)[0].date,base_tick + 10,
              'The first job date have to be equal to the second job date.');
    o.clock.tick(1000);
    deepEqual([o.f1.calledOnce,o.err.status],[true,12],
       'callback for the first save request -> result fail');
    ok(o.f2.calledOnce,'second callback is called once');
    o.jio.stop();

    o.jio = JIO.newJio({type:'dummyallok',applicationname:'jiotests'});
    o.ok1 = 0;
    o.jio.get('file1',function (err,val) {
        deepEqual (err || val,
                   {_id:'file1',content:'content',
                    _creation_date:10000,_last_modified:15000},
                   'First load');
        o.ok1 ++;
    });
    o.ok2 = 0;
    o.jio.get('file2',function (err,val) {
        deepEqual (err || val,
                   {_id:'file2',content:'content',
                    _creation_date:10000,_last_modified:15000},
                   'Second load must not replace the first one');
        o.ok2 ++;
    });
    o.clock.tick(1000);
    if (o.ok1 !== 1) {
        ok (false,'no response / too much response');
    }
    if (o.ok2 !== 1) {
        ok (false,'no response / too much response');
    }
    o.jio.stop();
});

test ('Simple Job Waiting', function () {
    // Test if the second job doesn't erase the first on going one

    var o = {};
    o.clock = this.sandbox.useFakeTimers();
    o.clock.tick(base_tick);
    o.id = 0;
    o.f = function (err,val) {
        deepEqual(err || val,{ok:true,id:'file'},'job 1 result');
    };
    o.f3 = o.f; this.spy(o,'f3');
    o.f4 = o.f; this.spy(o,'f4');
    o.checkCallback = function (fun_name,message) {
        if (!o[fun_name].calledOnce) {
            if (o[fun_name].called) {
                ok(false, 'too much response');
            } else {
                ok(false, 'no response');
            }
        } else {
            ok(true,message);
        }
    };

    o.jio = JIO.newJio({type:'dummyallok',applicationname:'jiotests'});
    o.id = o.jio.getId();
    o.jio.put({_id:'file',content:'content'},o.f3);
    o.clock.tick(200);
    o.jio.put({_id:'file',content:'content1'},o.f4);

    o.tmp0 = LocalOrCookieStorage.getItem('jio/job_array/'+o.id)[0];
    o.tmp1 = LocalOrCookieStorage.getItem('jio/job_array/'+o.id)[1];

    ok(o.tmp0 && o.tmp0.id === 1,'job 1 exists');
    deepEqual(o.tmp0.status.label,'on going','job 1 is on going');
    ok(o.tmp1 && o.tmp1.id === 2,'job 2 exists');
    deepEqual(o.tmp1.status.label,'wait','job 2 waiting');
    deepEqual(o.tmp1.status.waitforjob,[1],
              'job 2 must wait for the first to end');

    o.clock.tick(1000);
    o.checkCallback('f3','first request passed');
    o.checkCallback('f4','restore waiting job');

    o.jio.stop();
});

test ('Simple Time Waiting' , function () {
    // Test if the job that have fail wait until a certain moment to restart.
    // It will use the dummyall3tries, which will work after the 3rd try.

    var o = {}, clock = this.sandbox.useFakeTimers(), id = 0;
    clock.tick(base_tick);
    o.f = function (err,val) {
        if (err) {
            o.res = err;
        } else {
            o.res = val;
        }
    };
    this.spy(o,'f');
    o.jio = JIO.newJio({type:'dummyall3tries',applicationname:'jiotests'});
    o.jio.put({_id:'file',content:'content'},{max_retry:3},o.f);
    clock.tick(10000);
    if (!o.f.calledOnce) {
        if (o.f.called) {
            ok(false,'callback called too much times.');
        } else {
            ok(false,'no response.');
        }
    }
    deepEqual(o.res,{ok:true,id:'file'},'job done.');
    o.jio.stop();
});

module ( 'Jio Restore');

test ('Restore old Jio', function() {
    var o = {};
    o.clock = this.sandbox.useFakeTimers();
    o.f = function() {
        ok(false,'must never be called!');
    };
    this.spy(o,'f');
    o.jio = JIO.newJio({type:'dummyall3tries',applicationname:'jiotests'});
    o.id = o.jio.getId();
    ok(true,'create jio, id = ' + o.id);
    o.jio.put({_id:'file',content:'content'},{max_retry:3},o.f);
    o.clock.tick(1000);
    o.jio.close();
    o.jio = JIO.newJio({type:'dummyallok',applicationname:'jiotests'});
    o.clock.tick(11000);        // 10 sec
    deepEqual(LocalOrCookieStorage.getItem('jio/job_array/'+o.id),null,
              'job array list must be empty');
    o.tmp1 = LocalOrCookieStorage.getItem('jio/job_array/'+o.jio.getId());
    if (o.tmp1.length > 0) {
        deepEqual([o.tmp1[0].command.label,o.tmp1[0].command.doc._id,
                   o.tmp1[0].command.doc.content],
                  ['put','file','content'],
                  'job which id is id = ' +o.jio.getId()+', restored the jio');
    } else {
        ok (false, 'The recovered job must exists');
    }
    o.jio.stop();
});

module ( 'Jio LocalStorage' );

test ('Document save', function () {
    // Test if LocalStorage can save documents.
    // We launch a saving to localstorage and we check if the file is
    // realy saved. Then save again and check if

    var o = {}; o.t = this; o.clock = o.t.sandbox.useFakeTimers();
    o.clock.tick(base_tick);
    o.spy = basic_spy_function;
    o.tick = function (o, tick, value, fun) {
        basic_tick_function(o,tick,fun);
        o.tmp =
            LocalOrCookieStorage.getItem ('jio/local/MrSaveName/jiotests/file');
        if (o.tmp) {
            o.tmp.lmcd = (o.tmp._last_modified === o.tmp._creation_date);
            delete o.tmp._last_modified;
            delete o.tmp._creation_date;
            deepEqual (o.tmp,{_id:'file',content:'content',lmcd:value},
                       'check saved document');
        } else {
            ok (false, 'document is not saved!');
        }
    };

    o.jio = JIO.newJio({type:'local',username:'MrSaveName',
                        applicationname:'jiotests'});
    // save and check document existence
    o.spy (o,'value',{ok:true,id:'file'},'saving document');
    o.jio.put({_id:'file',content:'content'},o.f);
    o.tick(o,null,true);

    o.spy (o,'value',{ok:true,id:'file'},'saving document');
    o.jio.put({_id:'file',content:'content'},o.f);
    o.tick(o,null,false);

    o.jio.stop();
});

test ('Document load', function () {
    // Test if LocalStorage can load documents.
    // We launch a loading from localstorage and we check if the file is
    // realy loaded.

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.clock.tick(base_tick);
    o.spy = basic_spy_function;
    o.tick = basic_tick_function;

    o.jio = JIO.newJio({type:'local',username:'MrLoadName',
                        applicationname:'jiotests'});
    // save and check document existence
    o.doc = {_id:'file',content:'content',
             _last_modified:1234,_creation_date:1000};

    o.spy(o,'status',404,'loading document failure');
    o.jio.get('file',o.f);
    o.tick(o);

    addFileToLocalStorage('MrLoadName','jiotests',o.doc);
    o.spy(o,'value',o.doc,'loading document success');
    o.jio.get('file',o.f);
    o.tick(o);

    o.jio.stop();
});

test ('Get document list', function () {
    // Test if LocalStorage can get a list of documents.
    // We create 2 documents inside localStorage to check them.

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.clock.tick(base_tick);
    o.mytest = function (value){
        o.f = function (err,val) {
            if (val) {
                deepEqual (objectifyDocumentArray(val.rows),
                           objectifyDocumentArray(value),'getting list');
            } else {
                deepEqual (err,value,'getting list');
            }
        };
        o.t.spy(o,'f');
        o.jio.allDocs(o.f);
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
    o.doc1 = {_id:'file',content:'content',
              _last_modified:1,_creation_date:0};
    o.doc2 = {_id:'memo',content:'test',
              _last_modified:5,_creation_date:2};
    addFileToLocalStorage ('MrListName','jiotests',o.doc1);
    addFileToLocalStorage ('MrListName','jiotests',o.doc2);
    o.mytest ([{
        id:o.doc2._id,key:o.doc2._id,
        value:{
            _creation_date:o.doc2._creation_date,
            _last_modified:o.doc2._last_modified
        }
    },{
        id:o.doc1._id,key:o.doc1._id,
        value:{
            _last_modified:o.doc1._last_modified,
            _creation_date:o.doc1._creation_date
        }
    }]);

    o.jio.stop();
});

test ('Document remove', function () {
    // Test if LocalStorage can remove documents.
    // We launch a remove from localstorage and we check if the file is
    // realy removed.

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.clock.tick(base_tick);
    o.spy = basic_spy_function;
    o.tick = function () {
        basic_tick_function.apply(basic_tick_function,arguments);
        // check if the file is still there
        o.tmp = LocalOrCookieStorage.getItem (
            'jio/local/MrRemoveName/jiotests/file');
        ok (!o.tmp, 'check no content');
    };

    o.jio = JIO.newJio({type:'local',username:'MrRemoveName',
                        applicationname:'jiotests'});
    // test removing a file
    o.spy (o,'value',{ok:true,id:'file'},'removing document');
    addFileToLocalStorage ('MrRemoveName','jiotests',{_id:'file'});
    o.jio.remove({_id:'file'},o.f);
    o.tick (o);

    o.jio.stop();
});

module ('Jio DAVStorage');

test ('Document load', function () {
    // Test if DavStorage can load documents.

    var o = {};
    o.davload = getXML('responsexml/davload'),
    o.clock = this.sandbox.useFakeTimers();
    o.clock.tick(base_tick);
    o.t = this;
    o.mytest = function (message,doc,errprop,errget) {
        var server = o.t.sandbox.useFakeServer();
        server.respondWith (
            "PROPFIND","https://ca-davstorage:8080/davload/jiotests/file",
            [errprop,{'Content-Type':'text/xml; charset="utf-8"'},
             o.davload]);
        server.respondWith (
            "GET","https://ca-davstorage:8080/davload/jiotests/file",
            [errget,{},'content']);
        o.f = function (err,val) {
            if (err) {
                err = err.status;
            }
            deepEqual (err || val,doc,message);
        };
        o.t.spy(o,'f');
        o.jio.get('file',{max_retry:1},o.f);
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
    o.mytest ('load inexistant document',404,404,404);
    // load a document.
    o.mytest ('load document',{_id:'file',content:'content',
                               _last_modified:1335953199000,
                               _creation_date:1335953202000},207,200);
    o.jio.stop();
});

test ('Document save', function () {
    // Test if DavStorage can save documents.

    var o = {};
    o.davsave = getXML('responsexml/davsave');
    o.clock = this.sandbox.useFakeTimers();
    o.clock.tick(base_tick);
    o.t = this;
    o.mytest = function (message,value,errnoput,errnoprop) {
        var server = o.t.sandbox.useFakeServer();
        server.respondWith (
            // lastmodified = 7000, creationdate = 5000
            "PROPFIND","https://ca-davstorage:8080/davsave/jiotests/file",
            [errnoprop,{'Content-Type':'text/xml; charset="utf-8"'},
             o.davsave]);
        server.respondWith (
            "PUT",
            "https://ca-davstorage:8080/davsave/jiotests/file",
            [errnoput, {'Content-Type':'x-www-form-urlencoded'},
             'content']);
        server.respondWith (
            "GET","https://ca-davstorage:8080/davsave/jiotests/file",
            [errnoprop===207?200:errnoprop,{},'content']);
        // server.respondWith ("MKCOL","https://ca-davstorage:8080/dav",
        //                     [200,{},'']);
        // server.respondWith ("MKCOL","https://ca-davstorage:8080/dav/davsave",
        //                     [200,{},'']);
        // server.respondWith ("MKCOL",
        //                    "https://ca-davstorage:8080/dav/davsave/jiotests",
        //                     [200,{},'']);
        o.f = basic_test_function_generator(o,'value',value,message);
        o.t.spy(o,'f');
        o.jio.put({_id:'file',content:'content'},o.f);
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
    o.mytest('create document',{ok:true,id:'file'},201,404);
    o.clock.tick(8000);
    // the document already exists, we want to overwrite it
    o.mytest('overwrite document',{ok:true,id:'file'},204,207);
    o.jio.stop();
});

test ('Get Document List', function () {
    // Test if DavStorage can get a list a document.

    var o = {};
    o.davlist = getXML('responsexml/davlist');
    o.clock = this.sandbox.useFakeTimers();
    o.clock.tick(base_tick);
    o.t = this;
    o.mytest = function (message,metadata_only,value,errnoprop) {
        var server = o.t.sandbox.useFakeServer();
        server.respondWith (
            "PROPFIND",'https://ca-davstorage:8080/davlist/jiotests/',
            [errnoprop,{'Content-Type':'text/xml; charset="utf-8"'},
             o.davlist]);
        server.respondWith (
            "GET","https://ca-davstorage:8080/davlist/jiotests/file",
            [200,{},'content']);
        server.respondWith (
            "GET","https://ca-davstorage:8080/davlist/jiotests/memo",
            [200,{},'content2']);
        o.f = function (err,val) {
            if (err) {
                result = undefined;
            } else {
                deepEqual (objectifyDocumentArray(val.rows),
                           objectifyDocumentArray(value),message);
                return;
            }
            deepEqual (result, value, message);
        };
        o.t.spy(o,'f');
        o.jio.allDocs({metadata_only:metadata_only},o.f);
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
    o.mytest('fail to get list',true,undefined,404);
    o.mytest('getting list',true,[{
        id:'file',key:'file',
        value:{
            _creation_date:1335962911000,
            _last_modified:1335962907000
        }
    },{
        id:'memo',key:'memo',
        value:{
            _creation_date:1335894073000,
            _last_modified:1335955713000
        }
    }],207);
    o.mytest('getting list',false,[{
        id:'file',key:'file',
        value:{
            content:'content',
            _creation_date:1335962911000,
            _last_modified:1335962907000
        }
    },{
        id:'memo',key:'memo',
        value:{
            content:'content2',
            _creation_date:1335894073000,
            _last_modified:1335955713000
        }
    }],207);
    o.jio.stop();
});

test ('Remove document', function () {
    // Test if DavStorage can remove documents.

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.clock.tick(base_tick);
    o.mytest = function (message,value,errnodel) {
        var server = o.t.sandbox.useFakeServer();
        server.respondWith (
            "DELETE","https://ca-davstorage:8080/davremove/jiotests/file",
            [errnodel,{},'']);
        o.f = function (err,val) {
            if (err) {
                err = err.status;
            }
            deepEqual (err || val,value,message);
        };
        o.t.spy(o,'f');
        o.jio.remove({_id:'file'},o.f);
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
                        applicationname:'jiotests'});

    o.mytest('remove document',{ok:true,id:'file'},204);
    o.mytest('remove an already removed document',404,404);
    o.jio.stop();
});

module ('Jio ReplicateStorage');

test ('Document load', function () {
    // Test if ReplicateStorage can load several documents.

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.clock.tick(base_tick);
    o.mytest = function (message,doc,doc2) {
        o.f = function (result) {
            var gooddoc = doc;
            if (result && !result.status) {
                if (doc2 && result.content === doc2.content) {
                    gooddoc = doc2;
                }
            }
            deepEqual (result,gooddoc,message);
        };
        o.t.spy(o,'f');
        o.jio.loadDocument('file',{success:o.f,error:o.f,max_retry:3});
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
        {type:'dummyallok',username:'2'}]});
    o.mytest('DummyStorageAllOK,OK: load same file',{
        name:'file',content:'content',
        last_modified:15000,
        creation_date:10000});
    o.jio.stop();

    o.jio = JIO.newJio({type:'replicate',storagelist:[
        {type:'dummyall3tries'},
        {type:'dummyallok'}]});
    o.mytest('DummyStorageAllOK,3tries: load 2 different files',
             {
                 name:'file',content:'content',
                 last_modified:15000,creation_date:10000
             },{
                 name:'file',content:'content2',
                 last_modified:17000,creation_date:11000
             });

    o.jio.stop();
});

test ('Document save', function () {
    // Test if ReplicateStorage can save several documents.

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.clock.tick(base_tick);
    o.mytest = function (message,value) {
        o.f = function (result) {
            if (!result) {
                result = 'done';
            } else {
                result = 'fail';
            }
            deepEqual (result,value,message);
        };
        o.t.spy(o,'f');
        o.jio.saveDocument('file','content',{
            success:o.f,error:o.f,max_retry:3});
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
    o.clock.tick(base_tick);
    o.mytest = function (message,value) {
        o.f = function (result) {
            deepEqual (objectifyDocumentArray(result),
                       objectifyDocumentArray(value),message);
        };
        o.t.spy(o,'f');
        o.jio.getDocumentList('.',{success:o.f,error:o.f,max_retry:3});
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
    o.clock.tick(base_tick);
    o.mytest = function (message,value) {
        o.f = function (result) {
            if (!result) {
                result = 'done';
            } else {
                result = 'fail';
            }
            deepEqual (result,value,message);
        };
        o.t.spy(o,'f');
        o.jio.removeDocument('file',{success:o.f,error:o.f,max_retry:3});
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
    o.clock.tick(base_tick);
    o.jio = JIO.newJio({type:'indexed',storage:{type:'dummyall3tries'}});
    // loading must take long time with dummyall3tries
    o.f = this.spy();
    o.jio.loadDocument('memo',{max_retry:3,success:o.f,error:o.f,
                               metadata_only:true});
    o.clock.tick(1000);
    ok(!o.f.called,'Callback must not be called');
    // wait long time too retreive list
    o.clock.tick(10000);

    // now we can test if the document metadata are loaded faster.
    o.doc = {name:'memo',last_modified:25000,creation_date:20000};
    o.f2 = function (result) {
        deepEqual (result,o.doc,'Document metadata retrieved');
    };
    this.spy(o,'f2');
    o.jio.loadDocument('memo',{max_retry:3,success:o.f2,error:o.f2,
                               metadata_only:true});
    o.clock.tick(1000);
    if (!o.f2.calledOnce) {
        ok (false, 'no response / too much results');
    }

    // test a simple document loading
    o.doc2 = {name:'file',last_modified:17000,
              creation_date:11000,content:'content2'};
    o.f3 = function (result) {
        deepEqual (result,o.doc2,'Simple document loading');
    };
    this.spy(o,'f3');
    o.jio.loadDocument('file',{max_retry:3,success:o.f3,error:o.f3});
    o.clock.tick(2000);
    if (!o.f3.calledOnce) {
        ok (false, 'no response / too much results');
    }
    o.jio.stop();
});

test ('Document save', function () {
    var o = {}; o.clock = this.sandbox.useFakeTimers();
    o.clock.tick(base_tick);
    o.jio = JIO.newJio({type:'indexed',
                        storage:{type:'dummyall3tries',
                                 username:'indexsave'}});
    o.f = function (result) {
        if (!result) {
            result = 'done';
        } else {
            result = 'fail';
        }
        deepEqual (result,'done','document save');
    };
    this.spy(o,'f');
    o.jio.saveDocument('file','content',{max_retry:3,success:o.f,error:o.f});
    o.clock.tick(10000);
    if (!o.f.calledOnce){
        ok (false, 'no response / too much results');
    }
    o.jio.stop();
});

test ('Get document list', function () {
    var o = {}; o.clock = this.sandbox.useFakeTimers();
    o.clock.tick(base_tick);
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
    o.clock.tick(10000);
    // now we can test if the document list is loaded faster
    o.f2 = function (result) {
        deepEqual (result,[o.doc1,o.doc2],'get document list');
    };
    this.spy(o,'f2');
    o.jio.getDocumentList('.',{max_retry:3,success:o.f2,error:o.f2});
    o.clock.tick(1000)
    if (!o.f2.calledOnce) {
        ok (false, 'no response / too much results');
    }
});

test ('Remove document', function () {
    var o = {}; o.clock = this.sandbox.useFakeTimers();
    o.clock.tick(base_tick);
    o.jio = JIO.newJio({type:'indexed',
                        storage:{type:'dummyall3tries',
                                 username:'indexremove'}});
    o.f = function (result) {
        if (!result) {
            result = 'done';
        } else {
            result = 'fail';
        }
        deepEqual (result,'done','document remove');
    };
    this.spy(o,'f');
    o.jio.removeDocument('file',{max_retry:3,success:o.f,error:o.f});
    o.clock.tick(10000);
    if (!o.f.calledOnce){
        ok (false, 'no response / too much results');
    }
    o.jio.stop();
});

module ('Jio CryptedStorage');

test ('Document save' , function () {
    var o = {}, clock = this.sandbox.useFakeTimers();
    clock.tick(base_tick);
    o.jio=JIO.newJio({type:'crypt',
                      username:'cryptsave',
                      password:'mypwd',
                      storage:{type:'local',
                               username:'cryptsavelocal',
                               applicationname:'jiotests'}});
    o.f = function (result) {
        if (!result) {
            result = 'done';
        } else {
            result = 'fail';
        }
        deepEqual (result,'done','save ok');
    };
    this.spy(o,'f');
    o.jio.saveDocument('testsave','contentoftest',{success:o.f,error:o.f});
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

test ('Document load' , function () {
    var o = {}, clock = this.sandbox.useFakeTimers();
    clock.tick(base_tick);
    o.jio=JIO.newJio({type:'crypt',
                      username:'cryptload',
                      password:'mypwd',
                      storage:{type:'local',
                               username:'cryptloadlocal',
                               applicationname:'jiotests'}});
    o.f = function (result) {
        if (result && !result.status) {
            deepEqual (result,
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
    o.jio.loadDocument('testload',{success:o.f,error:o.f});
    clock.tick(1000);
    if (!o.f.calledOnce) {
        ok (false, 'no response / too much results');
    }
    o.jio.stop();
});

test ('Get Document List', function () {
    var o = {}, clock = this.sandbox.useFakeTimers();
    clock.tick(base_tick);
    o.jio=JIO.newJio({type:'crypt',
                      username:'cryptgetlist',
                      password:'mypwd',
                      storage:{type:'local',
                               username:'cryptgetlistlocal',
                               applicationname:'jiotests'}});
    o.f = function (result) {
        if (result && !result.status) {
            deepEqual (objectifyDocumentArray(result),
                       objectifyDocumentArray(o.doc_list),'Getting list');
        } else {
            ok (false, 'Cannot get list');
        }
    };
    o.tick = function (tick) {
        clock.tick (tick || 1000);
        if (!o.f.calledOnce) {
            if (o.f.called) {
                ok (false, 'too much results');
            } else {
                ok (false, 'no response');
            }
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
    o.jio.getDocumentList('.',{success:o.f,error:o.f});
    o.tick(10000);

    o.jio.stop();
});

test ('Remove document', function () {
    var o = {}, clock = this.sandbox.useFakeTimers();
    clock.tick(base_tick);
    o.jio=JIO.newJio({type:'crypt',
                      username:'cryptremove',
                      password:'mypwd',
                      storage:{type:'local',
                               username:'cryptremovelocal',
                               applicationname:'jiotests'}});
    o.f = function (result) {
        if (!result) {
            result = 'done';
        } else {
            result = 'fail';
        }
        deepEqual (result,'done','Document remove');
    };
    this.spy(o,'f');
    // encrypt with 'cryptremove:mypwd' as password
    o.doc = {name:'JqCLTjyxQqO9jwfxD/lyfGIX+qA',
             content:'LKaLZopWgML6IxERqoJ2mUyyO',
             last_modified:500,creation_date:500};
    o.jio.removeDocument('file',{success:o.f,error:o.f});
    clock.tick(1000);
    if (!o.f.calledOnce){
        ok (false, 'no response / too much results');
    }
    o.jio.stop();
});


module ('Jio ConflictManagerStorage');

test ('Simple methods', function () {
    // Try all the simple methods like saving, loading, removing a document and
    // getting a list of document without testing conflicts

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.clock.tick(base_tick);
    o.spy = function(res,value,message,before) {
        o.f = function(result) {
            if (res === 'status') {
                if (result && result.conflict_object) {
                    result = 'conflict';
                } else if (result && typeof result.status !== 'undefined') {
                    result = 'fail';
                } else {
                    result = 'done';
                }
            }
            if (before) { before (result); }
            deepEqual (result,value,message);
        };
        o.t.spy(o,'f');
    };
    o.tick = function (tick) {
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
    o.spy('status','done','saving "file.doc".');
    o.jio.saveDocument('file.doc','content1',{
        previous_revision: '0',
        success:function (result) {
            o.new_rev = result.revision;
            o.f (result);
        },
        error:o.f
    });
    o.tick();

    o.spy('status','done','saving "file2.doc".');
    o.jio.saveDocument('file2.doc','yes',{
        previous_revision: '0',
        success:o.f,
        error:o.f
    });
    o.tick();


    o.spy('value',{name:'file.doc',content:'content1',revision:'rev'},
          'loading "file.doc".',function (o) {
              if (!o) { return; }
              if (o.revision) { o.revision = 'rev'; }
              if (o.creation_date) { delete o.creation_date; }
              else { ok(false, 'creation date missing!'); }
              if (o.last_modified) { delete o.last_modified; }
              else { ok(false, 'last modified missing!'); }
              if (o.revision_object) { delete o.revision_object; }
              else { ok(false, 'revision object missing!'); }
          });
    o.jio.loadDocument('file.doc',{success:o.f,error:o.f});
    o.tick();

    o.spy('value',[{name:'file.doc',revision:'rev'},
                   {name:'file2.doc',revision:'rev'}],
          'getting list.',function (a) {
              var i;
              if (!a) { return; }
              for (i = 0; i < a.length; i+= 1) {
                  if (a[i].revision) { a[i].revision = 'rev'; }
                  if (a[i].creation_date) { delete a[i].creation_date; }
                  else { ok(false, 'creation date missing!'); }
                  if (a[i].last_modified) { delete a[i].last_modified; }
                  else { ok(false, 'last modified missing!'); }
                  if (a[i].revision_object) { delete a[i].revision_object; }
                  else { ok(false, 'revision object missing!'); }
              }
              // because the result can be disordered
              if (a.length === 2 && a[0].name === 'file2.doc') {
                  var tmp = a[0];
                  a[0] = a[1];
                  a[1] = tmp;
              }
          });
    o.jio.getDocumentList('.',{success:o.f,error:o.f});
    o.tick();

    o.spy('status','done','removing "file.doc"');
    o.jio.removeDocument('file.doc',{
        success:o.f,error:o.f,revision:o.new_rev
    });
    o.tick();

    o.spy('status','fail','loading document fail.');
    o.jio.loadDocument('file.doc',{
        success:o.f,error:function (error) {
            if (error.status === 404) {
                o.f(error);
            } else {
                deepEqual (error, '{}', 'An 404 error was expected.');
            }
        }
    });
    o.tick();

    o.jio.stop();
});

test ('Revision Conflict', function() {
    // Try to tests all revision conflict possibility

    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.clock.tick (base_tick);
    o.spy = function(res,value,message,function_name) {
        function_name = function_name || 'f';
        o[function_name] = function(result) {
            if (res === 'status') {
                if (result && result.conflict_object) {
                    result = 'conflict';
                } else if (result && typeof result.status !== 'undefined') {
                    result = 'fail';
                } else {
                    result = 'done';
                }
            }
            deepEqual (result,value,message);
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
    o.localNamespace = 'jio/local/revisionconflict/jiotests/';
    o.rev={};
    o.checkContent = function (string,message) {
        ok (LocalOrCookieStorage.getItem(o.localNamespace + string),
            message || '"' + string + '" is saved.');
    };
    o.checkNoContent = function (string,message) {
        ok (!LocalOrCookieStorage.getItem(o.localNamespace + string),
            message || '"' + string + '" does not exists.');
    };
    o.secondstorage_spec = {type:'local',
                            username:'revisionconflict',
                            applicationname:'jiotests'}
    //////////////////////////////////////////////////////////////////////
    o.jio = JIO.newJio({type:'conflictmanager',
                        storage:o.secondstorage_spec});
    // create a new file
    o.spy('status','done','new file "file.doc", revision: "0".');
    o.jio.saveDocument(
        'file.doc','content1',{
            previous_revision:'0',
            error:o.f,
            success:function(value){
                o.rev.first = value.revision;
                o.f(value);
            }
        });
    o.tick();
    o.checkContent('file.doc.'+o.rev.first);
    // modify the file
    o.spy('status','done','modify "file.doc", revision: "'+
          o.rev.first+'".');
    o.jio.saveDocument(
        'file.doc','content2',{
            previous_revision:o.rev.first,
            error:o.f,
            success:function(v) {
                o.f(v);
                o.rev.second = v.revision;
            }
        });
    o.tick();
    o.checkContent('file.doc.'+o.rev.second);
    o.checkNoContent('file.doc.'+o.rev.first);
    // modify the file from the second revision instead of the third
    o.spy('status','conflict','modify "file.doc", revision: "'+
          o.rev.first+'" -> conflict!');
    o.jio.saveDocument(
        'file.doc','content3',{
            previous_revision:o.rev.first,
            success:o.f,
            error: function (error) {
                o.conflict_object = error.conflict_object;
                o.f(error);
                o.rev.third = '?';
                if (o.conflict_object) {
                    o.rev.third = o.conflict_object.revision;
                    ok (!o.conflict_object.revision_object[o.new_rev],
                        'check if the first revision is not include to '+
                        'the conflict list.');
                    ok (o.conflict_object.revision_object[
                        o.conflict_object.revision],
                        'check if the new revision is include to '+
                        'the conflict list.');
                }
            }
        });
    o.tick();
    o.checkContent ('file.doc.'+o.rev.third);
    // loading test
    o.spy('status','conflict','loading "file.doc" -> conflict!');
    o.jio.loadDocument('file.doc',{
        success:o.f,error:o.f
    });
    o.tick();
    if (!o.conflict_object) { return ok(false,'Cannot to continue the tests'); }
    // solving conflict
    o.spy('status','done','solve conflict "file.doc".');
    o.conflict_object.solveConflict(
        'content4',{
            error:o.f,
            success:function (r) {
                o.f(r);
                o.rev.forth = r.revision;
            }
        });
    o.tick();
    o.checkContent('file.doc.'+o.rev.forth);
    o.checkNoContent('file.doc.'+o.rev.second);
    o.checkNoContent('file.doc.'+o.rev.third);
    o.jio.stop();
});

test ('Conflict in a conflict solving', function () {
    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.clock.tick (base_tick);
    o.spy = function(res,value,message,function_name) {
        function_name = function_name || 'f';
        o[function_name] = function(result) {
            if (res === 'status') {
                if (result && result.conflict_object) {
                    result = 'conflict';
                } else if (result && typeof result.status !== 'undefined') {
                    result = 'fail';
                } else {
                    result = 'done';
                }
            }
            deepEqual (result,value,message);
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
    o.localNamespace = 'jio/local/conflictconflict/jiotests/';
    o.rev={};
    o.checkContent = function (string,message) {
        ok (LocalOrCookieStorage.getItem(o.localNamespace + string),
            message || '"' + string + '" is saved.');
    };
    o.checkNoContent = function (string,message) {
        ok (!LocalOrCookieStorage.getItem(o.localNamespace + string),
            message || '"' + string + '" does not exists.');
    };
    o.secondstorage_spec = {type:'local',
                            username:'conflictconflict',
                            applicationname:'jiotests'}
    //////////////////////////////////////////////////////////////////////
    o.jio = JIO.newJio({type:'conflictmanager',
                        storage:o.secondstorage_spec});
    // create a new file
    o.spy('status','done','new file "file.doc", revision: "0".');
    o.jio.saveDocument(
        'file.doc','content1',{
            previous_revision:'0',
            error:o.f,
            success:function(value){
                o.rev.first = value.revision;
                o.f(value);
            }
        });
    o.tick();
    o.checkContent ('file.doc.'+o.rev.first);
    // modify the file from the second revision instead of the third
    o.spy('status','conflict','modify "file.doc", revision: "0" -> conflict!');
    o.jio.saveDocument(
        'file.doc','content2',{
            previous_revision:"0",
            success:o.f,
            error: function (error) {
                o.f(error);
                o.conflict_object = error.conflict_object;
                o.rev.second = o.conflict_object?o.conflict_object.revision:'?';
            }
        });
    o.tick();
    o.checkContent ('file.doc.'+o.rev.second);
    if (!o.conflict_object) { return ok(false,'Cannot to continue the tests'); }
    // saving another time
    o.spy('status','conflict','modify "file.doc" when solving, revision: "'+
          o.rev.first+'" -> conflict!');
    o.jio.saveDocument('file.doc','content3',{
        previous_revision: o.rev.first,
        error:function(e){
            o.f(e);
            o.rev.third = o.conflict_object?o.conflict_object.revision:'?';
        },
        success:o.f
    });
    o.tick();
    o.checkContent ('file.doc.'+o.rev.third);
    o.checkNoContent ('file.doc.'+o.rev.first);
    // solving first conflict
    o.spy('status','conflict','solving conflict "file.doc" -> conflict!');
    o.conflict_object.solveConflict('content4',{
        success: o.f,
        error: function (error) {
            o.rev.forth = '?';
            if (error.conflict_object) {
                o.conflict_object = error.conflict_object;
                o.rev.forth = o.conflict_object.revision;
            }
            o.f(error);
        }
    })
    o.tick();
    o.checkContent ('file.doc.'+o.rev.forth);
    o.checkNoContent ('file.doc.'+o.rev.second);
    // solving last conflict
    o.spy('status','done','solving last conflict "file.doc".');
    o.conflict_object.solveConflict('content5',{
        error:o.f,
        success:function (v) {
            o.f(v);
            o.rev.fith = v.revision;
        }
    });
    o.tick();
    o.checkContent ('file.doc.'+o.rev.fith);

    o.jio.stop();
});

test ('Remove revision conflict', function () {
    var o = {}; o.clock = this.sandbox.useFakeTimers(); o.t = this;
    o.clock.tick (base_tick);
    o.spy = function(res,value,message,function_name) {
        function_name = function_name || 'f';
        o[function_name] = function(result) {
            if (res === 'status') {
                if (result && result.conflict_object) {
                    result = 'conflict';
                } else if (result && typeof result.status !== 'undefined') {
                    result = 'fail';
                } else {
                    result = 'done';
                }
            }
            deepEqual (result,value,message);
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
    o.localNamespace = 'jio/local/removeconflict/jiotests/';
    o.rev={};
    o.checkContent = function (string,message) {
        ok (LocalOrCookieStorage.getItem(o.localNamespace + string),
            message || '"' + string + '" is saved.');
    };
    o.checkNoContent = function (string,message) {
        ok (!LocalOrCookieStorage.getItem(o.localNamespace + string),
            message || '"' + string + '" does not exists.');
    };
    o.secondstorage_spec = {type:'local',
                            username:'removeconflict',
                            applicationname:'jiotests'}
    //////////////////////////////////////////////////////////////////////
    o.jio = JIO.newJio({type:'conflictmanager',
                        storage:o.secondstorage_spec});

    o.spy('status','done','new file "file.doc", revision: "0".');
    o.jio.saveDocument(
        'file.doc','content1',{
            previous_revision:'0',
            error:o.f,
            success:function(value){
                o.rev.first = value.revision;
                o.f(value);
            }
        });
    o.tick();
    o.checkContent ('file.doc.'+o.rev.first);

    o.spy('status','fail','remove "file.doc", revision: "wrong" -> conflict!');
    o.jio.removeDocument(
        'file.doc',{
            previous_revision:'wrong',
            success:o.f,
            error:function (e) {
                o.f(e);
            }
        });
    o.tick();

    o.spy('status','conflict','new file again "file.doc", revision: "0".');
    o.jio.saveDocument(
        'file.doc','content2',{
            previous_revision:'0',
            success:o.f,
            error:function (error) {
                o.f(error);
                o.rev.second = error.conflict_object ?
                    error.conflict_object.revision : '?';
            }
        });
    o.tick();
    o.checkContent ('file.doc.'+o.rev.second);

    o.spy('status','conflict','remove "file.doc", revision: "'+o.rev.first+
          '" -> conflict!');
    o.jio.removeDocument(
        'file.doc',{
            revision:o.rev.first,
            success:o.f,
            error:function (error) {
                o.conflict_object = error.conflict_object;
                o.f(error);
                o.rev.third = o.conflict_object?o.conflict_object.revision:'?';
            }
        });
    o.tick();
    o.checkNoContent ('file.doc.'+o.rev.first);
    o.checkNoContent ('file.doc.'+o.rev.third);

    if (!o.conflict_object) { return ok(false, 'Cannot continue the tests'); }
    o.spy('status','done','solve "file.doc"');
    o.conflict_object.solveConflict({
        error:o.f,
        success:function (v) {
            o.f(v);
            o.rev.forth = v.revision;
        }
    });
    o.tick();
    o.checkNoContent ('file.doc.'+o.rev.second);
    o.checkNoContent ('file.doc.'+o.rev.third);
    o.checkNoContent ('file.doc.'+o.rev.forth);

    o.jio.stop();
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
