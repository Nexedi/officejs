
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

            var ca = $.Callbacks();
            console.log (ca);
            o.jio = JIO.createNew();
            ok ( o.jio, 'a new jio -> 1');
            o.jio2 = JIO.createNew();
            ok ( o.jio2, 'another new jio -> 2');
            ok ( JIO.addStorageType('qunit', function(){}) ,
                 "adding storage type.");
            deepEqual ( o.jio.isReady(), false, '1 must be not ready');
            deepEqual ( o.jio.start(), true, '1 must be ready now');
            o.jio2.start();
            ok ( o.jio2.id !== o.jio.id, '1 and 2 must be different');
            deepEqual ( o.jio.stop(), true, '1 must be stopped');
            o.jio2.stop();

            globalIndex++;
        });
        break;
    case 2: globalTestIndex = globalIndex;
        o.local = {};
        o.local.jio = JIO.createNew();
        o.local.jio.start();
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
                    o.local.pubsub_callback = o.local.jio.subscribe(
                        'pubsub_test',function () {
                            o.local.pubsub_test = true;
                        });
                    o.local.jio.publish('pubsub_test');
                    i++; break;
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
                    o.local.jio.unsubscribe('pubsub_test',
                                            o.local.pubsub_callback);
                    o.local.jio.publish('pubsub_test');
                    i ++;
                    break;
                case 9:         // wait a little
                    deepEqual (o.local.pubsub_test, false,
                               'unsubscribe');
                    o.local.pubsub_test = !o.local.pubsub_test;
                    i++;
                    break;
                case m:
                    o.local.jio.stop();
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
            var i = 0, ti = -1, m = 20;
            var id = setInterval(function (){
                switch(i){
                default:
                    i++;
                    break;
                case 0:
                    o.local.jio = JIO.createNew({
                        'type':'local',
                        'userName':'myName'
                    },{'ID':'myApp'});
                    o.local.jio.start();
                    i++;
                    break;
                case 1:i++;
                    //// test check name
                    o.local.check_test = null;
                    o.local.jio.checkNameAvailability(
                        {'userName':'myName','callback': function (result) {
                            o.local.check_test = result.isAvailable;
                            i = 3;
                        }});
                    break;
                case 2: break;
                case 3: i++;
                    deepEqual (o.local.check_test, true,
                               'name must be available');
                    //// test save document
                    o.local.jio.save_test = null;
                    o.local.jio.saveDocument(
                        {'fileName':'file','fileContent':'content','callback':
                         function (result) {
                             o.local.save_test = result.isSaved;
                             i = 5;
                         }});
                    break;
                case 4: break;
                case 5: i++;
                    deepEqual (o.local.save_test, true,
                               'document must be saved');
                    //// test check name
                    o.local.check_test = null;
                    o.local.jio.checkNameAvailability(
                        {'userName':'myName','callback': function (result) {
                            o.local.check_test = result.isAvailable;
                            i = 7;
                        }});
                    break;
                case 6: break;
                case 7: i++;
                    deepEqual (o.local.check_test, false,
                               'name must be unavailable');
                    //// test get list
                    o.local.getlist_test = null;
                    o.local.jio.getDocumentList(
                        {'callback': function (result) {
                            o.local.getlist_test = result.list;
                            i = 9;
                        }});
                    break;
                case 8: break;
                case 9: i++;
                    if (o.local.getlist_test) {
                        delete o.local.getlist_test[0].lastModified;
                        delete o.local.getlist_test[0].creationDate;
                    }
                    deepEqual (o.local.getlist_test,
                               [{'fileName':'file'}],
                               'list must contain one file');
                    //// test remove document
                    o.local.remove_test = null;
                    o.local.jio.removeDocument(
                        {'fileName':'file','callback': function (result) {
                            o.local.remove_test = result.isRemoved;
                            i = 11;
                        }});
                    break;
                case 10: break;
                case 11: i++;
                    deepEqual (o.local.remove_test, true,
                               'file must be removed');
                    break;
                case m:
                    o.local.jio.stop();
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


