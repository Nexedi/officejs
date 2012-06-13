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
