var waitStatus = function(spec, my) {
    var that = jobStatus(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    var priv = {};
    priv.job_id_a = spec.job_id_array || [];
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
        var tmp_job_id_a = [], i;
        for (i = 0; i < priv.job_id_a.length; i+= 1) {
            if (my.jobManager.jobIdExists(priv.job_id_a[i])) {
                tmp_job_id_a.push(priv.job_id_a[i]);
            }
        }
        priv.job_id_a = tmp_job_id_a;
    };

    /**
     * The status must wait for the job end before start again.
     * @method waitForJob
     * @param  {object} job The job to wait for.
     */
    that.waitForJob = function(job) {
        var i;
        for (i = 0; i < priv.job_id_a.length; i+= 1) {
            if (priv.job_id_a[i] === job.getId()) {
                return;
            }
        }
        priv.job_id_a.push(job.getId());
    };

    /**
     * The status stops to wait for this job.
     * @method dontWaitForJob
     * @param  {object} job The job to stop waiting for.
     */
    that.dontWaitForJob = function(job) {
        var i, tmp_job_id_a = [];
        for (i = 0; i < priv.job_id_a.length; i+= 1) {
            if (priv.job_id_a[i] !== job.getId()){
                tmp_job_id_a.push(priv.job_id_a[i]);
            }
        }
        priv.job_id_a = tmp_job_id_a;
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
