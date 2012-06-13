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
        return (job1.getCommand().getPath() === job2.getCommand().getPath() &&
                JSON.stringify(job1.getStorage().serialized()) ===
                JSON.stringify(job2.getStorage().serialized()));
    };

    // Methods //
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
    that.addActionRule ('saveDocument',true,'saveDocument',
                  function(job1,job2){
                      if (job1.getCommand().getContent() ===
                          job2.getCommand().getContent()) {
                          return that.dontAccept();
                      } else {
                          return that.wait();
                      }
                  });
    that.addActionRule('saveDocument'   ,true ,'loadDocument'   ,that.wait);
    that.addActionRule('saveDocument'   ,true ,'removeDocument' ,that.wait);
    that.addActionRule('saveDocument'   ,false,'saveDocument'   ,that.update);
    that.addActionRule('saveDocument'   ,false,'loadDocument'   ,that.wait);
    that.addActionRule('saveDocument'   ,false,'removeDocument' ,that.eliminate);

    that.addActionRule('loadDocument'   ,true ,'saveDocument'   ,that.wait);
    that.addActionRule('loadDocument'   ,true ,'loadDocument'   ,that.dontAccept);
    that.addActionRule('loadDocument'   ,true ,'removeDocument' ,that.wait);
    that.addActionRule('loadDocument'   ,false,'saveDocument'   ,that.wait);
    that.addActionRule('loadDocument'   ,false,'loadDocument'   ,that.update);
    that.addActionRule('loadDocument'   ,false,'removeDocument' ,that.wait);

    that.addActionRule('removeDocument' ,true ,'loadDocument'   ,that.dontAccept);
    that.addActionRule('removeDocument' ,true ,'removeDocument' ,that.dontAccept);
    that.addActionRule('removeDocument' ,false,'saveDocument'   ,that.eliminate);
    that.addActionRule('removeDocument' ,false,'loadDocument'   ,that.dontAccept);
    that.addActionRule('removeDocument' ,false,'removeDocument' ,that.update);

    that.addActionRule('getDocumentList',true ,'getDocumentList',that.dontAccept);
    that.addActionRule('getDocumentList',false,'getDocumentList',that.update);
    return that;
}());
