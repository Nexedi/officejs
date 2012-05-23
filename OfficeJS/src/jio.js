
var JIO =
(function () { var jio_loader_function = function ( LocalOrCookieStorage, $ ) {

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
                    (job1.method === 'removeDocument' &&
                     job2.method === 'saveDocument' ||
                     job1.method === 'saveDocument' &&
                     job2.method === 'removeDocument')) {
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
        'storageTypeObject': {}, // ex: {'type':'local','creator': fun ...}
        'max_wait_time': 10000
    },
    // end jio globals
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Tools

    // end Tools
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Classes
    PubSub,Job,JobQueue,JobListener,ActivityUpdater,BaseStorage,
    JioConstructor,JioCreator;
    // end Classes
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Publisher Subcriber
    PubSub = function () {
        var that = {}, priv = {},
        topics = {}, callbacks, topic;
        priv.eventAction = function (id) {
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
        that.publish = function (eventname,obj) {
            // publish an event
            priv.eventAction(eventname).publish(obj);
        };
        that.subscribe = function (eventname,callback) {
            // subscribe and return the callback function
            priv.eventAction(eventname).subscribe(callback);
            return callback;
        };
        that.unsubscribe = function (eventname,callback) {
            // unsubscribe the callback from eventname
            priv.eventAction(eventname).unsubscribe(callback);
        };
        return that;
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

        var that = {}, priv = {},
        jioIdArrayName = 'jio/idArray';

        that.init = function ( options ) {
            // initialize the JobQueue
            // options.publisher : is the publisher to use to send events
            // options.jioID : the jio ID

            var k, emptyfun = function (){},
            jioIdArray = jioGlobalObj.localStorage.getItem (jioIdArrayName)||[];
            if (options.publisher) {
                priv.publisher = publisher;
            }
            priv.jioID = options.jioID;
            priv.jobObjectName = 'jio/jobObject/'+options.jioID;
            priv.jobObject = {};
            jioIdArray.push (priv.jioID);
            jioGlobalObj.localStorage.setItem (jioIdArrayName,jioIdArray);
            that.copyJobQueueToLocalStorage();
            for (k in priv.recoveredJobObject) {
                priv.recoveredJobObject[k].callback = emptyfun;
                that.addJob (priv.recoveredJobObject[k]);
            }
        };
        that.close = function () {
            // close the job queue.
            // it also deletes from local storage only if the job list is
            // empty.

            if (JSON.stringify(priv.jobObject) === '{}') {
                jioGlobalObj.localStorage.deleteItem(priv.jobObjectName);
            }
        };
        that.getNewQueueID = function () {
            // Returns a new queueID

            var k = null, id = 0,
            jioIdArray = jioGlobalObj.localStorage.getItem (jioIdArrayName)||[];
            for (k = 0; k < jioIdArray.length; k += 1) {
                if (jioIdArray[k] >= jioGlobalObj.queueID) {
                    jioGlobalObj.queueID = jioIdArray[k] + 1;
                }
            }
            id = jioGlobalObj.queueID;
            jioGlobalObj.queueID ++;
            return id;
        };
        that.recoverOlderJobObject = function () {
            // recover job object from older inactive jio

            var k = null, newJioIdArray = [], jioIdArrayChanged = false,
            jioIdArray = jioGlobalObj.localStorage.getItem (jioIdArrayName)||[];
            for (k = 0; k < jioIdArray.length; k += 1) {
                if (jioGlobalObj.localStorage.getItem (
                    'jio/id/'+jioIdArray[k]) < Date.now () - 10000) {
                    // remove id from jioIdArray

                    // 10000 sec ? delete item
                    jioGlobalObj.localStorage.deleteItem('jio/id/'+
                                                         jioIdArray[k]);
                    // job recovery
                    priv.recoveredJobObject = jioGlobalObj.
                        localStorage.getItem('jio/jioObject/'+ jioIdArray[k]);
                    // remove ex job object
                    jioGlobalObj.localStorage.deleteItem(
                        'jio/jobObject/'+ jioIdArray[k]);
                    jioIdArrayChanged = true;
                } else {
                    newJioIdArray.push (jioIdArray[k]);
                }
            }
            if (jioIdArrayChanged) {
                jioGlobalObj.localStorage.setItem(jioIdArrayName,newJioIdArray);
            }
        };
        that.isThereJobsWhere = function( func ) {
            // Check if there is jobs, in the queue,
            // where [func](job) == true.

            var id = 'id';
            if (!func) { return true; }
            for (id in priv.jobObject) {
                if (func(priv.jobObject[id])) {
                    return true;
                }
            }
            return false;
        };
        that.copyJobQueueToLocalStorage = function () {
            // Copy job queue into localStorage.

            if (priv.useLocalStorage) {
                return jioGlobalObj.localStorage.setItem(
                    priv.jobObjectName,priv.jobObject);
            } else {
                return false;
            }
        };
        that.createJob = function ( options ) {
            return that.addJob ( new Job ( options ) );
        };
        that.addJob = function ( job ) {
            // Add a job to the queue, browsing all jobs
            // and check if the new job can eliminate older ones,
            // can replace older one, can be accepted, or must wait
            // for older ones.
            // It also clean fail or done jobs.
            // job  = the job object

            var res = {'newone':true,'elimArray':[],'waitArray':[],
                       'removeArray':[]}, basestorage = null, id = 'id';

            //// browsing current jobs
            for (id in priv.jobObject) {
                if (jioGlobalObj.jobManagingMethod.canRemoveFailOrDone(
                    priv.jobObject[id],job)) {
                    res.removeArray.push(id);
                    continue;
                }
                if (jioGlobalObj.jobManagingMethod.canSelect(
                    priv.jobObject[id],job)) {
                    if (jioGlobalObj.jobManagingMethod.canEliminate(
                        priv.jobObject[id],job)) {
                        res.elimArray.push(id);
                        continue;
                    }
                    if (jioGlobalObj.jobManagingMethod.canReplace(
                        priv.jobObject[id],job)) {
                        basestorage = new BaseStorage(
                            {'queue':that,'job':priv.jobObject[id]});
                        basestorage.replace(job);
                        res.newone = false;
                        break;
                    }
                    if (jioGlobalObj.jobManagingMethod.cannotAccept(
                        priv.jobObject[id],job)) {
                        // Job not accepted
                        return false;
                    }
                    if (jioGlobalObj.jobManagingMethod.mustWait(
                        priv.jobObject[id],job)) {
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
                for (id = 0; id < res.elimArray.length; id += 1) {
                    basestorage = new BaseStorage(
                        {'queue':that,'job':priv.jobObject[res.elimArray[id]]});
                    basestorage.eliminate();
                }
                if (res.waitArray.length > 0) {
                    job.status = 'wait';
                    job.waitingFor = {'jobIdArray':res.waitArray};
                    for (id = 0; id < res.waitArray.length; id += 1) {
                        if (priv.jobObject[res.waitArray[id]]) {
                            priv.jobObject[res.waitArray[id]].maxtries = 1;
                        }
                    }
                }
                for (id = 0; id < res.removeArray.length; id += 1) {
                    that.removeJob(priv.jobObject[res.removeArray[id]]);
                }
                // set job id
                job.id = priv.jobid;
                job.tries = 0;
                priv.jobid ++;
                // save the new job into the queue
                priv.jobObject[job.id] = job;
            }
            // save into localStorage
            that.copyJobQueueToLocalStorage();
            return true;
        }; // end addJob

        that.removeJob = function ( options ) {
            // Remove job(s) from queue where [options.where](job) === true.
            // If there is no job in [options], then it will treat all job.
            // If there is no [where] function, then it will remove all selected
            // job. It means that if no option was given, it'll remove all jobs.
            // options.job  = the job object containing at least {id:..}.
            // options.where  = remove values where options.where(job) === true

            var settings = $.extend ({'where':function (job) {return true;}},
                                     options),andwhere,found=false,k='key';

            //// modify the job list
            if (settings.job) {
                if (priv.jobObject[settings.job.id] && settings.where(
                    priv.jobObject[settings.job.id]) ) {
                    delete priv.jobObject[settings.job.id];
                    found = true;
                }
            }else {
                for (k in priv.jobObject) {
                    if (settings.where(priv.jobObject[k])) {
                        delete priv.jobObject[k];
                        found = true;
                    }
                }
            }
            if (!found) {
                $.error ('No jobs was found, when trying to remove some.');
            }
            //// end modifying
            that.copyJobQueueToLocalStorage();
        };

        that.resetAll = function () {
            // Reset all job to 'initial'.
            // TODO manage jobs ! All jobs are not 'initial'.

            var id = 'id';
            for (id in priv.jobObject) {
                priv.jobObject[id].status = 'initial';
            }
            that.copyJobQueueToLocalStorage();
        };

        that.invokeAll = function () {
            // Do all jobs in the queue.

            var i = 'id', j, ok;
            //// do All jobs
            for (i in priv.jobObject) {
                ok = false;
                if (priv.jobObject[i].status === 'initial') {
                    // if status initial
                    // invoke new job
                    that.invoke(priv.jobObject[i]);
                } else if (priv.jobObject[i].status === 'wait') {
                    ok = true;
                    // if status wait
                    if (priv.jobObject[i].waitingFor.jobIdArray) {
                        // wait job
                        // browsing job id array
                        for (j = 0;
                             j < priv.jobObject[i].waitingFor.jobIdArray.length;
                             j += 1) {
                            if (priv.jobObject[priv.jobObject[i].
                                               waitingFor.jobIdArray[j]]) {
                                // if a job is still exist, don't invoke
                                ok = false;
                                break;
                            }
                        }
                    }
                    if (priv.jobObject[i].waitingFor.time) {
                        // wait time
                        if (priv.jobObject[i].waitingFor.time > Date.now()) {
                            // it is not time to restore the job!
                            ok = false;
                        }
                    }
                    // else wait nothing
                    if (ok) {
                        // invoke waiting job
                        that.invoke(priv.jobObject[i]);
                    }
                }
            }
            this.copyJobQueueToLocalStorage();
            //// end, continue doing jobs asynchronously
        };

        that.invoke = function (job) {
            // Do a job invoking the good method in the good storage.

            var basestorage;

            //// analysing job method
            // if the method does not exist, do nothing
            if (!jioConstObj.jobMethodObject[job.method]) {
                return false;   // suppose never happen
            }
            // test if a similar job is on going, in order to publish a start
            // event if it is the first of his kind (method).
            if (!that.isThereJobsWhere(function (testjob){
                return (testjob.method === job.method &&
                        testjob.method === 'initial');
            })) {
                job.status = 'ongoing';
                priv.publisher.publish(jioConstObj.jobMethodObject[
                    job.method].start_event);
            } else {
                job.status = 'ongoing';
            }
            // Create a storage object and use it to save,load,...!
            basestorage = new BaseStorage({'queue':this,'job':job});
            basestorage.execute();
            //// end method analyse
        };

        that.ended = function (endedjob) {
            // It is a callback function called just before user callback.
            // It is called to manage jobObject according to the ended job.

            var job = $.extend({},endedjob); // copy
            // This job is supposed terminated, we can remove it from queue.
            that.removeJob ({'job':job});

            //// ended job analyse
            // if the job method does not exists, return false
            if (!jioConstObj.jobMethodObject[job.method]) {
                return false;
            }
            // if there isn't some job to do, then send stop event
            if (!that.isThereJobsWhere(function(testjob){
                return (testjob.method === job.method &&
                        // testjob.status === 'wait' || // TODO ?
                        testjob.status === 'ongoing' ||
                        testjob.status === 'initial');
            })) {
                priv.publisher.publish(
                    jioConstObj.jobMethodObject[
                        job.method].stop_event);
                    return;
            }
            //// end returnedJobAnalyse
        };
        that.clean = function () {
            // Clean the job list, removing all jobs that have failed.
            // It also change the localStorage job queue

            that.removeJob (
                undefined,{
                    'where':function (job) {
                        return (job.status === 'fail');
                    } });
        };
        //// end Methods

        //// Initialize
        priv.useLocalStorage = options.useLocalStorage;
        priv.publisher = publisher;
        priv.jobid = 1;
        priv.jioID = 0;
        priv.jobObjectName = '';
        priv.jobObject = {};
        priv.recoveredJobObject = {};
        //// end Initialize

        return that;
    };
    // end Job & JobQueue
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // jio job listener
    JobListener = function ( queue ) {
        // A little daemon which will start jobs from the joblist
        var that = {}, priv = {};

        priv.interval = 200;
        priv.id = null;
        priv.queue = queue;

        that.setIntervalDelay = function (interval) {
            // Set the time between two joblist check in millisec

            priv.interval = interval;
        };
        that.start = function () {
            // Start the listener. It will always check if there are jobs in the
            // queue

            if (!priv.id) {
                priv.id = setInterval (function () {
                    // recover older jobs
                    priv.queue.recoverOlderJobObject();
                    priv.queue.invokeAll();
                },priv.interval);
                return true;
            } else {
                return false;
            }
        };
        that.stop = function () {
            if (priv.id) {
                clearInterval (priv.id);
                priv.id = null;
                return true;
            }
            return false;
        };
        return that;
    };
    // end jio job listener
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // ActivityUpdater
    ActivityUpdater = function () {
        // The activity updater is a little thread that proves activity of this
        // jio instance.

        var that = {}, priv = {};

        //// private vars
        priv.interval = 400;
        priv.id = null;
        //// end private vars

        //// methods
        that.start = function (id) {
            // start the updater

            if (!priv.id) {
                that.touch(id);
                priv.id = setInterval (function () {
                    that.touch(id);
                },priv.interval);
                return true;
            } else {
                return false;
            }
        };
        that.stop = function () {
            // stop the updater
            if (priv.id) {
                clearInterval (priv.id);
                priv.id = null;
                return true;
            }
            return false;
        };
        that.touch = function (id) {
            jioGlobalObj.localStorage.setItem ('jio/id/' + id,
                                               Date.now() );
        };
        //// end methods
        return that;
    };
    // end ActivityUpdater
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // BaseStorage
    BaseStorage = function ( options ) {
        // The base storage, will call the good method from the good storage,
        // and will check and return the associated value.

        var that = {}, priv = {};

        //// Private attributes
        priv.job = options.job;
        priv.callback = options.job.callback;
        priv.queue = options.queue;
        priv.res = {'status':'done','message':''};
        //// end Private attributes

        //// Private Methods
        priv.fail_checkNameAvailability = function () {
            priv.res.message = 'Unable to check name availability.';
        };
        priv.done_checkNameAvailability = function ( isavailable ) {
            priv.res.message = priv.job.userName + ' is ' +
                (isavailable?'':'not ') + 'available.';
            priv.res.return_value = isavailable;
        };
        priv.fail_loadDocument = function () {
            priv.res.message = 'Unable to load document.';
        };
        priv.done_loadDocument = function ( returneddocument ) {
            priv.res.message = 'Document loaded.';
            priv.res.return_value = returneddocument;
            // transform date into ms
            priv.res.return_value.lastModified =
                new Date(priv.res.return_value.lastModified).getTime();
            priv.res.return_value.creationDate =
                new Date(priv.res.return_value.creationDate).getTime();
        };
        priv.fail_saveDocument = function () {
            priv.res.message = 'Unable to save document.';
        };
        priv.done_saveDocument = function () {
            priv.res.message = 'Document saved.';
        };
        priv.fail_getDocumentList = function () {
            priv.res.message = 'Unable to retrieve document list.';
        };
        priv.done_getDocumentList = function ( documentlist ) {
            var i;
            priv.res.message = 'Document list received.';
            priv.res.return_value = documentlist;
            for (i = 0; i < priv.res.return_value.length; i += 1) {
                priv.res.return_value[i].lastModified =
                    new Date(priv.res.return_value[i].lastModified).getTime();
                priv.res.return_value[i].creationDate =
                    new Date(priv.res.return_value[i].creationDate).getTime();
            }
        };
        priv.fail_removeDocument = function () {
            priv.res.message = 'Unable to removed document.';
        };
        priv.done_removeDocument = function () {
            priv.res.message = 'Document removed.';
        };

        priv.retryLater = function () {
            // Change the job status to wait for time.
            // The listener will invoke this job later.

            var time = (priv.job.tries*priv.job.tries*1000);
            if (time > jioGlobalObj.max_wait_time) {
                time = jioGlobalObj.max_wait_time;
            }
            priv.job.status = 'wait';
            priv.job.waitingFor = {'time':Date.now() + time};
        };
        //// end Private Methods

        //// Getters Setters
        that.cloneJob = function () {
            return $.extend({},priv.job);
        };
        that.getUserName = function () {
            return priv.job.userName || '';
        };
        that.getApplicantID = function () {
            return priv.job.applicant.ID || '';
        };
        that.getStorageUserName = function () {
            return priv.job.storage.userName || '';
        };
        that.getStoragePassword = function () {
            return priv.job.storage.password || '';
        };
        that.getStorageLocation = function () {
            return priv.job.storage.location || '';
        };
        that.getStorageArray = function () {
            return priv.job.storage.storageArray || [];
        };
        that.getFileName = function () {
            return priv.job.fileName || '';
        };
        that.getFileContent = function () {
            return priv.job.fileContent || '';
        };
        that.cloneOptionObject = function () {
            return $.extend({},priv.job.options);
        };
        that.getMaxTries = function () {
            return priv.job.maxtries;
        };
        that.getTries = function () {
            return priv.job.tries || 0;
        };
        that.setMaxTries = function (maxtries) {
            priv.job.maxtries = maxtries;
        };
        //// end Getters Setters

        //// Public Methods
        that.addJob = function ( newjob ) {
            return priv.queue.createJob ( newjob );
        };
        that.eliminate = function () {
            // Stop and remove a job !

            priv.job.maxtries = 1;
            priv.job.tries = 1;
            that.fail('Job Stopped!',0);
        };
        that.replace = function ( newjob ) {
            // It replace the current job by the new one.
            // Replacing only the date

            priv.job.tries = 0;
            priv.job.date = newjob.date;
            priv.job.callback = newjob.callback;

            priv.res.status = 'fail';
            priv.res.message = 'Job Stopped!';
            priv.res.errno = 0;
            priv['fail_'+priv.job.method]();
            priv.callback(priv.res);
        };
        that.fail = function ( message, errno ) {
            // Called when a job has failed.
            // It will retry the job from a certain moment or it will return
            // a failure.

            priv.res.status = 'fail';
            priv.res.message = message;
            priv.res.errno = errno;
            if (!priv.job.maxtries ||
                priv.job.tries < priv.job.maxtries) {
                priv.retryLater();
            } else {
                priv.job.status = 'fail';
                priv['fail_'+priv.job.method]();
                priv.queue.ended(priv.job);
                priv.callback(priv.res);
            }
        };
        that.done = function ( retvalue ) {
            // Called when a job has terminated successfully.
            // It will return the return value by the calling the callback
            // function.

            priv.job.status = 'done';
            priv['done_'+priv.job.method]( retvalue );
            priv.queue.ended(priv.job);
            priv.callback(priv.res);
        };
        that.execute = function () {
            // Execute the good function from the good storage.

            priv.job.tries = that.getTries() + 1;

            if ( !jioGlobalObj.storageTypeObject[ priv.job.storage.type ] ) {
                return null;
            }
            return jioGlobalObj.storageTypeObject[ priv.job.storage.type ]({
                'job':priv.job,'queue':priv.queue})[priv.job.method]();
        };
        // These methods must be redefined!
        that.checkNameAvailability = function () {
            that.fail('This method must be redefined!',0);
        };
        that.loadDocument = function () {
            that.fail('This method must be redefined!',0);
        };
        that.saveDocument = function () {
            that.fail('This method must be redefined!',0);
        };
        that.getDocumentList = function () {
            that.fail('This method must be redefined!',0);
        };
        that.removeDocument = function () {
            that.fail('This method must be redefined!',0);
        };
        //// end Public Methods
        return that;
    };
    // end BaseStorage
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // JIO Constructor
    JioConstructor = function ( storage , applicant, options ) {
        // JIO Constructor, create a new JIO object.
        // It just initializes values.
        // storage   : the storage that contains {type:..,[storageinfos]}
        // applicant : the applicant that contains {ID:...}
        // these parameters are optional and may be 'string' or 'object'

        var that = {}, priv = {};

        //// Getters Setters
        that.getID = function () {
            return priv.id;
        };
        //// end Getters Setters

        //// Methods
        that.start = function () {
            // Start JIO: start listening to jobs and make it ready
            if (priv.id !== 0) { return false; }
            // set a new jio id
            priv.id = priv.queue.getNewQueueID();
            // initializing objects
            priv.queue.init({'jioID':priv.id});
            // start activity updater
            if (priv.updater){
                priv.updater.start(priv.id);
            }
            // start listening
            priv.listener.start();
            // is now ready
            priv.ready = true;
            return that.isReady();
        };
        that.stop = function () {
            // Finish some job if possible and stop listening.
            // It can be restarted later

            priv.queue.close();
            priv.listener.stop();
            if (priv.updater) {
                priv.updater.stop();
            }
            priv.ready = false;
            priv.id = 0;
            return true;
        };
        that.kill = function () {
            // kill this JIO, job listening and job operation (event if they
            // are on going!)

            priv.queue.close();
            priv.listener.stop();
            if (priv.updater) {
                priv.updater.stop();
            }
            // TODO
            priv.ready = false;
            return true;
        };
        that.isReady = function () {
            // Check if Jio is ready to use.
            return priv.ready;
        };
        that.publish = function (eventname, obj) {
            // publish an event on this jio
            // eventname : the event name
            // obj : is an object containing some parameters for example

            if (!that.isReady()) { return ; }
            return priv.pubsub.publish(eventname,obj);
        };
        that.subscribe = function (eventname, callback) {
            // subscribe to an event on this jio. We can subscribe to jio event
            // even if jio is not started. Returns the callback function in
            // order to unsubscribe it.
            // eventname : the event name.
            // callback : called after receiving event.

            return priv.pubsub.subscribe(eventname,callback);
        };
        that.unsubscribe = function (eventname,callback) {
            // unsubscribe callback from an event

            return priv.pubsub.unsubscribe(eventname,callback);
        };

        that.checkNameAvailability = function ( options ) {
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
            // jio.checkNameAvailability({'userName':'myName','callback':
            //     function (result) {
            //         if (result.status === 'done') {
            //             if (result.return_value === true) { // available
            //             } else { } // not available
            //         } else { } // Error
            //     }});

            var settings = $.extend ({
                'userName': priv.storage.userName,
                'storage': priv.storage,
                'applicant': priv.applicant,
                'method': 'checkNameAvailability',
                'callback': function () {}
            },options);
            // check dependencies
            if (that.isReady() && settings.userName &&
                settings.storage && settings.applicant) {
                return priv.queue.createJob ( settings );
            }
            return null;
        };

        that.saveDocument = function ( options ) {
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
            //     'callback': function (result) {
            //         if (result.status === 'done') { // Saved
            //         } else { } // Error
            //     }});

            var settings = $.extend({
                'storage': priv.storage,
                'applicant': priv.applicant,
                'method':'saveDocument',
                'callback': function () {}
            },options);
            // check dependencies
            if (that.isReady() && settings.fileName && settings.fileContent &&
                settings.storage && settings.applicant) {
                return priv.queue.createJob ( settings );
            }
            return null;
        };

        that.loadDocument = function ( options ) {
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
            //     function (result) {
            //         if (result.status === 'done') { // Loaded
            //         } else { } // Error
            //     }});

            // result.return_value is a document object that looks like {
            //     fileName:'string',fileContent:'string',
            //     creationDate:123,lastModified:456 }

            var settings = $.extend ({
                'storage': priv.storage,
                'applicant': priv.applicant,
                'method':'loadDocument',
                'callback': function(){}
            },options);
            // check dependencies
            if (that.isReady() && settings.fileName &&
                settings.storage && settings.applicant) {
                return priv.queue.createJob ( settings );
            }
            return null;
        };

        that.getDocumentList = function ( options ) {
            // Get a document list of the user in the storage set in [options]
            // or in the storage set at init.
            // options.storage : the storage where to get the list (optional)
            // options.applicant : the applicant (optional)
            // options.callback(result) : called to get the result.

            // returns: - null if dependencies are missing
            //          - false if the job was not added
            //          - true if the job was added or replaced

            // jio.getDocumentList({'callback':
            //     function (result) {
            //         if (result.status === 'done') { // OK
            //             console.log(result.return_value);
            //         } else { } // Error
            //     }});

            // result.return_value is an Array that contains documents objects.

            var settings = $.extend ({
                'storage': priv.storage,
                'applicant': priv.applicant,
                'method':'getDocumentList',
                'callback':function(){}
            },options);
            // check dependencies
            if (that.isReady() && settings.storage && settings.applicant ) {
                return priv.queue.createJob( settings );
            }
            return null;
        };

        that.removeDocument = function ( options ) {
            // Remove a document in the storage set in [options]
            // or in the storage set at init.
            // options.storage : the storage where to remove (optional)
            // options.applicant : the applicant (optional)
            // options.callback(result) : called to get the result.

            // returns: - null if dependencies are missing
            //          - false if the job was not added
            //          - true if the job was added or replaced

            // jio.removeDocument({'fileName':'file','callback':
            //     function (result) {
            //         if(result.status === 'done') { // Removed
            //         } else { } // Not Removed
            //     }});

            var settings = $.extend ({
                'storage': priv.storage,
                'applicant': priv.applicant,
                'method':'removeDocument',
                'callback':function (){}
            },options);
            if (that.isReady() && settings.fileName &&
                settings.storage && settings.applicant ) {
                return priv.queue.createJob ( settings );
            }
            return null;
        };
        //// end Methods

        //// Initialize
        var settings = $.extend({'useLocalStorage':true},options);

        // objectify storage and applicant
        if(typeof storage === 'string') {
            storage = JSON.parse(options.storage);
        }
        if(typeof applicant === 'string') {
            applicant = JSON.parse(options.applicant);
        }

        // set init values
        priv['storage']   = storage;
        priv['applicant'] = applicant;
        priv['id']        = 0;
        priv['pubsub']    = new PubSub(settings);
        priv['queue']     = new JobQueue(priv.pubsub,settings);
        priv['listener']  = new JobListener(priv.queue,settings);
        priv['ready']     = false;
        if (settings.useLocalStorage) {
            priv['updater']   = new ActivityUpdater(settings);
        } else {
            priv['updater']   = null;
        }

        // check storage type
        if (priv.storage && !jioGlobalObj.storageTypeObject[priv.storage.type]){
            $.error('Unknown storage type "' + priv.storage.type +'"');
        }

        // start jio process
        that.start();
        //// end Initialize

        return that;
    };
    // end JIO
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Jio creator
    JioCreator = function () {
        var that = {};
        // Jio creator object
        // this object permit to create jio object
        that.createNew = function ( storage, applicant, options ) {
            // Return a new instance of JIO
            // storage: the storage object or json string
            // applicant: the applicant object or json string
            // options.useLocalStorage: if true, save job queue on localStorage.

            var settings = $.extend({'useLocalStorage':true},options);

            if (jioGlobalObj.localStorage===null) {
                jioGlobalObj.localStorage = LocalOrCookieStorage;
            }

            return new JioConstructor(storage,applicant,settings);
        };
        that.newBaseStorage = function ( options ) {
            // Create a Jio Storage which can be used to design new storage.

            return new BaseStorage( options );
        };
        that.addStorageType = function ( type, constructor ) {
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
        };
        that.getGlobalObject = function () {
            // Returns the global jio values
            return jioGlobalObj;
        };
        that.getConstObject = function () {
            // Returns a copy of the constants
            return $.extend({},jioConstObj);
        };
        return that;
    };
    return new JioCreator();
    // end Jio Creator
    ////////////////////////////////////////////////////////////////////////////
};

if (window.requirejs) {
    define ('JIO',['LocalOrCookieStorage','jQuery'],jio_loader_function);
    return undefined;
} else {
    return jio_loader_function ( LocalOrCookieStorage, jQuery );
}

}());
