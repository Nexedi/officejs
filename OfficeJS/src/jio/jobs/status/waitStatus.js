var waitStatus = function(spec, my) {
    var that = jobStatus(spec, my);
    spec = spec || {};
    my = my || {};
    // Attributes //
    var job_id_a = spec.job_id_array || [];
    var threshold = 0;
    // Methods //
    that.getLabel = function() {
        return 'wait';
    };

    that.waitForJob = function(job) {
        var i;
        for (i = 0; i < job_id_a.length; i+= 1) {
            if (job_id_a[i] === job.getId()) {
                return;
            }
        }
        job_id_a.push(job.getId());
    };
    that.dontWaitForJob = function(job) {
        var i, tmp_job_id_a = [];
        for (i = 0; i < job_id_a.length; i+= 1) {
            if (job_id_a[i] !== job.getId()){
                tmp_job_id_a.push(job_id_a[i]);
            }
        }
        job_id_a = tmp_job_id_a;
    };

    that.waitForTime = function(ms) {
        threshold = Date.now() + ms;
    };
    that.stopWaitForTime = function() {
        threshold = 0;
    };

    that.canStart = function() {
        return (job_id_a.length === 0 && Date.now() >= threshold);
    };
    that.canRestart = function() {
        return false;
    };

    that.serialized = function() {
        return {label:that.getLabel(),
                waitfortime:threshold,
                waitforjob:job_id_a};
    };

    return that;
};
