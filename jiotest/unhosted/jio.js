/*
 JIO: Javascript I/O. A library to load, edit, save documents to
 multiple storage backends using a common interface
 */
(function() {
    
    /**
     * load dependencies
     */
    var dependenceLoaded = function () {
        try {
            // check jQuery, sjcl & Base64
            if (window.$ && window.sjcl && window.Base64)
                return true;
            else return false;
        } catch (e) {
            return false;
        }
    };
    
    var queue = null;       // the jobs manager
    var jioStorage = null;
    var applicant = null;

    /**
     * JIO main object. Contains all IO methods
     */
    var JIO = {
        listener: null,

        /**
         * prepare and return the jio object
         * @param jioData : text or json content of jio.json or method to get it
         * @param applicant : (optional) information about the person/application needing this JIO object (used to limit access)
         * @return JIO object
         */
        initialize: function(jioData, applicant) {
            // JIO initialize
            // jioData: object containing storage informations
            //     {type:,userName:,etc}
            // applicant: a string of the applicant name
            applicant = {"ID":applicant};
            if (!applicant && !userName) return false; // TODO to know: return false or alert user ?
            if (!dependenceLoaded()) {
                setTimeout(function() {JIO.initialize(jioData, applicant)},50);
            } else {
                switch(typeof jioData) {
                case "string" :
                    jioStorage = JSON.parse(jioData);
                    break;
                case "object" :
                    jioStorage = jioData;
                    break;
                case "function" :
                    jioStorage = jioData();
                    break;
                default:
                    alert("Error while getting jio.json content");
                    break;
                }
                queue = new JIO.MessageQueue();
                this.listener = new JIO.JobListener(100);
                this.listener.listen();
            }
        },

        /**
         * return the state of JIO object
         * @return true if ready, false otherwise
         */
        isReady: function() {if(queue && jioStorage) return true; return false;},

        //IO functions
        getLocation: function() {return this.location},
        userNameAvailable: function(name, options) {
            // return this.storage.userNameAvailable(name, options !== undefined ? options : {});
        },
        loadDocument: function(fileName, options) {
            alert ('niy');
            // return this.jioMessage.postMessage (
            //     {"method":"load","fileName":fileName,"status":"initial"},
            //     options);
        },
        saveDocument: function(data, fileName, options) {
            console.log ('saveDoc');
            return queue.pushMessage (jioStorage,
                {"method":"save","fileName":fileName,"fileContent":data,"status":"initial"},
                options);
        },
        deleteDocument: function(fileName, options) {
            alert ('niy');
            // return this.jioMessage.postMessage (
            //     {"method":"delete","fileName":fileName,"status":"initial"},
            //     options);
        },
        getDocumentList: function(options) {
            alert ('niy');
            // return this.jioMessage.postMessage (
            //     {"method":"getList","status":"initial"},
            //     options);
        },
        
        publish: function(event,obj) {
            pubSub.publish(event,obj);
        },
        subscribe: function(event,func) {
            pubSub.subscribe(event,func);
        },
        unsubscribe: function(event) {
            pubSub.unsubscribe(event);
        }
    }
    /*************************************************************************
    ******************************** Events *********************************/

    var pubSub = new function () {
        var topics = {};
        $.JIOPubSub = function (id) {
            var callbacks;
            var topic = id && topics[id];
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
        }
        this.publish = function (eventname,obj) {
            $.JIOPubSub('jio:'+eventname).publish(obj);
        },
        this.subscribe = function (eventname,func) {
            $.JIOPubSub('jio:'+eventname).subscribe(func);
        },
        this.unsubscribe = function (eventname) {
            $.JIOPubSub('jio:'+eventname).unsubscribe();
        }
    };

    /*************************************************************************
    ************************ JIO Job Listener *******************************/

    JIO.JobListener = function (interval) {
        this.interval = interval;
        this.id = null;
    };
    
    JIO.JobListener.prototype = {

        /**
         * Set the time between two joblist check in millisec
         */
        setIntervalDelay: function (interval) {
            this.interval = interval;
        },

        /**
         * Wait for jobs in the joblist inside the localStorage
         */
        listen: function () {this.id = setInterval (function(){
            
            // if there are jobs
            if (getJobArrayFromLocalStorage().length > 0) {
                console.log ('listen');
                queue.doAll();
            }
        },this.interval);},

        /**
         * Stop the listener
         */
        stop: function () {
            clearInterval (this.id);
            this.id = null;
        }
    };

    /*************************************************************************
    ****************************** Messages *********************************/

    /**
     *     Function parameters
     * Parameter storage: Constains {type:local/dav/...,userName:...,...}.
     *                    Must be an 'object'.
     * Parameter job: Contains {[id:..,]method:save/load/delete,
     *                fileName:name,fileContent:content[,status:"initial"]}.
     *                May be a 'string' or an 'object'
     */

    JIO.MessageQueue = function () {
        //// set first job ID
        this.jobid = 1;
        var localjoblist = getJobArrayFromLocalStorage();
        if (localjoblist.length > 0) {
            this.jobid = localjoblist[localjoblist.length - 1].id + 1;
        }

        // job remaining object
        this.remaining = {'save':0,'load':0,'delete':0,'getList':0};

        // current job array, it is necessary even if 'ongoing' status exists.
        // because if we close and re-open browser during an action, the job
        // will stay in 'ongoing' status, but all jobs are terminated.
        this.currentjobarray = [];
        
        this.status = {'save':'done','load':'done','delete':'done','getList':'done'};

        // subscribe an event
        var t = this;
        JIO.subscribe ('job_terminated', function (o) {
            // check result of a terminated job

            console.log ('job_terminated received');
            var checkremaining = function(method) {
                var cpt = 0;
                for (var i in t.currentjobarray) {
                    if (t.currentjobarray[i].method === method) cpt ++;
                }
                return cpt;
            };
            
            objectDump(o);
            //// remove in current jobarray
            var newcurrentjobarray = [];
            for (var i in t.currentjobarray) {
                if (t.currentjobarray[i].id !== o.job.id)
                    newcurrentjobarray.push(t.currentjobarray[i]);
            }
            t.currentjobarray = newcurrentjobarray;
            //// end removing

            //// analysing job method
            switch (o.job.method) {
            case 'save':
                if (checkremaining('save') === 0) {
                    t.status.save = 'done';
                    JIO.publish ('stop_saving');
                }
                break;
            case 'load':
                if (checkremaining('load') === 0) JIO.publish ('stop_loading');
                break;
            case 'delete':
                if (checkremaining('delete') === 0) JIO.publish ('stop_deleting');
                break;
            case 'getList':
                if (checkremaining('getList') === 0) {
                    // TODO merge list if necessary (we can create this.getList,
                    // deleted after sending the event) -> merge here or show
                    // possible actions (manually, auto, ...)

                    JIO.publish ('stop_gettinglist',o.getList);
                }
                break;
            }
            //// end analyse

            //// check result
            if (o.job.status !== 'done') { // if it failed
                t.fail(o.job);
            } else {    // if done
                t.done(o.job);
            }
            //// end check result

        });

        // // do all jobs at start, event the failed job
        // this.doAll ({'checkstatus':function(){return true;}});

    };

    JIO.MessageQueue.prototype = {

        pushMessage: function (storage,job) {
            // Add a job to the Job list
            // storage : the storage object
            // job : the job object

            //// Adding job to the list in localStorage
            if (!job) return false;
            // transforming job to an object
            if ((typeof job) === 'string') job = JSON.parse(job);
            // create joblist in local storage if unset
            if (!localStorage.joblist) localStorage.joblist = "[]";
            // set job id
            job.id = this.jobid;
            this.jobid ++;
            // set job storage
            job.storage = storage;
            // post the message
            var localjoblist = getJobArrayFromLocalStorage();
            localjoblist.push(job);
            setJobArrayToLocalStorage (localjoblist);
            //// job added
        }, // end pushMessage

        doAll: function (options) {
            // Do all jobs in the list
            // options : object containing
            //     checkstatus: function (job) {
            //         true if we can do the job, otherwise false }
            console.log ('doAll');

            //// check options, and set default settings if not set yet
            options = checkOptions(options,{'checkstatus':function(status){
                return (status === 'initial');}});
            //// do All jobs
            jobarray = getJobArrayFromLocalStorage();
            for (var i in jobarray) {
                if (options.checkstatus(jobarray[i].status)) {
                    this.currentjobarray.push (jobarray[i]);
                    console.log ('ongoing');
                    jobarray[i].status = 'ongoing';
                    setJobArrayToLocalStorage(jobarray);
                    objectDump(localStorage);
                    this.do(jobarray[i]);
                }
            }
            //// end, continue doing jobs asynchronously
        },

        do: function (job) {
            console.log ('do');
            // Do a job


            //// analysing job method
            switch (job.method) {
            case 'save':
                if (this.status.save === 'done') {
                    this.status.save = 'ongoing';
                    JIO.publish ('start_saving',{'job':job});
                }
                createStorage(job.storage).saveDocumentFromJob(job);
                break;
            case 'load':
                break;
            case 'delete':
                break;
            case 'getList':
                break;
            default:
                // TODO do an appropriate error reaction : unknown job method
                alert ('Unknown job method: ' + job.method);
                this.fail (job);
                break;
            }
            //// end method analyse
        },
        
        done: function (job) {
            // This job is supposed done, we can remove it from localStorage.

            var localjoblist = getJobArrayFromLocalStorage ();
            var newjoblist = [];
            //// find this unique job inside the list
            for (var i in localjoblist) {
                // if found, it won't be in newjoblist
                if (localjoblist[i].id !== job.id) {
                    // not found, add to the new list
                    newjoblist.push ( localjoblist[i] );
                }
            }
            //// job supposed found
            // save to local storage
            setJobArrayToLocalStorage (newjoblist);
        },

        fail: function (job) {
            // This job cannot be done, change its status into localStorage.

            var localjoblist = getJobArrayFromLocalStorage ();
            //// find this unique job inside the list
            for (var i in localjoblist) {
                if (localjoblist[i].id === job.id) {
                    localjoblist[i] = job;
                    break;
                }
            }
            // save to local storage
            setJobArrayToLocalStorage (localjoblist);
        },
        
        clean: function () {
            // Clean the job list, removing all jobs that have failed.
            // It also change the localStorage Job list
            
            // TODO
            alert ('niy');
        }
        
    }; // end JIO.MessageQueue



    /*************************************************************************
    ************************* specific storages *****************************/

/************************************************************
*********************** LocalStorage ************************/
    /**
     * Class LocalStorage
     * @class provides usual API to save/load/delete documents on the localStorage
     * @param data : object containing every element needed to build the storage :
     * "userName" : the name of the user
     * @param applicant : object containing inforamtion about the person/application needing this JIO object
     */
    JIO.LocalStorage = function(data) {
        //// check user's localStorage part
        this.userName = data.userName;
        if(!localStorage.getItem(this.userName)) {
            localStorage[this.userName] = '{}'; // Create user
        }
        //// end check

        //// loading documents
        this.documents = JSON.parse(localStorage.getItem(this.userName)); //load documents

    }
    JIO.LocalStorage.prototype = {

        /**
         * check if an user already exist
         * @param name : the name you want to check
         * @return true if the name is free, false otherwise
         */
        userNameAvailable: function(name) {if (localStorage[name]) return false; return true;},

        /**
         * load a document in the storage
         * @param fileName : the name of the file where the data will be stored
         * @param option : optional object containing
         * "success" : the function to execute when the load is done
         * "errorHandler" : the function to execute if an error occures
         * @return the content of the document
         */
        loadDocument: function(fileName, options) {
            options = checkOptions(options,{'onsuccess':function(){},
                                            'onerror':function(){}});
            if(!this.documents[fileName]) {
                options.onerror({'status': 404,'message': "Document not found."});
                return {'status':'fail','message': "Document not found."};
            } else {
                options.onsuccess({'status':'success','message':''});
                return {'status':'success','message':''};
            }
        }, // end loadDocument

        /**
         * save a document in the local storage from a job
         * @param job : contains all the information to save the document
         * @param options : optional object containing
         * overwrite : a boolean set to true if the document has to be overwritten
         */
        saveDocumentFromJob: function(job, options) {
            console.log ('saving');
            var t = this;
            // wait a little in order to let some other instructions to continue
            setTimeout(function () {

                options = checkOptions(options,{'overwrite':true});
                if(!t.documents[job.fileName]) { // create document
                    t.documents[job.fileName] = {
                        'fileName': job.fileName,
                        'content': job.fileContent,
                        'creationDate': Date.now(),
                        'lastModified': Date.now()
                    }
                    t.writeToLocalStorage();
                    job.status='done';
                    job.message='success';
                } else {
                    if(options.overwrite) { // overwrite
                        t.documents[job.fileName].lastModified = Date.now();
                        t.documents[job.fileName].content = job.fileContent;
                        t.writeToLocalStorage();
                        job.status='done';
                        job.message='success';
                    } else {
                        job.status='fail';
                        job.message='Document already exists.';
                        job.errno=403;
                    }
                }
                JIO.publish('job_terminated',{'job':job});
            }, 100);
            return;
        }, // end saveDocumentFromJob

        /**
         * Delete a document or a list of documents from the storage
         * @param fileName : fileName to delete
         * @param options : optional object containing
         * "onsuccess" : the function to execute when the delete is done
         * "onerror" : the function to execute if an error occures
         */
        deleteDocument: function(fileName, options) {
            options = checkOptions (options, {'onsuccess': function () {},
                                              'onerror': function () {}});
            if (typeof this.documents[fileName] !== 'object') {
                options.onerror({'status':404,'message':'Document does not exists.'});
                return {'status':'fail','message':'Document does not exists.'};
            }
            delete this.documents[fileName];
            this.save();
            options.onsuccess({'status':'success','message':''});
            return {'status':'success','message':''};
        },

        /**
         * load the list of the documents in this storage
         * @param options : optional object containing
         * "onsuccess" : the function to execute when the load is done
         * "onerror" : the function to execute if an error occures
         */
        getDocumentList: function(options) {
            options = checkOptions (options,{'onsuccess':function(){},
                                             'onerror':function(){}});
            // var list = copy(this.documents);
            // if(option.success) option.success(list);
            // return list;
            var list = [];
            for (var key in this.documents) {
                list.push ({
                    'fileName':this.documents[key].fileName,
                    'creationDate':this.documents[key].creationDate,
                    'lastModified':this.documents[key].lastModified
                });
            }
            options.onsuccess({'status':'success','message':'','list':list,'length':list.length});
            return {'status':'success','message':'','list':list,'length':list.length};
        },


        writeToLocalStorage: function() {
            localStorage[this.userName] = JSON.stringify(this.documents);
        }
    }


    ///////////
    // Tools //
    ///////////

    /**
     * Create a tree node from data
     * @param data : information found in jio.json and needed to create the storage
     * @param applicant : (optional) information about the person/application needing this JIO object (allow limited access)
     */
    function createStorage(data) {
        switch(data.type) {
        case "dav":return new JIO.DAVStorage(data);break;
        case "local":return new JIO.LocalStorage(data);break;
        case "index":return new JIO.IndexedStorage(data);break;
        case "multiple":return new JIO.MultipleStorage(data);break;
        case "replicate":return new JIO.ReplicateStorage(data);break;
        case "encrypt":return new JIO.CryptedStorage(data);break;
            //etc
        default:
            // var waitedNode = null;//create a custom storage from a js file
            // $.ajax({
            //     url: data.location+"/storage-init.js",//url of the file describing the creation of the storage
            //     type: "GET",
            //     async: false,
            //     dataType: "script",
            //     success: function(script) {
            //         var CustomStorage = eval(script);
            //         waitedNode = new CustomStorage(data)
            //     },
            //     error: data.errorHandler !== undefined ? 
            //         data.errorHandler :
            //         function(type) {
            //             alert("Error "+type.status+
            //                   " : fail while trying to instanciate storage"+
            //                   data.location);
            //         }
            // });
            // return waitedNode;
            break;
        }
    }

    var checkOptions = function (current,defaultopts) {
        if(!current) {
            return defaultopts;
        }
        for (var k in defaultopts) {
            if (current[k] === undefined)
                current[k] = defaultopts[k];
        }
        return current;
    };

    var getJobArrayFromLocalStorage = function () {
        var localjoblist = [];
        if (localStorage.joblist)
            localjoblist = JSON.parse(localStorage.joblist);
        return localjoblist;
    };
    var setJobArrayToLocalStorage = function (jobarray) {
        localStorage.joblist = JSON.stringify(jobarray);
    };

    // TESTS
    var objectDump = function (o) {
        console.log (JSON.stringify(o));
    };

    window.JIO = JIO;//the name to use for the framework. Ex : JIO.initialize(...), JIO.loadDocument...
    
})();
