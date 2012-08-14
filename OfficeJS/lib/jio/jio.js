/*! JIO - v0.1.0 - 2012-08-14
* Copyright (c) 2012 Nexedi; Licensed  */

var jio = (function () {

var jioException = function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    that.name = 'jioException';
    that.message = spec.message || 'Unknown Reason.';
    that.toString = function() {
        return that.name + ': ' + that.message;
    };
    return that;
};

var invalidCommandState = function(spec, my) {
    var that = jioException(spec, my);
    spec = spec || {};
    var command = spec.command;
    that.name = 'invalidCommandState';
    that.toString = function() {
        return that.name +': ' +
            command.getLabel() + ', ' + that.message;
    };
    return that;
};

var invalidStorage = function(spec, my) {
    var that = jioException(spec, my);
    spec = spec || {};
    var type = spec.storage.getType();
    that.name = 'invalidStorage';
    that.toString = function() {
        return that.name +': ' +
            'Type "'+type + '", ' + that.message;
    };
    return that;
};

var invalidStorageType = function(spec, my) {
    var that = jioException(spec, my);
    var type = spec.type;
    that.name = 'invalidStorageType';
    that.toString = function() {
        return that.name +': ' +
            type + ', ' + that.message;
    };
    return that;
};

var jobNotReadyException = function(spec, my) {
    var that = jioException(spec, my);
    that.name = 'jobNotReadyException';
    return that;
};

var tooMuchTriesJobException = function(spec, my) {
    var that = jioException(spec, my);
    that.name = 'tooMuchTriesJobException';
    return that;
};

var invalidJobException = function(spec, my) {
    var that = jioException(spec, my);
    that.name = 'invalidJobException';
    return that;
};

var storage = function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    priv.type = spec.type || '';

    // Methods //
    that.getType = function() {
        return priv.type;
    };
    that.setType = function(type) {
        priv.type = type;
    };

    /**
     * Execute the command on this storage.
     * @method execute
     * @param  {object} command The command
     */
    that.execute = function(command) {
        that.success = command.success;
        that.error   = command.error;
        that.retry   = command.retry;
        that.end     = command.end;
        if (that.validate(command)) {
            command.executeOn(that);
        }
    };

    /**
     * Override this function to validate specifications.
     * @method isValid
     * @return {boolean} true if ok, else false.
     */
    that.isValid = function() {
        return true;
    };

    that.validate = function () {
        var mess = that.validateState();
        if (mess) {
            that.error({status:0,statusText:'Invalid Storage',
                        error:'invalid_storage',
                        message:mess,reason:mess});
            return false;
        }
        return true;
    };

    /**
     * Returns a serialized version of this storage.
     * @method serialized
     * @return {object} The serialized storage.
     */
    that.serialized = function() {
        return {type:that.getType()};
    };

    that.saveDocument    = function(command) {
        that.error({status:0,statusText:'Unknown storage',
                    error:'unknown_storage',message:'Unknown Storage'});
    };
    that.loadDocument    = function(command) {
        that.saveDocument();
    };
    that.removeDocument  = function(command) {
        that.saveDocument();
    };
    that.getDocumentList = function(command) {
        that.saveDocument();
    };

    /**
     * Validate the storage state. It returns a empty string all is ok.
     * @method validateState
     * @return {string} empty: ok, else error message.
     */
    that.validateState = function() {
        return '';
    };

    that.success = function() {};
    that.retry   = function() {};
    that.error   = function() {};
    that.end     = function() {};  // terminate the current job.

    return that;
};

var storageHandler = function(spec, my) {
    spec = spec || {};
    my = my || {};
    var that = storage( spec, my ), priv = {};

    priv.newCommand = function (method, spec) {
        var o = spec || {};
        o.label = method;
        return command (o, my);
    };

    that.addJob = function (method,storage_spec,doc,option,success,error) {
        var command_opt = {
            options: option,
            callbacks:{success:success,error:error}
        };
        if (doc) {
            if (method === 'get') {
                command_opt.docid = doc;
            } else {
                command_opt.doc = doc;
            }
        }
        my.jobManager.addJob (
            job({
                storage:jioNamespace.storage(storage_spec||{}),
                command:priv.newCommand(method,command_opt)
            }, my)
        );
    };

    return that;
};

var command = function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    priv.commandlist = {'post':postCommand,
                        'put':putCommand,
                        'get':getCommand,
                        'remove':removeCommand,
                        'allDocs':allDocsCommand};
    // creates the good command thanks to his label
    if (spec.label && priv.commandlist[spec.label]) {
        priv.label = spec.label;
        delete spec.label;
        return priv.commandlist[priv.label](spec, my);
    }

    priv.tried     = 0;
    priv.doc       = spec.doc || {};
    priv.docid     = spec.docid || '';
    priv.option    = spec.options || {};
    priv.callbacks = spec.callbacks || {};
    priv.success   = priv.callbacks.success || function (){};
    priv.error     = priv.callbacks.error || function (){};
    priv.retry     = function() {
        that.error({
            status:13,statusText:'Fail Retry',error:'fail_retry',
            message:'Impossible to retry.',reason:'Impossible to retry.'
        });
    };
    priv.end       = function() {};
    priv.on_going  = false;

    // Methods //
    /**
     * Returns a serialized version of this command.
     * Override this function.
     * @method serialized
     * @return {object} The serialized command.
     */
    that.serialized = function() {
        return {label:that.getLabel(),
                tried:priv.tried,
                doc:that.cloneDoc(),
                option:that.cloneOption()};
    };

    /**
     * Returns the label of the command.
     * @method getLabel
     * @return {string} The label.
     */
    that.getLabel = function() {
        return 'command';
    };

    that.getDocId = function () {
        return priv.docid || priv.doc._id;
    };
    that.getDocContent = function () {
        return priv.doc.content;
    };

    /**
     * Returns an information about the document.
     * @method getDocInfo
     * @param  {string} infoname The info name.
     * @return The info value.
     */
    that.getDocInfo = function (infoname) {
        return priv.doc[infoname];
    };

    /**
     * Returns the value of an option.
     * @method getOption
     * @param  {string} optionname The option name.
     * @return The option value.
     */
    that.getOption = function (optionname) {
        return priv.option[optionname];
    };

    /**
     * Validates the storage.
     * @param  {object} storage The storage.
     */
    that.validate = function (storage) {
        if (!that.validateState()) { return false; }
        return storage.validate();
    };

    /*
     * Extend this function
     */
    that.validateState = function() {
        if (typeof priv.doc !== 'object') {
            that.error({
                status:20,
                statusText:'Document_Id Required',
                error:'document_id_required',
                message:'No document id.',
                reason:'no document id'
            });
            return false;
        }
        return true;
    };

    that.canBeRetried = function () {
        return (typeof priv.option.max_retry === 'undefined' ||
                priv.option.max_retry === 0 ||
                priv.tried < priv.option.max_retry);
    };
    that.getTried = function() {
        return priv.tried;
    };

    /**
     * Delegate actual excecution the storage.
     * @param {object} storage The storage.
     */
    that.execute = function(storage) {
        if (!priv.on_going) {
            if (that.validate (storage)) {
                priv.tried ++;
                priv.on_going = true;
                storage.execute (that);
            }
        }
    };

    /**
     * Execute the good method from the storage.
     * Override this function.
     * @method executeOn
     * @param  {object} storage The storage.
     */
    that.executeOn = function(storage) {};

    that.success = function(return_value) {
        priv.on_going = false;
        priv.success (return_value);
        priv.end(doneStatus());
    };

    that.retry = function (return_error) {
        priv.on_going = false;
        if (that.canBeRetried()) {
            priv.retry();
        } else {
            that.error (return_error);
        }
    };

    that.error = function(return_error) {
        priv.on_going = false;
        priv.error(return_error);
        priv.end(failStatus());
    };

    that.end = function () {
        priv.end(doneStatus());
    };

    that.onSuccessDo = function (fun) {
        if (fun) {
            priv.success = fun;
        } else {
            return priv.success;
        }
    };

    that.onErrorDo = function (fun) {
        if (fun) {
            priv.error = fun;
        } else {
            return priv.error;
        }
    };

    that.onEndDo = function (fun) {
        priv.end = fun;
    };

    that.onRetryDo = function (fun) {
        priv.retry = fun;
    };

    /**
     * Is the command can be restored by another JIO : yes.
     * @method canBeRestored
     * @return {boolean} true
     */
    that.canBeRestored = function() {
        return true;
    };

    /**
     * Clones the command and returns it.
     * @method clone
     * @return {object} The cloned command.
     */
    that.clone = function () {
        return command(that.serialized(), my);
    };

    /**
     * Clones the command options and returns the clone version.
     * @method cloneOption
     * @return {object} The clone of the command options.
     */
    that.cloneOption = function () {
        var k, o = {};
        for (k in priv.option) {
            o[k] = priv.option[k];
        }
        return o;
    };

    /**
     * Clones the document and returns the clone version.
     * @method cloneDoc
     * @return {object} The clone of the document.
     */
    that.cloneDoc = function () {
        if (priv.docid) {
            return priv.docid;
        }
        var k, o = {};
        for (k in priv.doc) {
            o[k] = priv.doc[k];
        }
        return o;
    };

    return that;
};

var allDocsCommand = function(spec, my) {
    var that = command(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    // Methods //
    that.getLabel = function() {
        return 'allDocs';
    };

    that.executeOn = function(storage) {
        storage.allDocs (that);
    };

    that.canBeRestored = function() {
        return false;
    };

    return that;
};

var getCommand = function(spec, my) {
    var that = command(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    // Methods //
    that.getLabel = function() {
        return 'get';
    };

    that.validateState = function() {
        if (!that.getDocId()) {
            that.error({
                status:20,statusText:'Document Id Required',
                error:'document_id_required',
                message:'No document id.',reason:'no document id'
            });
            return false;
        }
        return true;
    };

    that.executeOn = function(storage) {
        storage.get (that);
    };

    that.canBeRestored = function() {
        return false;
    };

    return that;
};

var removeCommand = function(spec, my) {
    var that = command(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    // Methods //
    that.getLabel = function() {
        return 'remove';
    };

    that.executeOn = function(storage) {
        storage.remove (that);
    };

    return that;
};

var putCommand = function(spec, my) {
    var that = command(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};

    // Methods //
    that.getLabel = function() {
        return 'put';
    };

    /**
     * Validates the storage handler.
     * @param  {object} handler The storage handler
     */
    var super_validateState = that.validateState;
    that.validate = function () {
        if (typeof that.getDocInfo('content') !== 'string') {
            that.error({
                status:21,statusText:'Content Required',
                error:'content_required',
                message:'No data to put.',reason:'no data to put'
            });
            return false;
        }
        return super_validateState();
    };

    that.executeOn = function(storage) {
        storage.put (that);
    };

    return that;
};

var postCommand = function(spec, my) {
    var that = command(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};

    // Methods //
    that.getLabel = function() {
        return 'post';
    };

    /**
     * Validates the storage handler.
     * @param  {object} handler The storage handler
     */
    var super_validateState = that.validateState;
    that.validate = function () {
        if (typeof that.getDocInfo('content') !== 'string') {
            that.error({
                status:21,statusText:'Content Required',
                error:'content_required',
                message:'No data to put.',reason:'no data to put'
            });
            return false;
        }
        return super_validateState();
    };

    that.executeOn = function(storage) {
        storage.put (that);
    };

    return that;
};

var jobStatus = function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    // Methods //
    that.getLabel = function() {
        return 'job status';
    };

    that.canStart = function() {};
    that.canRestart = function() {};

    that.serialized = function() {
        return {label:that.getLabel()};
    };

    that.isWaitStatus = function() {
        return false;
    };

    that.isDone = function() {
        return false;
    };

    return that;
};

var doneStatus = function(spec, my) {
    var that = jobStatus(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    // Methods //
    that.getLabel = function() {
        return 'done';
    };

    that.canStart = function() {
        return false;
    };
    that.canRestart = function() {
        return false;
    };

    that.isDone = function() {
        return true;
    };
    return that;
};

var failStatus = function(spec, my) {
    var that = jobStatus(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    // Methods //
    that.getLabel = function() {
        return 'fail';
    };

    that.canStart = function() {
        return false;
    };
    that.canRestart = function() {
        return true;
    };
    return that;
};

var initialStatus = function(spec, my) {
    var that = jobStatus(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    // Methods //
    that.getLabel = function() {
        return 'initial';
    };

    that.canStart = function() {
        return true;
    };
    that.canRestart = function() {
        return true;
    };
    return that;
};
var onGoingStatus = function(spec, my) {
    var that = jobStatus(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    // Methods //
    that.getLabel = function() {
        return 'on going';
    };

    that.canStart = function() {
        return false;
    };
    that.canRestart = function() {
        return false;
    };
    return that;
};
var waitStatus = function(spec, my) {
    var that = jobStatus(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    priv.job_id_array = spec.job_id_array || [];
    priv.threshold = 0;

    // Methods //
    /**
     * Returns the label of this status.
     * @method getLabel
     * @return {string} The label: 'wait'.
     */
    that.getLabel = function() {
        return 'wait';
    };

    /**
     * Refresh the job id array to wait.
     * @method refreshJobIdArray
     */
    priv.refreshJobIdArray = function() {
        var tmp_job_id_array = [], i;
        for (i = 0; i < priv.job_id_array.length; i+= 1) {
            if (my.jobManager.jobIdExists(priv.job_id_array[i])) {
                tmp_job_id_array.push(priv.job_id_array[i]);
            }
        }
        priv.job_id_array = tmp_job_id_array;
    };

    /**
     * The status must wait for the job end before start again.
     * @method waitForJob
     * @param  {object} job The job to wait for.
     */
    that.waitForJob = function(job) {
        var i;
        for (i = 0; i < priv.job_id_array.length; i+= 1) {
            if (priv.job_id_array[i] === job.getId()) {
                return;
            }
        }
        priv.job_id_array.push(job.getId());
    };

    /**
     * The status stops to wait for this job.
     * @method dontWaitForJob
     * @param  {object} job The job to stop waiting for.
     */
    that.dontWaitForJob = function(job) {
        var i, tmp_job_id_array = [];
        for (i = 0; i < priv.job_id_array.length; i+= 1) {
            if (priv.job_id_array[i] !== job.getId()){
                tmp_job_id_array.push(priv.job_id_array[i]);
            }
        }
        priv.job_id_array = tmp_job_id_array;
    };

    /**
     * The status must wait for some milliseconds.
     * @method waitForTime
     * @param  {number} ms The number of milliseconds
     */
    that.waitForTime = function(ms) {
        priv.threshold = Date.now() + ms;
    };

    /**
     * The status stops to wait for some time.
     * @method stopWaitForTime
     */
    that.stopWaitForTime = function() {
        priv.threshold = 0;
    };

    that.canStart = function() {
        priv.refreshJobIdArray();
        return (priv.job_id_array.length === 0 && Date.now() >= priv.threshold);
    };
    that.canRestart = function() {
        return that.canStart();
    };

    that.serialized = function() {
        return {label:that.getLabel(),
                waitfortime:priv.threshold,
                waitforjob:priv.job_id_array};
    };

    /**
     * Checks if this status is waitStatus
     * @method isWaitStatus
     * @return {boolean} true
     */
    that.isWaitStatus = function () {
        return true;
    };

    return that;
};

var job = function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    priv.id        = my.jobIdHandler.nextId();
    priv.command   = spec.command;
    priv.storage   = spec.storage;
    priv.status    = initialStatus();
    priv.date      = new Date();

    // Initialize //
    if (!priv.storage){
        throw invalidJobException({job:that,message:'No storage set'});
    }
    if (!priv.command){
        throw invalidJobException({job:that,message:'No command set'});
    }
    // Methods //
    /**
     * Returns the job command.
     * @method getCommand
     * @return {object} The job command.
     */
    that.getCommand = function() {
        return priv.command;
    };

    that.getStatus = function() {
        return priv.status;
    };

    that.getId = function() {
        return priv.id;
    };

    that.getStorage = function() {
        return priv.storage;
    };

    that.getDate = function() {
        return priv.date;
    };

    /**
     * Checks if the job is ready.
     * @method isReady
     * @return {boolean} true if ready, else false.
     */
    that.isReady = function() {
        if (priv.command.getTried() === 0) {
            return priv.status.canStart();
        } else {
            return priv.status.canRestart();
        }
    };

    /**
     * Returns a serialized version of this job.
     * @method serialized
     * @return {object} The serialized job.
     */
    that.serialized = function() {
        return {id:priv.id,
                date:priv.date.getTime(),
                status:priv.status.serialized(),
                command:priv.command.serialized(),
                storage:priv.storage.serialized()};
    };

    /**
     * Tells the job to wait for another one.
     * @method waitForJob
     * @param  {object} job The job to wait for.
     */
    that.waitForJob = function(job) {
        if (priv.status.getLabel() !== 'wait') {
            priv.status = waitStatus({},my);
        }
        priv.status.waitForJob(job);
    };

    /**
     * Tells the job to do not wait for a job.
     * @method dontWaitForJob
     * @param  {object} job The other job.
     */
    that.dontWaitFor = function(job) {
        if (priv.status.getLabel() === 'wait') {
            priv.status.dontWaitForJob(job);
        }
    };

    /**
     * Tells the job to wait for a while.
     * @method waitForTime
     * @param  {number} ms Time to wait in millisecond.
     */
    that.waitForTime = function(ms) {
        if (priv.status.getLabel() !== 'wait') {
            priv.status = waitStatus({},my);
        }
        priv.status.waitForTime(ms);
    };

    /**
     * Tells the job to do not wait for a while anymore.
     * @method stopWaitForTime
     */
    that.stopWaitForTime = function() {
        if (priv.status.getLabel() === 'wait') {
            priv.status.stopWaitForTime();
        }
    };

    that.eliminated = function () {
        priv.command.error ({
            status:10,statusText:'Stopped',error:'stopped',
            message:'This job has been stoped by another one.',
            reason:this.message});
    };

    that.notAccepted = function () {
        priv.command.onEndDo (function () {
            priv.status = failStatus();
            my.jobManager.terminateJob (that);
        });
        priv.command.error ({
            status:11,statusText:'Not Accepted',error:'not_accepted',
            message:'This job is already running.',reason:this.message});
    };

    /**
     * Updates the date of the job with the another one.
     * @method update
     * @param  {object} job The other job.
     */
    that.update = function(job) {
        priv.command.error ({
            status:12,statusText:'Replaced',error:'replaced',
            message:'Job has been replaced by another one.',
            reason:'job has been replaced by another one'});
        priv.date = new Date(job.getDate().getTime());
        priv.command = job.getCommand();
        priv.status = job.getStatus();
    };

    /**
     * Executes this job.
     * @method execute
     */
    that.execute = function() {
        if (!that.getCommand().canBeRetried()) {
            throw tooMuchTriesJobException(
                {job:that,message:'The job was invoked too much time.'});
        }
        if (!that.isReady()) {
            throw jobNotReadyException(
                {job:that,message:'Can not execute this job.'});
        }
        priv.status = onGoingStatus();
        priv.command.onRetryDo (function() {
            var ms = priv.command.getTried();
            ms = ms*ms*200;
            if (ms>10000){
                ms = 10000;
            }
            that.waitForTime(ms);
        });
        priv.command.onEndDo (function(status) {
            priv.status = status;
            my.jobManager.terminateJob (that);
        });
        priv.command.execute (priv.storage);
    };

    return that;
};

var announcement = function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var callback_a = [];
    var name = spec.name || '';
    var announcer = spec.announcer || {};
    // Methods //
    that.add = function(callback) {
        callback_a.push(callback);
    };

    that.remove = function(callback) {
        var i, tmp_callback_a = [];
        for (i = 0; i < callback_a.length; i+= 1) {
            if (callback_a[i] !== callback) {
                tmp_callback_a.push(callback_a[i]);
            }
        }
        callback_a = tmp_callback_a;
    };

    that.register = function() {
        announcer.register(that);
    };

    that.unregister = function() {
        announcer.unregister(that);
    };

    that.trigger = function(args) {
        var i;
        for(i = 0; i < callback_a.length; i++) {
            callback_a[i].apply(null, args);
        }
    };

    return that;
};

var jio = function(spec, my) {


var activityUpdater = (function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    priv.id = spec.id || 0;
    priv.interval = 400;
    priv.interval_id = null;

    // Methods //
    /**
     * Update the last activity date in the localStorage.
     * @method touch
     */
    priv.touch = function() {
        LocalOrCookieStorage.setItem ('jio/id/'+priv.id, Date.now());
    };

    /**
     * Sets the jio id into the activity.
     * @method setId
     * @param  {number} id The jio id.
     */
    that.setId = function(id) {
        priv.id = id;
    };

    /**
     * Sets the interval delay between two updates.
     * @method setIntervalDelay
     * @param  {number} ms In milliseconds
     */
    that.setIntervalDelay = function(ms) {
        priv.interval = ms;
    };

    /**
     * Gets the interval delay.
     * @method getIntervalDelay
     * @return {number} The interval delay.
     */
    that.getIntervalDelay = function() {
        return priv.interval;
    };

    /**
     * Starts the activity updater. It will update regulary the last activity
     * date in the localStorage to show to other jio instance that this instance
     * is active.
     * @method start
     */
    that.start = function() {
        if (!priv.interval_id) {
            priv.touch();
            priv.interval_id = setInterval(function() {
                priv.touch();
            }, priv.interval);
        }
    };

    /**
     * Stops the activity updater.
     * @method stop
     */
    that.stop = function() {
        if (priv.interval_id !== null) {
            clearInterval(priv.interval_id);
            priv.interval_id = null;
        }
    };

    return that;
}());


var announcer = (function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var announcement_o = {};
    // Methods //
    that.register = function(name) {
        if(!announcement_o[name]) {
            announcement_o[name] = announcement();
        }
    };

    that.unregister = function(name) {
        if (announcement_o[name]) {
            delete announcement_o[name];
        }
    };

    that.at = function(name) {
        return announcement_o[name];
    };

    that.on = function(name, callback) {
        that.register(name);
        that.at(name).add(callback);
    };

    that.trigger = function(name, args) {
        that.at(name).trigger(args);
    };

    return that;
}());

var jobIdHandler = (function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var id = 0;
    // Methods //
    that.nextId = function() {
        id = id + 1;
        return id;
    };

    return that;
}());

var jobManager = (function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var job_array_name = 'jio/job_array';
    var priv = {};
    priv.id = spec.id;
    priv.interval_id = null;
    priv.interval = 200;
    priv.job_array = [];

    my.jobManager = that;
    my.jobIdHandler = jobIdHandler;

    // Methods //
    /**
     * Get the job array name in the localStorage
     * @method getJobArrayName
     * @return {string} The job array name
     */
    priv.getJobArrayName = function() {
        return job_array_name + '/' + priv.id;
    };

    /**
     * Returns the job array from the localStorage
     * @method getJobArray
     * @return {array} The job array.
     */
    priv.getJobArray = function() {
        return LocalOrCookieStorage.getItem(priv.getJobArrayName())||[];
    };

    /**
     * Does a backup of the job array in the localStorage.
     * @method copyJobArrayToLocal
     */
    priv.copyJobArrayToLocal = function() {
        var new_a = [], i;
        for (i = 0; i < priv.job_array.length; i+= 1) {
            new_a.push(priv.job_array[i].serialized());
        }
        LocalOrCookieStorage.setItem(priv.getJobArrayName(),new_a);
    };

    /**
     * Removes a job from the current job array.
     * @method removeJob
     * @param  {object} job The job object.
     */
    priv.removeJob = function(job) {
        var i, tmp_job_array = [];
        for (i = 0; i < priv.job_array.length; i+= 1) {
            if (priv.job_array[i] !== job) {
                tmp_job_array.push(priv.job_array[i]);
            }
        }
        priv.job_array = tmp_job_array;
        priv.copyJobArrayToLocal();
    };

    /**
     * Sets the job manager id.
     * @method setId
     * @param  {number} id The id.
     */
    that.setId = function(id) {
        priv.id = id;
    };

    /**
     * Starts listening to the job array, executing them regulary.
     * @method start
     */
    that.start = function() {
        var i;
        if (priv.interval_id === null) {
            priv.interval_id = setInterval (function() {
                priv.restoreOldJio();
                for (i = 0; i < priv.job_array.length; i+= 1) {
                    that.execute(priv.job_array[i]);
                }
            },priv.interval);
        }
    };

    /**
     * Stops listening to the job array.
     * @method stop
     */
    that.stop = function() {
        if (priv.interval_id !== null) {
            clearInterval(priv.interval_id);
            priv.interval_id = null;
            if (priv.job_array.length === 0) {
                LocalOrCookieStorage.deleteItem(priv.getJobArrayName());
            }
        }
    };

    /**
     * Try to restore an the inactive older jio instances.
     * It will restore the on going or initial jobs from their job array
     * and it will add them to this job array.
     * @method restoreOldJio
     */
    priv.restoreOldJio = function() {
        var i, jio_id_a;
        priv.lastrestore = priv.lastrestore || 0;
        if (priv.lastrestore > (Date.now()) - 2000) { return; }
        jio_id_a = LocalOrCookieStorage.getItem('jio/id_array')||[];
        for (i = 0; i < jio_id_a.length; i+= 1) {
            priv.restoreOldJioId(jio_id_a[i]);
        }
        priv.lastrestore = Date.now();
    };

    /**
     * Try to restore an old jio according to an id.
     * @method restoreOldJioId
     * @param  {number} id The jio id.
     */
    priv.restoreOldJioId = function(id) {
        var jio_date;
        jio_date = LocalOrCookieStorage.getItem('jio/id/'+id)||0;
        if (new Date(jio_date).getTime() < (Date.now() - 10000)) { // 10 sec
            priv.restoreOldJobFromJioId(id);
            priv.removeOldJioId(id);
            priv.removeJobArrayFromJioId(id);
        }
    };

    /**
     * Try to restore all jobs from another jio according to an id.
     * @method restoreOldJobFromJioId
     * @param  {number} id The jio id.
     */
    priv.restoreOldJobFromJioId = function(id) {
        var i, jio_job_array;
        jio_job_array = LocalOrCookieStorage.getItem('jio/job_array/'+id)||[];
        for (i = 0; i < jio_job_array.length; i+= 1) {
            var command_object = command(jio_job_array[i].command, my);
            if (command_object.canBeRestored()) {
                that.addJob ( job(
                    {storage:jioNamespace.storage(jio_job_array[i].storage,my),
                     command:command_object}, my));
            }
        }
    };

    /**
     * Removes a jio instance according to an id.
     * @method removeOldJioId
     * @param  {number} id The jio id.
     */
    priv.removeOldJioId = function(id) {
        var i, jio_id_array, new_array = [];
        jio_id_array = LocalOrCookieStorage.getItem('jio/id_array')||[];
        for (i = 0; i < jio_id_array.length; i+= 1) {
            if (jio_id_array[i] !== id) {
                new_array.push(jio_id_array[i]);
            }
        }
        LocalOrCookieStorage.setItem('jio/id_array',new_array);
        LocalOrCookieStorage.deleteItem('jio/id/'+id);
    };

    /**
     * Removes a job array from a jio instance according to an id.
     * @method removeJobArrayFromJioId
     * @param  {number} id The jio id.
     */
    priv.removeJobArrayFromJioId = function(id) {
        LocalOrCookieStorage.deleteItem('jio/job_array/'+id);
    };

    /**
     * Executes a job.
     * @method execute
     * @param  {object} job The job object.
     */
    that.execute = function(job) {
        try {
            job.execute();
        } catch (e) {
            switch (e.name) {
            case 'jobNotReadyException': break; // do nothing
            case 'tooMuchTriesJobException': break; // do nothing
            default: throw e;
            }
        }
        priv.copyJobArrayToLocal();
    };

    /**
     * Checks if a job exists in the job array according to a job id.
     * @method jobIdExists
     * @param  {number} id The job id.
     * @return {boolean} true if exists, else false.
     */
    that.jobIdExists = function(id) {
        var i;
        for (i = 0; i < priv.job_array.length; i+= 1) {
            if (priv.job_array[i].getId() === id) {
                return true;
            }
        }
        return false;
    };

    /**
     * Terminate a job. It only remove it from the job array.
     * @method terminateJob
     * @param  {object} job The job object
     */
    that.terminateJob = function(job) {
        priv.removeJob(job);
    };

    /**
     * Adds a job to the current job array.
     * @method addJob
     * @param  {object} job The new job.
     */
    that.addJob = function(job) {
        var result_array = that.validateJobAccordingToJobList (priv.job_array,job);
        priv.appendJob (job,result_array);
    };

    /**
     * Generate a result array containing action string to do with the good job.
     * @method validateJobAccordingToJobList
     * @param  {array} job_array A job array.
     * @param  {object} job The new job to compare with.
     * @return {array} A result array.
     */
    that.validateJobAccordingToJobList = function(job_array,job) {
        var i, result_array = [];
        for (i = 0; i < job_array.length; i+= 1) {
            result_array.push(jobRules.validateJobAccordingToJob (job_array[i],job));
        }
        return result_array;
    };

    /**
     * It will manage the job in order to know what to do thanks to a result
     * array. The new job can be added to the job array, but it can also be
     * not accepted. It is this method which can tells jobs to wait for another
     * one, to replace one or to eliminate some while browsing.
     * @method appendJob
     * @param  {object} job The job to append.
     * @param  {array} result_array The result array.
     */
    priv.appendJob = function(job,result_array) {
        var i;
        if (priv.job_array.length !== result_array.length) {
            throw new RangeError("Array out of bound");
        }
        for (i = 0; i < result_array.length; i+= 1) {
            if (result_array[i].action === 'dont accept') {
                return job.notAccepted();
            }
        }
        for (i = 0; i < result_array.length; i+= 1) {
            switch (result_array[i].action) {
            case 'eliminate':
                result_array[i].job.eliminated();
                priv.removeJob(result_array[i].job);
                break;
            case 'update':
                result_array[i].job.update(job);
                priv.copyJobArrayToLocal();
                return;
            case 'wait':
                job.waitForJob(result_array[i].job);
                break;
            default: break;
            }
        }
        priv.job_array.push(job);
        priv.copyJobArrayToLocal();
    };

    that.serialized = function () {
        var a = [], i, job_array = priv.job_array || [];
        for (i = 0; i < job_array.length; i+= 1) {
            a.push(job_array[i].serialized());
        }
        return a;
    };

    return that;
}());

var jobRules = (function(spec, my) {
    var that = {};
    // Attributes //
    var priv = {};
    priv.compare = {};
    priv.action = {};

    that.eliminate = function() { return 'eliminate'; };
    that.update = function() { return 'update'; };
    that.dontAccept = function() { return 'dont accept'; };
    that.wait = function() { return 'wait'; };
    that.none = function() { return 'none'; };
    that.default_action = that.none;
    that.default_compare = function(job1,job2) {
        return (job1.getCommand().getDocId() ===
                job2.getCommand().getDocId() &&
                job1.getCommand().getDocInfo('_rev') ===
                job2.getCommand().getDocInfo('_rev') &&
                job1.getCommand().getOption('rev') ===
                job2.getCommand().getOption('rev') &&
                JSON.stringify(job1.getStorage().serialized()) ===
                JSON.stringify(job2.getStorage().serialized()));
    };

    // Methods //
    /**
     * Returns an action according the jobs given in parameters.
     * @method getAction
     * @param  {object} job1 The already existant job.
     * @param  {object} job2 The job to compare with.
     * @return {string} An action string.
     */
    priv.getAction = function(job1,job2) {
        var j1label, j2label, j1status;
        j1label = job1.getCommand().getLabel();
        j2label = job2.getCommand().getLabel();
        j1status = (job1.getStatus().getLabel()==='on going'?
                    'on going':'not on going');
        if (priv.action[j1label] &&
            priv.action[j1label][j1status] &&
            priv.action[j1label][j1status][j2label]) {
            return priv.action[j1label][j1status][j2label](job1,job2);
        } else {
            return that.default_action(job1,job2);
        }
    };

    /**
     * Checks if the two jobs are comparable.
     * @method canCompare
     * @param  {object} job1 The already existant job.
     * @param  {object} job2 The job to compare with.
     * @return {boolean} true if comparable, else false.
     */
    priv.canCompare = function(job1,job2) {
        var job1label = job1.getCommand().getLabel(),
        job2label = job2.getCommand().getLabel();
        if (priv.compare[job1label] &&
            priv.compare[job2label]) {
            return priv.compare[job1label][job2label](job1,job2);
        } else {
            return that.default_compare(job1,job2);
        }
    };

    /**
     * Returns an action string to show what to do if we want to add a job.
     * @method validateJobAccordingToJob
     * @param job1 {object} The current job.
     * @param job2 {object} The new job.
     * @return {string} The action string.
     */
    that.validateJobAccordingToJob = function(job1,job2) {
        if (priv.canCompare(job1,job2)) {
            return {action:priv.getAction(job1,job2),job:job1};
        }
        return {action:that.default_action(job1,job2),job:job1};
    };

    /**
     * Adds a rule the action rules.
     * @method addActionRule
     * @param method1 {string} The action label from the current job.
     * @param ongoing {boolean} Is this action is on going or not?
     * @param method2 {string} The action label from the new job.
     * @param rule {function} The rule that return an action string.
     */
    that.addActionRule = function(method1,ongoing,method2,rule) {
        var ongoing_s = (ongoing?'on going':'not on going');
        priv.action[method1] = priv.action[method1] || {};
        priv.action[method1][ongoing_s] = priv.action[method1][ongoing_s] || {};
        priv.action[method1][ongoing_s][method2] = rule;
    };

    /**
     * Adds a rule the compare rules.
     * @method addCompareRule
     * @param method1 {string} The action label from the current job.
     * @param method2 {string} The action label from the new job.
     * @param rule {function} The rule that return a boolean
     * - true if job1 and job2 can be compared, else false.
     */
    that.addCompareRule = function(method1,method2,rule) {
        priv.compare[method1] = priv.compare[method1] || {};
        priv.compare[method1][method2] = rule;
    };

    ////////////////////////////////////////////////////////////////////////////
    // Adding some rules
    /*
      LEGEND:
      - s: storage
      - m: method
      - n: name
      - c: content
      - o: options
      - =: are equal
      - !: are not equal

      select ALL        s= n=
      removefailordone  fail|done
      /                           elim repl nacc wait
      Remove     !ongoing  Save    1    x    x    x
      Save       !ongoing  Remove  1    x    x    x
      GetList    !ongoing  GetList 0    1    x    x
      Remove     !ongoing  Remove  0    1    x    x
      Load       !ongoing  Load    0    1    x    x
      Save c=    !ongoing  Save    0    1    x    x
      Save c!    !ongoing  Save    0    1    x    x
      GetList     ongoing  GetList 0    0    1    x
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
      GetList     ongoing  Remove  0    0    0    0
      GetList     ongoing  Load    0    0    0    0
      GetList     ongoing  Save    0    0    0    0
      GetList    !ongoing  Remove  0    0    0    0
      GetList    !ongoing  Load    0    0    0    0
      GetList    !ongoing  Save    0    0    0    0
      Remove      ongoing  GetList 0    0    0    0
      Remove     !ongoing  GetList 0    0    0    0
      Load        ongoing  GetList 0    0    0    0
      Load       !ongoing  GetList 0    0    0    0
      Save        ongoing  GetList 0    0    0    0
      Save       !ongoing  GetList 0    0    0    0

      For more information, see documentation
    */
    that.addActionRule ('put'  ,true,'put',
                        function(job1,job2){
                            if (job1.getCommand().getDocInfo('content') ===
                                job2.getCommand().getDocInfo('content')) {
                                return that.dontAccept();
                            } else {
                                return that.wait();
                            }
                        });
    that.addActionRule('put'   ,true ,'get'   ,that.wait);
    that.addActionRule('put'   ,true ,'remove' ,that.wait);
    that.addActionRule('put'   ,false,'put'   ,that.update);
    that.addActionRule('put'   ,false,'get'   ,that.wait);
    that.addActionRule('put'   ,false,'remove' ,that.eliminate);

    that.addActionRule('get'   ,true ,'put'   ,that.wait);
    that.addActionRule('get'   ,true ,'get'   ,that.dontAccept);
    that.addActionRule('get'   ,true ,'remove' ,that.wait);
    that.addActionRule('get'   ,false,'put'   ,that.wait);
    that.addActionRule('get'   ,false,'get'   ,that.update);
    that.addActionRule('get'   ,false,'remove' ,that.wait);

    that.addActionRule('remove' ,true ,'get'   ,that.dontAccept);
    that.addActionRule('remove' ,true ,'remove' ,that.dontAccept);
    that.addActionRule('remove' ,false,'put'   ,that.eliminate);
    that.addActionRule('remove' ,false,'get'   ,that.dontAccept);
    that.addActionRule('remove' ,false,'remove' ,that.update);

    that.addActionRule('allDocs',true ,'allDocs',that.dontAccept);
    that.addActionRule('allDocs',false,'allDocs',that.update);
    // end adding rules
    ////////////////////////////////////////////////////////////////////////////
    return that;
}());

// Class jio
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    var jio_id_array_name = 'jio/id_array';
    priv.id = null;

    my.jobManager = jobManager;
    my.jobIdHandler = jobIdHandler;
    priv.storage_spec = spec;

    // initialize //
    priv.init = function() {
        // Initialize the jio id and add the new id to the list
        if (priv.id === null) {
            var i, jio_id_a =
                LocalOrCookieStorage.getItem (jio_id_array_name) || [];
            priv.id = 1;
            for (i = 0; i < jio_id_a.length; i+= 1) {
                if (jio_id_a[i] >= priv.id) {
                    priv.id = jio_id_a[i] + 1;
                }
            }
            jio_id_a.push(priv.id);
            LocalOrCookieStorage.setItem (jio_id_array_name,jio_id_a);
            activityUpdater.setId(priv.id);
            jobManager.setId(priv.id);
        }
    };

    // Methods //
    that.start = function() {
        priv.init();
        activityUpdater.start();
        jobManager.start();
    };
    that.stop = function() {
        jobManager.stop();
    };
    that.close = function() {
        activityUpdater.stop();
        jobManager.stop();
        priv.id = null;
    };
    that.start();

    /**
     * Returns the jio id.
     * @method getId
     * @return {number} The jio id.
     */
    that.getId = function() {
        return priv.id;
    };

    /**
     * Returns the jio job rules object used by the job manager.
     * @method getJobRules
     * @return {object} The job rules object
     */
    that.getJobRules = function() {
        return jobRules;
    };

    /**
     * Checks if the storage description is valid or not.
     * @method validateStorageDescription
     * @param  {object} description The description object.
     * @return {boolean} true if ok, else false.
     */
    that.validateStorageDescription = function(description) {
        return jioNamespace.storage(description, my).isValid();
    };

    that.getJobArray = function () {
        return jobManager.serialized();
    };

    priv.getParam = function (list,nodoc) {
        var param = {}, i = 0;
        if (!nodoc) {
            param.doc = list[i];
            i ++;
        }
        if (typeof list[i] === 'object') {
            param.options = list[i];
            i ++;
        } else {
            param.options = {};
        }
        param.callback = function (err,val){};
        param.success = function (val) {
            param.callback(undefined,val);
        };
        param.error = function (err) {
            param.callback(err,undefined);
        };
        if (typeof list[i] === 'function') {
            if (typeof list[i+1] === 'function') {
                param.success = list[i];
                param.error = list[i+1];
            } else {
                param.callback = list[i];
            }
        }
        return param;
    };

    priv.addJob = function (commandCreator,spec) {
        jobManager.addJob(
            job({storage:jioNamespace.storage(priv.storage_spec,my),
                 command:commandCreator(spec,my)},my));
    };

    // /**
    //  * Post a document.
    //  * @method post
    //  * @param  {object} doc The document {"content":}.
    //  * @param  {object} options (optional) Contains some options:
    //  * - {number} max_retry The number max of retries, 0 = infinity.
    //  * - {boolean} revs Include revision history of the document.
    //  * - {boolean} revs_info Retreive the revisions.
    //  * - {boolean} conflicts Retreive the conflict list.
    //  * @param  {function} callback (optional) The callback(err,response).
    //  * @param  {function} error (optional) The callback on error, if this
    //  *     callback is given in parameter, "callback" is changed as "success",
    //  *     called on success.
    //  */
    // that.post = function() {
    //     var param = priv.getParam(arguments);
    //     param.options.max_retry = param.options.max_retry || 0;
    //     priv.addJob(postCommand,{
    //         doc:param.doc,
    //         options:param.options,
    //         callbacks:{success:param.success,error:param.error}
    //     });
    // };

    /**
     * Put a document.
     * @method put
     * @param  {object} doc The document {"_id":,"_rev":,"content":}.
     * @param  {object} options (optional) Contains some options:
     * - {number} max_retry The number max of retries, 0 = infinity.
     * - {boolean} revs Include revision history of the document.
     * - {boolean} revs_info Retreive the revisions.
     * - {boolean} conflicts Retreive the conflict list.
     * @param  {function} callback (optional) The callback(err,response).
     * @param  {function} error (optional) The callback on error, if this
     *     callback is given in parameter, "callback" is changed as "success",
     *     called on success.
     */
    that.put = function() {
        var param = priv.getParam(arguments);
        param.options.max_retry = param.options.max_retry || 0;
        priv.addJob(putCommand,{
            doc:param.doc,
            options:param.options,
            callbacks:{success:param.success,error:param.error}
        });
    };

    /**
     * Get a document.
     * @method get
     * @param  {string} docid The document id (the path).
     * @param  {object} options (optional) Contains some options:
     * - {number} max_retry The number max of retries, 0 = infinity.
     * - {boolean} metadata_only Load only document metadata.
     * - {string} rev The revision we want to get.
     * - {boolean} revs Include revision history of the document.
     * - {boolean} revs_info Include list of revisions, and their availability.
     * - {boolean} conflicts Include a list of conflicts.
     * @param  {function} callback (optional) The callback(err,response).
     * @param  {function} error (optional) The callback on error, if this
     *     callback is given in parameter, "callback" is changed as "success",
     *     called on success.
     */
    that.get = function() {
        var param = priv.getParam(arguments);
        param.options.max_retry = param.options.max_retry || 3;
        param.options.metadata_only = (
            param.options.metadata_only !== undefined?
                param.options.metadata_only:false);
        priv.addJob(getCommand,{
            docid:param.doc,
            options:param.options,
            callbacks:{success:param.success,error:param.error}
        });
    };

    /**
     * Remove a document.
     * @method remove
     * @param  {object} doc The document {"_id":,"_rev":}.
     * @param  {object} options (optional) Contains some options:
     * - {number} max_retry The number max of retries, 0 = infinity.
     * - {boolean} revs Include revision history of the document.
     * - {boolean} revs_info Include list of revisions, and their availability.
     * - {boolean} conflicts Include a list of conflicts.
     * @param  {function} callback (optional) The callback(err,response).
     * @param  {function} error (optional) The callback on error, if this
     *     callback is given in parameter, "callback" is changed as "success",
     *     called on success.
     */
    that.remove = function() {
        var param = priv.getParam(arguments);
        param.options.max_retry = param.options.max_retry || 0;
        priv.addJob(removeCommand,{
            doc:param.doc,
            options:param.options,
            callbacks:{success:param.success,error:param.error}
        });
    };

    /**
     * Get a list of documents.
     * @method allDocs
     * @param  {object} options (optional) Contains some options:
     * - {number} max_retry The number max of retries, 0 = infinity.
     * - {boolean} metadata_only Load only document metadata
     * - {boolean} descending Reverse the order of the output table.
     * - {boolean} revs Include revision history of the document.
     * - {boolean} revs_info Include revisions.
     * - {boolean} conflicts Include conflicts.
     * @param  {function} callback (optional) The callback(err,response).
     * @param  {function} error (optional) The callback on error, if this
     *     callback is given in parameter, "callback" is changed as "success",
     *     called on success.
     */
    that.allDocs = function() {
        var param = priv.getParam(arguments,'no doc');
        param.options.max_retry = param.options.max_retry || 3;
        param.options.metadata_only = (
            param.options.metadata_only !== undefined?
                param.options.metadata_only:true);
        priv.addJob(allDocsCommand,{
            options:param.options,
            callbacks:{success:param.success,error:param.error}
        });
    };

    return that;
};                              // End Class jio

var jioNamespace = (function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var storage_type_o = {      // -> 'key':constructorFunction
        'base': storage,
        'handler': storageHandler
    };

    // Methods //

    /**
     * Returns a storage from a storage description.
     * @method storage
     * @param  {object} spec The specifications.
     * @param  {object} my The protected object.
     * @param  {string} forcetype Force storage type
     * @return {object} The storage object.
     */
    that.storage = function(spec, my, forcetype) {
        spec = spec || {};
        my = my || {};
        var type = forcetype || spec.type || 'base';
        if (!storage_type_o[type]) {
            throw invalidStorageType({type:type,
                                      message:'Storage does not exists.'});
        }
        return storage_type_o[type](spec, my);
    };

    /**
     * Creates a new jio instance.
     * @method newJio
     * @param  {object} spec The parameters:
     * - {object} spec.storage: A storage description
     *     - {string} spec.storage.type: The storage type
     *     - {string} spec.storage.username: The user name
     *     - {string} spec.storage.applicationname: The application name
     * @return {object} The new Jio instance.
     */
    that.newJio = function(spec) {
        var storage = spec;
        if (typeof storage === 'string') {
            storage = JSON.parse (storage);
        }
        storage = storage || {type:'base'};
        return jio(spec);
    };

    /**
     * Add a storage type to jio.
     * @method addStorageType
     * @param  {string} type The storage type
     * @param  {function} constructor The associated constructor
     */
    that.addStorageType = function(type, constructor) {
        constructor = constructor || function(){return null;};
        if (storage_type_o[type]) {
            throw invalidStorageType({type:type,message:'Already known.'});
        }
        storage_type_o[type] = constructor;
    };

    return that;
}());


return jioNamespace;
}());
