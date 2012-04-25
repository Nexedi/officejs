
// test ( "QUnit", function () { 
//     ok ( true , "QUnit works!" );
// });
var o = {};
var globalIndex = 1;
var globalTestIndex = 0;
var globalMax = 10;
var globalID = setInterval (function (){
    if (globalIndex === globalTestIndex) return;
    switch (globalIndex) {
    default:
        globalIndex++;
        break;
    case 1: globalTestIndex = globalIndex;
        test ( "Jio simple methods", function () {

            ok ( $.jio('addStorageType',{'type':'qunit','creator':function(){}})
                 , "storage type qunit added.");
            var tmp = $.jio('isReady');
            ok ( tmp === false, 'isReady === ' +tmp);
            var tmp = $.jio({'storage':{'type':'local','userName':'myName'},
                             'applicant':{'ID':'myID'}});
            ok ( tmp === true, 'initialized ? ' + tmp );
            var tmp = $.jio('isReady');
            ok ( tmp === true, 'isReady === ' +tmp);
            var tmp = $.jio('getApplicant');
            deepEqual ( tmp , {'ID':'myID'},
                        'get the good applicant.' );

            globalIndex++;
        });
        break;
    case 2: globalTestIndex = globalIndex;
        o.local = {};
        test ( 'Jio Pub/Sub methods', function () {
            stop();
            var i = 1, ti = 0, m = 10;
            var id = setInterval(function (){
                switch(i){
                default:
                    i++;
                    break;
                case 1: // if(i===ti)return;ti=i; // force do only one time
                    o.local.pubsub_test = false;
                    $.jio('subscribe',
                          {'event':'pubsub_test', 'func':
                           function () {
                               o.local.pubsub_test = true;
                           }});
                    $.jio('publish',{'event':'pubsub_test'});
                    i++;
                    break;
                case 5:         // wait a little
                    deepEqual (o.local.pubsub_test, true,
                       'subscribe & publish');
                    if (o.local.pubsub_test) {
                        i++;
                    } else {
                        i=m;
                        globalIndex = globalMax;
                    }
                    break;
                case 6:
                    o.local.pubsub_test = false;
                    $.jio('unsubscribe',{'event':'pubsub_test'});
                    $.jio('publish',{'event':'pubsub_test'});
                    i ++;
                    break;
                case 9:         // wait a little
                    deepEqual (o.local.pubsub_test, false,
                               'unsubscribe');
                    i++;
                    break;
                case m:
                    start();
                    globalIndex++;
                    clearInterval(id);
                    break;
                }
            },100);
        });
        break;
    case 3: globalTestIndex = globalIndex;
        test ( 'LocalStorage' , function () {
            stop();
            var i = 1, ti = 0, m = 31;
            var id = setInterval(function (){
                switch(i){
                default:
                    i++;
                    break;
                case 1:
                    o.local.start_check = false;
                    o.local.stop_check = false;
                    o.local.ret_check = false;
                    o.start_check_func = function () {
                        o.local.start_check = true;
                    };
                    o.stop_check_func = function (e) {
                        o.local.ret_check = e.job.isAvailable;
                        o.local.stop_check = true;
                    };
                    $.jio('subscribe',{'event':'start_checkingNameAvailability',
                                       'func':function (e) {
                                           o.start_check_func(e);
                                       }})
                    $.jio('subscribe',{'event':'stop_checkingNameAvailability',
                                       'func':function (e) {
                                           o.stop_check_func(e);
                                       }})
                    $.jio('checkNameAvailability',{'userName':'myName'});
                    i++;
                    break;
                case 5:         // wait a little
                    deepEqual ( [o.local.start_check,
                                 o.local.stop_check,
                                 o.local.ret_check],
                                [true,true,true],
                                'checking name availability');
                    i++;
                    break;
                case 6:
                    o.local.start_save = false;
                    o.local.stop_save = false;
                    o.local.ret_save = false;
                    o.start_save_func = function () {
                        o.local.start_save = true;
                    };
                    o.job_done_func = function (e) {
                        o.local.ret_save = e.job.isSaved;
                    };
                    o.stop_save_func = function () {
                        o.local.stop_save = true;
                    };
                    $.jio('subscribe',{'event':'start_saving',
                                       'func':function (e) {
                                           o.start_save_func(e);
                                       }})
                    $.jio('subscribe',{'event':'job_done',
                                       'func':function(e){
                                           o.job_done_func(e);}
                                      });
                    $.jio('subscribe',{'event':'stop_saving',
                                       'func':function (e) {
                                           o.stop_save_func(e);
                                       }})
                    $.jio('saveDocument',{'fileName':'file',
                                          'fileContent':'content'});
                    i++;
                    break;
                case 10:         // wait a little
                    deepEqual ( [o.local.start_save,
                                 o.local.stop_save,
                                 o.local.ret_save],
                                [true,true,true],
                                'saving');
                    i++;
                    break;
                case 11:
                    o.local.start_check = false;
                    o.local.stop_check = false;
                    o.local.ret_check = true;
                    // already subscribed
                    $.jio('checkNameAvailability',{'userName':'myName'});
                    i++;
                    break;
                case 15:         // wait a little
                    deepEqual ( [o.local.start_check,
                                 o.local.stop_check,
                                 o.local.ret_check],
                                [true,true,false],
                                'checking name availability');
                    i++;
                    break;
                case 16:
                    o.local.start_load = false;
                    o.local.stop_load = false;
                    o.local.ret_load = null;
                    o.start_load_func = function () {
                        o.local.start_load = true;
                    };
                    o.job_done_func = function (e) {
                        o.local.ret_load = e.job.fileContent;
                    };
                    o.stop_load_func = function () {
                        o.local.stop_load = true;
                    };
                    $.jio('subscribe',{'event':'start_loading',
                                       'func':function (e) {
                                           o.start_load_func(e);
                                       }})
                    $.jio('subscribe',{'event':'stop_loading',
                                       'func':function (e) {
                                           o.stop_load_func(e);
                                       }})
                    $.jio('loadDocument',{'fileName':'file'});
                    i++;
                    break;
                case 20:         // wait a little
                    deepEqual ( [o.local.start_load,
                                 o.local.stop_load,
                                 o.local.ret_load],
                                [true,true,'content'],
                                'loading');
                    i++;
                    break;
                case 21:
                    o.local.start_getlist = false;
                    o.local.stop_getlist = false;
                    o.local.ret_getlist_at_job = [];
                    o.local.ret_getlist_at_stop = [];
                    o.start_getlist_func = function () {
                        o.local.start_getlist = true;
                    };
                    o.job_done_func = function (e) {
                        o.local.ret_getlist_at_job = e.job.list;
                    };
                    o.stop_getlist_func = function (e) {
                        o.local.ret_getlist_at_stop = e.job.list;
                        o.local.stop_getlist = true;
                    };
                    $.jio('subscribe',{'event':'start_gettingList',
                                       'func':function (e) {
                                           o.start_getlist_func(e);
                                       }})
                    $.jio('subscribe',{'event':'stop_gettingList',
                                       'func':function (e) {
                                           o.stop_getlist_func(e);
                                       }})
                    $.jio('getDocumentList');
                    i++;
                    break;
                case 25:         // wait a little
                    var expected = JSON.parse(
                        localStorage['jio/local/myName/myID/file']);
                    delete expected.fileContent;
                    expected = [expected];
                    deepEqual ( [o.local.start_getlist,
                                 o.local.stop_getlist,
                                 o.local.ret_getlist_at_job,
                                 o.local.ret_getlist_at_stop],
                                [true,true,expected,expected],
                                'get list');
                    i++;
                    break;
                case 26:
                    o.local.start_remove = false;
                    o.local.stop_remove = false;
                    o.local.ret_remove = false;
                    o.start_remove_func = function () {
                        o.local.start_remove = true;
                    };
                    o.job_done_func = function (e) {
                        o.local.ret_remove = e.job.isRemoved;
                    };
                    o.stop_remove_func = function () {
                        o.local.stop_remove = true;
                    };
                    $.jio('subscribe',{'event':'start_removing',
                                       'func':function (e) {
                                           o.start_remove_func(e);
                                       }})
                    $.jio('subscribe',{'event':'stop_removing',
                                       'func':function (e) {
                                           o.stop_remove_func(e);
                                       }})
                    $.jio('removeDocument',{'fileName':'file'});
                    i++;
                    break;
                case 30:         // wait a little
                    deepEqual ( [o.local.start_remove,
                                 o.local.stop_remove,
                                 o.local.ret_remove],
                                [true,true,true],
                                'remove');
                    i++;
                    break;
                case m:
                    start();
                    globalIndex++;
                    clearInterval(id);
                    break;
                }
            },100);
        });
        break;
    case globalMax:
        clearInterval(globalID);
        break;
    }
},100);


