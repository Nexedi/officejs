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

    /**
     * JIO main object. Contains all IO methods
     */
    var JIO = {
        jioMessage: null,       // the jobs manager

        /**
         * prepare and return the jio object
         * @param jioData : text or json content of jio.json or method to get it
         * @param applicant : (optional) information about the person/application needing this JIO object (used to limit access)
         * @return JIO object
         */
        initialize: function(jioData, applicant) {
            if(!dependenceLoaded()) {
                setTimeout(function() {JIO.initialize(jioData, applicant)},50);
            } else {
                switch(typeof jioData) {
                case "string" :
                    this.jioMessage = new JIO.Message(JSON.parse(jioData), applicant);
                    break;
                case "object" :
                    this.jioMessage = new JIO.Message(jioData, applicant);
                    break;
                case "function" :
                    this.jioMessage = new JIO.Message(jioData(), applicant);
                    break;
                default:
                    alert("Error while getting jio.json content");
                    break;
                }
            }
        },

        /**
         * return the state of JIO object
         * @return true if ready, false otherwise
         */
        isReady: function() {if(this.jioMessage) return true; return false;},

        //IO functions
        getLocation: function() {return this.location},
        userNameAvailable: function(name, options) {
            // return this.storage.userNameAvailable(name, options !== undefined ? options : {});
        },
        loadDocument: function(fileName, options) {
            return this.jioMessage.pushMessage (
                {"method":"load","fileName":fileName,"status":"initial"},
                options);
        },
        saveDocument: function(data, fileName, options) {
            return this.jioMessage.pushMessage (
                {"method":"save","fileName":fileName,"fileContent":data,"status":"initial"},
                options);
        },
        deleteDocument: function(fileName, options) {
            return this.jioMessage.pushMessage (
                {"method":"delete","fileName":fileName,"status":"initial"},
                options);
        },
        getDocumentList: function(options) {
            return this.jioMessage.pushMessage (
                {"method":"getList","status":"initial"},
                options);
        }
    }


    /*************************************************************************
    ****************************** Messages *********************************/

    /**
     *     Function parameters
     * Parameter storage: Constains {type:local/dav/...,userName:...,...}.
     *                    Must be an 'object'.
     * Parameter job: Contains {method:save/load/delete,
     *                fileName:name,fileContent:content[,status:"initial"]}.
     *                May be a 'string' or an 'object'
     * Parameter options: //TODO options documentation
     */
    JIO.Message = function (storage, applicant) {
        this.storage = storage;
        this.messagequeue = new JIO.MessageQueue(applicant);
    };
    JIO.Message.prototype = {
        /**
         * pushMessage: Add a job on a storage joblist
         */
        pushMessage: function (job,options) {
            // transforming job to an object
            if ((typeof job) === 'string') job = JSON.parse(job);
            // send messages
            this.messagequeue.pushMessage(this.storage,job);
            var result = this.messagequeue.doJobs(options);
            return 'success';
        } // end pushMessage
    }; // end JIO.Message
    JIO.MessageQueue = function (applicant) {
        this.applicant = applicant;
        this.storages = {};
    };
    JIO.MessageQueue.prototype = {

        pushMessage: function (storage,job) {
            if (this.storages[storage.type] === undefined) {
                this.storages[storage.type] =
                    createStorage(storage,this.applicant);
            }
            this.storages[storage.type].addJob (job);
        }, // end pushMessage

        doJobs: function (options) {
            var ret = {'status':'success','message':''};
            for (var k in this.storages) {
                var res = this.storages[k].wakeUp(options);
                if (res.status !== 'success') {
                    ret.status = 'fail';
                    ret.message += " " + res.message;
                }
            }
            return ret;
        }
    }; // end JIO.MessageQueue


    /*************************************************************************
    ******************************** Events *********************************/

    JIO.PubSub = {
        start_saving: function (currentjob,nbremainingjobs) {},
        stop_saving: function (retobject) {},
        start_loading: function (currentjob,nbremainingjobs) {},
        stop_loading: function (retobject) {},
        start_deleting: function (currentjob,nbremainingjobs) {},
        stop_deleting: function (retobject) {},
        start_gettinglist: function (currentjob,nbremainingjobs) {},
        stop_gettinglist: function (retobject) {}
    };

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
    JIO.LocalStorage = function(data, applicant) {
        this.userName = data.userName;
        if(!localStorage.getItem(this.userName)) {
            localStorage[this.userName] = '{}'; // new user
        }
        this.documents = JSON.parse(localStorage.getItem(this.userName)); //load documents
        this.jobs = [];
        this.currentjob = null;
    }
    JIO.LocalStorage.prototype = {
        addJob: function (job) {return this.jobs.push(job);},
        getJobArray: function () {return this.jobs;},
        getCurrentJob: function () {return this.currentjob;},

        /**
         * wakeUp: check if there's something to do in this.jobs, and do them
         *         if it is possible.
         * @param options: all options are optionnal
         *        { 'retryfailedjobs': true/false (def: false) }
         */
        wakeUp: function(options) {
            // count 'method' jobs
            var countjobs = function (method) {
                var c = 0; var countnow = false;
                for (var j in this.jobs) {
                    if (countnow && this.jobs[j].method === method) c ++;
                    if (j === k) countnow = true;
                } return c;
            };
            // If there's no jobs, good! There's nothing to do!
            if (this.jobs === []) return {'status':'success'};
            // checkOptions
            options = checkOptions (options,{ 'retryfailedjobs': false });
            // browse jobs
            var newjobs = [];
            var ret = {'status':'success','message':''};
            for (var k in this.jobs) {
                this.currentjob = this.jobs[k];
                var result = {};
                // Do job. Don't retry if not required, but try if not tried yet.
                if ((!options.retryfailedjobs) && this.currentjob.status !== 'initial') continue;
                switch (this.currentjob.method) {
                case 'getList':
                    var getlist = {'ret':{'status':'success','message':''},
                                   'count':countjobs('getList')};
                    JIO.PubSub.start_gettinglist(this.currentjob,getlist.count);
                    result = this.getDocumentList(options);
                    getlist.ret = result;
                    if (getlist.count == 0)
                        JIO.PubSub.stop_gettinglist(getlist.ret);
                    break;
                case 'delete':
                    var vdelete = {'ret':{'status':'success','message':''},
                                   'count':countjobs('delete')};
                    JIO.PubSub.start_deleting(this.currentjob,vdelete.count);
                    result = this.deleteDocument(this.currentjob.fileName,options);
                    vdelete.ret= result;
                    if (vdelete.count == 0)
                        JIO.PubSub.stop_deleting(vdelete.ret);
                    break;
                case 'load':
                    var load = {'ret':{'status':'success','message':''},
                                'count':countjobs('load')};
                    JIO.PubSub.start_loading(this.currentjob,load.count);
                    result = this.loadDocument(this.currentjob.fileName,options);
                    load.ret = result;
                    if(load.count == 0)
                        JIO.PubSub.stop_loading(load.ret);
                    break;
                case 'save':
                    var save = {'ret':{'status':'success','message':''},
                                'count':countjobs('save')};
                    JIO.PubSub.start_saving (this.currentjob,save.count);
                    result = this.saveDocument(this.currentjob.fileContent,this.currentjob.fileName,options);
                    save.ret = result;
                    if(save.count == 0)
                        JIO.PubSub.stop_saving(save.ret);
                    break;
                };
                // if errors, fill return value
                if (result.status !== 'success') {
                    ret.status = 'fail';
                    ret.message += '"'+this.currentjob.fileName+'" in LocalStorage, '+ result.message;
                    this.currentjob.status = result.status;
                    newjobs.append = this.currentjob;
                }
                this.currentjob = null;
            };
            this.jobs = newjobs;
            return ret;
        }, // end wakeUp

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
         * save a document in the storage
         * @param data : the data to store
         * @param fileName : the name of the file where the data will be stored
         * @param option : optional object containing
         * onsuccess : the function to execute when the save is done
         * onerror : the function to execute if an error occures
         * overwrite : a boolean set to true if the document has to be overwritten
         */
        saveDocument: function(data, fileName, options) {
            options = checkOptions(options,{'overwrite':true,
                                            'onsuccess':function(){},
                                            'onerror':function(){}});
            if(!this.documents[fileName]) { // create document
                this.documents[fileName] = {
                    'fileName': fileName,
                    'content': data,
                    'creationDate': Date.now(),
                    'lastModified': Date.now()
                }
                this.save();
            } else {
                if(options.overwrite) { // overwrite
                    this.documents[fileName].lastModified = Date.now();
                    this.documents[fileName].content = data;
                    this.save();
                } else { // repport an error
                    options.onerror(
                        {'status': 403, 'message': "Document already exists."}
                    );
                    return {'status':'fail','message':'Document already exists.'};
                }
            }
            options.onsuccess({'status':'success','message':''});
            return {'status':'success','message':''};
        }, // end saveDocument

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


        save: function() {
            localStorage[this.userName] = JSON.stringify(this.documents);
        }
    }































    

    /*************************************************************************
    *************************** other functions *****************************/


    /**
     * function used to address requests to a php file
     * @param address : address of the target
     * @param data : data to send to the server
     * @param instruction : function to execute after receiving the answer
     * @return void
     */
    function request(address, data, instruction) {
        $.ajax({
            url: address,
            type: "POST",
            async: false,
            dataType: "text",
            data: data,
            success: instruction,
            error: function(type) {alert("Error "+type.status+" : fail while trying to load "+address);}
        });
    }

    /**
     * Create a tree node from data
     * @param data : information found in jio.json and needed to create the storage
     * @param applicant : (optional) information about the person/application needing this JIO object (allow limited access)
     */
    function createStorage(data, applicant) {
        switch(data.type) {
        case "dav":return new JIO.DAVStorage(data, applicant);break;
        case "local":return new JIO.LocalStorage(data, applicant);break;
        case "index":return new JIO.IndexedStorage(data, applicant);break;
        case "multiple":return new JIO.MultipleStorage(data, applicant);break;
        case "replicate":return new JIO.ReplicateStorage(data, applicant);break;
        case "encrypt":return new JIO.CryptedStorage(data,applicant);break;
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

    /**
     * delegate a function to a non-object element, or to each element of an array of non-object elements
     * this function is used to delete a file or a list of files for example
     * @param element : a non-object element, or an array of non-object elements
     * @param f : function to apply
     */
    function oneOrEach(element,f) {
        typeof element != "object" ? f(element) : $.each(element,function(index, fileName) {f(fileName);})
    }

    /**
     * return a shallow copy of the object parameter
     * @param object : the object to copy
     * @return a shallow copy of the object
     */
    function copy(object) {
        return $.extend({}, object);
    }

    /**
     * add an instruction to a function
     * @param instruction : the instruction to add to the function
     * @param f : the function
     * @param before : (optional) set to true if you want the instruction to be executed before f
     * @return a new function executing f & instruction
     */
    function addInstruction(instruction, f, before) {
        return before ?
        function() {
            var result = instruction.apply(this, arguments);
            if(f) {return f.apply(this, arguments);}
            return result;
        }
        :
        function()  {
            if(f) {f.apply(this, arguments);}
            return instruction.apply(this, arguments);
        };
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

    // TESTS
    var objectDump = function (o) {
        console.log (JSON.stringify(o));
    };

    window.JIO = JIO;//the name to use for the framework. Ex : JIO.initialize(...), JIO.loadDocument...
    
})();
