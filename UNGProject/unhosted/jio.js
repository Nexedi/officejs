/*
 JIO: Javascript I/O. A library to load, edit, save documents to
 multiple storage backends using a common interface
 */
(function() {
    
    /**
     * load dependencies
     */
    includeJS("unhosted/sjcl.js");
    includeJS("unhosted/jquery.js");
    includeJS("unhosted/base64.js");


    /**
     * JIO main object. Contains all IO methods
     */
    var JIO = {
        jioFileContent: null,//content of jio.json file
        storage: null,//the storage tree
        
        /**
         * prepare and return the jio object
         * @param jioData : content of jio.json or method to get it
         * @param applicant : (optional) information about the person/application needing this JIO object (allow limited access)
         * @return JIO object
         */
        initialize: function(jioData, applicant) {
            switch(typeof jioData) {
                case "string" : this.jioFileContent = jioData;break;
                case "object" : this.jioFileContent = JSON.stringify(jioData);break;
                case "function" : this.jioFileContent = jioData();break;
                default: alert("Error while getting jio.json content");break;
            }
            this.storage = createStorage(JSON.parse(this.jioFileContent), applicant)//create the object allowing IO in storages
            return this;
        },

        //IO
        getLocation: function() {return this.location},
        userNameAvailable: function() {return this.storage.userNameAvailable.apply(this.storage,arguments)},
        loadDocument: function() {return this.storage.loadDocument.apply(this.storage,arguments)},
        saveDocument: function() {return this.storage.saveDocument.apply(this.storage,arguments)},
        deleteDocument: function() {return this.storage.deleteDocument.apply(this.storage,arguments)},
        getDocumentList: function() {return this.storage.getDocumentList.apply(this.storage,arguments)}

    }




    /*************************************************************************
    ************************* specific storages *****************************/

    JIO.DAVStorage = function(data, applicant) {
        this.userName = data.userName;
        this.applicationID = applicant.ID;
        this.applicationPassword = data.password;
        this.location = data.location;
        this.provider = data.provider;//like "gmail.com", "yahoo.fr"...
    }
    JIO.DAVStorage.prototype = {
        userNameAvailable: function(success, errorHandler, asyncronous) {
            var isAvailable = null;
            $.ajax({
                url: this.location + "/dav/"+this.userName,
                type: "HEAD",
                async: asyncronous || true,
                success: function() {isAvailable=true;instruction();},
                error: errorHandler || function(type) {alert("Error "+type.status+" : fail while trying to load "+file);}
            });
            return isAvailable;//warning : always null if asyncronous
        },
        loadDocument: function(file, type, instruction, errorHandler, asyncronous) {
            var data = null;
            $.ajax({
                url: this.location + "/dav/"+this.userName+"/"+this.applicationID+"/"+file,
                type: "GET",
                async: asyncronous || true,
                dataType: type,
                headers: {Authorization: "Basic "+Base64.encode(this.userName+":"+this.applicationPassword)},
                fields: {withCredentials: "true"},
                success: function(content) {instruction(content);data=content},
                error: errorHandler || function(type) {alert("Error "+type.status+" : fail while trying to load "+file);}
            });
            return data;//warning : always null if asyncronous
        },
        saveDocument: function(newData, file, type, overwrite, instruction, oldData, errorHandler) {
            var storage = this;
            //check if already exists and for diffs
            this.loadDocument(file, type,
                function(serverData) {
                    merge(serverData);
                },
                function(type) {
                    if(type.status==404) {
                        save();
                    } else {
                        errorHandler || save();
                    }
                },
                false
            );

            function save() {
                $.ajax({
                    url: storage.location + "/dav/"+storage.userName+"/"+storage.applicationID+"/"+file,
                    type: "PUT",
                    dataType: type,
                    data: newData,
                    headers: {Authorization: "Basic "+Base64.encode(storage.userName+":"+storage.applicationPassword)},
                    fields: {withCredentials: "true"},
                    success: instruction,
                    error: function(type) {
                      if(type.status==201 || type.status==204) {instruction();}//ajax thinks that 201 is an error...
                      else {error: errorHandler || function(type) {alert("Error "+type.status+" : fail while trying to save "+file);}}
                    }
                });
            }

            function merge(serverData) {
                if(overwrite) {
                    //if(diff(oldData,serverData)) {merge(newData, serverData);}
                    save();
                }
            }

        },

        /**
         * Delete a document or a list of documents
         * @param file : fileName or array ogf fileNames
         * @param instruction : instructions to execute when done
         * @param errorHandler : what to do if the request fails
         */
        deleteDocument: function(file, instruction, errorHandler) {
            var storage = this;
            typeof file!=Object ? deleteFile(file) : $.each(file,function(index, fileName) {deleteFile(fileName);});
            
            function deleteFile(fileName) {
                $.ajax({
                    url: storage.location + "/dav/"+storage.userName+"/"+storage.applicationID+"/"+fileName,
                    type: "DELETE",
                    headers: {Authorization: "Basic "+Base64.encode(this.userName+":"+this.applicationPassword)},
                    fields: {withCredentials: "true"},
                    success: instruction,
                    error: function(type) {
                        if(type.status==201 || type.status==204) {instruction();}//ajax thinks that 201 is an error...
                        else {error: errorHandler || function(type) {alert("Error "+type.status+" : fail while trying to delete "+file);}}
                    }
                });
            }
        },

        getDocumentList: function(instruction, errorHandler, asyncronous) {
            var storage = this;
            var list = null;
            $.ajax({
                url: storage.location + "/dav/"+storage.userName+"/"+storage.applicationID+"/",
                async: asyncronous || true,
                type: "PROPFIND",
                dataType: "xml",
                headers: {Authorization: "Basic "+Base64.encode(this.userName+":"+this.applicationPassword), Depth: "1"},
                fields: {withCredentials: "true"},
                success: function(data) {list=xml2jsonFileList(data);instruction(list)},
                error: function(type) {error: errorHandler || function(type) {alert("Error "+type.status+" : fail while trying to load file list");}}
            });
            return list;//warning : always null if asyncronous

            function xml2jsonFileList(xmlData) {
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
            function xml2jsonFile(xmlData) {
                var file = {};
                file.lastModified = $($("lp1\\:getlastmodified",xmlData).get(0)).text();
                file.creationDate = $($("lp1\\:creationdate",xmlData).get(0)).text();
                return file;
            }
            function fileName(xmlData) {
                var string = $($("D\\:href",xmlData).get(0)).text()
                var T = string.split("/");
                return T[T.length-1] ? T[T.length-1] : T[T.length-2]+"/";
            }
        }
    }

    /**
     * Class LocalStorage
     * this class provides usual API to save/load/delete documents on the localStorage
     */
    JIO.LocalStorage = function(userName) {
        this.userName = userName;
        if(!localStorage.getItem(this.userName)) {localStorage[this.userName] = {}}//new user
        this.documents = JSON.parse(localStorage.getItem(this.userName));//load documents
        this.save = function() {
            localStorage[this.userName]=JSON.stringify(this.documents);
        }
    }
    JIO.LocalStorage.prototype = {
        userNameAvailable: function(userName) {return localStorage.userName;},
        loadDocument: function(file, type, instruction) {
            var doc = this.userName[file];
            if(instruction) instruction(doc);
            return doc;
        },
        saveDocument: function(newData, file, type, overwrite, instruction) {
            if(!this.documents[file] || overwrite) {
                this.documents[file] = newData;
            }
            this.save();
            if(instruction) instruction();
        },
        deleteDocument: function(file, instruction) {
            typeof file!=Object ? deleteFile(file) : $.each(file,function(index, fileName) {deleteFile(fileName);});
            function deleteFile(fileName) {
                delete this.documents[fileName];
            }
            this.save();
            if(instruction) instruction();
        },
        getDocumentList: function(instruction) {
            var list = this.documents;
            if(instruction) instruction(list);
            return list;
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
            case "dav": return new JIO.DAVStorage(data, applicant);break;
            //case "multipleStorage": return new JIO.MultipleStorage(data, applicantID, applicantPassword);break;
            //case "replicateStorage": return new JIO.ReplicateStorage(data, applicantID, applicantPassword);break;
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

    function includeJS(file) {
        var object = document.createElement("script");
        object.type = "text/javascript";
        object.src = file;
        $("head").append(object);
    }

    window.JIO = JIO;//the name to use for the framework. Ex : JIO.initialize(...)
    
})();
