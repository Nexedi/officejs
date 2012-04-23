
;(function ( $ ) {
    ////////////////////////////////////////////////////////////////////////////
    // private vars
    var attr = {
        'jobMethodObject': {
            'isAvailable': {
                'start_event':'start_checkingNameAvailability',
                'stop_event':'stop_checkingNameAvailability',
                'func':'checkNameAvailability',
                'retvalue':'isAvailable' }, // returns 'boolean'
            'save': {
                'start_event':'start_saving',
                'stop_event':'stop_saving',
                'func':'saveDocument',
                'retvalue':'isSaved' }, // returns 'boolean'
            'load': {
                'start_event':'start_loading',
                'stop_event':'stop_loading',
                'func':'loadDocument',
                'retvalue':'fileContent' }, // returns the file content 'string'
            'getList': {
                'start_event':'start_gettingList',
                'stop_event':'stop_gettingList',
                'func':'getDocumentList',
                'retvalue':'list' }, // returns the document list 'array'
            'remove': {
                'start_event':'start_removing',
                'stop_event':'stop_removing',
                'func':'removeDocument',
                'retvalue':'isRemoved' } // returns 'boolean'
        },
        'queue': null,          // the job manager
        'storage': null,        // the storage given at init
        'applicant': null,      // the applicant given at init
        'listener': null,       // the job listener
        'pubsub': null,         // publisher subscriber
        'isReady': false,       // check if jio is ready
        'storageTypeObject': {}
    };

    // end private vars
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Tools
    var objectDump = function (o) {
        // TODO DEBUG we can remove this function
        console.log (JSON.stringify(o));
    };
    var toString = function (o) {
        // TODO DEBUG we can remove this function
        return (JSON.stringify(o));
    };
    var supportLocalStorage = function () {
        // Modernizr function
        try { return !!localStorage.getItem; }
        catch (e) { return false; }
    };
    var ifRemainingJobs = function(method) {
        // check if it remains [method] jobs (save,load,...)
        // method : can me 'string' or 'undefined'
        //     undefined -> test if there is at least one job
        //     string -> test if there is at least one [method] job

        if (!method) return (localStorage.joblist !== '[]');
        var joba = getJobArrayFromLocalStorage();        
        for (var k in joba) {
            if (joba[k].method === method &&
                joba[k].status !== 'fail') return true;
        }
        return false;
    };
    var getStatusObjectFromLocalStorage = function () {
        var tmp = {};
        if (localStorage.status) {
            tmp = JSON.parse (localStorage.status);
        } else {                // if it does not exists, create it
            for (var method in attr.jobMethodObject) {
                tmp[method] = 'done';
            }
        }
        return tmp;
    };
    var setStatusObjectToLocalStorage = function (statusobject) {
        localStorage.status = JSON.stringify(statusobject);
    };
    var getJobArrayFromLocalStorage = function () {
        var localjoblist = [];
        if (localStorage.joblist)
            localjoblist = JSON.parse(localStorage.joblist);
        return localjoblist;
    };
    var setJobArrayToLocalStorage = function (jobarray) {
        localStorage.joblist = JSON.stringify(jobarray);
    };
    var createStorageObject = function ( options ) {
        // create a storage thanks to attr.storageTypeObject

        if (!attr.storageTypeObject[ options.storage.type])
            return null;       // error!
        return attr.storageTypeObject[ options.storage.type ](options);
    }
    // end Tools
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Publisher Subcriber
    var PubSub = function () {
        if (!$.jiopubsub) {
            var topics = {};
            $.jiopubsub = function (id) {
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
            $.jiopubsub(eventname).publish(obj);
        },
        subscribe: function (eventname,func) {
            $.jiopubsub(eventname).subscribe(func);
        },
        unsubscribe: function (eventname) {
            $.jiopubsub(eventname).unsubscribe();
        }
    };
    attr.pubsub = new PubSub();
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
        //// set first job ID
        console.log ('Queue');
        this.jobid = 1;
        var localjoblist = getJobArrayFromLocalStorage();
        if (localjoblist.length > 0) {
            this.jobid = localjoblist[localjoblist.length - 1].id + 1;
        };
        localjoblist = undefined; // it is not necessary to fill memory with

        // reset all jobs' status to initial
        this.resetAll();

        var returnedJobAnalyse = function ( job ) {
            // analyse the [o.job]
            
            //// analysing job method
            if (!attr.jobMethodObject[job.method])
                return false;
            if (!ifRemainingJobs(job.method)) {
                var statusobject = getStatusObjectFromLocalStorage();
                statusobject[job.method] = 'done';
                setStatusObjectToLocalStorage(statusobject);
                switch (job.method) {
                    // TODO merging is done with jio? or by the user's scripts?
                case 'isAvailable':
                    // TODO merge name availability between storages
                    // TODO send job ?
                    $.jio('publish',{'event': attr.jobMethodObject[
                        job.method].stop_event, 'job':job});
                    return;
                case 'getList':
                    // TODO merge list if necessary (we can create
                    // this.getList, deleted after sending the event,
                    // filled with done event) -> merge here or show
                    // possible actions (manually, auto, ...)
                    $.jio('publish',{'event': attr.jobMethodObject[
                        job.method].stop_event , 'job':job});
                                          ///*, 'retvalue': merged list */});
                    // delete list
                    return;
                default:
                    $.jio('publish',{'event': attr.jobMethodObject[
                        job.method].stop_event});
                    return;
                }
            }
            //// end analyse
        };

        //// sebscribe an event
        var t = this;
        $.jio('subscribe',{'event':'job_done','func':function (o) {
            if (methods.isReady()) {
                t.done(o.job);
                returnedJobAnalyse (o.job);
            }
        }});
        $.jio('subscribe',{'event':'job_fail','func':function (o) {
            if (methods.isReady()) {
                t.fail(o.job);
                returnedJobAnalyse (o.job);
            }
        }});
        //// end subscribing
    };

    JobQueue.prototype = {
        addJob: function ( o ) {
            // Add a job to the Job list
            // o.storage : the storage object
            // o.job : the job object (may be a 'string')

            console.log ('addJob');
            //// Adding job to the list in localStorage
            // transforming job/storage to an object
            try { o.job = JSON.parse(o.job); } catch (e) {};
            try { o.storage = JSON.parse(o.storage); } catch (e) {};
            // create joblist in local storage if unset
            if (!localStorage.joblist) localStorage.joblist = "[]";
            // set job id
            o.job.id = this.jobid;
            this.jobid ++;
            // save the new job
            var localjoblist = getJobArrayFromLocalStorage();
            localjoblist.push(o.job);
            setJobArrayToLocalStorage (localjoblist);
            //// job added
        }, // end addJob
        
        removeJob: function ( options ) {
            // remove a job from localStorage
            // options.job : the job object containing at least {id:..}.
            // options.where : remove values where options.where(a,b) === true
            
            console.log ('removeJob');
            //// set tests functions
            var settings = $.extend ({'where':function (j) {return true;}},
                                     options);
            var andwhere ;
            if (settings.job) {
                andwhere = function (j) {return (j.id === settings.job.id);};
            } else {
                andwhere = function (j) {return true;};
            }
            //// end set tests functions

            //// modify the job list
            var jobarray = getJobArrayFromLocalStorage();
            var newjobarray = [];
            var found = false;
            // fill now jobarray with the 
            for (var k in jobarray) {
                if ( settings.where(jobarray[k]) && andwhere(jobarray[k]) ) {
                    found = true;
                } else {
                    newjobarray.push ( jobarray[k] );
                }
            }
            if (found) {
                setJobArrayToLocalStorage (newjobarray);
            } else {
                $.error ('Job not found, when trying to remove one.');
            }
            //// end modifying

            console.log ('end removeJob');
        },

        resetAll: function () {
            // reset All job to 'initial'
            
            console.log ('resetAll');
            var jobarray = getJobArrayFromLocalStorage();
            for (var i in jobarray) {
                jobarray[i].status = 'initial';
            }
            setJobArrayToLocalStorage(jobarray);
            console.log ('end resetAll');
        },

        invokeAll: function () {
            // Do all jobs in the list

            //// do All jobs
            var jobarray = getJobArrayFromLocalStorage();
            for (var i in jobarray) {
                if (jobarray[i].status === 'initial') {
                    jobarray[i].status = 'ongoing';
                    this.invoke(jobarray[i]);
                }
            }
            setJobArrayToLocalStorage(jobarray);
            //// end, continue doing jobs asynchronously
        },

        invoke: function (job) {
            // Do a job

            console.log ('invoke');
            //// analysing job method
            // browsing methods
            if (!attr.jobMethodObject[job.method])
                // TODO do an appropriate error reaction ? unknown job method
                return false; 
            var statusobject = getStatusObjectFromLocalStorage ();
            if (statusobject[job.method] === 'done') {
                statusobject[job.method] = 'ongoing';
                setStatusObjectToLocalStorage(statusobject);
                $.jio('publish',
                      {'event':attr.jobMethodObject[job.method].start_event,
                       'job':job});
            }
            // create an object and use it to save,load,...!
            createStorageObject({'storage':job.storage,
                                 'applicant':attr.applicant})[
                attr.jobMethodObject[job.method].func
            ](job);
            //// end method analyse
            console.log ('end invoke');
        },

        done: function (job) {
            // This job is supposed done, we can remove it from localStorage.
            
            this.removeJob ({'job':job});
        },

        fail: function (job) {
            // This job cannot be done, change its status into localStorage.

            var jobarray = getJobArrayFromLocalStorage ();
            //// find this unique job inside the list
            for (var i in jobarray) {
                if (jobarray[i].id === job.id) {
                    jobarray[i] = job;
                    break;
                }
            }
            // save to local storage
            setJobArrayToLocalStorage (jobarray);
        },

        clean: function () {
            // Clean the job list, removing all jobs that have failed.
            // It also change the localStorage Job list

            this.removeJob (undefined,
                            {'where':
                             function (j) {
                                 return (j.status === 'fail');
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
            if (!this.id) {
                this.id = setInterval (function () {
                    // if there are jobs
                    if (localStorage.joblist &&
                        localStorage.joblist !== '[]') {
                        attr.queue.invokeAll();
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
            var settings = $.extend({},options);
            // if already initialized
            if (methods.isReady()) {
                methods.doMethod(settings);
                return false;
            }
            console.log ('initializing');
            // check dependencies
            if (!supportLocalStorage()) {
                alert ('Your browser does not support local storage. '+
                       '$.jio cannot be initialized.');
                $.error ('localStorage not supported');
                return false;
            }
            // check settings
            if (!settings.storage ||
                !settings.applicant) {
                $.error ('Storage or applicant are not correctly set.');
                return false;
            }
            // objectify settings if there are strings
            try { attr.storage = JSON.parse(settings.storage); }
            catch (e) { attr.storage = settings.storage; }
            try { attr.applicant = JSON.parse(settings.applicant); }
            catch (e) { attr.applicant = settings.applicant; }

            // check if key exists in attr.storageTypeObject
            if (!settings.storage.type) {
                $.error ('Storage incomplete.');
                return false;
            }
            if (!attr.storageTypeObject[settings.storage.type]) {
                $.error ('Unknown storage type "' + settings.storage.type + '".');
                return false;
            }

            // TODO set a tab id for THIS jio ?
            // set a tab id to every jobs ?
            // see todo from methods.close

            //attr.pubsub = new PubSub();
            if (!attr.queue)
                attr.queue = new JobQueue();
            if (!attr.listener)
                attr.listener = new JobListener();
            attr.listener.start();
            attr.isReady = true;
        },
        isReady: function () {
            // check if jio is ready
            return attr.isReady;
        },
        addStorageType: function ( options ) {
            var settings = $.extend({},options);
            // add LocalStorage to storage object
            if (settings.type && settings.creator) {
                attr.storageTypeObject [settings.type] = settings.creator;
                return true;
            }
            return false;
        },
        getApplicant: function () {
            // return applicant
            return attr.applicant;
        },
        publish: function ( options ) {
            if (!methods.isReady()) return null;
            console.log ('publish ' + options.event);
            var tmp = $.extend({},options);
            tmp.event = undefined;
            attr.pubsub.publish(options.event,tmp);
        },
        subscribe: function ( options ) {
            console.log ('subscribe');
            attr.pubsub.subscribe(options.event,options.func);
        },
        unsubscribe: function ( options ) {
            console.log ('unsubscribe');
            attr.pubsub.unsubscribe(options.event);
        },
        doMethod: function ( options ) {
            // $.jio({'fileName':'a','fileContent':'b','method':'save'}
            if (options.method) {
                if (methods[options.method]) {
                    methods[options.method]( options );
                } else {
                    $.error ('Method ' + options.method + ' not found.')
                }
            }
        },
        isAvailable: function ( options ) {
            // $.jio('isAvailable',{'userName':'toto'});
            console.log ('isAvailable');
            if (!methods.isReady()) return null;
            var settings = $.extend ({
                'userName': attr.storage.userName,
                'storage': attr.storage,
                'applicant': attr.applicant,
                'method': 'isAvailable'
            },options);
            // check dependencies
            if (settings.userName) {
                return attr.queue.addJob ( {'job':(new Job ( settings ))} ) ;
            }
            return null;
        },
        save: function ( options ) {
            // $.jio('save',{'fileName':'a','fileContent':'b','options':{
            //     'overwrite':false}}
            console.log ('save');
            if (!methods.isReady()) return null;
            var settings = $.extend({
                'storage': attr.storage,
                'applicant': attr.applicant,
                'lastModified': Date.now(),
                'method':'save'
            },options);
            // check dependencies
            if (settings.fileName && settings.fileContent) {
                return attr.queue.addJob ( {'job':(new Job ( settings ))} ) ;
            }
            return null;
        },
        load: function ( options ) {
            // $.jio('load',{'fileName':'a'});
            console.log ('load');
            if (!methods.isReady()) return null;
            var settings = $.extend ({
                'storage':attr.storage,
                'applicant':attr.applicant,
                'method':'load'
            },options);
            // check dependencies
            if ( settings.fileName ) {
                return attr.queue.addJob ( {'job':(new Job ( settings ))} ) ;
            }
            return null;
        },
        getList: function ( options ) {
            // $.jio('getList');
            console.log ('getList');
            if (!methods.isReady()) return null;
            var settings = $.extend ({
                'storage': attr.storage,
                'applicant': attr.applicant,
                'method':'getList'
            },options);
            return attr.queue.addJob ( {'job':(new Job ( settings ))} );
        },
        remove: function ( options ) {
            // $.jio('remove',{'fileName':'a'});
            console.log ('remove');
            if (!methods.isReady()) return null;
            var settings = $.extend ({
                'storage': attr.storage,
                'applicant': attr.applicant,
                'method':'remove'
            },options);
            if ( settings.fileName ) {
                return attr.queue.addJob ( {'job':(new Job( settings ))} );
            }
            return null;
        },
        clean: function ( options ) {
            // clean the job, removing all job that have failed.
            attr.queue.clean();
        },
        close: function ( options ) {
            // finish some job if possible and close jio.
            // it can be re-init later.
            
            // TODO if someone is managing the browser closure or go to previous
            // page, $.jio('close') will close tab id (if any) to free its jobs,
            // so that other tabs may do them.
            
            attr.listener.stop();
            attr.isReady = false;
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

    ////////////////////////////////////////////////////////////////////////////
    // Local Storage
    var LocalStorage = function ( options ) {
        this.userName = options.storage.userName;
        // check user's localStorage
        if(!localStorage[this.userName]) {
            localStorage[this.userName] = '{}'; // create user
        }
    };
    LocalStorage.prototype = {
        readDocumentsFromLocalStorage: function () {
            return JSON.parse (localStorage[this.userName]);
        },
        writeDocumentsToLocalStorage: function (documents) {
            localStorage[this.userName] = JSON.stringify(documents);
        },
        checkNameAvailability: function ( job ) {
            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                if (localStorage[job.userName]) {
                    job.status = 'done';
                    job.message = ''+ job.userName + ' is not available.';
                    job.isAvailable = false;
                    $.jio('publish',{'event': 'job_done',
                                     'job': job});
                } else {
                    job.status = 'done';
                    job.message = ''+ job.userName + ' is available.';
                    job.isAvailable = true;
                    $.jio('publish',{'event': 'job_done',
                                     'job': job});
                }
            }, 100);
        }, // end userNameAvailable

        saveDocument: function ( job ) {
            // Save a document in the local storage
            // job : the job object
            // job.options : the save options
            // job.options.overwrite : true -> overwrite
            // job.options.force : true -> save even if jobdate < existingdate
            //                             or overwrite: false

            var settings = $.extend({'overwrite':true,
                                     'force':false},job.options);
            var t = this;
            // wait a little in order to simulate asynchronous saving
            setTimeout (function () {
                var documents = t.readDocumentsFromLocalStorage();
                if (!documents[job.fileName]) { // create document
                    documents[job.fileName] = {
                        'fileName': job.fileName,
                        'fileContent': job.fileContent,
                        'creationDate': Date.now (),
                        'lastModified': Date.now ()
                    }
                    t.writeDocumentsToLocalStorage(documents);
                    job.status = 'done';
                    job.message = 'Document saved.';
                    job.isSaved = true;
                    $.jio('publish',{'event':'job_done',
                                     'job':job});
                    return true;
                }
                if ( settings.overwrite || settings.force ) { // overwrite
                    if ( ! settings.force ) { // force write
                        // checking modification date
                        if ( ! documents[
                            job.fileName].lastModified < job.lastModified ) {
                            // date problem!
                            job.status = 'fail';
                            job.message = 'Modification date is earlier than ' +
                                'existing modification date.';
                            job.isSaved = false;
                            $.jio('publish',{'event':'job_done',
                                             'job':job});
                            return false;
                        }
                    }
                    documents[job.fileName].lastModified = Date.now();
                    documents[job.fileName].fileContent = job.fileContent;
                    t.writeDocumentsToLocalStorage(documents);
                    job.status = 'done';
                    job.message = 'Document saved';
                    job.isSaved = true;
                    $.jio('publish',{'event':'job_done',
                                     'job':job});
                    return true;
                }
                // already exists
                job.status = 'fail';
                job.message = 'Document already exists.';
                job.errno = 403;
                job.isSaved = false;
                $.jio('publish',{'event':'job_fail',
                                 'job': job});
                return false;
            }, 100);
        }, // end saveDocument

        loadDocument: function ( job ) {
            // load a document in the storage, copy the content into the job
            // job : the job
            
            var t = this;
            // wait a little in order to simulate asynchronous operation
            setTimeout(function () {
                var documents = t.readDocumentsFromLocalStorage();
                if (!documents[job.fileName]) {
                    job.status = 'fail';
                    job.errno = 404;
                    job.message = 'Document not found.';
                    $.jio('publish',{'event':'job_fail',
                                     'job':job});
                } else {
                    job.status = 'done';
                    job.message = 'Document loaded.';
                    job.fileContent = documents[job.fileName].fileContent;
                    $.jio('publish',{'event':'job_done',
                                     'job':job});
                }
            }, 100);
        }, // end loadDocument

        getDocumentList: function (job) {
            var t = this;
            setTimeout(function () {
                var documents = t.readDocumentsFromLocalStorage();
                job.list = [];
                for (var k in documents) {
                    job.list.push ({
                        'fileName':documents[k].fileName,
                        'creationDate':documents[k].creationDate,
                        'lastModified':documents[k].lastModified});
                }
                job.status = 'done';
                job.message = 'List received.';
                $.jio('publish',{'event':'job_done',
                                 'job':job});
            }, 100);
        }, // end getDocumentList

        removeDocument: function () {
            var t = this;
            setTimeout (function () {
                var documents = t.readDocumentsFromLocalStorage();
                if (!documents[job.fileName]) {
                    // job.status = 'fail';
                    // job.errno = 404;
                    // job.message = 'Document not found.';
                    // job.isRemoved = false;
                    // $.jio('publish',{'event':'job_fail',
                    //                  'job':job});
                    job.status = 'done';
                    job.message = 'Document already removed.';
                    job.isRemoved = true;
                    $.jio('publish',{'event':'job_done',
                                     'job':job});
                } else {
                    delete documents[job.fileName];
                    t.writeToLocalStorage(documents);
                    job.status = 'done';
                    job.message = 'Document removed.';
                    job.isRemoved = true;
                    $.jio('publish',{'event':'job_done',
                                     'job':job});
                }
            }, 100);
        }
    };

    // add key to storageObject
    methods.addStorageType({'type':'local','creator':function (o) {
        return new LocalStorage(o);
    }});

    // end Local Storage
    ////////////////////////////////////////////////////////////////////////////

})( jQuery );
