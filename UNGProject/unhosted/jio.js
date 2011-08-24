/*
 JIO: Javascript I/O. A library to load, edit, save documents to
 multiple storage backends using a common interface
 */
(function() {
    
    /**
     * load dependencies
     */
    var ready = includeJS([//files to load
        "unhosted/sjcl.js",
        "unhosted/jquery.js",
        "unhosted/base64.js"
    ],[//element to check before being ready
        $
    ]);

    //wait until dependencies are ready
    (function waitUntilLoaded() {!ready() ? setTimeout(waitUntilLoaded,50) : script();})()
    function script() {

        /**
         * JIO main object. Contains all IO methods
         */
        var JIO = {
            jioFileContent: null,//content of jio.json file
            storage: null,//the storage tree

            /**
             * prepare and return the jio object
             * @param jioData : text or json content of jio.json or method to get it
             * @param applicant : (optional) information about the person/application needing this JIO object (used to limit access)
             * @return JIO object
             */
            initialize: function(jioData, applicant) {
                switch(typeof jioData) {
                    case "string" :this.jioFileContent = jioData;break;
                    case "object" :this.jioFileContent = JSON.stringify(jioData);break;
                    case "function" :this.jioFileContent = jioData();break;
                    default:alert("Error while getting jio.json content");break;
                }
                this.storage = createStorage(JSON.parse(this.jioFileContent), applicant)//create the object allowing IO in storages
                return this;
            },

            /**
             * return the state of JIO object
             * @return true if ready, false otherwise
             */
            isReady: function() {return this.jioFileContent && this.storage},

            //IO functions
            userNameAvailable: function(name, option) {return this.storage.userNameAvailable.apply(this.storage,arguments)},
            loadDocument: function(fileName, option) {return this.storage.loadDocument.apply(this.storage,arguments)},
            saveDocument: function(data, fileName, option) {return this.storage.saveDocument.apply(this.storage,arguments)},
            deleteDocument: function(file, option) {return this.storage.deleteDocument.apply(this.storage,arguments)},
            getDocumentList: function(option) {return this.storage.getDocumentList.apply(this.storage,arguments)}

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
                    async: option.asyncronous || true,
                    success: function() {isAvailable=true;if(option.sucess) option.success();},
                    error: option.errorHandler || function(type) {if(type.status==404) {isAvailable=false;}else{alert("Error "+type.status+" : fail while trying to check "+name);}}
                });
                return isAvailable;//warning : always null if asyncronous
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
                    async: option.asyncronous || true,
                    dataType: option.type || "text",
                    headers: {Authorization: "Basic "+Base64.encode(this.userName+":"+this.applicationPassword)},
                    fields: {withCredentials: "true"},
                    success: function(content) {if(option.success) option.success(content);data=content},
                    error: option.errorHandler || function(type) {alert("Error "+type.status+" : fail while trying to load "+fileName);}
                });
                return data;//warning : always null if asyncronous
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
                var loadOption = {
                    type: option.type,
                    asynchronous: false,//TODO : try to asynchronize
                    success: function(remoteData) {
                        merge(remoteData);
                    },
                    errorHandler: function(type) {
                        if(type.status==404) {
                            save();
                        } else {
                            option.errorHandler || save();
                        }
                    }
                }
                this.loadDocument(fileName, loadOption);

                function save() {
                    $.ajax({
                        url: storage.location + "/dav/"+storage.userName+"/"+storage.applicationID+"/"+fileName,
                        type: "PUT",
                        async: option.asynchronous || true,
                        dataType: option.type || "text",
                        data: data,
                        headers: {Authorization: "Basic "+Base64.encode(storage.userName+":"+storage.applicationPassword)},
                        fields: {withCredentials: "true"},
                        success: option.success,
                        error: function(type) {
                          if(type.status==201 || type.status==204) {if(option.success) option.success();}//ajax thinks that 201 is an error...
                          else {option.errorHandler ? option.errorHandler.call(this,type) : alert("Error "+type.status+" : fail while trying to save "+fileName);}
                        }
                    });
                }

                function merge(serverData) {
                    if(option.overwrite!==false) {
                        //if(diff(oldData,serverData)) {merge(newData, serverData);}
                        save();
                    }
                }

            },


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
                    async: option.asynchronous || true,
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
                    async: option.asyncronous || true,
                    type: "PROPFIND",
                    dataType: "xml",
                    headers: {Authorization: "Basic "+Base64.encode(this.userName+":"+this.applicationPassword), Depth: "1"},
                    fields: {withCredentials: "true"},
                    success: function(data) {list=xml2jsonFileList(data);if(option.success) option.success(list)},
                    error: option.errorHandler || function(type) {alert("Error "+type.status+" : fail while trying to load file list");}
                });
                return list;//warning : always null if asyncronous

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
                        return option.success(doc);
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
                if(!this.documents[fileName] || option.overwrite) {
                    this.documents[fileName] = data;
                    this.save();
                    if(option.success) option.success();
                } else {
                    var error = {status: 403,message: "document already exists"};
                    if(option.errorHandler) option.errorHandler(error);
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
                oneOrEach(file,deleteFile);
                this.save();
                if(option.success) option.success();

                function deleteFile(fileName) {
                    delete this.documents[fileName];
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
                var list = this.documents;
                if(option.success) option.success(list);
                return list;
            },

            
            save: function() {
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
            this.storage = createStorage(data.storage, applicant)//create the object allowing IO in storages
            this.index = null;

            //initialize the index
            var storage = this;
            (function initialize() {//try to download jio.index
                if(this.storage) {
                    this.storage.loadDocument("jio.index","text",function(data) {storage.index = this;},function(error) {
                        if(error.status==404) {createIndex()} else {alert("error "+error.status+" while trying to download jio.index")}
                    });
                } else {//if the storage is not ready
                    setTimeout(initialize,50);
                }
            })()
            function createIndex() {//create a new index if doesn't exist
                storage.index = {}//for the moment, just consider that the folder is empty
            }
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
                return option.metaDataOnly ? this.getIndex()[fileName] : this.storage.loadDocument.apply(this.storage,arguments)
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
                var fileAlreadyExist = this.getIndex()[fileName];
                return this.storage.saveDocument(data,fileName,generateSaveOption(fileAlreadyExist));

                function generateSaveOption(fileAlreadyExist) {
                    var indexedStorage = this;
                    var saveOption = copy(option);
                    saveOption.success = function(data) {
                        var time = Date.now();
                        indexedStorage.getIndex()[fileName] = option.metaData;
                        indexedStorage.getIndex()[fileName].lastModified = time;
                        indexedStorage.getIndex()[fileName].fileName = fileName;
                        if(!fileAlreadyExist) {indexedStorage.getIndex()[fileName].creationDate = time;}
                        indexedStorage.save();
                        option.success(data);
                    }
                    return saveOption
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
                var newOption = copy(option);
                newOption.success = function() {
                    if(option.success) {option.success()}
                    oneOrEach(file,deleteFileData);
                    indexedStorage.save();
                }
                this.storage.deleteDocument(file, newOption);

                function deleteFileData(fileName) {
                    delete this.getIndex()[fileName];
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
                var list = this.getIndex();
                if(option.success) option.success(list);
                return list;
            },

            getIndex: function() {return this.index},
            save: function() {
                this.storage.saveDocument(JSON.stringify(this.getIndex()), "jio.index", "text", true);
            }
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
            this.storageList = {};
            for(var storage in data.storageList) {//create each storage from the list
                this.storageList[storage]=createStorage(data.storageList[storage], applicant);
            }
        }
        JIO.MultipleStorage.prototype = {
            userNameAvailable: function(userName, option) {
                if(option.location) {//TODO : think about writing location as a string "a/b/c" in case of spate of multipleStorages
                    this.storageList[option.location].userNameAvailable(userName,option)
                } else {
                    //TODO
                }
            },//TODO  /return this.storage.userNameAvailable.apply(this.storage,arguments)},
            loadDocument: function(fileName, option) {
                if(option.location) {
                    this.storageList[option.location].loadDocument(fileName,option)
                } else {
                    //TODO
                }
            },
            saveDocument: function(data, fileName, option) {
                if(option.location) {
                    this.storageList[option.location].saveDocument(data, fileName, option)
                } else {
                    //TODO
                }
            },
            deleteDocument: function(fileName, option) {
                if(option.location) {
                    this.storageList[option.location].deleteDocument(fileName, option)
                } else {
                    //TODO
                }
            },
            getDocumentList: function(option) {
                if(option.location) {
                    this.storageList[option.location].getDocumentList(option)
                } else {
                    //TODO
                }
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
                case "index":return new JIO.IndexedStorage(data, applicant);break;
                case "multiple":return new JIO.MultipleStorage(data, applicant);break;
                case "replicate":return new JIO.ReplicateStorage(data, applicant);break;
                //etc
                default:var waitedNode = null;//create a custom storage from a js file
                    $.ajax({
                        url: data.location+"/storage-init.js",//url of the file describing the creation of the storage
                        type: "GET",
                        async: false,
                        dataType: "script",
                        success: function(script){var CustomStorage = eval(script);waitedNode = new CustomStorage(data)},
                        error: data.errorHandler || function(type) {alert("Error "+type.status+" : fail while trying to instanciate storage"+data.location);}
                    });
                    return waitedNode;
                    break;
            }
        }

        /**
         * return a shallow copy of the object parameter
         * @param object : the object to copy
         * @return a shallow copy of the object
         */
        function copy(object) {
            $.extend({}, object);
        }

        /**
         * delegate a function to a non-object element, or to each element of an array of non-object elements
         * @param element : a non-object element, or an array of non-object elements
         * @param f : function to apply
         */
        function oneOrEach(element,f) {
            typeof element != "object" ? f(element) : $.each(element,function(index, fileName) {f(fileName);})
        }

        /**
         * include js files
         * @param url : path or array of paths of the js file(s)
         * @param flag : (optional) array of elements allowing to know if dependencies are ready
         * @return a ready function which returns true only if the dependencies are ready
         * @example : includeJS("jquery.js",[$]);
         */
        function includeJS(url,flag) {
            oneOrEach(url,includeElement);
            return function() {
                return checkArray(flag.slice());
            }

            function includeElement(element) {//include a js file
                var head = window.document.getElementsByTagName('head')[0];
                var script = window.document.createElement('script');
                script.setAttribute('src', url);
                script.setAttribute('type', 'text/javascript');
                head.appendChild(script);
            }
            function checkElement(element) {//check if a script is ready
                switch(typeof element) {
                    case "function" : return element.call(this);break;
                    case "undefined" : return false;break;
                    case "object" : return true;
                }
            }
            function checkArray(array) {//recursive function to check if elements are ready
                if(!array) return true;
                var head = array.pop();
                return checkElement(head) && checkArray(array);
            }
        }

        window.JIO = JIO;//the name to use for the framework. Ex : JIO.initialize(...)
    }
    
})();
