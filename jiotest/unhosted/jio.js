
;var JIO = 
(function () {
    
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
    },
    // end constants
    ////////////////////////////////////////////////////////////////////////////
    // jio globals
    jioGlobalObj = {
        'jobManagingMethod':{
            /*
              LEGEND:
              - s: storage
              - a: applicant
              - m: method
              - n: fileName
              - c: fileContent
              - o: options
              - =: are equal
              - !: are not equal
              
              select ALL        s= a= n=
              removefailordone  fail|done
              /                           elim repl nacc wait
              Remove     !ongoing  Save    1    x    x    x
              Save       !ongoing  Remove  1    x    x    x
              GetList    !ongoing  GetList 0    1    x    x
              Check      !ongoing  Check   0    1    x    x
              Remove     !ongoing  Remove  0    1    x    x
              Load       !ongoing  Load    0    1    x    x
              Save c=    !ongoing  Save    0    1    x    x
              Save c!    !ongoing  Save    0    1    x    x
              GetList     ongoing  GetList 0    0    1    x
              Check       ongoing  Check   0    0    1    x
              Remove      ongoing  Remove  0    0    1    x
              Remove      ongoing  Load    0    0    1    x
              Remove     !ongoing  Load    0    0    1    x
              Load        ongoing  Load    0    0    1    x
              Save c=     ongoing  Save    0    0    1    x
              Remove      ongoing  Save    0    0    0    1
              Load        ongoing  Remove  0    0    0    1
              Load        ongoing  Save    0    0    0    1
              Load       !ongoing  Remove  0    0    0    1
              Load       !ongoing  Save    0    0    0    1
              Save        ongoing  Remove  0    0    0    1
              Save        ongoing  Load    0    0    0    1
              Save c!     ongoing  Save    0    0    0    1
              Save       !ongoing  Load    0    0    0    1
              GetList     ongoing  Check   0    0    0    0
              GetList     ongoing  Remove  0    0    0    0
              GetList     ongoing  Load    0    0    0    0
              GetList     ongoing  Save    0    0    0    0
              GetList    !ongoing  Check   0    0    0    0
              GetList    !ongoing  Remove  0    0    0    0
              GetList    !ongoing  Load    0    0    0    0
              GetList    !ongoing  Save    0    0    0    0
              Check       ongoing  GetList 0    0    0    0
              Check       ongoing  Remove  0    0    0    0
              Check       ongoing  Load    0    0    0    0
              Check       ongoing  Save    0    0    0    0
              Check      !ongoing  GetList 0    0    0    0
              Check      !ongoing  Remove  0    0    0    0
              Check      !ongoing  Load    0    0    0    0
              Check      !ongoing  Save    0    0    0    0
              Remove      ongoing  GetList 0    0    0    0
              Remove      ongoing  Check   0    0    0    0
              Remove     !ongoing  GetList 0    0    0    0
              Remove     !ongoing  Check   0    0    0    0
              Load        ongoing  GetList 0    0    0    0
              Load        ongoing  Check   0    0    0    0
              Load       !ongoing  GetList 0    0    0    0
              Load       !ongoing  Check   0    0    0    0
              Save        ongoing  GetList 0    0    0    0
              Save        ongoing  Check   0    0    0    0
              Save       !ongoing  GetList 0    0    0    0
              Save       !ongoing  Check   0    0    0    0
              
              For more information, see documentation
            */
            'canSelect':function (job1,job2) {
                if (JSON.stringify (job1.storage) ===
                    JSON.stringify (job2.storage) &&
                    JSON.stringify (job1.applicant) ===
                    JSON.stringify (job2.applicant) &&
                    job1.fileName === job2.fileName) {
                    return true;
                }
                return false;
            },
            'canRemoveFailOrDone':function (job1,job2) {
                if (job1.status === 'fail' ||
                    job1.status === 'done') {
                    return true;
                }
                return false;
            },
            'canEliminate':function (job1,job2) {
                if (job1.status !== 'ongoing' &&
                    job2.method === 'removeDocument' &&
                    (job1.method === 'removeDocument' ||
                     job1.method === 'saveDocument')) {
                    return true;
                }
                return false;
            },
            'canReplace':function (job1,job2) {
                if (job1.status !== 'ongoing' &&
                    job1.method === job2.method && 
                    job1.date < job2.date) {
                    return true;
                }
                return false;
            },
            'cannotAccept':function (job1,job2) {
                if (job1.status !== 'ongoing' ) {
                    if (job1.method === 'removeDocument' &&
                        job2.method === 'loadDocument') {
                        return true;
                    }
                } else {        // ongoing
                    if (job1.method === job2.method === 'loadDocument') {
                        return true;
                    } else if (job1.method === 'removeDocument' &&
                               (job2.method === 'loadDocument' ||
                                job2.method === 'removeDocument')) {
                        return true;
                    } else if (job1.method === job2.method === 'saveDocument' &&
                               job1.fileContent === job2.fileContent) {
                        return true;
                    } else if (job1.method === job2.method ===
                               'getDocumentList' ||
                               job1.method === job2.method ===
                               'checkNameAvailability') {
                        return true;
                    }
                }
                return false;
            },
            'mustWait':function (job1,job2) {
                if (job1.method === 'getDocumentList' ||
                    job1.method === 'checkNameAvailability' ||
                    job2.method === 'getDocumentList' ||
                    job2.method === 'checkNameAvailability' ) {
                    return false;
                }
                return true;
            }
        },
        'localStorage': null,   // where the browser stores data
        'queueID': 1,
        'storageTypeObject': {} // ex: {'type':'local','creator': fun ...}
    },
    // end jio globals
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Tools
    checkJioDependencies = function() {
        var retval = true,
        err = function (name) {
            console.error ('Fail to load ' + name);
            retval = false;
        };
        try { if (!JSON) { err('JSON'); } }
        catch (e) { err('JSON'); }
        try { if (!jQuery) { err('jQuery'); } }
        catch (e) { err('jQuery'); }
        try { if (!LocalOrCookieStorage) { err('LocalOrCookieStorage'); } }
        catch (e) { err('LocalOrCookieStorage'); }
        return retval;
    },
    getNewQueueID = function () {
        // Returns a new queueID
        var localStor = jioGlobalObj.localStorage.getAll(), k = 'key',
        splitk = ['splitedkey'], id = 0;
        for (k in localStor) {
            splitk = k.split('/');
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
        id = jioGlobalObj.queueID;
        jioGlobalObj.queueID ++;
        return id;
    },
    // end Tools
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Classes
    PubSub,Job,JobQueue,JobListener,ActivityUpdater,BaseStorage,JioCons,Jio; 
    // end Classes
    ////////////////////////////////////////////////////////////////////////////

    // check dependencies
    if (!checkJioDependencies()) { return; }

    ////////////////////////////////////////////////////////////////////////////
    // Publisher Subcriber
    PubSub = function () {
        var topics = {}, callbacks, topic;
        this.eventAction = function (id) {
            topic = id && topics[id];
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
    Job = function ( options ) {
        // Job constructor
        
        var job = $.extend({},options);
        job['id']=0;
        job['status']='initial';
        job['date']=Date.now();
        return job;
    };

    JobQueue = function ( publisher, options ) {
        // JobQueue is a queue of jobs. It will regulary copy this queue
        // into localStorage to resume undone tasks.
        // publisher: the publisher to use to send event
        // options.useLocalStorage: if true, save jobs into localStorage,
        //                          else only save on memory.
        
        this.useLocalStorage = options.useLocalStorage;
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
            
            var id = 'id';
            if (!func) { return true; }
            for (id in this.jobObject) {
                if (func(this.jobObject[id]))
                    return true;
            }
            return false;
        },
        copyJobQueueToLocalStorage: function () {
            // Copy job queue into localStorage.
            
            if (this.useLocalStorage) {
                return jioGlobalObj.localStorage.setItem(
                    this.jobObjectName,this.jobObject);
            } else {
                return false;
            }
        },
        createJob: function ( options ) {
            return this.addJob ( new Job ( options ) );
        },
        addJob: function ( job ) {
            // Add a job to the queue, browsing all jobs
            // and check if the new job can eliminate older ones,
            // can replace older one, can be accepted, or must wait
            // for older ones.
            // It also clean fail or done jobs.
            // job : the job object
            
            var res = {'newone':true,'elimArray':[],'waitArray':[],
                       'removeArray':[]}, basestorage = null, id=0;
            
            //// browsing current jobs
            for (id in this.jobObject) {
                if (jioGlobalObj.jobManagingMethod.canSelect(
                    this.jobObject[id],job)) {
                    if (jioGlobalObj.jobManagingMethod.canRemoveFailOrDone(
                        this.jobObject[id],job)) {
                        res.removeArray.push(id);
                        continue;
                    }
                    if (jioGlobalObj.jobManagingMethod.canEliminate(
                        this.jobObject[id],job)) {
                        console.log ('Elimitated: ' +
                                     JSON.stringify (this.jobObject[id]));
                        res.elimArray.push(id);
                        continue;
                    }
                    if (jioGlobalObj.jobManagingMethod.canReplace(
                        this.jobObject[id],job)) {
                        console.log ('Replaced: ' +
                                     JSON.stringify (this.jobObject[id]));
                        basestorage = new BaseStorage(
                            {'queue':this,'job':this.jobObject[id]});
                        basestorage.replace(job);
                        res.newone = false;
                        break;
                    }
                    if (jioGlobalObj.jobManagingMethod.cannotAccept(
                        this.jobObject[id],job)) {
                        console.log ('Not accepted: ' + JSON.stringify (job) + '\nby: ' +
                                     JSON.stringify (this.jobObject[id]));
                        // Job not accepted
                        return false;
                    }
                    if (jioGlobalObj.jobManagingMethod.mustWait(
                        this.jobObject[id],job)) {
                        console.log ('Waited: ' +
                                     JSON.stringify (this.jobObject[id]) +
                                     '\nby : ' + JSON.stringify (job));
                        res.waitArray.push(id);
                        continue;
                    }
                    // one of the previous tests must be ok.
                    // the program must not reach this part of the 'for'.
                }
            }
            //// end browsing current jobs
            
            if (res.newone) {
                // if it is a new job, we can eliminate deprecated jobs and
                // set this job dependencies.
                for (id in res.elimArray) {
                    basestorage = new BaseStorage(
                        {'queue':this,'job':this.jobObject[res.elimArray[id]]});
                    basestorage.eliminate();
                }
                if (res.waitArray.length > 0) {
                    job.status = 'wait';
                    job.waitingFor = {'jobIdArray':res.waitArray};
                    for (id in res.waitArray) {
                        if (this.jobObject[res.waitArray[id]]) {
                            this.jobObject[res.waitArray[id]].maxtries = 1;
                        }
                    }
                }
                for (id in res.removeArray) {
                    this.removeJob(this.jobObject[res.removeArray[id]]);
                }
                // set job id
                job.id = this.jobid;
                this.jobid ++;
                // save the new job into the queue
                this.jobObject[job.id] = job;
                console.log ('new one: ' + JSON.stringify (job));
            }
            // save into localStorage
            this.copyJobQueueToLocalStorage();
            return true;
        }, // end addJob
        
        removeJob: function ( options ) {
            // Remove job(s) from queue where [options.where](job) === true.
            // If there is no job in [options], then it will treat all job.
            // If there is no [where] function, then it will remove all selected
            // job. It means that if no option was given, it'll remove all jobs.
            // options.job : the job object containing at least {id:..}.
            // options.where : remove values where options.where(job) === true
            
            var settings = $.extend ({'where':function (job) {return true;}},
                                     options),k='key',andwhere,found=false;

            //// modify the job list
            if (settings.job) {
                if (this.jobObject[settings.job.id] && settings.where(
                    this.jobObject[settings.job.id]) ) {
                    delete this.jobObject[settings.job.id];
                    found = true;
                }
            }else {
                for (k in this.jobObject) {
                    if (settings.where(this.jobObject[k])) {
                        delete this.jobObject[k];
                        found = true;
                    }
                }
            }
            if (!found) {
                $.error ('No jobs was found, when trying to remove some.');
            }
            //// end modifying
            this.copyJobQueueToLocalStorage();
        },

        resetAll: function () {
            // Reset all job to 'initial'.
            // TODO manage jobs ! All jobs are not 'initial'.
            
            var id = 'id';
            for (id in this.jobObject) {
                this.jobObject[id].status = 'initial';
            }
            this.copyJobQueueToLocalStorage();
        },

        invokeAll: function () {
            // Do all jobs in the queue.

            var i = 'id', j = 'ind', ok = false;
            //// do All jobs
            for (i in this.jobObject) {
                if (this.jobObject[i].status === 'initial') {
                    // if status initial
                    // invoke new job
                    this.invoke(this.jobObject[i]);
                } else if (this.jobObject[i].status === 'wait') {
                    ok = true;
                    // if status wait
                    if (this.jobObject[i].waitingFor.jobIdArray) {
                        // wait job
                        // browsing job id array
                        for (j in this.jobObject[i].waitingFor.jobIdArray) {
                            if (this.jobObject[this.jobObject[i].
                                               waitingFor.jobIdArray[j]]) {
                                // if a job is still exist, don't invoke
                                ok = false;
                                break;
                            }
                        }
                    }
                    if (this.jobObject[i].waitingFor.time) {
                        // wait time
                        if (this.jobObject[i].waitingFor.time > Date.now()) {
                            // it is not time to restore the job!
                            ok = false;
                        } 
                    }
                    // else wait nothing
                    if (ok) {
                        // invoke waiting job
                        this.invoke(this.jobObject[i]);
                    }
                }
            }
            this.copyJobQueueToLocalStorage();
            //// end, continue doing jobs asynchronously
        },

        invoke: function (job) {
            // Do a job invoking the good method in the good storage.

            var t = this, basestorage,
            userName = job.userName ? job.userName : job.storage.userName;

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
            basestorage = new BaseStorage({'queue':this,'job':job});
            basestorage.execute();
            //// end method analyse
        },

        ended: function (job) {
            // It is a callback function called just before user callback.
            // It is called to manage jobObject according to the ended job.

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
            case 'wait':
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
                        // testjob.status === 'wait' || // TODO ?
                        testjob.status === 'ongoing' ||
                        testjob.status === 'initial');
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

            this.removeJob (
                undefined,{
                    'where':function (job) {
                        return (job.status === 'fail');
                    } });
        }
    };
    // end Job & JobQueue
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // jio job listener
    JobListener = function ( queue ) {
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
            var queue = this.queue;
            
            if (!this.id) {
                this.id = setInterval (function () {
                    // if there is jobs
                    if (JSON.stringify(queue.jobObject) !== '{}') {
                        queue.invokeAll();
                    }
                },this.interval);
                return true;
            } else {
                return false;
            }
        },
        stop: function () {
            if (this.id) {
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
    // ActivityUpdater
    ActivityUpdater = function () {
        // The activity updater is a little thread that proves activity of this
        // jio instance.

        this.interval = 400;
        this.id = null;
    };
    ActivityUpdater.prototype = {
        start: function (id) {
            // start the updater
            
            var t = this;
            
            if (!this.id) {
                this.touch(id);
                this.id = setInterval (function () {
                    t.touch(id);
                },this.interval);
                return true;
            } else {
                return false;
            }            
        },
        stop: function () {
            // stop the updater
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
    // end ActivityUpdater
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // BaseStorage
    BaseStorage = function ( options ) {
        // The base storage, will call the good method from the good storage,
        // and will check and return the associated value.

        this.job = options.job;
        this.callback = options.job.callback;
        this.queue = options.queue;
        this.res = {'status':'done','message':''};
    };
    BaseStorage.prototype = {
        createStorageObject: function ( options ) {
            // Create a storage thanks to storages types set
            // with 'addStorageType'.
            
            if (!jioGlobalObj.storageTypeObject[ options.job.storage.type ])
                return null;       // error!
            return jioGlobalObj.storageTypeObject[
                options.job.storage.type ](options);
        },
        retryLater: function () {
            // Change the job status to wait for time.
            // The listener will invoke this job later.
            
            this.job.status = 'wait';
            this.job.waitingFor = {'time':Date.now() +
                                   (this.job.tries*this.job.tries*1000)};
        },
        eliminate: function () {
            this.job.maxtries = 0;
            this.fail('Job Stopped!',0);
        },
        replace: function ( newjob ) {
            // It replace the current job by the new one.
            // Replacing only the date

            this.job.tries = 0;
            this.job.date = newjob.date;
            this.job.callback = newjob.callback;

            this.res.status = 'fail';
            this.res.message = 'Job Stopped!';
            this.res.errno = 0;
            this['fail_'+this.job.method]();
            this.callback(this.res);
        },
        fail: function ( message, errno ) {
            // Called when a job has failed.
            // It will retry the job from a certain moment or it will return
            // a failure.

            this.res.status = 'fail';
            this.res.message = message;
            this.res.errno = errno;
            if (this.job.maxtries && this.job.tries < this.job.maxtries) {
                this.retryLater();
            } else {
                this.job.status = 'fail';
                this['fail_'+this.job.method]();
                this.queue.ended(this.job);
                this.callback(this.res);
            }
        },
        done: function ( retvalue ) {
            // Called when a job has terminated successfully.
            // It will return the return value by the calling the callback
            // function.

            this.job.status = 'done';
            this['done_'+this.job.method]( retvalue );
            this.queue.ended(this.job);
            this.callback(this.res);
        },
        execute: function () {
            // Execute the good function from the good storage.
            
            var t = this, stor = null;

            if (!this.job.tries) {
                this.job.tries = 0;
            }
            this.job.tries ++;            
            stor = this.createStorageObject (
                {'job':this.job,'queue':this.queue}
            );
            stor.done = function (retval) { t.done(retval); };
            stor.fail = function (mess,errno) { t.fail(mess,errno); };
            stor[this.job.method]();
        },
        fail_checkNameAvailability: function () {
            this.res.isAvailable = false;
        },
        done_checkNameAvailability: function ( isavailable ) {
            this.res.message = this.job.userName + ' is ' +
                (isavailable?'':'not ') + 'available.';
            this.res.isAvailable = isavailable;
        },
        fail_saveDocument: function () {
            this.res.isSaved = false;
        },
        done_saveDocument: function () {
            this.res.message = 'Document saved.';
            this.res.isSaved = true;
        },
        fail_loadDocument: function () {
            this.res.document = {};
        },
        done_loadDocument: function ( returneddocument ) {
            this.res.message = 'Document loaded.';
            this.res.document = returneddocument;
        },
        fail_getDocumentList: function () {
            this.res.list = [];
        },
        done_getDocumentList: function ( documentlist ) {
            this.res.message = 'Document list received.';
            this.res.list = documentlist;
        },
        fail_removeDocument: function () {
            this.res.isRemoved = false;
        },
        done_removeDocument: function () {
            this.res.message = 'Document removed.';
            this.res.isRemoved = true;
        }
    };
    // end BaseStorage
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // JIO Constructor
    JioCons = function ( storage , applicant, options ) {
        // JIO Constructor, create a new JIO object.
        // It just initializes values.
        // storage   : the storage that contains {type:..,[storageinfos]}
        // applicant : the applicant that contains {ID:...}
        // these parameters are optional and may be 'string' or 'object'

        var settings = $.extend({'useLocalStorage':true},options);

        // objectify storage and applicant
        if(typeof storage === 'string')
            storage = JSON.parse(options.storage);
        if(typeof applicant === 'string')
            applicant = JSON.parse(options.applicant);

        // set init values
        this['storage']   = storage;
        this['applicant'] = applicant;
        this['id']        = 0;
        this['pubsub']    = new PubSub(settings);
        this['queue']     = new JobQueue(this.pubsub,settings);
        this['listener']  = new JobListener(this.queue,settings);
        this['ready']     = false;
        if (settings.useLocalStorage) {
            this['updater']   = new ActivityUpdater(settings);
        } else {
            this['updater']   = null;
        }

        // check storage type
        if (this.storage)
            if (!jioGlobalObj.storageTypeObject[this.storage.type])
                $.error('Unknown storage type "' + this.storage.type +'"');

        // start jio process
        this.start();
    };
    // JIO Prototype
    JioCons.prototype = {
        start: function () {
            // Start JIO: start listening to jobs and make it ready
            if (this.id !== 0) return false;
            // set a new jio id
            this.id = getNewQueueID();
            // initializing objects
            this.queue.init({'jioID':this.id});
            // start activity updater
            if (this.updater){
                this.updater.start(this.id);
            }
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
            if (this.updater) {
                this.updater.stop();
            }
            this.ready = false;
            this.id = 0;
            return true;
        },
        kill: function () {
            // kill this JIO, job listening and job operation (event if they
            // are on going!)
            
            this.queue.close();
            this.listener.stop();
            if (this.updater) {
                this.updater.stop();
            }
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
            return this.pubsub.publish(eventname,obj);
        },
        subscribe: function (eventname, callback) {
            // subscribe to an event on this jio. We can subscribe to jio event
            // even if jio is not started. Returns the callback function in
            // order to unsubscribe it.
            // eventname : the event name.
            // callback : called after receiving event.

            return this.pubsub.subscribe(eventname,callback);
        },
        unsubscribe: function (eventname,callback) {
            // unsubscribe callback from an event
            
            return this.pubsub.unsubscribe(eventname,callback);
        },

        checkNameAvailability: function ( options ) {
            // Check the user availability in the storage set in [options]
            // or in the storage set at init. At the end of the job,
            // 'job_done' will be sent with this job and its 'isAvailable'
            // return value.
            // options.storage : the storage where to check (optional)
            // options.applicant : the applicant (optional)
            // options.callback(result) : called to get the result.

            // returns: - null if dependencies are missing
            //          - false if the job was not added
            //          - true if the job was added or replaced

            // example :
            //     jio.checkNameAvailability({'userName':'myName','callback':
            //         function (result) { alert('is available? ' +
            //             result.isAvailable); }});

            var settings = $.extend ({
                'userName': this.storage.userName,
                'storage': this.storage,
                'applicant': this.applicant,
                'method': 'checkNameAvailability',
                'callback': function () {}
            },options);
            // check dependencies
            if (this.isReady() && settings.userName &&
                settings.storage && settings.applicant) {
                return this.queue.createJob ( settings );
            }
            return null;
        },

        saveDocument: function ( options ) {
            // Load a document in the storage set in [options]
            // or in the storage set at init. At the end of the job,
            // 'job_done' will be sent with this job.
            // options.storage : the storage where to save (optional)
            // options.applicant : the applicant (optional)
            // options.callback(result) : called to get the result.

            // returns: - null if dependencies are missing
            //          - false if the job was not added
            //          - true if the job was added or replaced

            // jio.saveDocument({'fileName':'file','fileContent':'content',
            //     'callback': function (result) { alert('saved?' +
            //         result.isSaved); }});

            var settings = $.extend({
                'storage': this.storage,
                'method':'saveDocument',
                'applicant': this.applicant,
                'callback': function () {}
            },options);
            // check dependencies
            if (this.isReady() && settings.fileName && settings.fileContent &&
                settings.storage && settings.applicant) {
                return this.queue.createJob ( settings );
            }
            return null;
        },

        loadDocument: function ( options ) {
            // Load a document in the storage set in [options]
            // or in the storage set at init. At the end of the job,
            // 'job_done' will be sent with this job and its 'fileContent'
            // return value.
            // options.storage : the storage where to load (optional)
            // options.applicant : the applicant (optional)
            // options.callback(result) : called to get the result.

            // returns: - null if dependencies are missing
            //          - false if the job was not added
            //          - true if the job was added or replaced

            // jio.loadDocument({'fileName':'file','callback':
            //     function (result) { alert('content: '+
            //         result.doc.fileContent + ' creation date: ' +
            //         result.doc.creationDate); }});

            var settings = $.extend ({
                'storage': this.storage,
                'applicant': this.applicant,
                'method':'loadDocument',
                'callback': function(){}
            },options);
            // check dependencies
            if (this.isReady() && settings.fileName &&
                settings.storage && settings.applicant) {
                return this.queue.createJob ( settings );
            }
            return null;
        },

        getDocumentList: function ( options ) {
            // Get a document list of the user in the storage set in [options]
            // or in the storage set at init.
            // options.storage : the storage where to get the list (optional)
            // options.applicant : the applicant (optional)
            // options.callback(result) : called to get the result.

            // returns: - null if dependencies are missing
            //          - false if the job was not added
            //          - true if the job was added or replaced

            // jio.getDocumentList({'callback':
            //     function (result) { alert('list: '+result.list); }});

            var settings = $.extend ({
                'storage': this.storage,
                'applicant': this.applicant,
                'method':'getDocumentList',
                'callback':function(){}
            },options);
            // check dependencies
            if (this.isReady() && settings.storage && settings.applicant ) {
                return this.queue.createJob( settings );
            }
            return null;
        },

        removeDocument: function ( options ) {
            // Remove a document in the storage set in [options]
            // or in the storage set at init.
            // options.storage : the storage where to remove (optional)
            // options.applicant : the applicant (optional)
            // options.callback(result) : called to get the result.

            // returns: - null if dependencies are missing
            //          - false if the job was not added
            //          - true if the job was added or replaced

            // jio.removeDocument({'fileName':'file','callback':
            //     function (result) { alert('removed? '+result.isRemoved); }});
            
            var settings = $.extend ({
                'storage': this.storage,
                'applicant': this.applicant,
                'method':'removeDocument',
                'callback':function (){}
            },options);
            if (this.isReady() && settings.fileName &&
                settings.storage && settings.applicant ) {
                return this.queue.createJob ( settings );
            }
            return null;
        }
    };
    // end JIO Prototype
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Jio creator
    Jio = function () {
        // Jio creator object
        // this object permit to create jio object
    };
    Jio.prototype = {
        createNew: function ( storage, applicant, options ) {
            // Return a new instance of JIO
            // storage: the storage object or json string
            // applicant: the applicant object or json string
            // options.useLocalStorage: if true, save job queue on localStorage.
            var settings = $.extend({'useLocalStorage':true},options);

            if (jioGlobalObj.localStorage===null) {
                jioGlobalObj.localStorage = LocalOrCookieStorage;
            }

            return new JioCons(storage,applicant,settings);
        },
        getStoragePrototype: function () {
            return new BaseStorage();
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
