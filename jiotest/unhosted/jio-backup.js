/*
 JIO: Javascript I/O. A library to load, edit, save documents to
 multiple storage backends using a common interface
 */
(function() {

    ////////////////////////////////////////////////////////////////////////////
    // Define constants

    var C = {
        'STATUS_INITIAL': 'initial',
        'STATUS_DONE': 'done',
        'STATUS_ONGOING': 'ongoing',
        'STATUS_FAIL': 'fail',
        
        'METHOD_AVAILABLE': 'userNameAvailable',
        'METHOD_SAVE': 'save',
        'METHOD_LOAD': 'load',
        'METHOD_GETLIST': 'getList',
        'METHOD_DELETE': 'delete',
        
        'EVENT_PREFIX': 'jio:',
        'EVENT_JOB_DONE': 'job_done',
        'EVENT_JOB_FAIL': 'job_fail',
        'EVENT_START_AVAILABLE': 'start_usernameavailable',
        'EVENT_STOP_AVAILABLE': 'stop_usernameavailable',
        'EVENT_START_SAVING': 'start_saving',
        'EVENT_STOP_SAVING': 'stop_saving',
        'EVENT_START_LOADING': 'start_loading',
        'EVENT_STOP_LOADING': 'stop_loading',
        'EVENT_START_GETTINGLIST': 'start_gettinglist',
        'EVENT_STOP_GETTINGLIST': 'stop_gettinglist',
        'EVENT_START_DELETING': 'start_deleting',
        'EVENT_STOP_DELETING': 'stop_deleting',
        
        'FUNC_AVAILABLE':'userNameAvailableFromJob',
        'FUNC_SAVE':'saveDocumentFromJob',
        'FUNC_LOAD':'loadDocumentFromJob',
        'FUNC_GETLIST':'getListFromJob',
        'FUNC_DELETE':'deleteDocumentFromJob',
        
        'DEFAULT_INTERVAL_DELAY': 100
    };
    C['DEFAULT_CONST_OBJECT'] = {};
    C['DEFAULT_CONST_OBJECT'][C.METHOD_AVAILABLE] = {
        'STARTEVENT':C.EVENT_START_AVAILABLE,
        'STOPEVENT':C.EVENT_STOP_AVAILABLE,
        'FUNC':C.FUNC_AVAILABLE};
    C['DEFAULT_CONST_OBJECT'][C.METHOD_SAVE] = {
        'STARTEVENT':C.EVENT_START_SAVING,
        'STOPEVENT':C.EVENT_STOP_SAVING,
        'FUNC':C.FUNC_SAVE};
    C['DEFAULT_CONST_OBJECT'][C.METHOD_LOAD] = {
        'STARTEVENT':C.EVENT_START_LOADING,
        'STOPEVENT':C.EVENT_STOP_LOADING,
        'FUNC':C.FUNC_LOAD};
    C['DEFAULT_CONST_OBJECT'][C.METHOD_GETLIST] = {
        'STARTEVENT':C.EVENT_START_GETTINGLIST,
        'STOPEVENT':C.EVENT_STOP_GETTINGLIST,
        'FUNC':C.FUNC_GETLIST};
    C['DEFAULT_CONST_OBJECT'][C.METHOD_DELETE] = {
        'STARTEVENT':C.EVENT_START_DELETING,
        'STOPEVENT':C.EVENT_STOP_DELETING,
        'FUNC':C.FUNC_DELETE};

    var storageTypeObject = {};
    var queue = null;       // the jobs manager
    var jioStorage = null;
    var jioApplicant = null;
    // TODO stock statusobject for this tab ? faster ? better ?


    ////////////////////////////////////////////////////////////////////////////
    // JIO main object. Contains all IO methods

    var JIO = {
        listener: null,

        /**
         * prepare and return the jio object
         * @param jioData : text or json content of jio.json or method to get it
         * @param applicant : (optional) information about the person/application needing this JIO object (used to limit access)
         * @return JIO object
         */
        initialize: function(jioData, applicant) {
            // JIO initialize
            // jioData: object containing storage informations
            //     {type:,userName:,etc}
            // applicant: a string of the applicant name
            jioApplicant = {"ID":applicant};
            if (!applicant) return false; // TODO to know: return false or alert user ?
            if (!dependenceLoaded()) {
                setTimeout(function() {JIO.initialize(jioData, jioApplicant);},50);
            } else {
                switch(typeof jioData) {
                case "string" :
                    jioStorage = JSON.parse(jioData);
                    break;
                case "object" :
                    jioStorage = jioData;
                    break;
                case "function" :
                    jioStorage = jioData();
                    break;
                default:
                    alert("Error while getting jio.json content");
                    break;
                }
                this.addStorageType('local',function (stor,app) {
                    return new JIO.LocalStorage(stor,app);
                });
                queue = new JIO.JobQueue();
                this.listener = new JIO.JobListener(C.DEFAULT_INTERVAL_DELAY);
                this.listener.start();
            }
        },

        /**
         * return the state of JIO object
         * @return true if ready, false otherwise
         */
        isReady: function() {if(queue && jioStorage) return true; return false;},

        //IO functions
        getLocation: function() {return this.location},
        userNameAvailable: function(name) {
            return queue.addJob (jioStorage,
                                 new JIO.JobUser(C.METHOD_AVAILABLE,name));
        },
        loadDocument: function(fileName) {
            return queue.addJob (jioStorage,
                                 new JIO.Job(C.METHOD_LOAD,fileName));
        },
        saveDocument: function(fileContent, fileName) {
            return queue.addJob (jioStorage,
                                 new JIO.Job(C.METHOD_SAVE,fileName,fileContent));
        },
        deleteDocument: function(fileName) {
            return queue.addJob (jioStorage,
                                 new JIO.Job(C.METHOD_DELETE,fileName));
        },
        getDocumentList: function() {
            return queue.addJob (jioStorage,
                                 new JIO.Job(C.METHOD_GETLIST));
        },
        
        publish: function(event,obj) {
            pubSub.publish(event,obj);
        },
        subscribe: function(event,func) {
            pubSub.subscribe(event,func);
        },
        unsubscribe: function(event) {
            pubSub.unsubscribe(event);
        },

        getApplicant: function() {
            return jioApplicant;
        },

        getConstantObject: function() {
            // return a copy of the constants
            return JSON.parse(JSON.stringify(C));
        },
        addStorageType: function(newType,storageCreator) {
            storageTypeObject[newType] = storageCreator;
        }
    }

    // End JIO object
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Publisher Subscriber

    var pubSub = new function () {
        var topics = {};
        $.JIOPubSub = function (id) {
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
        }
        this.publish = function (eventname,obj) {
            $.JIOPubSub(C.EVENT_PREFIX + eventname).publish(obj);
        },
        this.subscribe = function (eventname,func) {
            $.JIOPubSub(C.EVENT_PREFIX + eventname).subscribe(func);
        },
        this.unsubscribe = function (eventname) {
            $.JIOPubSub(C.EVENT_PREFIX + eventname).unsubscribe();
        }
    };
    
    // End Publisher Subscriber
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // JIO Job Listener

    JIO.JobListener = function (interval) {
        // A little daemon which will start jobs from the joblist
        
        this.interval = (interval ? interval : 200);
        this.id = null;
    };
    
    JIO.JobListener.prototype = {

        /**
         * Set the time between two joblist check in millisec
         */
        setIntervalDelay: function (interval) {
            this.interval = interval;
        },

        /**
         * Wait for jobs in the joblist inside the localStorage
         */
        start: function () {this.id = setInterval (function(){
            // if there are jobs
            if (localStorage.joblist &&
                localStorage.joblist !== '[]') {
                queue.invokeAll();
            }
        },this.interval);},

        /**
         * Stop the listener
         */
        stop: function () {
            console.log ('stop listening');
            clearInterval (this.id);
            this.id = null;
        }
    };

    // End Job Listener
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Job & JobQueue

    /**
     *     Function parameters
     * Parameter storage: Constains {type:local/dav/...,userName:...,...}.
     *                    Must be an 'object'.
     * Parameter job: Contains {[id:..,]method:save/load/delete,
     *                fileName:name,fileContent:content[,status:"initial"]}.
     *                May be a 'string' or an 'object'
     */

    JIO.Job = function (method,filename,filecontent) {
        // Job Constructor & initializer
        
        var tmp = {'id':0}
        tmp['method'] = method;
        tmp['fileName'] = filename;
        tmp['fileContent'] = filecontent;
        tmp['status'] = C.STATUS_INITIAL;
        return tmp;
    };
    JIO.JobUser = function (method,username) {
        // JobUser Constructor & initializer
        
        var tmp = {'id':0}
        tmp['method'] = method;
        tmp['userName'] = username;
        tmp['status'] = C.STATUS_INITIAL;
        return tmp;
    };

    JIO.JobQueue = function () {
        //// set first job ID
        this.jobid = 1;
        var localjoblist = getJobArrayFromLocalStorage();
        if (localjoblist.length > 0) {
            this.jobid = localjoblist[localjoblist.length - 1].id + 1;
        };
        localjoblist = null; // it is not necessary to fill memory with
                             // unused vars

        // reset all jobs' status to initial
        this.resetAll();

        var returnedJobAnalyse = function (job) {
            // analyse the [job]
            
            //// analysing job method
            if (!C.DEFAULT_CONST_OBJECT[job.method])
                return false;
            if (!ifRemainingJobs(job.method)) {
                var statusobject = getStatusObjectFromLocalStorage();
                statusobject[job.method] = C.STATUS_DONE;
                setStatusObjectToLocalStorage(statusobject);
                switch (job.method) {
                case C.METHOD_GETLIST:
                    // TODO merge list if necessary (we can create
                    // this.getList, deleted after sending the event,
                    // filled with done event) -> merge here or show
                    // possible actions (manually, auto, ...)
                    JIO.publish (C.DEFAULT_CONST_OBJECT[job.method].STOPEVENT/*, merged list*/);
                    // deleting list
                    return;
                default: // if it was not a specific method
                    JIO.publish (C.DEFAULT_CONST_OBJECT[job.method].STOPEVENT);
                    return;
                }
            }
            //// end analyse
        };
        
        //// subscribe an event
        var t = this;
        JIO.subscribe (C.EVENT_JOB_DONE, function (job) {

            console.log (C.EVENT_JOB_DONE+'_received');
            t.done(job);
            returnedJobAnalyse (job);
        });

        JIO.subscribe (C.EVENT_JOB_FAIL, function (job) {

            console.log (C.EVENT_JOB_FAIL+'_received');
            t.fail(job);
            returnedJobAnalyse (job);
        });
        //// end subscribing

    };

    JIO.JobQueue.prototype = {

        addJob: function (storage,job) {
            // Add a job to the Job list
            // storage : the storage object
            // job : the job object (may be a 'string')
            console.log ('addJob');

            //// Adding job to the list in localStorage
            // transforming job to an object
            if ((typeof job) === 'string') job = JSON.parse(job);
            // create joblist in local storage if unset
            if (!localStorage.joblist) localStorage.joblist = "[]";
            // set job id
            job.id = this.jobid;
            this.jobid ++;
            // set job storage
            job.storage = storage;
            // save the new job
            var localjoblist = getJobArrayFromLocalStorage();
            localjoblist.push(job);
            setJobArrayToLocalStorage (localjoblist);
            //// job added
        }, // end addJob

        resetAll: function () {
            // reset All job to 'initial'
            console.log ('resetAll');
            
            var jobarray = getJobArrayFromLocalStorage();
            for (var i in jobarray) {
                jobarray[i].status = C.STATUS_INITIAL;
            }
            setJobArrayToLocalStorage(jobarray);
        },
        
        invokeAll: function () {
            // Do all jobs in the list

            //// do All jobs
            var jobarray = getJobArrayFromLocalStorage();
            for (var i in jobarray) {
                if (jobarray[i].status === C.STATUS_INITIAL) {
                    jobarray[i].status = C.STATUS_ONGOING;
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
            if (!C.DEFAULT_CONST_OBJECT[job.method])
                // TODO do an appropriate error reaction ? unknown job method
                return false; 
            var statusobject = getStatusObjectFromLocalStorage ();
            objectDump(statusobject);
            if (statusobject[job.method] === C.STATUS_DONE) {
                statusobject[job.method] = C.STATUS_ONGOING;
                setStatusObjectToLocalStorage(statusobject);
                JIO.publish (C.DEFAULT_CONST_OBJECT[job.method].STARTEVENT);
            }
            // create an object and use it to save,load,...!
            createStorageObject(job.storage,jioApplicant)[
                C.DEFAULT_CONST_OBJECT[job.method].FUNC
            ](job,true); // overwrite
            //// end method analyse
        },
        
        done: function (job) {
            // This job is supposed done, we can remove it from localStorage.
            console.log ('done');

            var localjoblist = getJobArrayFromLocalStorage ();
            // remove the job from the job list
            localjoblist = arrayRemoveValues (localjoblist,function (o) {
                return (o.id === job.id);
            });
            // save to local storage
            setJobArrayToLocalStorage (localjoblist);
        },

        fail: function (job) {
            // This job cannot be done, change its status into localStorage.
            console.log ('fail');

            var localjoblist = getJobArrayFromLocalStorage ();
            //// find this unique job inside the list
            for (var i in localjoblist) {
                if (localjoblist[i].id === job.id) {
                    localjoblist[i] = job;
                    break;
                }
            }
            // save to local storage
            setJobArrayToLocalStorage (localjoblist);
        },
        
        clean: function () {
            // Clean the job list, removing all jobs that have failed.
            // It also change the localStorage Job list
            
            setJobArrayToLocalStorage(
                arrayRemoveValues(
                    getJobArrayFromLocalStorage(),
                    function(j){return (j.status === C.STATUS_FAIL);}
                )
            );
        }
        
    }; // end JIO.JobQueue

    // End Job & JobQueue
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // LOCAL STORAGE

    /**
     * Class LocalStorage
     * @class provides usual API to save/load/delete documents on the localStorage
     * @param storagedata : object containing every element needed to build the storage
     * @param applicant : object containing inforamtion about the person/application needing this JIO object
     */
    JIO.LocalStorage = function(storagedata,applicant) {
        this.applicant = applicant;
        //// check user's localStorage part
        this.userName = storagedata.userName;
        if(!localStorage.getItem(this.userName)) {
            localStorage[this.userName] = '{}'; // Create user
        }
        //// end check

    }
    JIO.LocalStorage.prototype = {        
        getDocumentsFromLocalStorage: function() {
            return JSON.parse(localStorage[this.userName]);
        },

        writeToLocalStorage: function(documents) {
            localStorage[this.userName] = JSON.stringify(documents);
        }
    }

    /**
     * check if an user already exist
     * @param name : the name you want to check
     * @return true if the name is free, false otherwise
     */
    JIO.LocalStorage.prototype[C.FUNC_AVAILABLE] = function(job) {
        setTimeout(function () {
            if (localStorage[job.userName]) {
                job.status = C.STATUS_DONE;
                job.message = '' + job.userName + ' is not available.';
                job.userIsAvailable = false;
                JIO.publish (C.EVENT_JOB_DONE,job);
                return false;
            }
            job.status = C.STATUS_DONE;
            job.message = '' + job.userName + ' is available.';
            job.userIsAvailable = true;
            JIO.publish (C.EVENT_JOB_DONE,job);
            return true;
        }, C.DEFAULT_INTERVAL_DELAY);
    };

    /**
     * save a document in the local storage from a job
     * @param job : contains all the information to save the document
     * @param overwrite : a boolean set to true if the document has to be overwritten
     */
    JIO.LocalStorage.prototype[C.FUNC_SAVE] = function(job, overwrite) {
        var t = this;
        // wait a little in order to let some other instructions to continue
        setTimeout(function () {
            var documents = t.getDocumentsFromLocalStorage();

            // TODO check modification date !!!

            if(!documents[job.fileName]) { // create document
                documents[job.fileName] = {
                    'fileName': job.fileName,
                    'content': job.fileContent,
                    'creationDate': Date.now(),
                    'lastModified': Date.now()
                }
                t.writeToLocalStorage();
                job.status=C.STATUS_DONE;
                job.message='success';
                JIO.publish(C.EVENT_JOB_DONE,job);
                return;
            } else {
                if(overwrite === true) { // overwrite
                    documents[job.fileName].lastModified = Date.now();
                    documents[job.fileName].content = job.fileContent;
                    t.writeToLocalStorage(documents);
                    job.status=C.STATUS_DONE;
                    job.message='success';
                    JIO.publish(C.EVENT_JOB_DONE,job);
                    return;
                } else {
                    job.status=C.STATUS_FAIL;
                    job.message='Document already exists.';
                    job.errno=403;
                    JIO.publish(C.EVENT_JOB_FAIL,job);
                    return;
                }
            }
        }, C.DEFAULT_INTERVAL_DELAY);
        return;
    } // end saveDocumentFromJob

    /**
     * load a document in the storage, copy the content into the job,
     * then the function sends the job with an event.
     * @param job : the job that contains all informations about
     *              loading operation.
     */
    JIO.LocalStorage.prototype[C.FUNC_LOAD] = function(job) {
        var t = this;
        // wait a little in order to let some other instructions to continue
        setTimeout(function () {
            var documents = t.getDocumentsFromLocalStorage();
            if(!documents[job.fileName]) {
                job.status=C.STATUS_FAIL;
                job.errno=404;
                job.message='Document not found.';
                JIO.publish (C.EVENT_JOB_FAIL,job);
            } else {
                job.status=C.STATUS_DONE;
                job.file=documents[job.fileName];
                job.message='success';
                JIO.publish (C.EVENT_JOB_DONE,job);
            }
        }, C.DEFAULT_INTERVAL_DELAY)
    }; // end loadDocumentFromJob
    
    /**
     * load the list of the documents in this storage
     * @param job : the job that contains all informations about
     *              getting list operation.
     */
    JIO.LocalStorage.prototype[C.FUNC_GETLIST] = function(job) {
        // TODO update it
        var t = this;
        setTimeout(function () {
            var documents = t.getDocumentsFromLocalStorage();
            job.list = [];
            for (var key in documents) {
                job.list.push ({
                    'fileName':documents[key].fileName,
                    'creationDate':documents[key].creationDate,
                    'lastModified':documents[key].lastModified
                });
            }
            JIO.publish (C.EVENT_JOB_DONE,job);
        }, C.DEFAULT_INTERVAL_DELAY);
    }; // end getListFromJob

    /**
     * Delete a document or a list of documents from the storage
     * @param fileName : fileName to delete
     * @param options : optional object containing
     */
    JIO.LocalStorage.prototype[C.FUNC_DELETE] = function(job) {
        // TODO update it
        var t = this;
        setTimeout (function () {
            var documents = t.getDocumentsFromLocalStorage();
            // TODO is it realy a problem if we try to delete a deleted file ?
            if (!documents[job.fileName]) {
                job.status = C.STATUS_FAIL;
                job.errno = 404;
                job.message = 'Document not found.';
                JIO.publish (C.EVENT_JOB_FAIL,job);
                return;
            }
            delete documents[job.fileName];
            t.writeToLocalStorage(documents);
            job.status = C.STATUS_DONE;
            job.message = 'success';
            JIO.publish (C.EVENT_JOB_DONE,job);
            return;
        }, C.DEFAULT_INTERVAL_DELAY);
    }; // end deleteDocumentFromJob

    // END LOCAL STORAGE
    ////////////////////////////////////////////////////////////////////////////


    ///////////
    // Tools //
    ///////////

    var dependenceLoaded = function () {
        // tests if the dependencies are loaded

        try {
            // check jQuery
            if ($)
                return true;
            else return false;
        } catch (e) {
            return false;
        }
    };

    var ifRemainingJobs = function(method) {
        // check if it remains [method] jobs (save,load,...)
        // method : can me 'string' or 'undefined'
        //     undefined -> test if there is at least one job
        //     string -> test if there is at least one [method] job

        if (!method) return (localStorage.joblist !== '[]');
        joba = getJobArrayFromLocalStorage();        
        for (var k in joba) {
            if (joba[k].method === method &&
                joba[k].status !== C.STATUS_FAIL) return true;
        }
        return false;
    };

    /**
     * Create a storage with [data] informations
     * @param data : information found in jio.json and needed to create the storage
     * @param applicant : information about the person/application needing this JIO object (allow limited access)
     */
    function createStorageObject(data,applicant) {
        if (!storageTypeObject[data.type])
            return null;       // error!
        return storageTypeObject[data.type](data,applicant);
    }

    var checkOptionObject = function (current,defaultopts) {
        if(!current) {
            return defaultopts;
        }
        for (var k in defaultopts) {
            if (current[k] === undefined)
                current[k] = defaultopts[k];
        }
        return current;
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

    var getStatusObjectFromLocalStorage = function () {
        var tmp = {};
        if (localStorage.status) {
            tmp = JSON.parse (localStorage.status);
        } else {
            for (var Method in C.DEFAULT_CONST_OBJECT) {
                tmp[Method] = C.STATUS_DONE;
            }
        }
        return tmp;
    };

    var setStatusObjectToLocalStorage = function (statusobject) {
        localStorage.status = JSON.stringify(statusobject);
    };

    var arrayRemoveValues = function (a,testfunc) {
        // Removes the values from [a] where [testfunc(value)] returns true.

        var isArray = function (a) {
            return Object.prototype.toString.apply(a) === '[object Array]';
        };
        if (!isArray(a)) return a;
        var na = [];
        for (var k in a) {
            if (!testfunc(a[k]))
                na.push (a[k]);
        }
        return na;
    };

    // TODO DEBUG we can remove this function
    var objectDump = function (o) {
        console.log (JSON.stringify(o));
    };

    // the name to use for the framework. Ex : JIO.initialize(...), JIO.loadDocument...
    window.JIO = JIO;
    
})();
