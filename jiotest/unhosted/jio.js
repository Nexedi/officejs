
;(function ( $ ) {

    ////////////////////////////////////////////////////////////////////////////
    // constants
    var jioAttributeObject = {
        'jobMethodObject': {
            'checkNameAvailability': {
                'start_event':'start_checkingNameAvailability',
                'stop_event':'stop_checkingNameAvailability',
                'retvalue':'isAvailable' }, // returns 'boolean'
            'saveDocument': {
                'start_event':'start_saving',
                'stop_event':'stop_saving',
                'retvalue':'isSaved' }, // returns 'boolean'
            'loadDocument': {
                'start_event':'start_loading',
                'stop_event':'stop_loading',
                'retvalue':'fileContent' }, // returns the file content 'string'
            'getDocumentList': {
                'start_event':'start_gettingList',
                'stop_event':'stop_gettingList',
                'retvalue':'list' }, // returns the document list 'array'
            'removeDocument': {
                'start_event':'start_removing',
                'stop_event':'stop_removing',
                'retvalue':'isRemoved' } // returns 'boolean'
        },
        'localStorage': null,   // where the browser stores data
        'tabid': 0,             // this jio id
        'queue': null,          // the job manager
        'storage': null,        // the storage given at init
        'applicant': null,      // the applicant given at init
        'listener': null,       // the job listener
        'pubsub': null,         // publisher subscriber
        'isReady': false,       // check if jio is ready
        'storageTypeObject': {} // ex: {'type':'local','creator': fun ...}
    };
    // end constants
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // cookies & localStorage
    var myLocalStorage = function () {
    };
    myLocalStorage.prototype = {
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
            jioAttributeObject.localStorage = new myLocalStorage();
        } else {
            jioAttributeObject.localStorage = new cookieStorage();
        }
    }
    catch (e) {
        jioAttributeObject.localStorage = new cookieStorage();
    }
    // end cookies & localStorages
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Tools
    var createStorageObject = function ( options ) {
        // Create a storage thanks to storages types set with 'addStorageType'.

        if (!jioAttributeObject.storageTypeObject[ options.storage.type ])
            return null;       // error!
        return jioAttributeObject.storageTypeObject[
            options.storage.type ](options);
    };
    // end Tools
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Publisher Subcriber
    var PubSub = function () {
        if (!this.eventAction) {
            var topics = {};
            this.eventAction = function (id) {
                var callbacks;
                var topic = id && topics[id];
                if (!topic) {
                    callbacks = $.Callbacks();
                    topic = {
                        publish: callbacks.fire,
                        subscribe: callbacks.add,
                        unsubscribe: callbacks.remove
                    };
                    if (id) {
                        topics[id] = topic;
                    }
                }
                return topic;
            };
        }
    };
    PubSub.prototype = {
        publish: function (eventname,obj) {
            this.eventAction(eventname).publish(obj);
        },
        subscribe: function (eventname,func) {
            this.eventAction(eventname).subscribe(func);
        },
        unsubscribe: function (eventname) {
            this.eventAction(eventname).unsubscribe();
        }
    };
    jioAttributeObject.pubsub = new PubSub();
    // end Publisher Subcriber
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Job & JobQueue
    var Job = function ( options ) {
        // Job constructor
        
        console.log ('Job');
        var job = $.extend({},options);
        job['id']=0;
        job['status']='initial';
        return job;
    };

    var JobQueue = function () {
        // JobQueue is a queue of jobs. It will regulary copy this queue
        // into localStorage to resume undone tasks.

        // restore job list from local storage, if it exists
        this.jobObject = jioAttributeObject.localStorage.getItem(
            'jio/jobObject/' + jioAttributeObject.tabid);
        if (!this.jobObject) this.jobObject = {};
        
        //// set first job ID
        console.log ('Queue');
        this.jobid = 1;
        for (var id in this.jobObject) {
            if ( this.jobObject[id].id > this.jobid ) {
                this.jobid = this.jobObject[id].id;
            }
        }
        this.jobid++;

        // reset all jobs' status to initial
        this.resetAll();

        var t = this;
        var returnedJobAnalyse = function ( job ) {
            // analyse the [job]
            
            // if the job method does not exists, return false
            if (!jioAttributeObject.jobMethodObject[job.method])
                return false;
            // if there isn't some job to do, then send stop event
            if (!t.isThereJobsWhere(function(testjob){
                return (testjob.method === job.method && 
                        testjob.status !== 'fail');
            })) {
                switch (job.method) {
                    // TODO merging is done with jio? or by the user's scripts?
                case 'checkNameAvailability':
                    // TODO merge name availability between storages
                    // TODO send job ?
                    $.jio('publish',{'event':
                                     jioAttributeObject.jobMethodObject[
                                         job.method].stop_event, 'job':job});
                    return;
                case 'getDocumentList':
                    // TODO merge list if necessary (we can create
                    // this.getList, deleted after sending the event,
                    // filled with done event) -> merge here or show
                    // possible actions (manually, auto, ...)
                    $.jio('publish',{'event':
                                     jioAttributeObject.jobMethodObject[
                                         job.method].stop_event , 'job':job});
                                          ///*, 'retvalue': merged list */});
                    // delete list
                    return;
                default:
                    $.jio('publish',{'event':
                                     jioAttributeObject.jobMethodObject[
                                         job.method].stop_event});
                    return;
                }
            }
        }; // end returnedJobAnalyse

        //// sebscribe an event
        var t = this;
        $.jio('subscribe',{'event':'job_done','func':function (o) {
            setTimeout (function () {
                if (methods.isReady()) {
                    t.done(o.job);
                    returnedJobAnalyse (o.job);
                    t.copyJobQueueToLocalStorage();
                }
            },50);
        }});
        $.jio('subscribe',{'event':'job_fail','func':function (o) {
            setTimeout (function () {
                if (methods.isReady()) {
                    t.fail(o.job);
                    returnedJobAnalyse (o.job);
                    t.copyJobQueueToLocalStorage();
                }
            },50);
        }});
        //// end subscribing
    };

    JobQueue.prototype = {
        isThereJobsWhere: function( func ) {
            // Check if there is jobs, in the queue,
            // where [func](job) == true.

            if (!func)
                return true;
            for (var id in this.jobObject) {
                if (func(this.jobObject[id]))
                    return true;
            }
            return false;
        },
        copyJobQueueToLocalStorage: function () {
            // Copy job queue into localStorage.

            return jioAttributeObject.localStorage.setItem(
                'jio/jobObject/' + jioAttributeObject.tabid,
                this.jobObject);
        },
        addJob: function ( options ) {
            // Add a job to the queue
            // options.storage : the storage object
            // options.job : the job object (may be a 'string')

            console.log ('addJob');

            // transforming job/storage to an object
            if (typeof options.job === 'string')
                options.job = JSON.parse(options.job);
            if (typeof options.storage === 'string')
                options.storage=JSON.parse(options.storage);

            // set job id
            options.job.id = this.jobid;
            this.jobid ++;
            // save the new job into the queue
            this.jobObject[this.jobid] = options.job;
            // save into localStorage
            this.copyJobQueueToLocalStorage();
        }, // end addJob
        
        removeJob: function ( options ) {
            // Remove job(s) from queue where [options.where](job) === true.
            // If there is no job in [options], then it will treat all job.
            // If there is no [where] function, then it will remove all selected
            // job. It means that if no option was given, it'll remove all jobs.
            // options.job : the job object containing at least {id:..}.
            // options.where : remove values where options.where(job) === true
            
            console.log ('removeJob');
            //// set tests functions
            var settings = $.extend ({'where':function (job) {return true;}},
                                     options);
            var andwhere ;
            if (settings.job) {
                andwhere = function (job) {return (job.id===settings.job.id);};
            } else {
                andwhere = function (job) {return true;};
            }
            //// end set tests functions

            //// modify the job list
            var found = false;
            for (var k in this.jobObject) {
                if (settings.where(this.jobObject[k]) &&
                    andwhere(this.jobObject[k]) ) {
                    delete this.jobObject[k];
                    found = true;
                }
            }
            if (!found) {
                $.error ('No jobs was found, when trying to remove some.');
            }
            //// end modifying
            this.copyJobQueueToLocalStorage();

            console.log ('end removeJob');
        },

        resetAll: function () {
            // Reset all job to 'initial'.
            
            for (var id in this.jobObject) {
                this.jobObject[id].status = 'initial';
            }
            this.copyJobQueueToLocalStorage();
        },

        invokeAll: function () {
            // Do all jobs in the queue.

            //// do All jobs
            for (var i in this.jobObject) {
                if (this.jobObject[i].status === 'initial') {
                    this.invoke(this.jobObject[i]);
                }
            }
            this.copyJobQueueToLocalStorage();
            //// end, continue doing jobs asynchronously
        },

        invoke: function (job) {
            // Do a job invoking the good method in the good storage.

            console.log ('invoke');
            //// analysing job method
            // if the method does not exist, do nothing
            if (!jioAttributeObject.jobMethodObject[job.method])
                return false;   // suppose never happen
            // test if a similar job is on going, in order to publish a start
            // event if it is the first of his kind (method).
            if (!this.isThereJobsWhere(function (testjob){
                return (testjob.method === job.method &&
                        testjob.method === 'ongoing');
            })) {
                job.status = 'ongoing';
                $.jio('publish',
                      {'event':
                       jioAttributeObject.jobMethodObject[
                           job.method].start_event,
                       'job':job});
            } else {
                job.status = 'ongoing';
            }
            // Create a storage object and use it to save,load,...!
            createStorageObject(
                {'storage':job.storage,
                 'applicant':jioAttributeObject.applicant})[job.method](job);
            //// end method analyse
        },

        done: function (job) {
            // This job is supposed done, we can remove it from queue.
            
            this.removeJob ({'job':job});
        },

        fail: function (job) {
            // This job cannot be done, change its status.

            this.jobObject[job.id] = job;
            // save to local storage
            this.copyJobQueueToLocalStorage ();
        },
        clean: function () {
            // Clean the job list, removing all jobs that have failed.
            // It also change the localStorage job queue

            this.removeJob (undefined,
                            {'where':function (job) {
                                return (job.status === 'fail');
                            } });
        }
    };
    // end Job & JobQueue
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // jio job listener
    var JobListener = function ( options ) {
        // A little daemon which will start jobs from the joblist
        
        var settings = $.extend({'interval': 100},options);
        this.interval = settings.interval;
        this.id = null;
    };

    JobListener.prototype = {
        setIntervalDelay: function (interval) {
            // Set the time between two joblist check in millisec

            this.interval = interval;
        },
        start: function () {
            // Start the listener. It will always check if there are jobs in the
            // queue

            if (!this.id) {
                this.id = setInterval (function () {
                    // if there are jobs
                    if (jioAttributeObject.localStorage.getItem(
                        'jio/jobObject/'+jioAttributeObject.tabid) &&
                        localStorage.joblist !== '{}') {
                        jioAttributeObject.queue.invokeAll();
                    }
                },this.interval);
                console.log ('listener started');
                return true;
            } else {
                return false;
            }
        },
        stop: function () {
            if (this.id) {
                console.log ('listener stopped');
                clearInterval (this.id);
                this.id = null;
            }
        }
    }
    // end jio job listener
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // jio methods
    var methods = {
        init: function ( options ) {
            // Initialize jio. Create/Update all jio attributes and start
            // listening to jobs. If jio is already initialized, arguments
            // will be given to 'doMethod' which will treat them as a 'job'.

            var settings = $.extend({},options);
            // if already initialized
            if (methods.isReady()) {
                methods.doMethod(settings);
                return false;
            }
            console.log ('initializing');
            // check settings
            if (!settings.storage ||
                !settings.applicant) {
                $.error ('Storage or applicant are not correctly set.');
                return false;
            }
            // objectify settings if there are strings
            try {jioAttributeObject.storage=JSON.parse(settings.storage);}
            catch(e){jioAttributeObject.storage=settings.storage;}
            try{jioAttributeObject.applicant=JSON.parse(settings.applicant);}
            catch(e){jioAttributeObject.applicant=settings.applicant;}

            // check if key exists in jioAttributeObject.storageTypeObject
            if (!settings.storage.type) {
                $.error ('Storage incomplete.');
                return false;
            }
            if(!jioAttributeObject.storageTypeObject[settings.storage.type]) {
                $.error ('Unknown storage type "' +
                         settings.storage.type + '".');
                return false;
            }

            // TODO set a tab id for THIS jio ?
            // set a tab id to every jobs ?
            // see todo from methods.close

            // set tab id
            
            var localStor = jioAttributeObject.localStorage.getAll();
            for (var key in localStor) {
                var splitedkey = key.split('/');
                if (splitedkey[0] === 'jio' && splitedkey[1] === 'tab' &&
                    JSON.parse(splitedkey[2]) > jioAttributeObject.tabid) {
                    jioAttributeObject.tabid = JSON.parse(splitedkey[2]);
                }
            }
            jioAttributeObject.tabid ++;

            //jioAttributeObject.pubsub = new PubSub();
            if (!jioAttributeObject.queue)
                jioAttributeObject.queue = new JobQueue();
            if (!jioAttributeObject.listener)
                jioAttributeObject.listener = new JobListener();
            jioAttributeObject.listener.start();
            jioAttributeObject.isReady = true;
            return true;
        },
        isReady: function () {
            // Check if jio is ready to use.

            return jioAttributeObject.isReady;
        },
        addStorageType: function ( options ) {
            // Add a storage type to jio. Jio must have keys/types which are
            // bound to a storage creation function. ex: 'local', will
            // create a LocalStorage (in jio.storage.js).
            // It can replace a older type with a newer creation function.
            // options.type : the type of the storage.
            // options.creator : the function to create a storage object.

            var settings = $.extend({},options);
            if (settings.type && settings.creator) {
                jioAttributeObject.storageTypeObject[
                    settings.type] = settings.creator;
                return true;
            }
            return false;
        },
        getApplicant: function () {
            // return applicant set at init of jio

            return jioAttributeObject.applicant;
        },
        publish: function ( options ) {
            // publish a jio event
            // options.event : contains the event name.
            // options[*] : are the arguments sent with this event.
            
            if (!methods.isReady()) return null;
            console.log ('publish ' + options.event);
            var tmp = $.extend({},options);
            tmp.event = undefined;
            jioAttributeObject.pubsub.publish(options.event,tmp);
        },
        subscribe: function ( options ) {
            // subscribe to a jio event. We can subscribe to jio event even
            // if jio is not initialized.
            // options.event : contains the event name.
            // options.func : will call this function after receiving event.

            console.log ('subscribe');
            jioAttributeObject.pubsub.subscribe(options.event,options.func);
        },
        unsubscribe: function ( options ) {
            // unsubscribe to a jio event.
            // options.event : contains the event name.
            // TODO I wonder if it works.. ?

            console.log ('unsubscribe');
            jioAttributeObject.pubsub.unsubscribe(options.event);
        },
        doMethod: function ( options ) {
            // Do a method in jio. The method is set in [options.method],
            // it can be everything but itself.
            
            // $.jio({'fileName':'a','fileContent':'b','method':'save'}
            if (options.method) {
                if (options.method === 'doMethod') {
                    $.error ('Cannot do method "doMethod" recursively.');
                    return null;
                }
                if (methods[options.method]) {
                    return methods[options.method]( options );
                }
                $.error ('Method ' + options.method + ' not found.')
            }
            return null;
        },
        checkNameAvailability: function ( options ) {
            // Check the user availability in the storage set in [options]
            // or in the storage set at init. At the end of the job,
            // 'job_done' will be sent with this job and its 'isAvailable'
            // return value.
            // options.storage : the storage where to remove (optional)
            // options.applicant : the applicant (optional)

            // $.jio('checkNameAvailability',{'userName':'toto'});
            console.log ('isAvailable');
            if (!methods.isReady()) return null;
            var settings = $.extend ({
                'userName': jioAttributeObject.storage.userName,
                'storage': jioAttributeObject.storage,
                'applicant': jioAttributeObject.applicant,
                'method': 'checkNameAvailability'
            },options);
            // check dependencies
            if (settings.userName) {
                return jioAttributeObject.queue.addJob (
                    {'job':(new Job ( settings ))} ) ;
            }
            return null;
        },
        saveDocument: function ( options ) {
            // Load a document in the storage set in [options]
            // or in the storage set at init. At the end of the job,
            // 'job_done' will be sent with this job.
            // options.storage : the storage where to remove (optional)
            // options.applicant : the applicant (optional)

            // $.jio('saveDocument',{'fileName':'a','fileContent':'b','options':{
            //     'overwrite':false}}
            console.log ('saveDocument');
            if (!methods.isReady()) return null;
            var settings = $.extend({
                'storage': jioAttributeObject.storage,
                'applicant': jioAttributeObject.applicant,
                'lastModified': Date.now(),
                'method':'saveDocument'
            },options);
            // check dependencies
            if (settings.fileName && settings.fileContent) {
                return jioAttributeObject.queue.addJob (
                    {'job':(new Job ( settings ))} ) ;
            }
            return null;
        },
        loadDocument: function ( options ) {
            // Load a document in the storage set in [options]
            // or in the storage set at init. At the end of the job,
            // 'job_done' will be sent with this job and its 'fileContent'
            // return value.
            // options.storage : the storage where to remove (optional)
            // options.applicant : the applicant (optional)

            // $.jio('loadDocument',{'fileName':'a'});
            console.log ('load');
            if (!methods.isReady()) return null;
            var settings = $.extend ({
                'storage':jioAttributeObject.storage,
                'applicant':jioAttributeObject.applicant,
                'method':'loadDocument'
            },options);
            // check dependencies
            if ( settings.fileName ) {
                return jioAttributeObject.queue.addJob (
                    {'job':(new Job ( settings ))} ) ;
            }
            return null;
        },
        getDocument: function ( options ) {
            // TODO
        },
        getDocumentList: function ( options ) {
            // Get a document list of the user in the storage set in [options]
            // or in the storage set at init. At the end of the job,
            // 'job_done' will be sent with this job and its 'list'
            // return value.
            // options.storage : the storage where to remove (optional)
            // options.applicant : the applicant (optional)

            // $.jio('getDocumentList');
            console.log ('getList');
            if (!methods.isReady()) return null;
            var settings = $.extend ({
                'storage': jioAttributeObject.storage,
                'applicant': jioAttributeObject.applicant,
                'method':'getDocumentList'
            },options);
            return jioAttributeObject.queue.addJob (
                {'job':(new Job ( settings ))} );
        },
        removeDocument: function ( options ) {
            // Remove a document in the storage set in [options]
            // or in the storage set at init. At the end of the job,
            // 'job_done' will be sent with this job.
            // options.storage : the storage where to remove (optional)
            // options.applicant : the applicant (optional)

            // $.jio('removeDocument',{'fileName':'a'});
            console.log ('removeDocument');
            if (!methods.isReady()) return null;
            var settings = $.extend ({
                'storage': jioAttributeObject.storage,
                'applicant': jioAttributeObject.applicant,
                'method':'removeDocument'
            },options);
            if ( settings.fileName ) {
                return jioAttributeObject.queue.addJob (
                    {'job':(new Job( settings ))} );
            }
            return null;
        },
        start: function ( options ) { 
            // TODO
        },
        close: function ( options ) {
            // Finish some job if possible and close jio.
            // It can be re-init later.
            
            // TODO if someone is managing the browser closure or go to previous
            // page, $.jio('close') will close tab id (if any) to free its jobs,
            // so that other tabs may do them.
            
            jioAttributeObject.listener.stop();
            jioAttributeObject.isReady = false;
            return true;
        },
        getJioAttributes: function ( options ) {
            return $.extend({},jioAttributeObject);
        }
    };
    // end JIO methods
    ////////////////////////////////////////////////////////////////////////////
    // JIO arguments manager
    $.jio = function ( method ) {
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call (
                arguments, 1));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error ('Method ' + method + ' does not exists on JQuery.jio' );
        }
    };
    // end JIO arguments manager
    ////////////////////////////////////////////////////////////////////////////

})( jQuery );
