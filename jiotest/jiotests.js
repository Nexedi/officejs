
var cookieOrLocal = null;
var browserStorage = function () {
};
browserStorage.prototype = {
    getItem: function (name) {
        return JSON.parse(localStorage.getItem(name));
    },
    setItem: function (name,value) {
        if (name)
            return localStorage.setItem(name,JSON.stringify(value));
    },
    getAll: function() {
        return localStorage;
    },
    deleteItem: function (name) {
        if (name)
            delete localStorage[name];
    }
};
var cookieStorage = function () {
};
cookieStorage.prototype = {
    getItem: function (name) {
        var cookies = document.cookie.split(';');
        for (var i in cookies) {
            var x = cookies[i].substr(0, cookies[i].indexOf('='));
            var y = cookies[i].substr(cookies[i].indexOf('=')+1);
            x = x.replace(/^\s+|\s+$/g,"");
            if( x == name ) return unescape(y);
        }
        return null;
    },
    setItem: function (name,value) {
        // function to store into cookies
        if (value != undefined) {
            document.cookie = name+'='+JSON.stringify(value)+';domain='+
                window.location.hostname+
                ';path='+window.location.pathname;
            return true;
        }
        return false;
    },
    getAll: function() {
        var retObject = {};
        var cookies = document.cookie.split(':');
        for (var i in cookies) {
            var x = cookies[i].substr(0, cookies[i].indexOf('='));
            var y = cookies[i].substr(cookies[i].indexOf('=')+1);
            x = x.replace(/^\s+|\s+$/g,"");
            retObject[x] = unescape(y);
        }
        return retObject;
    },
    deleteItem: function (name) {
        document.cookie = name+'=null;domain='+window.location.hostname+
            ';path='+window.location.pathname+
            ';expires=Thu, 01-Jan-1970 00:00:01 GMT';
    }
};
// set good localStorage
try {
    if (localStorage.getItem) {
        cookieOrLocal = new browserStorage();
    } else {
        cookieOrLocal = new cookieStorage();
    }
}
catch (e) {
    cookieOrLocal = new cookieStorage();
}


// //// QUnit Tests ////

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

    deepEqual ( o.jio.isReady(), false, '1 must be not ready');
    deepEqual ( o.jio.start(), true, '1 must be ready now');

    o.jio2.start();
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
    o.jio.start();

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

module ( 'Jio LocalStorage' );

test ('Check name availability', function () {
    // Test if LocalStorage can check the availabality of a name.
    // We remove MrCheckName from local storage, and checking must return true.
    // We now add MrCheckName to local storage, and checking must return false.
    var o = {}
    var clock = this.sandbox.useFakeTimers();
    // name must be available
    o.f = function (result) {
        deepEqual ( result.isAvailable, true,
                    'checking name availabality');
    };
    var spy = this.spy(o,'f');

    cookieOrLocal.deleteItem ('jio/local/MrCheckName/jiotests/file');

    o.jio = JIO.createNew({'type':'local','userName':'noname'},
                          {"ID":'noid'});
    o.jio.start();
    o.jio.checkNameAvailability(
        {'userName':'MrCheckName','callback': o.f});
    
    clock.tick(510);
    ok (o.f.calledOnce, 'callback called once');
    
    // name must not be available
    o.f2 = function (result) {
        deepEqual ( result.isAvailable, false,
                    'another checking name availabality');
    };
    var spy2 = this.spy(o,'f2');
    
    cookieOrLocal.setItem ('jio/local/MrCheckName/jiotests/file',{});

    o.jio.checkNameAvailability(
        {'userName':'MrCheckName','callback': o.f2});
    
    clock.tick(510);
    ok (o.f2.calledOnce, 'another callback called once');
    
    o.jio.stop();
});

test ('Document save', function () {
    // Test if LocalStorage can save documents.
    // We launch a saving to localstorage and we check if the file is
    // realy saved. Then save again and check if 

    var o = {}
    var clock = this.sandbox.useFakeTimers();
    // save and check document existence
    o.f = function (result) {
        deepEqual ( result.isSaved, true,
                    'saving document');
    };
    var spy = this.spy(o,'f');

    cookieOrLocal.deleteItem ('jio/local/MrSaveName/jiotests/file');

    clock.tick(200);
    o.jio = JIO.createNew({'type':'local','userName':'MrSaveName'},
                          {"ID":'jiotests'});
    o.jio.start();
    o.jio.saveDocument(
        {'fileName':'file','fileContent':'content','callback': o.f});
    
    clock.tick(510);
    ok (o.f.calledOnce, 'callback called once');
    
    // check content
    var tmp = cookieOrLocal.getItem ('jio/local/MrSaveName/jiotests/file');
    deepEqual (tmp,{'fileName':'file','fileContent':'content',
                    'lastModified':200,'creationDate':200}, 'check content');
    
    // re-save and check modification date
    o.f2 = function (result) {
        deepEqual ( result.isSaved, true,
                    'saving document again');
    };
    var spy2 = this.spy(o,'f2');

    o.jio.saveDocument(
        {'fileName':'file','fileContent':'content','callback': o.f2});
    
    clock.tick(510);
    ok (o.f2.calledOnce, 'another callback called once');

    // check content
    tmp = cookieOrLocal.getItem ('jio/local/MrSaveName/jiotests/file');
    deepEqual (tmp,{'fileName':'file','fileContent':'content',
                    'lastModified':710,'creationDate':200}, 'check content');

    o.jio.stop();
});

test ('Document load', function () {
    // Test if LocalStorage can load documents.
    // We launch a loading from localstorage and we check if the file is
    // realy loaded.

    var o = {}
    var clock = this.sandbox.useFakeTimers();
    // load a non existing file
    o.f = function (result) {
        deepEqual ( result.status, 'fail',
                    'loading document');
    };
    var spy = this.spy(o,'f');

    cookieOrLocal.deleteItem ('jio/local/MrLoadName/jiotests/file');

    o.jio = JIO.createNew({'type':'local','userName':'MrLoadName'},
                          {"ID":'jiotests'});
    o.jio.start();
    o.jio.loadDocument(
        {'fileName':'file','callback': o.f});
    
    clock.tick(510);
    ok (o.f.calledOnce, 'callback called once');
    
    // re-load file after saving it manually
    var tmp = cookieOrLocal.setItem ('jio/local/MrLoadName/jiotests/file',
                                 {'fileName':'file','fileContent':'content',
                                  'lastModified':1234,'creationDate':1000});
    o.f2 = function (result) {
        deepEqual ( result.document,
                    {'fileName':'file','fileContent':'content',
                     'lastModified':1234,'creationDate':1000},
                    'loading document again, check content');
    };
    var spy2 = this.spy(o,'f2');

    o.jio.loadDocument(
        {'fileName':'file','callback': o.f2});
    
    clock.tick(510);
    ok (o.f2.calledOnce, 'another callback called once');

    o.jio.stop();
});

test ('Document remove', function () {
    // Test if LocalStorage can remove documents.
    // We launch a remove from localstorage and we check if the file is
    // realy removed.

    var o = {}
    var clock = this.sandbox.useFakeTimers();

    o.f = function (result) {
        deepEqual ( result.isRemoved, true,
                    'removing document');
    };
    var spy = this.spy(o,'f');

    cookieOrLocal.setItem ('jio/local/MrRemoveName/jiotests/file',{});

    o.jio = JIO.createNew({'type':'local','userName':'MrRemoveName'},
                          {"ID":'jiotests'});
    o.jio.start();
    o.jio.removeDocument(
        {'fileName':'file','callback': o.f});
    
    clock.tick(510);
    ok (o.f.calledOnce, 'callback called once');
    
    var tmp = cookieOrLocal.getItem ('jio/local/MrRemoveName/jiotests/file');
    ok (!tmp, 'check no content');

    o.jio.stop();
});

