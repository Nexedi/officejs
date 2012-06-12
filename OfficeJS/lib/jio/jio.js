/*! JIO - v0.1.0 - 2012-06-12
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
    // my.jio exists

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
        command.executeOn(that);
    };

    /**
     * Override this function to validate specifications.
     * @method isValid
     * @return {boolean} true if ok, else false.
     */
    that.isValid = function() {
        return true;
    };

    that.validate = function(command) {
        command.validate(that);
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
        throw invalidStorage({storage:that,message:'Unknown storage.'});
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

    return that;
};

var storageHandler = function(spec, my) {
    var that = storage(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    priv.storage_a = spec.storagelist || [];

    // Methods //
    /**
     * It is called before the execution.
     * Override this function.
     * @method beforeExecute
     * @param  {object} command The command.
     * @param  {object} option Some options.
     */
    that.beforeExecute = function(command,option) {};

    /**
     * Execute the command according to this storage.
     * @method execute
     * @param  {object} command The command.
     * @param  {object} option Some options.
     */
    that.execute = function(command,option) {
        var i;
        that.validate(command);
        that.beforeExecute(command,option);
        for(i = 0; i < priv.storage_a.length; i++) {
            priv.storage_a[i].execute(command);
        }
        that.afterExecute(command,option);
    };

    /**
     * Is is called after the execution.
     * Override this function.
     * @method afterExecute
     * @param  {object} command The command.
     * @param  {object} option Some options.
     */
    that.afterExecute = function(command,option) {
        that.done();
    };

    /**
     * Returns a serialized version of this storage
     * @method serialized
     * @return {object} The serialized storage.
     */
    that.serialized = function() {
        return {type:priv.type,
                storagelist:priv.storagelist};
    };

    return that;
};

var jio = function(spec, my) {


var command = function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    priv.commandlist = {'saveDocument':saveDocument,
                        'loadDocument':loadDocument,
                        'removeDocument':removeDocument,
                        'getDocumentList':getDocumentList};
    // creates the good command thanks to his label
    if (spec.label && priv.commandlist[spec.label]) {
        priv.label = spec.label;
        delete spec.label;
        return priv.commandlist[priv.label](spec, my);
    }

    priv.path      = spec.path || '';
    priv.tried     = 0;
    priv.option    = spec.option || {};
    priv.respond   = priv.option.onResponse || function(){};
    priv.done      = priv.option.onDone || function(){};
    priv.fail      = priv.option.onFail || function(){};
    priv.retry     = function() {
        that.setMaxRetry(-1);
        that.fail({status:0,statusText:'Fail Retry',
                   message:'Impossible to retry.'});
    };
    priv.end       = function() {};

    // Methods //
    /**
     * Returns the label of the command.
     * @method getLabel
     * @return {string} The label.
     */
    that.getLabel = function() {
        return 'command';
    };

    /**
     * Returns the path of the command.
     * @method getPath
     * @return {string} The path of the command.
     */
    that.getPath = function() {
        return priv.path;
    };

    /**
     * Returns the value of an option.
     * @method getOption
     * @param  {string} optionname The option name.
     * @return The option value.
     */
    that.getOption = function(optionname) {
        return priv.option[optionname];
    };

    /**
     * Validates the storage.
     * Override this function.
     * @param  {object} handler The storage handler
     */
    that.validate = function(handler) {
        that.validateState();
    };

    that.getTried = function() {
        return priv.tried;
    };

    that.setMaxRetry = function(max_retry) {
        priv.option.max_retry = max_retry;
    };

    /**
     * Delegate actual excecution the storage handler.
     * @param {object} handler The storage handler.
     */
    that.execute = function(handler) {
        that.validate(handler);
        priv.tried ++;
        handler.execute(that);
    };

    /**
     * Execute the good method from the storage.
     * Override this function.
     * @method executeOn
     * @param  {object} storage The storage.
     */
    that.executeOn = function(storage) {};

    /*
     * Do not override.
     * Override `validate()' instead
     */
    that.validateState = function() {
        if (priv.path === '') {
            throw invalidCommandState({command:that,message:'Path is empty'});
        }
    };

    that.done = function(return_value) {
        console.log ('done');
        priv.done(return_value);
        priv.respond({status:doneStatus(),value:return_value});
        priv.end();
    };

    that.fail = function(return_error) {
        if (priv.option.max_retry === 0 || priv.tried < priv.option.max_retry) {
            priv.retry();
        } else {
            console.log ('fail');
            priv.fail(return_error);
            priv.respond({status:failStatus(),error:return_error});
            priv.end();
        }
    };

    that.onEndDo = function(fun) {
        priv.end = fun;
    };

    that.onRetryDo = function(fun) {
        priv.retry = fun;
    };

    /**
     * Returns a serialized version of this command.
     * Override this function.
     * @method serialized
     * @return {object} The serialized command.
     */
    that.serialized = function() {
        return {label:that.getLabel(),
                tried:priv.tried,
                max_retry:priv.max_retry,
                path:priv.path,
                option:priv.option};
    };

    return that;
};

var getDocumentList = function(spec, my) {
    var that = command(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    // Methods //
    that.getLabel = function() {
        return 'getDocumentList';
    };

    that.executeOn = function(storage) {
        storage.getDocumentList(that);
    };

    return that;
};

var loadDocument = function(spec, my) {
    var that = command(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    // Methods //
    that.getLabel = function() {
        return 'loadDocument';
    };

    that.executeOn = function(storage) {
        storage.loadDocument(that);
    };

    return that;
};

var removeDocument = function(spec, my) {
    var that = command(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    // Methods //
    that.getLabel = function() {
        return 'removeDocument';
    };

    that.executeOn = function(storage) {
        storage.removeDocument(that);
    };

    return that;
};

var saveDocument = function(spec, my) {
    var that = command(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    var content = spec.content;
    // Methods //
    that.getLabel = function() {
        return 'saveDocument';
    };

    that.getContent = function() {
        return content;
    };

    /**
     * Validates the storage handler.
     * @param  {object} handler The storage handler
     */
    var super_validate = that.validate;
    that.validate = function(handler) {
        if (typeof content !== 'string') {
            throw invalidCommandState({command:that,message:'No data to save'});
        }
        super_validate(handler);
    };

    that.executeOn = function(storage) {
        storage.saveDocument(that);
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
    priv.job_id_a = spec.job_id_array || [];
    priv.threshold = 0;
    // Methods //
    that.getLabel = function() {
        return 'wait';
    };

    priv.refreshJobIdArray = function() {
        var tmp_job_id_a = [], i;
        for (i = 0; i < priv.job_id_a.length; i+= 1) {
            if (jobManager.jobIdExists(priv.job_id_a[i])) {
                tmp_job_id_a.push(priv.job_id_a[i]);
            }
        }
        priv.job_id_a = tmp_job_id_a;
    };

    that.waitForJob = function(job) {
        var i;
        for (i = 0; i < priv.job_id_a.length; i+= 1) {
            if (priv.job_id_a[i] === job.getId()) {
                return;
            }
        }
        priv.job_id_a.push(job.getId());
    };
    that.dontWaitForJob = function(job) {
        var i, tmp_job_id_a = [];
        for (i = 0; i < priv.job_id_a.length; i+= 1) {
            if (priv.job_id_a[i] !== job.getId()){
                tmp_job_id_a.push(priv.job_id_a[i]);
            }
        }
        priv.job_id_a = tmp_job_id_a;
    };

    that.waitForTime = function(ms) {
        priv.threshold = Date.now() + ms;
    };
    that.stopWaitForTime = function() {
        priv.threshold = 0;
    };

    that.canStart = function() {
        priv.refreshJobIdArray();
        console.log (priv.job_id_a);
        return (priv.job_id_a.length === 0 && Date.now() >= priv.threshold);
    };
    that.canRestart = function() {
        return that.canStart();
    };

    that.serialized = function() {
        return {label:that.getLabel(),
                waitfortime:priv.threshold,
                waitforjob:priv.job_id_a};
    };

    return that;
};

var job = function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    priv.id        = jobIdHandler.nextId();
    priv.command   = spec.command;
    priv.storage   = spec.storage;
    priv.status    = initialStatus();
    priv.date      = new Date();

    // Initialize //
    (function() {
        if (!priv.storage){
            throw invalidJobException({job:that,message:'No storage set'});
        }
        if (!priv.command){
            throw invalidJobException({job:that,message:'No command set'});
        }
    }());
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
        if (priv.tried === 0) {
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
            priv.status = waitStatus();
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
            priv.status = waitStatus();
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

    /**
     * Updates the date of the job with the another one.
     * @method update
     * @param  {object} job The other job.
     */
    that.update = function(job) {
        console.log ('updating');
        priv.command.setMaxRetry(-1);
        priv.command.fail({status:0,statusText:'Replaced',
                           message:'Job has been replaced by another one.'});
        priv.date = job.getDate();
        priv.command = job.getCommand();
        priv.status = job.getStatus();
    };

    that.execute = function() {
        if (priv.max_retry !== 0 && priv.tried >= priv.max_retry) {
            throw tooMuchTriesJobException(
                {job:that,message:'The job was invoked too much time.'});
        }
        if (!that.isReady()) {
            throw jobNotReadyException({message:'Can not execute this job.'});
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
        priv.command.onEndDo (function() {
            jobManager.terminateJob (that);
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
    priv.touch = function() {
        LocalOrCookieStorage.setItem ('jio/id/'+priv.id, Date.now());
    };
    that.setId = function(id) {
        priv.id = id;
    };
    that.setIntervalDelay = function(ms) {
        priv.interval = ms;
    };
    that.getIntervalDelay = function() {
        return priv.interval;
    };
    that.start = function() {
        if (!priv.interval_id) {
            priv.touch();
            priv.interval_id = setInterval(function() {
                priv.touch();
            }, priv.interval);
        }
    };
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
    priv.job_a = [];

    // Methods //
    priv.getJobArrayName = function() {
        return job_array_name + '/' + priv.id;
    };
    priv.getJobArray = function() {
        return LocalOrCookieStorage.getItem(priv.getJobArrayName())||[];
    };
    priv.copyJobArrayToLocal = function() {
        var new_a = [], i;
        for (i = 0; i < priv.job_a.length; i+= 1) {
            new_a.push(priv.job_a[i].serialized());
        }
        LocalOrCookieStorage.setItem(priv.getJobArrayName(),new_a);
    };

    priv.removeJob = function(job) {
        var i, tmp_job_a = [];
        for (i = 0; i < priv.job_a.length; i+= 1) {
            if (priv.job_a[i] !== job) {
                tmp_job_a.push(priv.job_a[i]);
            }
        }
        priv.job_a = tmp_job_a;
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
                for (i = 0; i < priv.job_a.length; i+= 1) {
                    that.execute(priv.job_a[i]);
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
            if (priv.job_a.length === 0) {
                LocalOrCookieStorage.deleteItem(priv.getJobArrayName());
            }
        }
    };

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

    priv.restoreOldJioId = function(id) {
        var jio_date;
        jio_date = LocalOrCookieStorage.getItem('jio/id/'+id)||0;
        if (jio_date < Date.now() - 10000) {
            priv.restoreOldJobFromJioId(id);
            priv.removeOldJioId(id);
        }
    };

    priv.restoreOldJobFromJioId = function(id) {
        var i, jio_job_array;
        jio_job_array = LocalOrCookieStorage.getItem('jio/job_array/'+id)||[];
        for (i = 0; i < jio_job_array.length; i+= 1) {
            that.addJob ( job(
                {storage:jioNamespace.storage(jio_job_array[i]),
                 command:command(jio_job_array[i].command)}));
        }
    };

    priv.removeOldJioId = function(id) {
        var i, jio_id_a, new_a = [];
        jio_id_a = LocalOrCookieStorage.getItem('jio/id_array')||[];
        for (i = 0; i < jio_id_a.length; i+= 1) {
            if (jio_id_a[i] !== id) {
                new_a.push(jio_id_a[i]);
            }
        }
        LocalOrCookieStorage.setItem('jio/id_array',new_a);
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

    that.jobIdExists = function(id) {
        var i;
        for (i = 0; i < priv.job_a.length; i+= 1) {
            if (priv.job_a[i].getId() === id) {
                console.log ('found');
                return true;
            }
        }
        console.log ('not found');
        return false;
    };

    that.terminateJob = function(job) {
        priv.removeJob(job);
        priv.copyJobArrayToLocal();
    };

    that.addJob = function(job) {
        var result_a = that.validateJobAccordingToJobList (priv.job_a,job);
        priv.manage (job,result_a);
    };

    that.validateJobAccordingToJobList = function(job_a,job) {
        var i, result_a = [];
        for (i = 0; i < job_a.length; i+= 1) {
            result_a.push(jobRules.validateJobAccordingToJob (job_a[i],job));
        }
        return result_a;
    };

    priv.manage = function(job,result_a) {
        var i;
        if (priv.job_a.length !== result_a.length) {
            throw new RangeError("Array out of bound");
        }
        for (i = 0; i < result_a.length; i+= 1) {
            if (result_a[i].action === 'dont accept') {
                return;
            }
        }
        console.log ('managing '+JSON.stringify (result_a));
        for (i = 0; i < result_a.length; i+= 1) {
            switch (result_a[i].action) {
            case 'eliminate':
                console.log ('eliminating');
                that.eliminate(result_a[i].job);
                break;
            case 'update':
                result_a[i].job.update(job);
                priv.copyJobArrayToLocal();
                return;
            case 'wait':
                console.log ('wait');
                job.waitForJob(result_a[i].job);
                break;
            default: break;
            }
        }
        priv.job_a.push(job);
        priv.copyJobArrayToLocal();
    };

    that.eliminate = function(job) {
        var i, tmp_a = [];
        for (i = 0; i < priv.job_a.length; i+= 1) {
            if (priv.job_a[i].getId() !== job.getId()) {
                tmp_a.push(priv.job_a[i]);
                console.log ('add: '+priv.job_a[i].getId()+' -> it is not '+job.getId());
            }
        }
        priv.job_a = tmp_a;
        priv.copyJobArrayToLocal();
    };

    return that;
}());

var jobRules = (function(spec, my) {
    var that = {};
    // Attributes //
    var priv = {};
    that.eliminate = function() { return 'eliminate'; };
    that.update = function() { return 'update'; };
    that.dontAccept = function() { return 'dont accept'; };
    that.wait = function() { return 'wait'; };
    that.none = function() { return 'none'; };

    priv.compare = {
    };
    priv.default_compare = function(job1,job2) {
        return (job1.getCommand().getPath() === job2.getCommand().getPath() &&
                JSON.stringify(job1.getStorage().serialized()) ===
                JSON.stringify(job2.getStorage().serialized()));
    };
    priv.action = {
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
        'saveDocument':{
            'on going':{
                'saveDocument'    :function(job1,job2){
                    if (job1.getCommand().getContent() ===
                        job2.getCommand().getContent()) {
                        return that.dontAccept();
                    } else {
                        return that.wait();
                    }
                },
                'loadDocument'    : that.wait,
                'removeDocument'  : that.wait,
                'getDocumentList' : that.none
            },
            'not on going':{
                'saveDocument'    : that.update,
                'loadDocument'    : that.wait,
                'removeDocument'  : that.eliminate,
                'getDocumentList' : that.none
            }
        },
        'loadDocument':{
            'on going':{
                'saveDocument'    : that.wait,
                'loadDocument'    : that.dontAccept,
                'removeDocument'  : that.wait,
                'getDocumentList' : that.none
            },
            'not on going':{
                'saveDocument'    : that.wait,
                'loadDocument'    : that.update,
                'removeDocument'  : that.wait,
                'getDocumentList' : that.none
            }
        },
        'removeDocument':{
            'on going':{
                'saveDocument'    : that.wait,
                'loadDocument'    : that.dontAccept,
                'removeDocument'  : that.dontAccept,
                'getDocumentList' : that.none
            },
            'not on going':{
                'saveDocument'    : that.eliminate,
                'loadDocument'    : that.dontAccept,
                'removeDocument'  : that.update,
                'getDocumentList' : that.none
            }
        },
        'getDocumentList':{
            'on going':{
                'saveDocument'    : that.none,
                'loadDocument'    : that.none,
                'removeDocument'  : that.none,
                'getDocumentList' : that.dontAccept
            },
            'not on going':{
                'saveDocument'    : that.none,
                'loadDocument'    : that.none,
                'removeDocument'  : that.none,
                'getDocumentList' : that.update
            }
        }
    };
    priv.default_action = that.none;
    // Methods //
    priv.getAction = function(job1,job2) {
        var j1label, j2label, j1status;
        j1label = job1.getCommand().getLabel();
        j2label = job2.getCommand().getLabel();
        j1status = (job1.getStatus().getLabel()==='on going'?
                    'on going':'not on going');
        try {
            console.log (j1label);
            console.log (j2label);
            console.log (j1status);
            return priv.action[j1label][j1status][j2label](job1,job2);
        } catch (e) {
            if(e.name==='TypeError') {
                return priv.default_action(job1,job2);
            } else {
                throw e;
            }
        }
    };
    priv.canCompare = function(job1,job2) {
        var job1label = job1.getCommand().getLabel(),
        job2label = job2.getCommand().getLabel();
        try {
            return priv.compare[job1label][job2label](job1,job2);
        } catch(e) {
            if (e.name==='TypeError') {
                return priv.default_compare(job1,job2);
            } else {
                throw e;
            }
        }
    };
    that.validateJobAccordingToJob = function(job1,job2) {
        if (priv.canCompare(job1,job2)) {
            return {action:priv.getAction(job1,job2),job:job1};
        }
        return {action:priv.default_action(job1,job2),job:job1};
    };

    return that;
}());

// Class jio
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    var jio_id_array_name = 'jio/id_array';
    priv.id = 1;
    priv.storage = jioNamespace.storage(spec, that);

    // initialize //
    (function () {
        // Initialize the jio id and add the new id to the list
        var i,
        jio_id_a = LocalOrCookieStorage.getItem (jio_id_array_name) || [];
        for (i = 0; i < jio_id_a.length; i+= 1) {
            if (jio_id_a[i] >= priv.id) {
                priv.id = jio_id_a[i] + 1;
            }
        }
        jio_id_a.push(priv.id);
        LocalOrCookieStorage.setItem (jio_id_array_name,jio_id_a);
    }());
    (function (){
        // Start Jio updater, and the jobManager
        activityUpdater.setId(priv.id);
        activityUpdater.start();
        jobManager.setId(priv.id);
        jobManager.start();
    }());

    // Methods //
    that.start = function() {
        jobManager.start();
    };
    that.stop = function() {
        jobManager.stop();
    };

    /**
     * Returns the jio id.
     * @method getId
     * @return {number} The jio id.
     */
    that.getId = function() {
        return priv.id;
    };

    /**
     * Checks if the storage description is valid or not.
     * @method validateStorageDescription
     * @param  {object} description The description object.
     * @return {boolean} true if ok, else false.
     */
    that.validateStorageDescription = function(description) {
        return jioNamespace.storage(description.type)(description).isValid();
    };

    /**
     * Save a document.
     * @method saveDocument
     * @param  {string} path The document path name.
     * @param  {string} content The document's content.
     * @param  {object} option (optional) Contains some options:
     * - {function} onResponse The callback called when the job is terminated.
     * - {function} onDone The callback called when the job has passed.
     * - {function} onFail The callback called when the job has fail.
     * - {number} max_retry The number max of retries, 0 = infinity.
     * @param  {object} specificstorage (optional) A specific storage, only if
     * you want to save this document elsewhere.
     */
    that.saveDocument = function(path, content, option, specificstorage) {
        option            = option            || {};
        option.onResponse = option.onResponse || function(){};
        option.onDone     = option.onDone     || function(){};
        option.onFail     = option.onFail     || function(){};
        option.max_retry  = option.max_retry  || 0;
        jobManager.addJob(
            job({storage:(specificstorage?
                          jioNamespace.storage(specificstorage):
                          priv.storage),
                 command:saveDocument(
                     {path:path,content:content,option:option})}));
    };

    /**
     * Load a document.
     * @method loadDocument
     * @param  {string} path The document path name.
     * @param  {object} option (optional) Contains some options:
     * - {function} onResponse The callback called when the job is terminated.
     * - {function} onDone The callback called when the job has passed.
     * - {function} onFail The callback called when the job has fail.
     * - {number} max_retry The number max of retries, 0 = infinity.
     * - {boolean} metadata_only Load only document metadata.
     * @param  {object} specificstorage (optional) A specific storage, only if
     * you want to save this document elsewhere.
     */
    that.loadDocument = function(path, option, specificstorage) {
        option               = option               || {};
        option.onResponse    = option.onResponse    || function(){};
        option.onDone        = option.onDone        || function(){};
        option.onFail        = option.onFail        || function(){};
        option.max_retry     = option.max_retry     || 0;
        option.metadata_only = (option.metadata_only !== undefined?
                                option.metadata_only:false);
        jobManager.addJob(
            job({storage:(specificstorage?
                          jioNamespace.storage(specificstorage):
                          priv.storage),
                 command:loadDocument(
                     {path:path,option:option})}));
    };

    /**
     * Remove a document.
     * @method removeDocument
     * @param  {string} path The document path name.
     * @param  {object} option (optional) Contains some options:
     * - {function} onResponse The callback called when the job is terminated.
     * - {function} onDone The callback called when the job has passed.
     * - {function} onFail The callback called when the job has fail.
     * - {number} max_retry The number max of retries, 0 = infinity.
     * @param  {object} specificstorage (optional) A specific storage, only if
     * you want to save this document elsewhere.
     */
    that.removeDocument = function(path, option, specificstorage) {
        option            = option            || {};
        option.onResponse = option.onResponse || function(){};
        option.onDone     = option.onDone     || function(){};
        option.onFail     = option.onFail     || function(){};
        option.max_retry  = option.max_retry  || 0;
        jobManager.addJob(
            job({storage:(specificstorage?
                          jioNamespace.storage(specificstorage):
                          priv.storage),
                 command:removeDocument(
                     {path:path,option:option})}));
    };

    /**
     * Get a document list from a folder.
     * @method getDocumentList
     * @param  {string} path The folder path.
     * @param  {object} option (optional) Contains some options:
     * - {function} onResponse The callback called when the job is terminated.
     * - {function} onDone The callback called when the job has passed.
     * - {function} onFail The callback called when the job has fail.
     * - {number} max_retry The number max of retries, 0 = infinity.
     * - {boolean} metadata_only Load only document metadata
     * @param  {object} specificstorage (optional) A specific storage, only if
     * you want to save this document elsewhere.
     */
    that.getDocumentList = function(path, option, specificstorage) {
        option               = option               || {};
        option.onResponse    = option.onResponse    || function(){};
        option.onDone        = option.onDone        || function(){};
        option.onFail        = option.onFail        || function(){};
        option.max_retry     = option.max_retry     || 0;
        option.metadata_only = (option.metadata_only !== undefined?
                                option.metadata_only:true);
        jobManager.addJob(
            job({storage:(specificstorage?
                          jioNamespace.storage(specificstorage):
                          priv.storage),
                 command:getDocumentList(
                     {path:path,option:option})}));
    };

    return that;
};                              // End Class jio

var jioNamespace = (function(spec, my) {
    var that = {};
    spec = spec || {};
    my = my || {};
    // Attributes //
    var storage_type_o = {'base':storage,'handler':storageHandler};

    // Methods //

    /**
     * Returns a storage from a storage description.
     * @method storage
     * @param  {object} spec The specifications.
     * @param  {object} my The protected object.
     * @return {object} The storage object.
     */
    that.storage = function(spec, my) {
        spec = spec || {};
        var type = spec.type || 'base';
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
