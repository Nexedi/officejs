
;var JIO = 
(function () {
    
    // check dependencies
    var errorDependencies=function(){console.error('Cannot find jQuery.');};
    try{if(!jQuery){
        errorDependencies();return null;
    }}catch(e){
        errorDependencies();return null;}

    ////////////////////////////////////////////////////////////////////////////
    // constants
    var jioConstObj = {
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
        }
    };
    // end constants
    ////////////////////////////////////////////////////////////////////////////
    // jio globals
    var jioGlobalObj = {
        'localStorage': null,   // where the browser stores data
        'queueID': 1,
        'storageTypeObject': {} // ex: {'type':'local','creator': fun ...}
    };
    // end jio globals
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // cookies & localStorage
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
            jioGlobalObj.localStorage = new browserStorage();
        } else {
            jioGlobalObj.localStorage = new cookieStorage();
        }
    }
    catch (e) {
        jioGlobalObj.localStorage = new cookieStorage();
    }
    // end cookies & localStorages
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Tools
    var createStorageObject = function ( options ) {
        // Create a storage thanks to storages types set with 'addStorageType'.

        if (!jioGlobalObj.storageTypeObject[ options.storage.type ])
            return null;       // error!
        return jioGlobalObj.storageTypeObject[
            options.storage.type ](options);
    };
    var getNewQueueID = function () {
        // Returns a new queueID
        var localStor = jioGlobalObj.localStorage.getAll();
        for (var k in localStor) {
            var splitk = k.split('/');
            if (splitk[0] === 'jio' &&
                splitk[1] === 'id') {
                if (JSON.parse(localStor[k]) < Date.now() - 10000) { // 10 sec ?
                    jioGlobalObj.localStorage.deleteItem(k);
                }
                if (JSON.parse(splitk[2]) >= jioGlobalObj.queueID) {
                    jioGlobalObj.queueID = JSON.parse(splitk[2]) + 1;
                }
            }
        }
        var id = jioGlobalObj.queueID;
        jioGlobalObj.queueID ++;
        return id;
    };
    // end Tools
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Publisher Subcriber
    var PubSub = function () {
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
    };
    PubSub.prototype = {
        publish: function (eventname,obj) {
            // publish an event
            this.eventAction(eventname).publish(obj);
        },
        subscribe: function (eventname,callback) {
            // subscribe and return the callback function
            this.eventAction(eventname).subscribe(callback);
            return callback;
        },
        unsubscribe: function (eventname,callback) {
            // unsubscribe the callback from eventname
            this.eventAction(eventname).unsubscribe(callback);
        }
    };
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

    var JobQueue = function ( publisher ) {
        // JobQueue is a queue of jobs. It will regulary copy this queue
        // into localStorage to resume undone tasks.
        // pubsub: the publisher to use to send event
        
        this.publisher = publisher;
        this.jobid = 1;
        this.jioID = 0;
        this.jobObjectName = '';
        this.jobObject = {};

        // reset all jobs' status to initial
        this.resetAll();

    };

    JobQueue.prototype = {
        init: function ( options ) {
            // initialize the JobQueue
            // options.publisher : is the publisher to use to send events
            // options.jioID : the jio ID

            if (options.publisher)
                this.publisher = publisher;
            this.jioID = options.jioID;
            this.jobObjectName = 'jio/jobObject/'+options.jioID;
            this.jobObject = {};
            this.copyJobQueueToLocalStorage();
        },
        close: function () {
            // close the job queue.
            // it also deletes from local storage only if the job list is
            // empty.
            
            if (JSON.stringify(this.jobObject) === '{}') {
                jioGlobalObj.localStorage.deleteItem(this.jobObjectName);
            }
        },
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

            return jioGlobalObj.localStorage.setItem(
                this.jobObjectName,this.jobObject);
        },
        addJob: function ( job ) {
            // Add a job to the queue
            // job : the job object

            console.log ('addJob');
            // set job id
            job.id = this.jobid;
            this.jobid ++;
            // save the new job into the queue
            this.jobObject[job.id] = job;
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

            console.log ('invoke ' + JSON.stringify(job));
            //// analysing job method
            // if the method does not exist, do nothing
            if (!jioConstObj.jobMethodObject[job.method])
                return false;   // suppose never happen
            // test if a similar job is on going, in order to publish a start
            // event if it is the first of his kind (method).
            if (!this.isThereJobsWhere(function (testjob){
                return (testjob.method === job.method &&
                        testjob.method === 'initial');
            })) {
                job.status = 'ongoing';
                this.publisher.publish(jioConstObj.jobMethodObject[
                    job.method].start_event);
            } else {
                job.status = 'ongoing';
            }
            // Create a storage object and use it to save,load,...!
            var t = this;
            createStorageObject(
                {'storage':job.storage,
                 'applicant':jioGlobalObj.applicant})[job.method](
                     job,function (endedjob){
                         t.ended(endedjob);
                     });
            //// end method analyse
        },

        ended: function (job) {
            console.log ('ended');
            switch (job.status) {
            case 'done':
                // This job is supposed done, we can remove it from queue.
                this.removeJob ({'job':job});
                break;
            case 'fail':
                // This job cannot be done.
                // save to local storage
                this.copyJobQueueToLocalStorage ();
                break;
            default:
                break;
            }

            //// ended job analyse
            // if the job method does not exists, return false
            if (!jioConstObj.jobMethodObject[job.method])
                return false;
            // if there isn't some job to do, then send stop event
            if (!this.isThereJobsWhere(function(testjob){
                return (testjob.method === job.method && 
                        testjob.status !== 'fail');
            })) {
                this.publisher.publish(
                    jioConstObj.jobMethodObject[
                        job.method].stop_event);
                    return;
            }
            //// end returnedJobAnalyse
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
    var JobListener = function ( queue ) {
        // A little daemon which will start jobs from the joblist
        
        this.interval = 200;
        this.id = null;
        this.queue = queue;
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
                var queue = this.queue;
                this.id = setInterval (function () {
                    // if there is jobs
                    if (JSON.stringify(queue.jobObject) !== '{}') {
                        queue.invokeAll();
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
                return true;
            }
            return false;
        }
    }
    // end jio job listener
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Toucher
    var Toucher = function () {
        // The toucher is a little thread that show activity of this jio.
        this.interval = 400;
        this.id = null;
    };
    Toucher.prototype = {
        start: function (id) {
            // start the toucher
            console.log ('start touching jio/id/'+id);
            if (!this.id) {
                this.touch(id);
                var t = this;
                this.id = setInterval (function () {
                    t.touch(id);
                },this.interval);
                return true;
            } else {
                return false;
            }            
        },
        stop: function () {
            // stop the toucher
            console.log ('stop touching');
            if (this.id) {
                clearInterval (this.id);
                this.id = null;
                return true;
            }
            return false;
        },
        touch: function (id) {
            jioGlobalObj.localStorage.setItem ('jio/id/' + id,
                                               Date.now() );
        }
    };
    // end Toucher
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // JIO Constructor
    var JioCons = function ( storage , applicant ) {
        // JIO Constructor, create a new JIO object.
        // It just initializes values.
        // storage   : the storage that contains {type:..,[storageinfos]}
        // applicant : the applicant that contains {ID:...}
        // these parameters are optional and may be 'string' or 'object'

        // objectify storage and applicant
        if(typeof storage === 'string')
            storage = JSON.parse(options.storage);
        if(typeof applicant === 'string')
            applicant = JSON.parse(options.applicant);

        // set init values
        this['storage']   = storage;
        this['applicant'] = applicant;
        this['id']        = 0;
        this['pubsub']    = new PubSub();
        this['queue']     = new JobQueue(this.pubsub);
        this['listener']  = new JobListener(this.queue);
        this['toucher']   = new Toucher();
        this['ready']     = false;

        // check storage type
        if (this.storage)
            if (!jioGlobalObj.storageTypeObject[this.storage.type])
                $.error('Unknown storage type "' + this.storage.type +'"');
    };
    // JIO Prototype
    JioCons.prototype = {
        start: function () {
            // Start JIO: start listening to jobs and make it ready
            
            // set a new jio id
            this.id = getNewQueueID();
            console.log (this.id);
            // initializing objects
            this.queue.init({'jioID':this.id});
            // start touching
            this.toucher.start(this.id);
            // start listening
            this.listener.start();
            // is now ready
            this.ready = true;
            return this.isReady();
        },
        stop: function () {
            // Finish some job if possible and stop listening.
            // It can be restarted later
            
            this.queue.close();
            this.listener.stop();
            this.toucher.stop();
            this.ready = false;
            return true;
        },
        kill: function () {
            // kill this JIO, job listening and job operation (event if they
            // are on going!)
            
            this.queue.close();
            this.listener.stop();
            this.toucher.stop();
            // TODO
            this.ready = false;
            return true;
        },
        isReady: function () {
            // Check if Jio is ready to use.
            return this.ready;
        },
        publish: function (eventname, obj) {
            // publish an event on this jio
            // eventname : the event name
            // obj : is an object containing some parameters for example
            
            if (!this.isReady()) return ;
            console.log ('publish ' + eventname);
            return this.pubsub.publish(eventname,obj);
        },
        subscribe: function (eventname, callback) {
            // subscribe to an event on this jio. We can subscribe to jio event
            // even if jio is not started. Returns the callback function in
            // order to unsubscribe it.
            // eventname : the event name.
            // callback : called after receiving event.

            console.log ('subscribe ' +eventname);
            return this.pubsub.subscribe(eventname,callback);
        },
        unsubscribe: function (eventname,callback) {
            // unsubscribe callback from an event
            
            console.log ('unsubscribe ' +eventname);
            return this.pubsub.unsubscribe(eventname,callback);
        },

        checkNameAvailability: function ( options ) {
            // Check the user availability in the storage set in [options]
            // or in the storage set at init. At the end of the job,
            // 'job_done' will be sent with this job and its 'isAvailable'
            // return value.
            // options.storage : the storage where to remove (optional)
            // options.applicant : the applicant (optional)
            // options.callback(result) : called to get the result.

            // example :
            //     jio.checkNameAvailability({'userName':'myName','callback':
            //         function (result) { alert('is available? ' +
            //             result.isAvailable); }});

            if (!this.isReady()) return null;
            var settings = $.extend ({
                'userName': this.storage.userName,
                'storage': this.storage,
                'applicant': this.applicant,
                'method': 'checkNameAvailability',
                'callback': function () {}
            },options);
            // check dependencies
            if (settings.userName && settings.storage && settings.applicant) {
                return this.queue.addJob ( new Job ( settings ) );
            }
            return null;
        },

        saveDocument: function ( options ) {
            // Load a document in the storage set in [options]
            // or in the storage set at init. At the end of the job,
            // 'job_done' will be sent with this job.
            // options.storage : the storage where to remove (optional)
            // options.applicant : the applicant (optional)
            // options.callback(result) : called to get the result.

            // jio.saveDocument({'fileName':'file','fileContent':'content',
            //     'callback': function (result) { alert('saved?' +
            //         result.isSaved); }});

            console.log ('saveDocument');
            if (!this.isReady()) return null;
            var settings = $.extend({
                'storage': this.storage,
                'lastModified': Date.now(),
                'method':'saveDocument',
                'applicant': this.applicant,
                'callback': function () {}
            },options);
            // check dependencies
            if (settings.fileName && settings.fileContent &&
                settings.storage && settings.applicant) {
                return this.queue.addJob ( new Job ( settings ) );
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
            // options.callback(result) : called to get the result.

            // jio.loadDocument({'fileName':'file','callback':
            //     function (result) { alert('content: '+
            //         result.fileContent); }});

            console.log ('load');
            if (!this.isReady()) return null;
            var settings = $.extend ({
                'storage': this.storage,
                'applicant': this.applicant,
                'method':'loadDocument',
                'callback': function(){}
            },options);
            // check dependencies
            if ( settings.fileName && settings.storage && settings.applicant) {
                return jioGlobalObj.queue.addJob ( new Job ( settings ) );
            }
            return null;
        },

        getDocument: function ( options ) {
            // TODO (don't forgot to add this method to constants)
        },

        getDocumentList: function ( options ) {
            // Get a document list of the user in the storage set in [options]
            // or in the storage set at init.
            // options.storage : the storage where to remove (optional)
            // options.applicant : the applicant (optional)
            // options.callback(result) : called to get the result.

            // jio.getDocumentList({'callback':
            //     function (result) { alert('list: '+result.list); }});

            console.log ('getList');
            if (!this.isReady()) return null;
            var settings = $.extend ({
                'storage': this.storage,
                'applicant': this.applicant,
                'method':'getDocumentList',
                'callback':function(){}
            },options);
            // check dependencies
            if ( settings.storage && settings.applicant ) {
                return this.queue.addJob ( new Job ( settings ) );
            }
            return null;
        },

        removeDocument: function ( options ) {
            // Remove a document in the storage set in [options]
            // or in the storage set at init.
            // options.storage : the storage where to remove (optional)
            // options.applicant : the applicant (optional)
            // options.callback(result) : called to get the result.

            // jio.removeDocument({'fileName':'file','callback':
            //     function (result) { alert('removed? '+result.isRemoved); }});
            
            console.log ('removeDocument');
            if (!this.isReady()) return null;
            var settings = $.extend ({
                'storage': this.storage,
                'applicant': this.applicant,
                'method':'removeDocument',
                'callback':function (){}
            },options);
            if ( settings.fileName && settings.storage && settings.applicant ) {
                return this.queue.addJob ( new Job( settings ) );
            }
            return null;
        }
    };
    // end JIO Prototype
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Jio creator
    var Jio = function () {
        // Jio creator object
        // this object permit to create jio object
    };
    Jio.prototype = {
        createNew: function ( storage, applicant) {
            // return a new instance of JIO

            return new JioCons(storage,applicant);
        },
        addStorageType: function ( type, constructor ) {
            // Add a storage type to jio. Jio must have keys/types which are
            // bound to a storage creation function. ex: 'local', will
            // create a LocalStorage (in jio.storage.js).
            // It can replace a older type with a newer creation function.
            // type : the type of the storage.
            // constructor : the function which returns a new storage object.

            if (type && constructor) {
                jioGlobalObj.storageTypeObject[type] = constructor;
                return true;
            }
            return false;
        },
        getGlobalObject: function () {
            // Returns the global jio values
            return jioGlobalObj;
        },
        getConstObject: function () {
            // Returns a copy of the constants
            return $.extend({},jioConstObj);
        }
    };
    return new Jio();
    // end Jio Creator
    ////////////////////////////////////////////////////////////////////////////
})();
