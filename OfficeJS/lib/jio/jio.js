/*! JIO - v0.1.0 - 2012-06-05
* Copyright (c) 2012 Nexedi; Licensed  */

var JIO =
(function () { var jioLoaderFunction = function ( localOrCookieStorage, $ ) {

    ////////////////////////////////////////////////////////////////////////////
    // constants
    var jio_const_obj = {
        job_method_object: {
            checkNameAvailability:{},
            saveDocument:{},
            loadDocument:{},
            getDocumentList:{},
            removeDocument:{}
        }
    },
    // end constants
    ////////////////////////////////////////////////////////////////////////////
    // jio globals
    jio_global_obj = {
        job_managing_method:{
            /*
              LEGEND:
              - s: storage
              - a: applicant
              - m: method
              - n: name
              - c: content
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
            canSelect:function (job1,job2) {
                if (JSON.stringify (job1.storage) ===
                    JSON.stringify (job2.storage) &&
                    JSON.stringify (job1.applicant) ===
                    JSON.stringify (job2.applicant) &&
                    job1.name === job2.name) {
                    return true;
                }
                return false;
            },
            canRemoveFailOrDone:function (job1,job2) {
                if (job1.status === 'fail' ||
                    job1.status === 'done') {
                    return true;
                }
                return false;
            },
            canEliminate:function (job1,job2) {
                if (job1.status !== 'on_going' &&
                    (job1.method === 'removeDocument' &&
                     job2.method === 'saveDocument' ||
                     job1.method === 'saveDocument' &&
                     job2.method === 'removeDocument')) {
                    return true;
                }
                return false;
            },
            canReplace:function (job1,job2) {
                if (job1.status !== 'on_going' &&
                    job1.method === job2.method &&
                    job1.date < job2.date) {
                    return true;
                }
                return false;
            },
            cannotAccept:function (job1,job2) {
                if (job1.status !== 'on_going' ) {
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
                               job1.content === job2.content) {
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
            mustWait:function (job1,job2) {
                if (job1.method === 'getDocumentList' ||
                    job1.method === 'checkNameAvailability' ||
                    job2.method === 'getDocumentList' ||
                    job2.method === 'checkNameAvailability' ) {
                    return false;
                }
                return true;
            }
        },
        queue_id: 1,
        storage_type_object: {},  // ex: {'type':'local','creator': fun ...}
        max_wait_time: 10000
    },
    // end jio globals
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Tools
    // end Tools
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Classes
    newPubSub,newJob,newJobQueue,newJobListener,newActivityUpdater,
    newBaseStorage,newJioConstructor,newJioCreator;
    // end Classes
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Publisher Subcriber
    newPubSub = function (spec, my) {
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
        that.publish = function (event_name,obj) {
            // publish an event
            priv.eventAction(event_name).publish(obj);
        };
        that.subscribe = function (event_name,callback) {
            // subscribe and return the callback function
            priv.eventAction(event_name).subscribe(callback);
            return callback;
        };
        that.unsubscribe = function (event_name,callback) {
            // unsubscribe the callback from eventname
            priv.eventAction(event_name).unsubscribe(callback);
        };
        return that;
    };
    // end Publisher Subcriber
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Job & JobQueue
    newJob = function ( spec, my ) {
        // Job constructor

        var job = $.extend(true,{},spec);
        job['id']=0;
        job['status']='initial';
        job['date']=Date.now();
        return job;
    };

    newJobQueue = function ( spec, my ) {
        // JobQueue is a queue of jobs. It will regulary copy this queue
        // into localStorage to resume undone tasks.
        // spec.publisher: the publisher to use to send event
        // spec.options.useLocalStorage: if true, save jobs into localStorage,
        //                               else only save on memory.

        var that = {}, priv = {}, jio_id_array_name = 'jio/id_array';

        that.init = function ( options ) {
            // initialize the JobQueue
            // options.publisher : is the publisher to use to send events
            // options.jio_id : the jio ID

            var k, emptyFun = function (){}, jio_id_array;
            if (priv.use_local_storage) {
                jio_id_array = localOrCookieStorage.
                    getItem (jio_id_array_name)||[];
                if (spec.publisher) {
                    priv.publisher = spec.publisher;
                }
                priv.jio_id = options.jio_id;
                priv.job_object_name = 'jio/job_object/' + priv.jio_id;
                jio_id_array.push (priv.jio_id);
                localOrCookieStorage.setItem (jio_id_array_name,jio_id_array);
            }
            priv.job_object = {};
            that.copyJobQueueToLocalStorage();
            for (k in priv.recovered_job_object) {
                priv.recovered_job_object[k].callback = emptyFun;
                that.addJob (priv.recovered_job_object[k]);
            }
        };
        that.close = function () {
            // close the job queue.
            // it also deletes from local storage only if the job list is
            // empty.

            if (JSON.stringify(priv.job_object) === '{}') {
                localOrCookieStorage.deleteItem(priv.job_object_name);
            }
        };
        that.getNewQueueID = function () {
            // Returns a new queueID

            var k = null, id = 0,
            jio_id_array = localOrCookieStorage.getItem (jio_id_array_name)||[];
            for (k = 0; k < jio_id_array.length; k += 1) {
                if (jio_id_array[k] >= jio_global_obj.queue_id) {
                    jio_global_obj.queue_id = jio_id_array[k] + 1;
                }
            }
            id = jio_global_obj.queue_id;
            jio_global_obj.queue_id ++;
            return id;
        };
        that.recoverOlderJobObject = function () {
            // recover job object from older inactive jio

            var k = null, new_jio_id_array = [], jio_id_array_changed = false,
            jio_id_array;
            if (priv.use_local_storage) {
                jio_id_array = localOrCookieStorage.
                    getItem (jio_id_array_name)||[];
                for (k = 0; k < jio_id_array.length; k += 1) {
                    if (localOrCookieStorage.getItem (
                        'jio/id/'+jio_id_array[k]) < Date.now () - 10000) {
                        // remove id from jio_id_array

                        // 10000 sec ? delete item
                        localOrCookieStorage.deleteItem('jio/id/'+
                                                        jio_id_array[k]);
                        // job recovery
                        priv.recovered_job_object = localOrCookieStorage.
                            getItem('jio/job_object/'+ jio_id_array[k]);
                        // remove ex job object
                        localOrCookieStorage.deleteItem(
                            'jio/job_object/'+ jio_id_array[k]);
                        jio_id_array_changed = true;
                    } else {
                        new_jio_id_array.push (jio_id_array[k]);
                    }
                }
                if (jio_id_array_changed) {
                    localOrCookieStorage.setItem(jio_id_array_name,
                                                 new_jio_id_array);
                }
            }
        };
        that.isThereJobsWhere = function( func ) {
            // Check if there is jobs, in the queue,
            // where [func](job) == true.

            var id = 'id';
            if (!func) { return true; }
            for (id in priv.job_object) {
                if (func(priv.job_object[id])) {
                    return true;
                }
            }
            return false;
        };
        that.copyJobQueueToLocalStorage = function () {
            // Copy job queue into localStorage.

            if (priv.use_local_storage) {
                return localOrCookieStorage.setItem(
                    priv.job_object_name,priv.job_object);
            } else {
                return false;
            }
        };
        that.createJob = function ( options ) {
            return that.addJob ( newJob ( options ) );
        };
        that.addJob = function ( job ) {
            // Add a job to the queue, browsing all jobs
            // and check if the new job can eliminate older ones,
            // can replace older one, can be accepted, or must wait
            // for older ones.
            // It also clean fail or done jobs.
            // job  = the job object

            var new_one = true, elim_array = [], wait_array = [],
            remove_array = [], base_storage = null, id = 'id';

            //// browsing current jobs
            for (id in priv.job_object) {
                if (jio_global_obj.job_managing_method.canRemoveFailOrDone(
                    priv.job_object[id],job)) {
                    remove_array.push(id);
                    continue;
                }
                if (jio_global_obj.job_managing_method.canSelect(
                    priv.job_object[id],job)) {
                    if (jio_global_obj.job_managing_method.canEliminate(
                        priv.job_object[id],job)) {
                        elim_array.push(id);
                        continue;
                    }
                    if (jio_global_obj.job_managing_method.canReplace(
                        priv.job_object[id],job)) {
                        base_storage = newBaseStorage(
                            {'queue':that,'job':priv.job_object[id]});
                        base_storage.replace(job);
                        new_one = false;
                        break;
                    }
                    if (jio_global_obj.job_managing_method.cannotAccept(
                        priv.job_object[id],job)) {
                        // Job not accepted
                        return false;
                    }
                    if (jio_global_obj.job_managing_method.mustWait(
                        priv.job_object[id],job)) {
                        wait_array.push(id);
                        continue;
                    }
                    // one of the previous tests must be ok.
                    // the program must not reach this part of the 'for'.
                }
            }
            //// end browsing current jobs

            if (new_one) {
                // if it is a new job, we can eliminate deprecated jobs and
                // set this job dependencies.
                for (id = 0; id < elim_array.length; id += 1) {
                    base_storage = newBaseStorage(
                        {'queue':that,
                         'job':priv.job_object[elim_array[id]]});
                    base_storage.eliminate();
                }
                if (wait_array.length > 0) {
                    job.status = 'wait';
                    job.waiting_for = {'job_id_array':wait_array};
                    for (id = 0; id < wait_array.length; id += 1) {
                        if (priv.job_object[wait_array[id]]) {
                            priv.job_object[wait_array[id]].max_tries = 1;
                        }
                    }
                }
                for (id = 0; id < remove_array.length; id += 1) {
                    that.removeJob(priv.job_object[remove_array[id]]);
                }
                // set job id
                job.id = priv.job_id;
                job.tries = 0;
                priv.job_id ++;
                // save the new job into the queue
                priv.job_object[job.id] = job;
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

            var settings = $.extend ({where:function (job) {return true;}},
                                     options),andwhere,found=false,k='key';

            //// modify the job list
            if (settings.job) {
                if (priv.job_object[settings.job.id] && settings.where(
                    priv.job_object[settings.job.id]) ) {
                    delete priv.job_object[settings.job.id];
                    found = true;
                }
            }else {
                for (k in priv.job_object) {
                    if (settings.where(priv.job_object[k])) {
                        delete priv.job_object[k];
                        found = true;
                    }
                }
            }
            if (!found) {
                console.error('No jobs was found, when trying to remove some.');
            }
            //// end modifying
            that.copyJobQueueToLocalStorage();
        };

        that.resetAll = function () {
            // Reset all job to 'initial'.
            // TODO manage jobs ! All jobs are not 'initial'.

            var id = 'id';
            for (id in priv.job_object) {
                priv.job_object[id].status = 'initial';
            }
            that.copyJobQueueToLocalStorage();
        };

        that.invokeAll = function () {
            // Do all jobs in the queue.

            var i = 'id', j, ok;
            //// do All jobs
            for (i in priv.job_object) {
                ok = false;
                if (priv.job_object[i].status === 'initial') {
                    // if status initial
                    // invoke new job
                    that.invoke(priv.job_object[i]);
                } else if (priv.job_object[i].status === 'wait') {
                    ok = true;
                    // if status wait
                    if (priv.job_object[i].waiting_for.job_id_array) {
                        // wait job
                        // browsing job id array
                        for (j = 0;
                             j < priv.job_object[i].
                             waiting_for.job_id_array.length;
                             j += 1) {
                            if (priv.job_object[priv.job_object[i].
                                                waiting_for.job_id_array[j]]) {
                                // if a job is still exist, don't invoke
                                ok = false;
                                break;
                            }
                        }
                    }
                    if (priv.job_object[i].waiting_for.time) {
                        // wait time
                        if (priv.job_object[i].waiting_for.time > Date.now()) {
                            // it is not time to restore the job!
                            ok = false;
                        }
                    }
                    // else wait nothing
                    if (ok) {
                        // invoke waiting job
                        that.invoke(priv.job_object[i]);
                    }
                }
            }
            this.copyJobQueueToLocalStorage();
            //// end, continue doing jobs asynchronously
        };

        that.invoke = function (job) {
            // Do a job invoking the good method in the good storage.

            var base_storage;

            //// analysing job method
            // if the method does not exist, do nothing
            if (!jio_const_obj.job_method_object[job.method]) {
                return false;   // suppose never happen
            }
            // test if a similar job is on going, in order to publish a start
            // event if it is the first of his kind (method).
            if (!that.isThereJobsWhere(function (testjob){
                return (testjob.method === job.method &&
                        testjob.method === 'initial');
            })) {
                job.status = 'on_going';
                priv.publisher.publish(jio_const_obj.job_method_object[
                    job.method]['start_'+job.method]);
            } else {
                job.status = 'on_going';
            }
            // Create a storage object and use it to save,load,...!
            base_storage = newBaseStorage({'queue':this,'job':job});
            base_storage.execute();
            //// end method analyse
        };

        that.ended = function (endedjob) {
            // It is a callback function called just before user callback.
            // It is called to manage job_object according to the ended job.

            var job = $.extend(true,{},endedjob); // copy
            // This job is supposed terminated, we can remove it from queue.
            that.removeJob ({'job':job});

            //// ended job analyse
            // if the job method does not exists, return false
            if (!jio_const_obj.job_method_object[job.method]) {
                return false;
            }
            // if there isn't some job to do, then send stop event
            if (!that.isThereJobsWhere(function(testjob){
                return (testjob.method === job.method &&
                        // testjob.status === 'wait' || // TODO ?
                        testjob.status === 'on_going' ||
                        testjob.status === 'initial');
            })) {
                priv.publisher.publish(
                    jio_const_obj.job_method_object[
                        job.method]['stop_'+job.method]);
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
        priv.use_local_storage = spec.options.use_local_storage;
        priv.publisher = spec.publisher;
        priv.job_id = 1;
        priv.jio_id = 0;
        priv.job_object_name = '';
        priv.job_object = {};
        priv.recovered_job_object = {};
        //// end Initialize

        return that;
    };
    // end Job & JobQueue
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // jio job listener
    newJobListener = function ( spec, my ) {
        // A little daemon which will start jobs from the joblist
        var that = {}, priv = {};

        priv.interval = 200;
        priv.id = null;
        priv.queue = spec.queue;

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
    newActivityUpdater = function () {
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
            localOrCookieStorage.setItem ('jio/id/' + id,Date.now() );
        };
        //// end methods
        return that;
    };
    // end ActivityUpdater
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // BaseStorage
    newBaseStorage = function ( options ) {
        // The base storage, will call the good method from the good storage,
        // and will check and return the associated value.

        var that = {}, priv = {};

        //// Private attributes
        priv.job = options.job;
        priv.callback = options.job.callback;
        priv.queue = options.queue;
        priv.res = {'status':'done','message':''};
        priv.sorted = false;
        priv.limited = false;
        priv.research_done = false;
        //// end Private attributes

        //// Private Methods
        priv.fail_checkNameAvailability = function () {
            priv.res.message = 'Unable to check name availability.';
        };
        priv.done_checkNameAvailability = function ( isavailable ) {
            priv.res.message = priv.job.user_name + ' is ' +
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
            priv.res.return_value.last_modified =
                new Date(priv.res.return_value.last_modified).getTime();
            priv.res.return_value.creation_date =
                new Date(priv.res.return_value.creation_date).getTime();
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
                // transform current date format into ms since 1/1/1970
                // useful for easy comparison
                if (typeof priv.res.return_value[i].last_modified !== 'number') {
                    priv.res.return_value[i].last_modified =
                        new Date(priv.res.return_value[i].last_modified).
                        getTime();
                }
                if (typeof priv.res.return_value[i].creation_date !== 'number') {
                    priv.res.return_value[i].creation_date =
                        new Date(priv.res.return_value[i].creation_date).
                        getTime();
                }
            }
            // check for sorting
            if (!priv.sorted && typeof priv.job.sort !== 'undefined') {
                that.sortDocumentArray(priv.res.return_value);
            }
            // check for limiting
            if (!priv.limited &&
                typeof priv.job.limit !== 'undefined' &&
                typeof priv.job.limit.begin !== 'undefined' &&
                typeof priv.job.limit.end !== 'undefined') {
                priv.res.return_value =
                    that.limitDocumentArray(priv.res.return_value);
            }
            // check for research
            if (!priv.research_done && typeof priv.job.search !== 'undefined') {
                priv.res.return_value =
                    that.searchDocumentArray(priv.res.return_value);
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
            if (time > jio_global_obj.max_wait_time) {
                time = jio_global_obj.max_wait_time;
            }
            priv.job.status = 'wait';
            priv.job.waiting_for = {'time':Date.now() + time};
        };
        //// end Private Methods

        //// Getters Setters
        that.cloneJob = function () {
            return $.extend(true,{},priv.job);
        };
        that.getUserName = function () {
            return priv.job.user_name || '';
        };
        that.getApplicantID = function () {
            return priv.job.applicant.ID || '';
        };
        that.getStorageUserName = function () {
            return priv.job.storage.user_name || '';
        };
        that.getStoragePassword = function () {
            return priv.job.storage.password || '';
        };
        that.getStorageURL = function () {
            return priv.job.storage.url || '';
        };
        that.getSecondStorage = function () {
            return priv.job.storage.storage || {};
        };
        that.getStorageArray = function () {
            return priv.job.storage.storage_array || [];
        };
        that.getFileName = function () {
            return priv.job.name || '';
        };
        that.getFileContent = function () {
            return priv.job.content || '';
        };
        that.cloneOptionObject = function () {
            return $.extend(true,{},priv.job.options);
        };
        that.getMaxTries = function () {
            return priv.job.max_tries;
        };
        that.getTries = function () {
            return priv.job.tries || 0;
        };
        that.setMaxTries = function (max_tries) {
            priv.job.max_tries = max_tries;
        };
        //// end Getters Setters

        //// Public Methods
        that.addJob = function ( newjob ) {
            return priv.queue.createJob ( newjob );
        };
        that.eliminate = function () {
            // Stop and remove a job !

            priv.job.max_tries = 1;
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
            priv.res.error = {};
            priv.res.error.status = 0;
            priv.res.error.statusText = 'Replaced';
            priv.res.error.message = 'The job was replaced by a newer one.';
            priv['fail_'+priv.job.method]();
            priv.callback(priv.res);
        };
        that.fail = function ( errorobject ) {
            // Called when a job has failed.
            // It will retry the job from a certain moment or it will return
            // a failure.

            priv.res.status = 'fail';
            priv.res.error = errorobject;
            // init error object with default values
            priv.res.error.status = priv.res.error.status || 0;
            priv.res.error.statusText =
                priv.res.error.statusText || 'Unknown Error';
            priv.res.error.array = priv.res.error.array || [];
            priv.res.error.message = priv.res.error.message || '';
            // retry ?
            if (!priv.job.max_tries ||
                priv.job.tries < priv.job.max_tries) {
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

            if ( !jio_global_obj.storage_type_object[priv.job.storage.type] ) {
                return null;
            }
            return jio_global_obj.storage_type_object[ priv.job.storage.type ]({
                'job':priv.job,'queue':priv.queue})[priv.job.method]();
        };
        // These methods must be redefined!
        that.checkNameAvailability = function () {
            that.fail({status:0,
                       statusText:'Undefined Method',
                       message:'This method must be redefined!'});
        };
        that.loadDocument = function () {
            that.fail({status:0,
                       statusText:'Undefined Method',
                       message:'This method must be redefined!'});
        };
        that.saveDocument = function () {
            that.fail({status:0,
                       statusText:'Undefined Method',
                       message:'This method must be redefined!'});
        };
        that.getDocumentList = function () {
            that.fail({status:0,
                       statusText:'Undefined Method',
                       message:'This method must be redefined!'});
        };
        that.removeDocument = function () {
            that.fail({status:0,
                       statusText:'Undefined Method',
                       message:'This method must be redefined!'});
        };

        /**
         * Sorts a document list using sort parameters set in the job.
         * @method sortDocumentArray
         * @param  {array} documentarray The array we want to sort.
         */
        that.sortDocumentArray = function (documentarray) {
            documentarray.sort(function (row1,row2) {
                var k, res;
                for (k in priv.job.sort) {
                    var sign = (priv.job.sort[k] === 'descending' ? -1 : 1);
                    if (row1[k] === row2[k]) { continue; }
                    return (row1[k] > row2[k] ? sign : -sign);
                }
                return 0;
            });
            that.sortDone();
        };

        /**
         * Tells to this storage that the sorting process is already done.
         * @method sortDone
         */
        that.sortDone = function () {
            priv.sorted = true;
        };

        /**
         * Limits the document list. Clones only the document list between
         * begin and end set in limit object in the job.
         * @method limitDocumentArray
         * @param  {array} documentarray The array we want to limit
         * @return {array} The new document list
         */
        that.limitDocumentArray = function (documentarray) {
            that.limitDone();
            return documentarray.slice(priv.job.limit.begin,
                                       priv.job.limit.end);
        };

        /**
         * Tells to this storage that the limiting process is already done.
         * @method limitDone
         */
        that.limitDone = function () {
            priv.limited = true;
        };

        /**
         * Search the strings inside the document list. Clones the document list
         * containing only the matched strings.
         * @method searchDocumentArray
         * @param  {array} documentarray The array we want to search into.
         * @return {array} The new document list.
         */
        that.searchDocumentArray = function (documentarray) {
            var i, k, newdocumentarray = [];
            for (i = 0; i < documentarray.length; i += 1) {
                for (k in priv.job.search) {
                    if (typeof documentarray[i][k] === 'undefined') {
                        continue;
                    }
                    if (documentarray[i][k].search(priv.job.search[k]) > -1) {
                        newdocumentarray.push(documentarray[i]);
                        break;
                    }
                }
            }
            that.researchDone();
            return newdocumentarray;
        };

        /**
         * Tells to this storage that the research is already done.
         * @method researchDone
         */
        that.researchDone = function () {
            priv.research_done = true;
        };

        //// end Public Methods
        return that;
    };
    // end BaseStorage
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // JIO Constructor
    newJioConstructor = function ( spec, my ) {
        // JIO Constructor, create a new JIO object.
        // It just initializes values.
        // storage   : the storage that contains {type:..,[storageinfos]}
        // applicant : the applicant that contains {ID:...}
        // these parameters are optional and may be 'string' or 'object'

        var that = {}, priv = {};

        priv.wrongParametersError = function (settings) {
            var m = 'Method: '+ settings.method +
                ', One or some parameters are undefined.';
            console.error (m);
            settings.callback({status:'fail',
                               error: {status:0,
                                       statusText:'Undefined Parameter',
                                       message: m}});
            return null;
        };

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
            priv.queue.init({'jio_id':priv.id});
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
            // jio.checkNameAvailability({'user_name':'myName','callback':
            //     function (result) {
            //         if (result.status === 'done') {
            //             if (result.return_value === true) { // available
            //             } else { } // not available
            //         } else { } // Error
            //     }});

            var settings = $.extend (true,{
                'user_name': priv.storage.user_name,
                'storage': priv.storage,
                'applicant': priv.applicant,
                'method': 'checkNameAvailability',
                'callback': function () {}
            },options);
            // check dependencies
            if (that.isReady() && settings.user_name &&
                settings.storage && settings.applicant) {
                return priv.queue.createJob ( settings );
            }
            return priv.wrongParametersError(settings);
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

            // jio.saveDocument({'name':'file','content':'content',
            //     'callback': function (result) {
            //         if (result.status === 'done') { // Saved
            //         } else { } // Error
            //     }});

            var settings = $.extend(true,{
                'storage': priv.storage,
                'applicant': priv.applicant,
                'content': '',
                'method':'saveDocument',
                'callback': function () {}
            },options);
            // check dependencies
            if (that.isReady() && settings.name &&
                settings.storage && settings.applicant) {
                return priv.queue.createJob ( settings );
            }
            return priv.wrongParametersError(settings);
        };

        that.loadDocument = function ( options ) {
            // Load a document in the storage set in [options]
            // or in the storage set at init. At the end of the job,
            // 'job_done' will be sent with this job and its 'content'
            // return value.
            // options.storage : the storage where to load (optional)
            // options.applicant : the applicant (optional)
            // options.callback(result) : called to get the result.

            // returns: - null if dependencies are missing
            //          - false if the job was not added
            //          - true if the job was added or replaced

            // jio.loadDocument({'name':'file','callback':
            //     function (result) {
            //         if (result.status === 'done') { // Loaded
            //         } else { } // Error
            //     }});

            // result.return_value is a document object that looks like {
            //     name:'string',content:'string',
            //     creation_date:123,last_modified:456 }

            var settings = $.extend (true,{
                'storage': priv.storage,
                'applicant': priv.applicant,
                'method':'loadDocument',
                'callback': function(){}
            },options);
            // check dependencies
            if (that.isReady() && settings.name &&
                settings.storage && settings.applicant) {
                return priv.queue.createJob ( settings );
            }
            return priv.wrongParametersError(settings);
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

            var settings = $.extend (true,{
                'storage': priv.storage,
                'applicant': priv.applicant,
                'method':'getDocumentList',
                'callback':function(){}
            },options);
            // check dependencies
            if (that.isReady() && settings.storage && settings.applicant ) {
                return priv.queue.createJob( settings );
            }
            return priv.wrongParametersError(settings);
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

            // jio.removeDocument({'name':'file','callback':
            //     function (result) {
            //         if(result.status === 'done') { // Removed
            //         } else { } // Not Removed
            //     }});

            var settings = $.extend (true,{
                'storage': priv.storage,
                'applicant': priv.applicant,
                'method':'removeDocument',
                'callback':function (){}
            },options);
            if (that.isReady() && settings.name &&
                settings.storage && settings.applicant ) {
                return priv.queue.createJob ( settings );
            }
            return priv.wrongParametersError(settings);
        };
        //// end Methods

        //// Initialize
        var settings = $.extend(true,{'use_local_storage':true},spec.options);

        // objectify storage and applicant
        if(typeof spec.storage === 'string') {
            spec.storage = JSON.parse(spec.storage);
        }
        if(typeof spec.applicant === 'string') {
            spec.applicant = JSON.parse(spec.applicant);
        }

        // set init values
        priv['storage']   = spec.storage;
        priv['applicant'] = spec.applicant;
        priv['id']        = 0;
        priv['pubsub']    = newPubSub({options:settings});
        priv['queue']     = newJobQueue({publisher:priv.pubsub,
                                         options:settings});
        priv['listener']  = newJobListener({queue:priv.queue,
                                            options:settings});
        priv['ready']     = false;
        if (settings.use_local_storage) {
            priv['updater'] = newActivityUpdater({options:settings});
        } else {
            priv['updater'] = null;
        }

        // check storage type
        if (priv.storage &&
            !jio_global_obj.storage_type_object[priv.storage.type]){
            console.error('Unknown storage type "' + priv.storage.type +'"');
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
    newJioCreator = function ( spec, my ) {
        var that = {};
        // Jio creator object
        // this object permit to create jio object
        that.newJio = function ( storage, applicant, options ) {
            // Return a new instance of JIO
            // storage: the storage object or json string
            // applicant: the applicant object or json string
            // options.useLocalStorage: if true, save job queue on localStorage.

            var settings = $.extend(true,{'use_local_storage':true},options);

            return newJioConstructor({storage:storage,
                                      applicant:applicant,
                                      options:settings});
        };
        that.newBaseStorage = function ( spec, my ) {
            // Create a Jio Storage which can be used to design new storage.

            return newBaseStorage( spec, my );
        };
        that.addStorageType = function ( type, constructor ) {
            // Add a storage type to jio. Jio must have keys/types which are
            // bound to a storage creation function. ex: 'local', will
            // create a LocalStorage (in jio.storage.js).
            // It can replace a older type with a newer creation function.
            // type : the type of the storage.
            // constructor : the function which returns a new storage object.

            if (type && constructor) {
                jio_global_obj.storage_type_object[type] = constructor;
                return true;
            }
            return false;
        };
        that.getGlobalObject = function () {
            // Returns the global jio values
            return jio_global_obj;
        };
        that.getConstObject = function () {
            // Returns a copy of the constants
            return $.extend(true,{},jio_const_obj);
        };
        return that;
    };
    return newJioCreator();
    // end Jio Creator
    ////////////////////////////////////////////////////////////////////////////
};

if (window.requirejs) {
    define ('JIO',['LocalOrCookieStorage','jQuery'],jioLoaderFunction);
    return undefined;
} else {
    return jioLoaderFunction ( LocalOrCookieStorage, jQuery );
}

}());
