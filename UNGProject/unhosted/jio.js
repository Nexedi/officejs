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
        jioFileContent: null,   //content of jio.json file
        storage: null,          //the storage tree

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
                    case "string" :this.jioFileContent = jioData;break;
                    case "object" :this.jioFileContent = JSON.stringify(jioData);break;
                    case "function" :this.jioFileContent = jioData();break;
                    default:alert("Error while getting jio.json content");break;
                }
                this.storage = createStorage(JSON.parse( this.jioFileContent ), applicant);//create the object allowing IO in storages
                this.ready();
            }
        },

        /**
         * return the state of JIO object
         * @return true if ready, false otherwise
         */
        isReady: function() {return this.jioFileContent && this.storage},

        ready: function(instruction) {if(instruction) this.isReady() ? instruction() : this.ready = instruction},

        //IO functions
        getLocation: function() {return this.location},
        userNameAvailable: function(name, option) {
            return this.storage.userNameAvailable(name, option !== undefined ? option : {});
        },
        loadDocument: function(fileName, option) {
            return this.storage.loadDocument(fileName, option !== undefined ? option : {});
        },
        saveDocument: function(data, fileName, option) {
            return this.storage.saveDocument(data, fileName, option !== undefined ? option : {});
        },
        deleteDocument: function(file, option) {
            return this.storage.deleteDocument(file, option !== undefined ? option : {});
        },
        getDocumentList: function(option) {
            return this.storage.getDocumentList(option !== undefined ? option : {});
        }

    }




    /*************************************************************************
    ************************* specific storages *****************************/

/************************************************************
*********************** DAVstorage *************************/
    /**
     * Class DAVStorage
     * @class provides usual API to save/load/delete documents on a storage webDav
     * @param data : object containing every element needed to build the storage :
     * "userName" : the name of the user
     * "location" : the complete url of the storage
     * "provider" : the provider of the storage
     * @param applicant : object containing inforamtion about the person/application needing this JIO object
     */
    JIO.DAVStorage = function(data, applicant) {
        this.userName = data.userName;
        this.applicationID = applicant.ID;
        this.applicationPassword = data.password;
        this.location = data.location;//complete url of the storage
        this.provider = data.provider;//like "gmail.com", "yahoo.fr"...
    }
    JIO.DAVStorage.prototype = {

        /**
         * check if an user already exist
         * @param name : the name you want to check
         * @param option : optional object containing
         * "success" : the function to execute when the check is done
         * "errorHandler" : the function to execute if an error occures
         * "asynchronous" : a boolean set to false if the request must be synchronous
         * @return null if the request is asynchronous, true if the name is free, false otherwise
         */
        userNameAvailable: function(name, option) {
            var isAvailable = null;
            $.ajax({
                url: this.location + "/dav/"+name,
                type: "HEAD",
                async: option.asynchronous !== undefined ? option.asynchronous : true,
                success: function() {isAvailable=true;if(option.sucess) option.success();},
                error: option.errorHandler !== undefined ?
                    option.errorHandler :
                    function(type) {if(type.status==404) {isAvailable=false;}else{alert("Error "+type.status+" : fail while trying to check "+name);}}
            });
            return isAvailable;//warning : always null if asynchronous
        },


        /**
         * load a document in the storage
         * @param fileName : the name of the file where the data will be stored
         * @param option : optional object containing
         * "type" : the type of data to store
         * "success" : the function to execute when the load is done
         * "errorHandler" : the function to execute if an error occures
         * "asynchronous" : a boolean set to false if the request must be synchronous
         * @return null if the request is asynchronous, the content of the document otherwise
         */
        loadDocument: function(fileName, option) {
            var data = null;
            $.ajax({
                url: this.location + "/dav/"+this.userName+"/"+this.applicationID+"/"+fileName,
                type: "GET",
                async: option.asynchronous !== undefined ? option.asynchronous : true,
                dataType: option.type !== undefined ? option.type : "text",
                headers: {Authorization: "Basic "+Base64.encode(this.userName+":"+this.applicationPassword)},
                fields: {withCredentials: "true"},
                success: function(content) {if(option.success) option.success(content);data=content},
                error: option.errorHandler !== undefined ?
                    option.errorHandler :
                    function(type) {alert("Error "+type.status+" : fail while trying to load "+fileName);}
            });
            return data;//warning : always null if asynchronous
        },


        /**
         * save a document in the storage
         * @param data : the data to store
         * @param fileName : the name of the file where the data will be stored
         * @param option : optional object containing
         * type : the type of data to store
         * success : the function to execute when the save is done
         * errorHandler : the function to execute if an error occures
         * overwrite : a boolean set to true if the document has to be overwritten
         * asynchronous : a boolean set to false if the request must be synchronous
         * oldData : last data downloaded. Used to know if data has changed since last download and has to been merged
         */
        saveDocument: function(data, fileName, option) {

            var storage = this;//save the context

            //check if already exists and for diffs
            this.loadDocument(fileName, {
                type: option.type,
                asynchronous: false,//TODO : try to asynchronize
                success: function(remoteData) {
                    merge(remoteData);
                },
                errorHandler: function(type) {
                    if(type.status==404) {
                        save();
                    } else {
                        option.errorHandler !== undefined ?
                            option.errorHandler : save();
                    }
                }
            });

            function save() {
                $.ajax({
                    url: storage.location + "/dav/"+storage.userName+"/"+storage.applicationID+"/"+fileName,
                    type: "PUT",
                    async: option.asynchronous !== undefined ? option.asynchronous : true,
                    dataType: option.type !== undefined ? option.type : "text",
                    data: data,
                    headers: {Authorization: "Basic "+Base64.encode(storage.userName+":"+storage.applicationPassword)},
                    fields: {withCredentials: "true"},
                    success: option.success,
                    error: function(type) {
                      if(type.status==201 || type.status==204) {if(option.success) option.success();}//ajax thinks that 201 is an error...
                      else {option.errorHandler ? option.errorHandler.call(this,type) : alert("Error "+type.status+" : fail while trying to save "+fileName);}
                    }
                });
            }// end save function

            function merge(serverData) {
                if(option.overwrite!==false) {
                    //if(diff(oldData,serverData)) {merge(newData, serverData);}
                    save();
                }
            }// end merge function

        },// end saveDocument function


        /**
         * Delete a document or a list of documents from the storage
         * @param file : fileName or array of fileNames to delete
         * @param option : optional object containing
         * "success" : the function to execute when the delete is done. The function is executed only if every delete are successful
         * "errorHandler" : the function to execute if an error occures
         * "asynchronous" : a boolean set to false if the request must be synchronous
         */
        deleteDocument: function(file, option) {
            var storage = this;

            var fileName = typeof file == "string" ? file : file.pop();
            var successFunction = generateSuccess();
            $.ajax({
                url: storage.location + "/dav/"+storage.userName+"/"+storage.applicationID+"/"+fileName,
                type: "DELETE",
                async: option.asynchronous !== undefined ? option.asynchronous : true,
                headers: {Authorization: "Basic "+Base64.encode(this.userName+":"+this.applicationPassword)},
                fields: {withCredentials: "true"},
                success: successFunction,
                error: function(type) {
                    if(type.status==201 || type.status==204) {successFunction();}//ajax thinks that 201 is an error...
                    else {option.errorHandler ? option.errorHandler(type) : alert("Error "+type.status+" : fail while trying to delete "+fileName);}
                }
            });

            function generateSuccess() {
                if(typeof file == "string" || file.length===0) {
                    return function() {if(option.success) {option.success()}}
                } else {
                    return function() {storage.deleteDocument(file,option);}
                }
            }
        },


        /**
         * load the list of the documents in this storage
         * @param option : optional object containing
         * "success" : the function to execute when the load is done
         * "errorHandler" : the function to execute if an error occures
         * "asynchronous" : a boolean set to false if the request must be synchronous
         * @return null if the request is asynchronous, the list of documents otherwise.
         * @example {"file1":{fileName:"file1",creationDate:"Tue, 23 Aug 2011 15:18:32 GMT",lastModified:"Tue, 23 Aug 2011 15:18:32 GMT"},...}
         */
        getDocumentList: function(option) {
            var storage = this;
            var list = null;
            $.ajax({
                url: storage.location + "/dav/"+storage.userName+"/"+storage.applicationID+"/",
                async: option.asynchronous !== undefined ? option.asynchronous : true,
                type: "PROPFIND",
                dataType: "xml",
                headers: {Authorization: "Basic "+Base64.encode(this.userName+":"+this.applicationPassword), Depth: "1"},
                fields: {withCredentials: "true"},
                success: function(data) {list=xml2jsonFileList(data);if(option.success) option.success(list)},
                error: option.errorHandler !== undefined ? option.errorHandler : function(type) {alert("Error "+type.status+" : fail while trying to load file list");}
            });
            return list;//warning : always null if asynchronous

            function xml2jsonFileList(xmlData) {//transform the xml into a list
                var fileList = {};
                $("D\\:response",xmlData)
                    .each(function(i,data){
                        if(i>0) {//exclude the parent folder
                            var name = fileName(data);
                            fileList[name]=xml2jsonFile(data)
                            fileList[name].fileName = name;
                        }
                });

                //remove webDav files from the list
                delete fileList[".htaccess"];
                delete fileList[".htpasswd"];
                return fileList;
            }
            function xml2jsonFile(xmlData) {//transform the xml about a file into json information
                var file = {};
                file.lastModified = $($("lp1\\:getlastmodified",xmlData).get(0)).text();
                file.creationDate = $($("lp1\\:creationdate",xmlData).get(0)).text();
                return file;
            }
            function fileName(xmlData) {//read the name of a file in the xml
                var string = $($("D\\:href",xmlData).get(0)).text()
                var T = string.split("/");
                return T[T.length-1] ? T[T.length-1] : T[T.length-2]+"/";
            }
        }
    }


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
        if(!localStorage.getItem(this.userName)) {localStorage[this.userName] = "{}"}//new user
        this.documents = JSON.parse(localStorage.getItem(this.userName));//load documents
        // HACK : re-stringify the content :
    }
    JIO.LocalStorage.prototype = {

        /**
         * check if an user already exist
         * @param name : the name you want to check
         * @return true if the name is free, false otherwise
         */
        userNameAvailable: function(name) {return localStorage[name];},


        /**
         * load a document in the storage
         * @param fileName : the name of the file where the data will be stored
         * @param option : optional object containing
         * "success" : the function to execute when the load is done
         * "errorHandler" : the function to execute if an error occures
         * @return the content of the document
         */
        loadDocument: function(fileName, option) {
            var doc = this.documents[fileName];
            if(!doc) {
                if(option.errorHandler) {
                    var error = {status: 404,message: "document not found"};
                    return option.errorHandler(error);
                } else {
                    return false;
                }
            } else {
                if(option.success) {
                    return option.success(doc.content);
                } else {
                    return doc
                }
            }
        },

        /**
         * save a document in the storage
         * @param data : the data to store
         * @param fileName : the name of the file where the data will be stored
         * @param option : optional object containing
         * success : the function to execute when the save is done
         * errorHandler : the function to execute if an error occures
         * overwrite : a boolean set to true if the document has to be overwritten
         * oldData : last data downloaded. Used to know if data has changed since last download and has to been merged
         */
        saveDocument: function(data, fileName, option) {
            if(!this.documents[fileName]) {       //create document
                this.documents[fileName] = {
                    fileName:fileName,
                    content: data,
                    creationDate: Date.now(),
                    lastModified: Date.now()
                }
                this.save();
                if(option.success !== undefined) option.success();
            } else {
                if(option.overwrite === undefined ||
                   option.overwrite) { // overwrite (true or undefined)
                    this.documents[fileName].lastModified = Date.now();
                    this.documents[fileName].content = data;
                    this.save();
                    if(option.success !== undefined) option.success();
                } else {        // repport an error
                    if(option.errorHandler !== undefined) {
                        option.errorHandler(
                            {status: 403, message: "document already exists"}
                        );
                    }
                }
            }
        },

        /**
         * Delete a document or a list of documents from the storage
         * @param file : fileName or array of fileNames to delete
         * @param option : optional object containing
         * "success" : the function to execute when the delete is done
         * "errorHandler" : the function to execute if an error occures
         */
        deleteDocument: function(file, option) {
            var storage = this;
            oneOrEach(file,deleteFile);
            this.save();
            if(option.success) option.success();

            function deleteFile(fileName) {
                delete storage.documents[fileName];
            }
        },


        /**
         * load the list of the documents in this storage
         * @param option : optional object containing
         * "success" : the function to execute when the load is done
         * "errorHandler" : the function to execute if an error occures
         * @return null if the request is asynchronous, the list of documents otherwise.
         * @example {"file1":{fileName:"file1",creationDate:"Tue, 23 Aug 2011 15:18:32 GMT",lastModified:"Tue, 23 Aug 2011 15:18:32 GMT"},...}
         */
        getDocumentList: function(option) {
            var list = copy(this.documents);
            if(option.success) option.success(list);
            return list;
        },


        save: function() {
            var s = JSON.stringify(this.documents);
            localStorage[this.userName]=JSON.stringify(this.documents);
        }
    }

/***************************************************************
*********************** IndexedStorage *************************/
    /**
     * Class IndexedStorage
     * @class provides usual API to create an index while storing documents
     * @param data : object containing every element needed to build the storage
     * "storage" : the storage to index
     * @param applicant : object containing inforamtion about the person/application needing this JIO object
     */
    JIO.IndexedStorage = function(data, applicant) {
        this.storage = createStorage(data.storage, applicant);//create the object allowing IO in storages
        this.index = null;

        //initialize the index
        var storage = this;
        (function initialize() {//try to download jio.index
            if(storage.storage) {
                var loadOption = {
                    success: function(data) {storage.index = JSON.parse(data);},
                    errorHandler: function(error) {
                        if(error.status==404) {storage.createIndex()} else {alert("error "+error.status+" while trying to download jio.index")}
                    }
                }
                storage.storage.loadDocument("jio.index", loadOption);
            } else {//if the storage is not ready
                setTimeout(initialize,50);
            }
        })()
    }
    JIO.IndexedStorage.prototype = {
        /* delegate the call to the indexed storage */
        userNameAvailable: function() {return this.storage.userNameAvailable.apply(this.storage,arguments)},

        /**
         * load either a document or only its metaData
         * @param fileName : the name of the file where the data will be stored
         * @param option : optional object containing
         * "metaDataOnly" : set to true if only metaData are wanted
         * @return the content of metaData, or the content of the document
         */
        loadDocument: function(fileName, option) {
            var indexedStorage = this;
            if(this.getIndex()===undefined) {
                setTimeout(function() {indexedStorage.loadDocument(fileName, option)},50);
                return null;
            } else {
                return option.metaDataOnly ? this.getIndex()[fileName] : this.storage.loadDocument.apply(this.storage,arguments)
            }
        },


        /**
         * save a document in the storage and update its metaData
         * @param data : the data to store
         * @param fileName : the name of the file where the data will be stored
         * @param option : optional object containing
         * "success" : the function to execute when the save is done
         * "metaData" : information to store about the document
         */
        saveDocument: function(data, fileName, option) {
            var indexedStorage = this;
            if(this.getIndex()==null) {
                setTimeout(function() {indexedStorage.saveDocument(data, fileName, option)},50);
                return null;
            } else {
                var fileAlreadyExist = this.getIndex()[fileName]!==undefined;
                var instruction = function() {
                    var time = Date.now();
                    indexedStorage.getIndex()[fileName] = (option.metaData !== undefined ? option.metaData : {});
                    indexedStorage.getIndex()[fileName].lastModified = time;
                    indexedStorage.getIndex()[fileName].fileName = fileName;
                    if(!fileAlreadyExist) {indexedStorage.getIndex()[fileName].creationDate = time;}
                    indexedStorage.save();
                }
                option.success = addInstruction(instruction, option.success, true);
                return this.storage.saveDocument(data,fileName,option);
            }
        },


        /**
         * Delete a document or a list of documents from the storage and remove its metaData from the index
         * Data are deleted only if the delete is successful
         * @param file : fileName or array of fileNames to delete
         * @param option : optional object containing
         * "success" : the function to execute when the delete is done
         */
        deleteDocument: function(file, option) {
            var indexedStorage = this;
            if(this.getIndex()===undefined) {
                setTimeout(function() {indexedStorage.deleteDocument.call(indexedStorage, file, option)},50);
                return null;
            } else {
                var newOption = copy(option);
                newOption.success = function() {
                    oneOrEach(file,deleteFileData);
                    indexedStorage.save();
                    if(option.success) {option.success()}
                }
                return this.storage.deleteDocument(file, newOption);
            }

            function deleteFileData(fileName) {
                delete indexedStorage.getIndex()[fileName];
            }
        },


        /**
         * return the list of the documents in the index
         * @param option : optional object containing
         * "success" : the function to execute on the list
         * @return the list of documents.
         * @example {"file1":{fileName:"file1",creationDate:"Tue, 23 Aug 2011 15:18:32 GMT",lastModified:"Tue, 23 Aug 2011 15:18:32 GMT"},...}
         */
        getDocumentList: function(option) {
            var indexedStorage = this;
            if(this.getIndex()===undefined) {
                setTimeout(function() {indexedStorage.getDocumentList.call(indexedStorage, fileName, option)},50);
                return null;
            } else {
                var list = this.getIndex();
                if(option.success) option.success(list);
                return list;
            }
        },

        getIndex: function() {return this.index},
        save: function() {
            this.storage.saveDocument(JSON.stringify(this.getIndex()), "jio.index", "text", true);
        },
        createIndex: function () {//create a new index if doesn't exist
            this.index = {}//for the moment, just consider that the folder is empty
        }
    }


/***************************************************************
*********************** CryptedStorage *************************/
    /**
     * Class CryptedStorage
     * @class provides usual API to encrypte data storing documents
     * @param data : object containing every element needed to build the storage
     * "storage" : the storage to encrypt
     * "password" : the key to encrypt/decrypt data
     * "method" : (optional) the algorythm to use - Only sjcl available for the moment
     * @param applicant : object containing inforamtion about the person/application needing this JIO object
     */
    JIO.CryptedStorage = function(data, applicant) {
        this.storage = createStorage(data.storage, applicant);
        this.password = data.password;
    }
    JIO.CryptedStorage.prototype = {
        userNameAvailable: function(name, option) {return this.storage.userNameAvailable.apply(this.storage,arguments)},
        loadDocument: function(fileName, option) {
            var cryptedStorage = this;
            var newOption = copy(option);
            newOption.success = function(data) {
                if(option.success) {option.success(sjcl.decrypt(cryptedStorage.password,data))}//case asynchronous
            }
            var data = this.storage.loadDocument(fileName, newOption);
            return data ? sjcl.decrypt(cryptedStorage.password,data) : data //case synchronous
        },
        saveDocument: function(data, fileName, option) {
            var encryptedData = sjcl.encrypt(this.password,data);
            return this.storage.saveDocument(encryptedData, fileName, option)
        },
        deleteDocument: function(file, option) {return this.storage.deleteDocument.apply(this.storage,arguments)},
        getDocumentList: function(option) {return this.storage.getDocumentList.apply(this.storage,arguments)}
    }


/***************************************************************
*********************** AsynchronousStorage *************************/
    /**
     * Class AsynchronousStorage
     * @class manage the pending list of requests
     * @param data : object containing every element needed to build the storage :
     * "storage" : the storage to manage
     * @param applicant : object containing inforamtion about the person/application needing this JIO object
     */
    JIO.AsynchronousStorage = function(data, applicant) {
        this.storage = createStorage(data.storage, applicant);
        this.pendingList = {};//contains the list of pending actions
    }
    JIO.AsynchronousStorage.prototype = {
        userNameAvailable: function(name, option) {
            var asynchronousStorage = this;
            var requestID = this.addPendingAction(this.userNameAvailable, arguments);
            var instruction = function() {asynchronousStorage.removePendingAction(requestID)}
            option.success = addInstruction(instruction,option.success,true);
            option.errorHandler = addInstruction(instruction,option.errorHandler,true);
            return this.storage.userNameAvailable(name, option);
        },
        loadDocument: function(fileName, option) {
            var asynchronousStorage = this;
            var requestID = this.addPendingAction(this.loadDocument, arguments);
            var instruction = function() {asynchronousStorage.removePendingAction(requestID)}
            option.success = addInstruction(instruction,option.success,true);
            option.errorHandler = addInstruction(instruction,option.errorHandler,true);
            return this.storage.loadDocument(fileName, option);
        },
        saveDocument: function(data, fileName, option) {
            var asynchronousStorage = this;
            var requestID = this.addPendingAction(this.saveDocument, arguments);
            var instruction = function() {asynchronousStorage.removePendingAction(requestID)}
            option.success = addInstruction(instruction,option.success,true);
            option.errorHandler = addInstruction(instruction,option.errorHandler,true);
            return this.storage.saveDocument(data, fileName, option);
        },
        deleteDocument: function(file, option) {
            var asynchronousStorage = this;
            var requestID = this.addPendingAction(this.deleteDocument, arguments);
            var instruction = function() {asynchronousStorage.removePendingAction(requestID)}
            option.success = addInstruction(instruction,option.success,true);
            option.errorHandler = addInstruction(instruction,option.errorHandler,true);
            return this.storage.deleteDocument(file, option);
        },
        getDocumentList: function(option) {
            var asynchronousStorage = this;
            var requestID = this.addPendingAction(this.getDocumentList, arguments);
            var instruction = function() {asynchronousStorage.removePendingAction(requestID)}
            option.success = addInstruction(instruction,option.success,true);
            option.errorHandler = addInstruction(instruction,option.errorHandler,true);
            return this.storage.getDocumentList(option);
        },

        addPendingAction: function(action, argument) {
            var ID = Date.now();
            var task = {action: action, arguments:argument}
            this.getPendingList()[ID] = task;
            return ID;
        },
        removePendingAction: function(ID) {
            delete this.getPendingList()[ID];
        },
        getPendingList: function() {return this.pendingList}
    }


/***************************************************************
*********************** ReplicateStorage *************************/
    /**
     * Class ReplicateStorage
     * @class provides usual API to replicate save/load/delete in a list of storages
     * @param data : object containing every element needed to build the storage :
     * "storageList" : an array containing the different storages ([{"storage1":{...},...])
     * @param applicant : object containing inforamtion about the person/application needing this JIO object
     */
    JIO.ReplicateStorage = function(data, applicant) {
        this.storageList = [];
        for(var i = 0; i<data.storageList.length; i++) {//create each storage from the list
            this.storageList[i]=createStorage(data.storageList[i], applicant);
        }
    }
    JIO.ReplicateStorage.prototype = {

        /**
         * check if an user already exists
         * @param name : the name you want to check
         * @param option : optional object containing
         * "errorHandler" : the function to execute if an error occures
         * @return the answer of the first storage able to answer
         */
        userNameAvailable: function(name, option) {
            return tryCheckUser(this.storageList.slice());

            function tryCheckUser(storageList) {
                var storage = storageList.pop();
                var newOption = copy(option);
                newOption.errorHandler = generateErrorHandler(storageList);
                return storage.userNameAvailable(name,newOption);
            }
            function generateErrorHandler(storageList) {
                return storageList.length>0 ? function() {tryCheckUser(storageList);} : option.errorHandler;
            }
        },


        /**
         * load a document in the storage
         * @param fileName : the name of the file where the data will be stored
         * @param option : optional object containing
         * "errorHandler" : the function to execute if an error occures
         * @return the content of the document sent by the first storage able to
         */
        loadDocument: function(fileName, option) {
            return tryLoadDocument(this.storageList.slice());

            function tryLoadDocument(storageList) {
                var storage = storageList.pop();
                var newOption = copy(option);
                newOption.errorHandler = generateErrorHandler(storageList);
                return storage.loadDocument(fileName,newOption);
            }
            function generateErrorHandler(storageList) {
                return storageList.length>0 ? function() {tryLoadDocument(storageList);} : option.errorHandler;
            }
        },


        /**
         * save the document in each storage (simply delegate the call to each storage. Perhaps the success function sould be executed only once?)
         * @param data : the data to store
         * @param fileName : the name of the file where the data will be stored
         * @param option : optional object
         */
        saveDocument: function(data, fileName, option) {
            for(var element in this.storageList) {
                this.storageList[element].saveDocument(data, fileName, option);
            }
        },


        /**
         * delete the document in each storage (simply delegate the call to each storage. Perhaps the success function sould be executed only once?)
         * @param file : fileName or array of fileNames to delete
         * @param option : optional object
         */
        deleteDocument: function(file, option) {
            for(var element in this.storageList) {
                this.storageList[element].deleteDocument(file, option);
            }
        },


        /**
         * load the list of the documents in this storage
         * @param option : optional object containing
         * "errorHandler" : the function to execute if an error occures
         * @return the answer of the first storage able to answer
         * @example {"file1":{fileName:"file1",creationDate:"Tue, 23 Aug 2011 15:18:32 GMT",lastModified:"Tue, 23 Aug 2011 15:18:32 GMT"},...}
         */
        getDocumentList: function(option) {
            return tryGetDocumentList(this.storageList.slice());

            function tryGetDocumentList(storageList) {
                var storage = storageList.pop();
                var newOption = copy(option);
                newOption.errorHandler = generateErrorHandler(storageList);
                return storage.getDocumentList(newOption);
            }
            function generateErrorHandler(storageList) {
                return storageList.length>0 ? function() {tryGetDocumentList(storageList);} : option.errorHandler;
            }
        }
    }

/***************************************************************
*********************** MultipleStorage *************************/
    /**
     * Class MultipleStorage
     * @class provides usual API to save/load/delete documents in a list of storages
     * @param data : object containing every element needed to build the storage :
     * "storageList" : an object containing the different storages ({"storage1":{...},...})
     * @param applicant : object containing inforamtion about the person/application needing this JIO object
     */
    JIO.MultipleStorage = function(data, applicant) {
        this.storageList = {};//contains the different storages
        this.documentList = {};//contains the document list of each storage
        for(var storage in data.storageList) {//create each storage from the list
            this.storageList[storage]=createStorage(data.storageList[storage], applicant);
        }
    }
    JIO.MultipleStorage.prototype = {
        userNameAvailable: function(userName, option) {
            var path = userName.split("/");
            if(path.length>1) {
                var storage = path.shift();
                var name = path.join("/");
                this.storageList[storage].userNameAvailable(name,option)
            } else {
                //TODO
            }
        },//TODO  /return this.storage.userNameAvailable.apply(this.storage,arguments)},
        loadDocument: function(fileName, option) {
            var path = fileName.split("/");
            if(path.length>1) {
                var storage = path.shift();
                var name = path.join("/");
                this.storageList[storage].loadDocument(name,option)
            } else {
                //TODO : handle name conflicts
                var multipleStorage = this;
                $.each(this.storageList, function(storage){
                    if(multipleStorage.documentList[storage][fileName]) {
                        multipleStorage.storageList[storage].loadDocument(fileName,option)
                    }
                });
            }
        },
        saveDocument: function(data, fileName, option) {
            var path = fileName.split("/");
            if(path.length>1) {
                var storage = path.shift();
                var name = path.join("/");
                this.storageList[storage].saveDocument(data, name, option);
            } else {
                //TODO : decide how to choose between storages
            }
        },
        deleteDocument: function(fileName, option) {
            var path = fileName.split("/");
            if(path.length>1) {
                var storage = path.shift();
                var name = path.join("/");
                this.storageList[storage].deleteDocument(name, option)
            } else {
                var multipleStorage = this;
                $.each(this.storageList, function(storage){
                    if(multipleStorage.documentList[storage][fileName]) {
                        multipleStorage.storageList[storage].deleteDocument(fileName,option);
                        delete multipleStorage.documentList[storage][fileName]
                    }
                });
            }
        },
        getDocumentList: function(option) {
            if(option.location) {
                this.storageList[option.location].getDocumentList(option)
            } else {
                var finalList = {};
                var multipleStorage = this;
                $.each(this.storageList, function(storage){
                    var documentList = multipleStorage.documentList[storage];
                    $.each(documentList,function(fileName) {
                        finalList[storage+"/"+fileName]= copy(documentList[fileName]);
                        finalList[storage+"/"+fileName].fileName = storage+"/"+fileName;
                    })
                });
            }
        },

        updateDocumentList: function() {
            for(var storage in this.storageList) {this.documentList[storage] = this.storageList[storage].getDocumentList()}
        },
        analysePath: function(path) {
            var storage = path.shift();
            var address = path.join("/");
            return {storage: storage, address: address}
        }
    }


/************************************************************
*********************** AWSStorage ************************/
    /**
     * Class AWSStorage
     * @class provides usual API to save/load/delete documents on the Amazon Web S3
     * @param data : object containing every element needed to build the storage :
     * "userName" : the name of the user
     * @param applicant : object containing inforamtion about the person/application needing this JIO object
     * XXX: this is just a prototype
     */
    JIO.AWSStorage = function(data, applicant) {
        this.userName = data.userName;
        if(!localStorage.getItem(this.userName)) {localStorage[this.userName] = "{}"}//new user
        this.documents = JSON.parse(localStorage.getItem(this.userName));//load documents
        // HACK : re-stringify the content :
    }
    JIO.AWSStorage.prototype = {

        /**
         * check if an user already exist
         * @param name : the name you want to check
         * @return true if the name is free, false otherwise
         */
        userNameAvailable: function(name) {
          // XXX: How to check username is available and how to represent
          // an user space in a file system like AWS ?
          // XXX: how to make sure an user can not access other user's data if from the same bucket
        },


        /**
         * load a document in the storage
         * @param fileName : the name of the file where the data will be stored
         * @param option : optional object containing
         * "success" : the function to execute when the load is done
         * "errorHandler" : the function to execute if an error occures
         * @return the content of the document
         */
        loadDocument: function(fileName, option) {
            // XXX:  Load document from AWS filesystem
        },

        /**
         * save a document in the storage
         * @param data : the data to store
         * @param fileName : the name of the file where the data will be stored
         * @param option : optional object containing
         * success : the function to execute when the save is done
         * errorHandler : the function to execute if an error occures
         * overwrite : a boolean set to true if the document has to be overwritten
         * oldData : last data downloaded. Used to know if data has changed since last download and has to been merged
         */
        saveDocument: function(data, fileName, option) {
            // XXX: save document to AWS filesystem
        },

        /**
         * Delete a document or a list of documents from the storage
         * @param file : fileName or array of fileNames to delete
         * @param option : optional object containing
         * "success" : the function to execute when the delete is done
         * "errorHandler" : the function to execute if an error occures
         */
        deleteDocument: function(file, option) {
            // XXX: delete document from AWS filesystem
        },


        /**
         * load the list of the documents in this storage
         * @param option : optional object containing
         * "success" : the function to execute when the load is done
         * "errorHandler" : the function to execute if an error occures
         * @return null if the request is asynchronous, the list of documents otherwise.
         * @example {"file1":{fileName:"file1",creationDate:"Tue, 23 Aug 2011 15:18:32 GMT",lastModified:"Tue, 23 Aug 2011 15:18:32 GMT"},...}
         */
        getDocumentList: function(option) {
            // XXX: get list of documents for current user
        },


        save: function() {
            // XXX: 
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
            default:var waitedNode = null;//create a custom storage from a js file
                $.ajax({
                    url: data.location+"/storage-init.js",//url of the file describing the creation of the storage
                    type: "GET",
                    async: false,
                    dataType: "script",
                    success: function(script){var CustomStorage = eval(script);waitedNode = new CustomStorage(data)},
                    error: data.errorHandler !== undefined ? data.errorHandler : function(type) {alert("Error "+type.status+" : fail while trying to instanciate storage"+data.location);}
                });
                return waitedNode;
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

    window.JIO = JIO;//the name to use for the framework. Ex : JIO.initialize(...), JIO.loadDocument...
    
})();
