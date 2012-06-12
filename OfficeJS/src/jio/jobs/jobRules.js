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
