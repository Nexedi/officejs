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

    that.terminateJob = function(job) {
        priv.removeJob(job);
        priv.copyJobArrayToLocal();
    };

    that.addJob = function(job) {
        var result_a = that.validateJobAccordingToJobList (priv.job_a,job);
        priv.manage (job,result_a);
        priv.copyJobArrayToLocal();
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
        for (i = 0; i < result_a.length; i+= 1) {
            switch (result_a[i].action) {
            case 'eliminate':
                that.eliminate(result_a[i].job);
                break;
            case 'replace':
                job.update(result_a[i].job);
                priv.copyJobArrayToLocal();
                return;
            case 'wait':
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
            }
        }
        priv.job_a = tmp_a;
    };

    return that;
}());