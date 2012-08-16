/*! JIO Storage - v0.1.0 - 2012-08-16
* Copyright (c) 2012 Nexedi; Licensed  */

(function(LocalOrCookieStorage, $, Base64, sjcl, hex_sha256, Jio) {

var newLocalStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'base' ), priv = {};

    priv.secureDocId = function (string) {
        var split = string.split('/'), i;
        if (split[0] === '') {
            split = split.slice(1);
        }
        for (i = 0; i < split.length; i+= 1) {
            if (split[i] === '') { return ''; }
        }
        return split.join('%2F');
    };
    priv.convertSlashes = function (string) {
        return string.split('/').join('%2F');
    };

    priv.restoreSlashes = function (string) {
        return string.split('%2F').join('/');
    };

    priv.username = spec.username || '';
    priv.secured_username = priv.convertSlashes(priv.username);
    priv.applicationname = spec.applicationname || 'untitled';
    priv.secured_applicationname = priv.convertSlashes(priv.applicationname);

    var storage_user_array_name = 'jio/local_user_array';
    var storage_file_array_name = 'jio/local_file_name_array/' +
        priv.secured_username + '/' + priv.secured_applicationname;

    var super_serialized = that.serialized;
    that.serialized = function() {
        var o = super_serialized();
        o.applicationname = priv.applicationname;
        o.username = priv.username;
        return o;
    };

    that.validateState = function() {
        if (priv.secured_username) {
            return '';
        }
        return 'Need at least one parameter: "username".';
    };

    /**
     * Returns a list of users.
     * @method getUserArray
     * @return {array} The list of users.
     */
    priv.getUserArray = function () {
        return LocalOrCookieStorage.getItem(
            storage_user_array_name) || [];
    };

    /**
     * Adds a user to the user list.
     * @method addUser
     * @param  {string} user_name The user name.
     */
    priv.addUser = function (user_name) {
        var user_array = priv.getUserArray();
        user_array.push(user_name);
        LocalOrCookieStorage.setItem(storage_user_array_name,
                                     user_array);
    };

    /**
     * checks if a user exists in the user array.
     * @method userExists
     * @param  {string} user_name The user name
     * @return {boolean} true if exist, else false
     */
    priv.userExists = function (user_name) {
        var user_array = priv.getUserArray(), i, l;
        for (i = 0, l = user_array.length; i < l; i += 1) {
            if (user_array[i] === user_name) {
                return true;
            }
        }
        return false;
    };

    /**
     * Returns the file names of all existing files owned by the user.
     * @method getFileNameArray
     * @return {array} All the existing file paths.
     */
    priv.getFileNameArray = function () {
        return LocalOrCookieStorage.getItem(
            storage_file_array_name) || [];
    };

    /**
     * Adds a file name to the local file name array.
     * @method addFileName
     * @param  {string} file_name The new file name.
     */
    priv.addFileName = function (file_name) {
        var file_name_array = priv.getFileNameArray();
        file_name_array.push(file_name);
        LocalOrCookieStorage.setItem(storage_file_array_name,
                                     file_name_array);
    };

    /**
     * Removes a file name from the local file name array.
     * @method removeFileName
     * @param  {string} file_name The file name to remove.
     */
    priv.removeFileName = function (file_name) {
        var i, l, array = priv.getFileNameArray(), new_array = [];
        for (i = 0, l = array.length; i < l; i+= 1) {
            if (array[i] !== file_name) {
                new_array.push(array[i]);
            }
        }
        LocalOrCookieStorage.setItem(storage_file_array_name,
                                     new_array);
    };

    priv.checkSecuredDocId = function (secured_docid,docid,method) {
        if (!secured_docid) {
            that.error({
                status:403,statusText:'Method Not Allowed',
                error:'method_not_allowed',
                message:'Cannot '+method+' "'+docid+
                    '", file name is incorrect.',
                reason:'Cannot '+method+' "'+docid+
                    '", file name is incorrect'
            });
            return false;
        }
        return true;
    };

    that.post = function (command) {
        that.put(command);
    };

    /**
     * Saves a document in the local storage.
     * It will store the file in 'jio/local/USR/APP/FILE_NAME'.
     * @method put
     */
    that.put = function (command) {
        // wait a little in order to simulate asynchronous saving
        setTimeout (function () {
            var secured_docid = priv.secureDocId(command.getDocId()),
            doc = null, path =
                'jio/local/'+priv.secured_username+'/'+
                priv.secured_applicationname+'/'+
                secured_docid;

            if (!priv.checkSecuredDocId(
                secured_docid,command.getDocId(),'put')) {return;}
            // reading
            doc = LocalOrCookieStorage.getItem(path);
            if (!doc) {
                // create document
                doc = {
                    _id: command.getDocId(),
                    content: command.getDocContent(),
                    _creation_date: Date.now(),
                    _last_modified: Date.now()
                };
                if (!priv.userExists(priv.secured_username)) {
                    priv.addUser (priv.secured_username);
                }
                priv.addFileName(secured_docid);
            } else {
                // overwriting
                doc.content = command.getDocContent();
                doc._last_modified = Date.now();
            }
            LocalOrCookieStorage.setItem(path, doc);
            that.success ({ok:true,id:command.getDocId()});
        });
    }; // end put

    /**
     * Loads a document from the local storage.
     * It will load file in 'jio/local/USR/APP/FILE_NAME'.
     * You can add an 'options' object to the job, it can contain:
     * - metadata_only {boolean} default false, retrieve the file metadata
     *   only if true.
     * @method get
     */
    that.get = function (command) {

        setTimeout(function () {
            var secured_docid = priv.secureDocId(command.getDocId()),
            doc = null;

            if (!priv.checkSecuredDocId(
                secured_docid,command.getDocId(),'get')) {return;}
            doc = LocalOrCookieStorage.getItem(
                'jio/local/'+priv.secured_username+'/'+
                    priv.secured_applicationname+'/'+secured_docid);
            if (!doc) {
                that.error ({status:404,statusText:'Not Found.',
                             error:'not_found',
                             message:'Document "'+ command.getDocId() +
                             '" not found.',
                             reason:'missing'});
            } else {
                if (command.getOption('metadata_only')) {
                    delete doc.content;
                }
                that.success (doc);
            }
        });
    }; // end get

    /**
     * Gets a document list from the local storage.
     * It will retreive an array containing files meta data owned by
     * the user.
     * @method allDocs
     */
    that.allDocs = function (command) {

        setTimeout(function () {
            var new_array = [], array = [], i, l, k = 'key',
            path = 'jio/local/'+priv.secured_username+'/'+
                priv.secured_applicationname, file_object = {};

            array = priv.getFileNameArray();
            for (i = 0, l = array.length; i < l; i += 1) {
                file_object =
                    LocalOrCookieStorage.getItem(path+'/'+array[i]);
                if (file_object) {
                    if (command.getOption('metadata_only')) {
                        new_array.push ({
                            id:file_object._id,key:file_object._id,value:{
                                _creation_date:file_object._creation_date,
                                _last_modified:file_object._last_modified}});
                    } else {
                        new_array.push ({
                            id:file_object._id,key:file_object._id,value:{
                                content:file_object.content,
                                _creation_date:file_object._creation_date,
                                _last_modified:file_object._last_modified}});
                    }
                }
            }
            that.success ({total_rows:new_array.length,rows:new_array});
        });
    }; // end allDocs

    /**
     * Removes a document from the local storage.
     * It will also remove the path from the local file array.
     * @method remove
     */
    that.remove = function (command) {
        setTimeout (function () {
            var secured_docid = priv.secureDocId(command.getDocId()),
            path = 'jio/local/'+
                priv.secured_username+'/'+
                priv.secured_applicationname+'/'+
                secured_docid;
            if (!priv.checkSecuredDocId(
                secured_docid,command.getDocId(),'remove')) {return;}
            // deleting
            LocalOrCookieStorage.deleteItem(path);
            priv.removeFileName(secured_docid);
            that.success ({ok:true,id:command.getDocId()});
        });
    }; // end remove

    return that;
};
Jio.addStorageType('local', newLocalStorage);

var newDAVStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'base' ), priv = {};

    priv.secureDocId = function (string) {
        var split = string.split('/'), i;
        if (split[0] === '') {
            split = split.slice(1);
        }
        for (i = 0; i < split.length; i+= 1) {
            if (split[i] === '') { return ''; }
        }
        return split.join('%2F');
    };
    priv.convertSlashes = function (string) {
        return string.split('/').join('%2F');
    };

    priv.restoreSlashes = function (string) {
        return string.split('%2F').join('/');
    };


    priv.username = spec.username || '';
    priv.secured_username = priv.convertSlashes(priv.username);
    priv.applicationname = spec.applicationname || 'untitled';
    priv.secured_applicationname = priv.convertSlashes(priv.applicationname);
    priv.url = spec.url || '';
    priv.password = spec.password || ''; // TODO : is it secured ?

    var super_serialized = that.serialized;
    that.serialized = function() {
        var o = super_serialized();
        o.username = priv.username;
        o.applicationname = priv.applicationname;
        o.url = priv.url;
        o.password = priv.password; // TODO : not realy secured...
        return o;
    };

    /**
     * If some other parameters is needed, it returns an error message.
     * @method validateState
     * @return {string} '' -> ok, 'message' -> error
     */
    that.validateState = function() {
        if (priv.secured_username && priv.url) {
            return '';
        }
        return 'Need at least 2 parameters: "username" and "url".';
    };

    priv.newAsyncModule = function () {
        var async = {};
        async.call = function (obj,function_name,arglist) {
            obj._wait = obj._wait || {};
            if (obj._wait[function_name]) {
                obj._wait[function_name]--;
                return function () {};
            }
            // ok if undef or 0
            arglist = arglist || [];
            return obj[function_name].apply(obj[function_name],arglist);
        };
        async.neverCall = function (obj,function_name) {
            obj._wait = obj._wait || {};
            obj._wait[function_name] = -1;
        };
        async.wait = function (obj,function_name,times) {
            obj._wait = obj._wait || {};
            obj._wait[function_name] = times;
        };
        async.end = function () {
            async.call = function(){};
        };
        return async;
    };

    that.post = function (command) {
        that.put(command);
    };

    /**
     * Saves a document in the distant dav storage.
     * @method put
     */
    that.put = function (command) {

        var secured_docid = priv.secureDocId(command.getDocId());

        $.ajax ( {
            url: priv.url + '/' +
                priv.secured_username + '/' +
                priv.secured_applicationname + '/' +
                secured_docid,
            type: 'PUT',
            data: command.getDocContent(),
            async: true,
            dataType: 'text', // TODO is it necessary ?
            headers: {'Authorization':'Basic '+Base64.encode(
                priv.username+':'+priv.password)},
            // xhrFields: {withCredentials: 'true'}, // cross domain
            success: function () {
                that.success({ok:true,id:command.getDocId()});
            },
            error: function (type) {
                // TODO : make statusText to lower case and add '_'
                type.error = type.statusText;
                type.reason = 'Cannot save "' + command.getDocId() + '"';
                type.message = type.reason + '.';
                that.retry(type);
            }
        } );
    }; // end put

    /**
     * Loads a document from a distant dav storage.
     * @method get
     */
    that.get = function (command) {
        var secured_docid = priv.secureDocId(command.getDocId()),
        doc = {}, getContent = function () {
            $.ajax ( {
                url: priv.url + '/' +
                    priv.secured_username + '/' +
                    priv.secured_applicationname + '/' +
                    secured_docid,
                type: "GET",
                async: true,
                dataType: 'text', // TODO is it necessary ?
                headers: {'Authorization':'Basic '+Base64.encode(
                    priv.username + ':' + priv.password )},
                // xhrFields: {withCredentials: 'true'}, // cross domain
                success: function (content) {
                    doc.content = content;
                    that.success(doc);
                },
                error: function (type) {
                    type.error = type.statusText; // TODO : to lower case
                    if (type.status === 404) {
                        type.message = 'Document "' +
                            command.getDocId() +
                            '" not found.';
                        type.reason = 'missing';
                        that.error(type);
                    } else {
                        type.reason =
                            'An error occured when trying to get "' +
                            command.getDocId() + '"';
                        type.message = type.reason + '.';
                        that.retry(type);
                    }
                }
            } );
        };
        doc._id = command.getDocId();
        // NOTE : if (command.getOption('content_only') { return getContent(); }
        // Get properties
        $.ajax ( {
            url: priv.url + '/' +
                priv.secured_username + '/' +
                priv.secured_applicationname + '/' +
                secured_docid,
            type: "PROPFIND",
            async: true,
            dataType: 'xml',
            headers: {'Authorization':'Basic '+Base64.encode(
                priv.username + ':' + priv.password )},
            success: function (xmlData) {
                // doc.last_modified =
                $(xmlData).find(
                    'lp1\\:getlastmodified, getlastmodified'
                ).each( function () {
                    doc._last_modified =
                        new Date($(this).text()).getTime();
                });
                $(xmlData).find(
                    'lp1\\:creationdate, creationdate'
                ).each( function () {
                    doc._creation_date =
                        new Date($(this).text()).getTime();
                });
                if (!command.getOption('metadata_only')) {
                    getContent();
                } else {
                    that.success(doc);
                }
            },
            error: function (type) {
                if (type.status === 404) {
                    type.message = 'Cannot find "' + command.getDocId() +
                        '" informations.';
                    type.reason = 'missing';
                    that.error(type);
                } else {
                    type.reason = 'Cannot get "' + command.getDocId() +
                        '" informations';
                    type.message = type.reason + '.';
                    that.retry(type);
                }
            }
        } );
    };

    /**
     * Gets a document list from a distant dav storage.
     * @method allDocs
     */
    that.allDocs = function (command) {
        var rows = [],
        am = priv.newAsyncModule(), o = {};

        o.getContent = function (file) {
            $.ajax ( {
                url: priv.url + '/' +
                    priv.secured_username + '/' +
                    priv.secured_applicationname + '/' +
                    priv.secureDocId(file.id),
                type: "GET",
                async: true,
                dataType: 'text', // TODO : is it necessary ?
                headers: {'Authorization':'Basic '+
                          Base64.encode(priv.username +':'+
                                        priv.password)},
                success: function (content) {
                    file.value.content = content;
                    // WARNING : files can be disordered because
                    // of asynchronous action
                    rows.push (file);
                    am.call(o,'success');
                },
                error: function (type) {
                    type.error = type.statusText; // TODO : to lower case
                    type.reason = 'Cannot get a document '+
                        'content from DAVStorage';
                    type.message = type.message + '.';
                    am.call(o,'error',[type]);
                }
            });
        };
        o.getDocumentList = function () {
            $.ajax ( {
                url: priv.url + '/' +
                    priv.secured_username + '/' +
                    priv.secured_applicationname + '/',
                async: true,
                type: 'PROPFIND',
                dataType: 'xml',
                headers: {'Authorization': 'Basic '+Base64.encode(
                    priv.username + ':' + priv.password ), Depth: '1'},
                success: function (xmlData) {
                    var response = $(xmlData).find(
                        'D\\:response, response'
                    );
                    var len = response.length;
                    if (len === 1) {
                        return am.call(o,'success');
                    } else {
                        am.wait(o,'success',len-2);
                    }
                    response.each( function(i,data){
                        if(i>0) { // exclude parent folder
                            var file = {value:{}};
                            $(data).find('D\\:href, href').each(function(){
                                var split = $(this).text().split('/');
                                file.id = split[split.length-1];
                                file.id = priv.restoreSlashes(file.id);
                                file.key = file.id;
                            });
                            if (file.id === '.htaccess' ||
                                file.id === '.htpasswd') { return; }
                            $(data).find(
                                'lp1\\:getlastmodified, getlastmodified'
                            ).each(function () {
                                file.value._last_modified =
                                    new Date($(this).text()).getTime();
                            });
                            $(data).find(
                                'lp1\\:creationdate, creationdate'
                            ).each(function () {
                                file.value._creation_date =
                                    new Date($(this).text()).getTime();
                            });
                            if (!command.getOption ('metadata_only')) {
                                am.call(o,'getContent',[file]);
                            } else {
                                rows.push (file);
                                am.call(o,'success');
                            }
                        }
                    });
                },
                error: function (type) {
                    if (type.status === 404) {
                        type.error = 'not_found';
                        type.reason = 'missing';
                        am.call(o,'error',[type]);
                    } else {
                        type.error = type.statusText; // TODO : to lower case
                        type.reason =
                            'Cannot get a document list from DAVStorage';
                        type.message = type.reason + '.';
                        am.call(o,'retry',[type]);
                    }
                }
            } );
        };
        o.retry = function (error) {
            am.neverCall(o,'retry');
            am.neverCall(o,'success');
            am.neverCall(o,'error');
            that.retry(error);
        };
        o.error = function (error) {
            am.neverCall(o,'retry');
            am.neverCall(o,'success');
            am.neverCall(o,'error');
            that.error(error);
        };
        o.success = function () {
            am.neverCall(o,'retry');
            am.neverCall(o,'success');
            am.neverCall(o,'error');
            that.success({total_rows:rows.length,
                          rows:rows});
        };
        am.call (o,'getDocumentList');
    }; // end allDocs

    /**
     * Removes a document from a distant dav storage.
     * @method remove
     */
    that.remove = function (command) {

        var secured_docid = priv.secureDocId(command.getDocId());

        $.ajax ( {
            url: priv.url + '/' +
                priv.secured_username + '/' +
                priv.secured_applicationname + '/' +
                secured_docid,
            type: "DELETE",
            async: true,
            headers: {'Authorization':'Basic '+Base64.encode(
                priv.username + ':' + priv.password )},
            // xhrFields: {withCredentials: 'true'}, // cross domain
            success: function (data,state,type) {
                that.success({ok:true,id:command.getDocId()});
            },
            error: function (type,state,statusText) {
                if (type.status === 404) {
                    //that.success({ok:true,id:command.getDocId()});
                    type.error = 'not_found';
                    type.reason = 'missing';
                    type.message = 'Cannot remove missing file.';
                    that.error(type);
                } else {
                    type.reason = 'Cannot remove "' + that.getDocId() + '"';
                    type.message = type.reason + '.';
                    that.retry(type);
                }
            }
        } );
    };

    return that;
};
Jio.addStorageType('dav', newDAVStorage);

var newReplicateStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'handler' ), priv = {};

    priv.return_value_array = [];
    priv.storagelist = spec.storagelist || [];
    priv.nb_storage = priv.storagelist.length;

    var super_serialized = that.serialized;
    that.serialized = function () {
        var o = super_serialized();
        o.storagelist = priv.storagelist;
        return o;
    };

    that.validateState = function () {
        if (priv.storagelist.length === 0) {
            return 'Need at least one parameter: "storagelist" '+
                'containing at least one storage.';
        }
        return '';
    };

    priv.isTheLast = function (error_array) {
        return (error_array.length === priv.nb_storage);
    };

    priv.doJob = function (command,errormessage,nodocid) {
        var done = false, error_array = [], i,
        error = function (err) {
            if (!done) {
                error_array.push(err);
                if (priv.isTheLast(error_array)) {
                    that.error ({
                        status:207,
                        statusText:'Multi-Status',
                        error:'multi_status',
                        message:'All '+errormessage+
                            (!nodocid?' "'+command.getDocId()+'"':' ') +
                            ' requests have failed.',
                        reason:'requests fail',
                        array:error_array
                    });
                }
            }
        },
        success = function (val) {
            if (!done) {
                done = true;
                that.success (val);
            }
        };
        for (i = 0; i < priv.nb_storage; i+= 1) {
            var cloned_option = command.cloneOption();
            that.addJob (command.getLabel(),priv.storagelist[i],
                         command.cloneDoc(),cloned_option,success,error);
        }
    };

    that.post = function (command) {
        priv.doJob (command,'post');
        that.end();
    };

    /**
     * Save a document in several storages.
     * @method put
     */
    that.put = function (command) {
        priv.doJob (command,'put');
        that.end();
    };

    /**
     * Load a document from several storages, and send the first retreived
     * document.
     * @method get
     */
    that.get = function (command) {
        priv.doJob (command,'get');
        that.end();
    };

    /**
     * Get a document list from several storages, and returns the first
     * retreived document list.
     * @method allDocs
     */
    that.allDocs = function (command) {
        priv.doJob (command,'allDocs',true);
        that.end();
    };

    /**
     * Remove a document from several storages.
     * @method remove
     */
    that.remove = function (command) {
        priv.doJob (command,'remove');
        that.end();
    };

    return that;
};
Jio.addStorageType('replicate', newReplicateStorage);

var newIndexStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'handler' ), priv = {};

    var validatestate_secondstorage = spec.storage || false;
    priv.secondstorage_spec = spec.storage || {type:'base'};
    priv.secondstorage_string = JSON.stringify (priv.secondstorage_spec);

    var storage_object_name = 'jio/indexed_storage_object';
    var storage_file_object_name = 'jio/indexed_file_object/'+
        priv.secondstorage_string;

    var super_serialized = that.serialized;
    that.serialized = function () {
        var o = super_serialized();
        o.storage = priv.secondstorage_spec;
        return o;
    };

    that.validateState = function () {
        if (!validatestate_secondstorage) {
            return 'Need at least one parameter: "storage" '+
                'containing storage specifications.';
        }
        return '';
    };

    priv.secureDocId = function (string) {
        var split = string.split('/'), i;
        if (split[0] === '') {
            split = split.slice(1);
        }
        for (i = 0; i < split.length; i+= 1) {
            if (split[i] === '') { return ''; }
        }
        return split.join('%2F');
    };

    priv.indexStorage = function () {
        var obj = LocalOrCookieStorage.getItem (storage_object_name) || {};
        obj[priv.secondstorage_spec] = new Date().getTime();
        LocalOrCookieStorage.setItem (storage_object_name,obj);
    };

    priv.formatToFileObject = function (row) {
        var k, obj = {_id:row.id};
        for (k in row.value) {
            obj[k] = row.value[k];
        }
        return obj;
    };

    priv.allDocs = function (files_object) {
        var k, obj = {rows:[]}, i = 0;
        for (k in files_object) {
            obj.rows[i] = {};
            obj.rows[i].value = files_object[k];
            obj.rows[i].id = obj.rows[i].key = obj.rows[i].value._id;
            delete obj.rows[i].value._id;
            i ++;
        }
        obj.total_rows = obj.rows.length;
        return obj;
    };

    priv.setFileArray = function (file_array) {
        var i, obj = {};
        for (i = 0; i < file_array.length; i+= 1) {
            obj[file_array[i].id] = priv.formatToFileObject(file_array[i]);
        }
        LocalOrCookieStorage.setItem (storage_file_object_name,obj);
    };

    priv.getFileObject = function (docid) {
        var obj = LocalOrCookieStorage.getItem (storage_file_object_name) || {};
        return obj[docid];
    };

    priv.addFile = function (file_obj) {
        var obj = LocalOrCookieStorage.getItem (storage_file_object_name) || {};
        obj[file_obj._id] = file_obj;
        LocalOrCookieStorage.setItem (storage_file_object_name,obj);
    };

    priv.removeFile = function (docid) {
        var obj = LocalOrCookieStorage.getItem (storage_file_object_name) || {};
        delete obj[docid];
        LocalOrCookieStorage.setItem (storage_file_object_name,obj);
    };

    /**
     * updates the storage.
     * It will retreive all files from a storage. It is an asynchronous task
     * so the update can be on going even if IndexedStorage has already
     * returned the result.
     * @method update
     */
    priv.update = function () {
        var success = function (val) {
            priv.setFileArray(val.rows);
        };
        that.addJob ('allDocs', priv.secondstorage_spec,null,
                     {max_retry:3},success,function(){});
    };

    that.post = function (command) {
        that.put(command);
    };

    /**
     * Saves a document.
     * @method put
     */
    that.put = function (command) {
        var cloned_doc = command.cloneDoc(),
        cloned_option = command.cloneOption(),
        success = function (val) {
            priv.update();
            that.success(val);
        },
        error = function (err) {
            that.error(err);
        };
        priv.indexStorage();
        that.addJob ('put',priv.secondstorage_spec,cloned_doc,
                     cloned_option,success,error);
    }; // end put

    /**
     * Loads a document.
     * @method get
     */
    that.get = function (command) {
        var file_array,
        success = function (val) {
            that.success(val);
        },
        error = function (err) {
            that.error(err);
        },
        get = function () {
            var cloned_option = command.cloneOption();
            that.addJob ('get',priv.secondstorage_spec,command.cloneDoc(),
                         cloned_option,success,error);
            that.end();
        };
        priv.indexStorage();
        priv.update();
        if (command.getOption('metadata_only')) {
            setTimeout(function () {
                var file_obj = priv.getFileObject(command.getDocId());
                if (file_obj &&
                    (file_obj._last_modified ||
                     file_obj._creation_date)) {
                    that.success (file_obj);
                } else {
                    get();
                }
            });
        } else {
            get();
        }
    }; // end get

    /**
     * Gets a document list.
     * @method allDocs
     */
    that.allDocs = function (command) {
        var obj = LocalOrCookieStorage.getItem (storage_file_object_name);
        if (obj) {
            priv.update();
            setTimeout(function (){
                that.success (priv.allDocs(obj));
            });
        } else {
            var success = function (val) {
                priv.setFileArray(val.rows);
                that.success(val);
            },
            error = function (err) {
                that.error(err);
            };
            that.addJob ('allDocs', priv.secondstorage_spec,null,
                         command.cloneOption(),success,error);
        }
    }; // end allDocs

    /**
     * Removes a document.
     * @method remove
     */
    that.remove = function (command) {
        var success = function (val) {
            priv.removeFile(command.getDocId());
            priv.update();
            that.success(val);
        },
        error = function (err) {
            that.error(err);
        };
        that.addJob ('remove',priv.secondstorage_spec,command.cloneDoc(),
                     command.cloneOption(),success,error);
    }; // end remove

    return that;
};
Jio.addStorageType ('indexed', newIndexStorage);

var newCryptedStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'handler' ), priv = {};

    var is_valid_storage = (spec.storage?true:false);

    priv.username = spec.username || '';
    priv.password = spec.password || '';
    priv.secondstorage_spec = spec.storage || {type:'base'};
    priv.secondstorage_string = JSON.stringify (priv.secondstorage_string);

    var super_serialized = that.serialized;
    that.serialized = function () {
        var o = super_serialized();
        o.username = priv.username;
        o.password = priv.password; // TODO : unsecured !!!
        o.storage = priv.secondstorage_string;
        return o;
    };

    that.validateState = function () {
        if (priv.username && is_valid_storage) {
            return '';
        }
        return 'Need at least two parameters: "username" and "storage".';
    };

    // TODO : IT IS NOT SECURE AT ALL!
    // WE MUST REWORK CRYPTED STORAGE!
    priv.encrypt_param_object = {
        "iv":"kaprWwY/Ucr7pumXoTHbpA",
        "v":1,
        "iter":1000,
        "ks":256,
        "ts":128,
        "mode":"ccm",
        "adata":"",
        "cipher":"aes",
        "salt":"K4bmZG9d704"
    };
    priv.decrypt_param_object = {
        "iv":"kaprWwY/Ucr7pumXoTHbpA",
        "ks":256,
        "ts":128,
        "salt":"K4bmZG9d704"
    };
    priv.encrypt = function (data,callback) {
        // end with a callback in order to improve encrypt to an
        // asynchronous encryption.
        var tmp = sjcl.encrypt (priv.username+':'+
                                priv.password, data,
                                priv.encrypt_param_object);
        callback(JSON.parse(tmp).ct);
    };
    priv.decrypt = function (data,callback) {
        var tmp, param = $.extend(true,{},priv.decrypt_param_object);
        param.ct = data || '';
        param = JSON.stringify (param);
        try {
            tmp = sjcl.decrypt (priv.username+':'+
                                priv.password,
                                param);
        } catch (e) {
            callback({status:403,statusText:'Forbidden',error:'forbidden',
                      message:'Unable to decrypt.',reason:'unable to decrypt'});
            return;
        }
        callback(undefined,tmp);
    };

    priv.newAsyncModule = function () {
        var async = {};
        async.call = function (obj,function_name,arglist) {
            obj._wait = obj._wait || {};
            if (obj._wait[function_name]) {
                obj._wait[function_name]--;
                return function () {};
            }
            // ok if undef or 0
            arglist = arglist || [];
            setTimeout(function (){
                obj[function_name].apply(obj[function_name],arglist);
            });
        };
        async.neverCall = function (obj,function_name) {
            obj._wait = obj._wait || {};
            obj._wait[function_name] = -1;
        };
        async.wait = function (obj,function_name,times) {
            obj._wait = obj._wait || {};
            obj._wait[function_name] = times;
        };
        async.end = function () {
            async.call = function(){};
        };
        return async;
    };

    that.post = function (command) {
        that.put (command);
    };

    /**
     * Saves a document.
     * @method put
     */
    that.put = function (command) {
        var new_file_name, new_file_content, am = priv.newAsyncModule(), o = {};
        o.encryptFilePath = function () {
            priv.encrypt(command.getDocId(),function(res) {
                new_file_name = res;
                am.call(o,'save');
            });
        };
        o.encryptFileContent = function () {
            priv.encrypt(command.getDocContent(),function(res) {
                new_file_content = res;
                am.call(o,'save');
            });
        };
        o.save = function () {
            var success = function (val) {
                val.id = command.getDocId();
                that.success (val);
            },
            error = function (err) {
                that.error (err);
            },
            cloned_doc = command.cloneDoc();
            cloned_doc._id = new_file_name;
            cloned_doc.content = new_file_content;
            that.addJob ('put',priv.secondstorage_spec,cloned_doc,
                         command.cloneOption(),success,error);
        };
        am.wait(o,'save',1);
        am.call(o,'encryptFilePath');
        am.call(o,'encryptFileContent');
    }; // end put

    /**
     * Loads a document.
     * @method get
     */
    that.get = function (command) {
        var new_file_name, option, am = priv.newAsyncModule(), o = {};
        o.encryptFilePath = function () {
            priv.encrypt(command.getDocId(),function(res) {
                new_file_name = res;
                am.call(o,'get');
            });
        };
        o.get = function () {
            that.addJob('get',priv.secondstorage_spec,new_file_name,
                        command.cloneOption(),o.success,o.error);
        };
        o.success = function (val) {
            val._id = command.getDocId();
            if (command.getOption('metadata_only')) {
                that.success (val);
            } else {
                priv.decrypt (val.content, function(err,res){
                    if (err) {
                        that.error(err);
                    } else {
                        val.content = res;
                        that.success (val);
                    }
                });
            }
        };
        o.error = function (error) {
            that.error(error);
        };
        am.call(o,'encryptFilePath');
    }; // end get

    /**
     * Gets a document list.
     * @method allDocs
     */
    that.allDocs = function (command) {
        var result_array = [], am = priv.newAsyncModule(), o = {};
        o.allDocs = function () {
            that.addJob ('allDocs', priv.secondstorage_spec, null,
                         command.cloneOption(), o.onSuccess, o.error);
        };
        o.onSuccess = function (val) {
            if (val.total_rows === 0) {
                return am.call(o,'success');
            }
            result_array = val.rows;
            var i, decrypt = function (c) {
                priv.decrypt (result_array[c].id,function (err,res) {
                    if (err) {
                        am.call(o,'error',[err]);
                    } else {
                        result_array[c].id = res;
                        result_array[c].key = res;
                        am.call(o,'success');
                    }
                });
                if (!command.getOption('metadata_only')) {
                    priv.decrypt (
                        result_array[c].value.content,
                        function (err,res) {
                            if (err) {
                                am.call(o,'error',[err]);
                            } else {
                                result_array[c].value.content = res;
                                am.call(o,'success');
                            }
                        });
                }
            };
            if (command.getOption('metadata_only')) {
                am.wait(o,'success',val.total_rows*1-1);
            } else {
                am.wait(o,'success',val.total_rows*2-1);
            }
            for (i = 0; i < result_array.length; i+= 1) {
                decrypt(i);
            }
        };
        o.error = function (error) {
            am.end();
            that.error (error);
        };
        o.success = function () {
            am.end();
            that.success ({total_rows:result_array.length,rows:result_array});
        };
        am.call(o,'allDocs');
    }; // end allDocs

    /**
     * Removes a document.
     * @method remove
     */
    that.remove = function (command) {
        var new_file_name, o = {};
        o.encryptDocId = function () {
            priv.encrypt(command.getDocId(),function(res) {
                new_file_name = res;
                o.removeDocument();
            });
        };
        o.removeDocument = function () {
            var cloned_doc = command.cloneDoc();
            cloned_doc._id = new_file_name;
            that.addJob ('remove', priv.secondstorage_spec, cloned_doc,
                         command.cloneOption(), o.success, that.error);
        };
        o.success = function (val) {
            val.id = command.getDocId();
            that.success (val);
        };
        o.encryptDocId();
    }; // end remove

    return that;
};
Jio.addStorageType('crypt', newCryptedStorage);

var newConflictManagerStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'handler' ), priv = {};
    spec = spec || {};
    my = my || {};

    var storage_exists = (spec.storage?true:false);
    priv.secondstorage_spec = spec.storage || {type:'base'};
    priv.secondstorage_string = JSON.stringify (priv.secondstorage_spec);

    var local_namespace = 'jio/conflictmanager/'+
        priv.secondstorage_string+'/';

    var empty_fun = function (){};

    var super_serialized = that.serialized;
    that.serialized = function () {
        var o = super_serialized();
        o.storage = priv.secondstorage_spec;
        return o;
    };

    that.validateState = function () {
        if (storage_exists) {
            return '';
        }
        return 'Need at least one parameter: "storage".';
    };

    priv.getDistantMetadata = function (command,path,success,error) {
        var cloned_option = command.cloneOption ();
        cloned_option.metadata_only = false;
        cloned_option.max_retry = command.getOption('max_retry') || 3;
        that.addJob ('get',priv.secondstorage_spec,path,cloned_option,
                     success, error);
    };

    priv.saveMetadataToDistant = function (command,path,content,success,error) {
        // max_retry:0 // inf
        that.addJob ('put',priv.secondstorage_spec,
                     {_id:path,content:JSON.stringify (content)},
                     command.cloneOption(),success,error);
    };

    priv.saveNewRevision = function (command,path,content,success,error) {
        that.addJob ('put',priv.secondstorage_spec,{_id:path,content:content},
                     command.cloneOption(),success,error);
    };

    priv.loadRevision = function (command,path,success,error) {
        that.addJob('get',priv.secondstorage_spec,path,command.cloneOption(),
                    success, error);
    };

    priv.deleteAFile = function (command,path,success,error) {
        var cloned_option = command.cloneOption();
        cloned_option.max_retry = 0; // inf
        that.addJob ('remove',priv.secondstorage_spec,{_id:path},
                     command.cloneOption(), success, error);
    };

    priv.chooseARevision = function (metadata) {
        var tmp_last_modified = 0, ret_rev = '', rev;
        for (rev in metadata) {
            if (tmp_last_modified <
                metadata[rev]._last_modified) {
                tmp_last_modified =
                    metadata[rev]._last_modified;
                ret_rev = rev;
            }
        }
        return ret_rev;
    };

    priv._revs = function (metadata,revision) {
        if (metadata[revision]) {
            return {start:metadata[revision]._revisions.length,
                    ids:metadata[revision]._revisions};
        } else {
            return null;
        }
    };

    priv._revs_info = function (metadata) {
        var k, l = [];
        for (k in metadata) {
            l.push({
                rev:k,status:(metadata[k]?(
                    metadata[k]._deleted?'deleted':'available'):'missing')
            });
        }
        return l;
    };

    priv.solveConflict = function (doc,option,param) {
        var o = {}, am = priv.newAsyncModule(),

        command = param.command,
        metadata_file_path = param.docid + '.metadata',
        current_revision = '',
        current_revision_file_path = '',
        metadata_file_content = null,
        on_conflict = false, conflict_object = {total_rows:0,rows:[]},
        on_remove = param._deleted,
        previous_revision = param.previous_revision,
        previous_revision_content_object = null,
        now = new Date(),
        failerror;

        o.getDistantMetadata = function (){
            priv.getDistantMetadata (
                command, metadata_file_path,
                function (result) {
                    var previous_revision_number =
                        parseInt(previous_revision.split('-')[0],10);
                    metadata_file_content = JSON.parse (result.content);
                    // set current revision
                    current_revision = (previous_revision_number + 1) + '-' +
                        hex_sha256 ('' + doc.content +
                                    previous_revision +
                                    JSON.stringify (metadata_file_content));
                    current_revision_file_path = param.docid + '.' +
                        current_revision;
                    previous_revision_content_object = metadata_file_content[
                        previous_revision] || {};
                    if (!on_remove) {
                        am.wait(o,'saveMetadataOnDistant',1);
                        am.call(o,'saveNewRevision');
                    }
                    am.call(o,'previousUpdateMetadata');
                },function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.saveNewRevision = function (){
            priv.saveNewRevision (
                command, current_revision_file_path, doc.content,
                function (result) {
                    am.call(o,'saveMetadataOnDistant');
                }, function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.previousUpdateMetadata = function () {
            var i;
            for (i = 0; i < param.key.length; i+= 1) {
                delete metadata_file_content[param.key[i]];
            }
            am.call(o,'checkForConflicts');
        };
        o.checkForConflicts = function () {
            var rev;
            for (rev in metadata_file_content) {
                var revision_index;
                on_conflict = true;
                failerror = {
                    status:409,error:'conflict',
                    statusText:'Conflict',reason:'document update conflict',
                    message:'There is one or more conflicts'
                };
                break;
            }
            am.call(o,'updateMetadata');
        };
        o.updateMetadata = function (){
            var revision_history, id = '';
            id = current_revision.split('-'); id.shift(); id = id.join('-');
            revision_history = previous_revision_content_object._revisions;
            revision_history.unshift(id);
            metadata_file_content[current_revision] = {
                _creation_date:previous_revision_content_object._creation_date||
                    now.getTime(),
                _last_modified: now.getTime(),
                _revisions: revision_history,
                _conflict: on_conflict,
                _deleted: on_remove
            };
            if (on_conflict) {
                conflict_object =
                    priv.createConflictObject(
                        command, metadata_file_content, current_revision
                    );
            }
            am.call(o,'saveMetadataOnDistant');
        };
        o.saveMetadataOnDistant = function (){
            priv.saveMetadataToDistant(
                command, metadata_file_path, metadata_file_content,
                function (result) {
                    am.call(o,'deleteAllConflictingRevision');
                    if (on_conflict) {
                        am.call(o,'error');
                    } else {
                        am.call(o,'success');
                    }
                },function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.deleteAllConflictingRevision = function (){
            var i;
            for (i = 0; i < param.key.length; i+= 1) {
                priv.deleteAFile (
                    command, param.docid+'.'+param.key[i], empty_fun,empty_fun);
            }
        };
        o.success = function (){
            var a = {ok:true,id:param.docid,rev:current_revision};
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            if (option.revs) {
                a.revisions = priv._revs(metadata_file_content,
                                         current_revision);
            }
            if (option.revs_info) {
                a.revs_info = priv._revs_info(metadata_file_content);
            }
            if (option.conflicts) {
                a.conflicts = conflict_object;
            }
            param.success(a);
        };
        o.error = function (error){
            var err = error || failerror ||
                {status:0,statusText:'Unknown',error:'unknown_error',
                 message:'Unknown error.',reason:'unknown error'};
            if (current_revision) {
                err.rev = current_revision;
            }
            if (option.revs) {
                err.revisions = priv._revs(metadata_file_content,
                                           current_revision);
            }
            if (option.revs_info) {
                err.revs_info = priv._revs_info(metadata_file_content);
            }
            if (option.conflicts) {
                err.conflicts = conflict_object;
            }
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            param.error(err);
        };
        am.call(o,'getDistantMetadata');
    };

    priv.createConflictObject = function (command, metadata, revision) {
        return {
            total_rows:1,
            rows:[priv.createConflictRow(command,command.getDocId(),
                                         metadata,revision)]
        };
    };

    priv.getParam = function (list) {
        var param = {}, i = 0;
        if (typeof list[i] === 'string') {
            param.content = list[i];
            i ++;
        }
        if (typeof list[i] === 'object') {
            param.options = list[i];
            i ++;
        } else {
            param.options = {};
        }
        param.callback = function (err,val){};
        param.success = function (val) {
            param.callback(undefined,val);
        };
        param.error = function (err) {
            param.callback(err,undefined);
        };
        if (typeof list[i] === 'function') {
            if (typeof list[i+1] === 'function') {
                param.success = list[i];
                param.error = list[i+1];
            } else {
                param.callback = list[i];
            }
        }
        return param;
    };

    priv.createConflictRow = function (command, docid, metadata, revision) {
        var row = {id:docid,key:[],value:{
            _solveConflict: function (/*content, option, success, error*/) {
                var param = {}, got = priv.getParam(arguments);
                if (got.content === undefined) {
                    param._deleted = true;
                } else {
                    param._deleted = false;
                }
                param.success = got.success;
                param.error = got.error;
                param.previous_revision = revision;
                param.docid = docid;
                param.key = row.key;
                param.command = command.clone();
                return priv.solveConflict (
                    {_id:docid,content:got.content,_rev:revision},
                    got.options,param
                );
            }
        }}, k;
        for (k in metadata) {
            row.key.push(k);
        }
        return row;
    };

    priv.newAsyncModule = function () {
        var async = {};
        async.call = function (obj,function_name,arglist) {
            obj._wait = obj._wait || {};
            if (obj._wait[function_name]) {
                obj._wait[function_name]--;
                return empty_fun;
            }
            // ok if undef or 0
            arglist = arglist || [];
            setTimeout(function(){
                obj[function_name].apply(obj[function_name],arglist);
            });
        };
        async.neverCall = function (obj,function_name) {
            obj._wait = obj._wait || {};
            obj._wait[function_name] = -1;
        };
        async.wait = function (obj,function_name,times) {
            obj._wait = obj._wait || {};
            obj._wait[function_name] = times;
        };
        async.end = function () {
            async.call = empty_fun;
        };
        return async;
    };

    that.post = function (command) {
        that.put (command);
    };

    /**
     * Save a document and can manage conflicts.
     * @method put
     */
    that.put = function (command) {
        var o = {}, am = priv.newAsyncModule(),

        metadata_file_path = command.getDocId() + '.metadata',
        current_revision = '',
        current_revision_file_path = '',
        metadata_file_content = null,
        on_conflict = false, conflict_object = {total_rows:0,rows:[]},
        previous_revision = command.getDocInfo('_rev') || '0',
        previous_revision_file_path = command.getDocId() + '.' +
            previous_revision,
        now = new Date(),
        failerror;

        o.getDistantMetadata = function (){
            priv.getDistantMetadata (
                command,metadata_file_path,
                function (result) {
                    var previous_revision_number =
                        parseInt(previous_revision.split('-')[0],10);
                    metadata_file_content = JSON.parse (result.content);
                    // set current revision
                    current_revision = (previous_revision_number + 1) + '-' +
                        hex_sha256 ('' + command.getDocContent() +
                                    previous_revision +
                                    JSON.stringify (metadata_file_content));
                    current_revision_file_path = command.getDocId() + '.' +
                        current_revision;
                    am.wait(o,'saveMetadataOnDistant',1);
                    am.call(o,'saveNewRevision');
                    am.call(o,'checkForConflicts');
                },function (error) {
                    if (error.status === 404) {
                        current_revision = '1-' +
                            hex_sha256 (command.getDocContent());
                        current_revision_file_path = command.getDocId() + '.' +
                            current_revision;
                        am.wait(o,'saveMetadataOnDistant',1);
                        am.call(o,'saveNewRevision');
                        am.call(o,'createMetadata');
                    } else {
                        am.call(o,'error',[error]);
                    }
                }
            );
        };
        o.saveNewRevision = function (){
            priv.saveNewRevision (
                command,current_revision_file_path,command.getDocContent(),
                function (result) {
                    am.call(o,'saveMetadataOnDistant');
                }, function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.checkForConflicts = function () {
            var rev;
            for (rev in metadata_file_content) {
                if (rev !== previous_revision) {
                    on_conflict = true;
                    failerror = {
                        status:409,error:'conflict',
                        statusText:'Conflict',reason:'document update conflict',
                        message:'Document update conflict.'
                    };
                    break;
                }
            }
            am.call(o,'updateMetadata');
        };
        o.createMetadata = function (){
            var id = current_revision;
            id = id.split('-'); id.shift(); id = id.join('-');
            metadata_file_content = {};
            metadata_file_content[current_revision] = {
                _creation_date: now.getTime(),
                _last_modified: now.getTime(),
                _revisions: [id],
                _conflict: false,
                _deleted: false
            };
            am.call(o,'saveMetadataOnDistant');
        };
        o.updateMetadata = function (){
            var previous_creation_date, revision_history = [], id = '';
            if (metadata_file_content[previous_revision]) {
                previous_creation_date = metadata_file_content[
                    previous_revision]._creation_date;
                revision_history = metadata_file_content[
                    previous_revision]._revisions;
                delete metadata_file_content[previous_revision];
            }
            id = current_revision.split('-'); id.shift(); id = id.join('-');
            revision_history.unshift(id);
            metadata_file_content[current_revision] = {
                _creation_date: previous_creation_date || now.getTime(),
                _last_modified: now.getTime(),
                _revisions: revision_history,
                _conflict: on_conflict,
                _deleted: false
            };
            if (on_conflict) {
                conflict_object =
                    priv.createConflictObject(
                        command, metadata_file_content, current_revision
                    );
            }
            am.call(o,'saveMetadataOnDistant');
        };
        o.saveMetadataOnDistant = function (){
            priv.saveMetadataToDistant(
                command, metadata_file_path, metadata_file_content,
                function (result) {
                    am.call(o,'deletePreviousRevision');
                    if (on_conflict) {
                        am.call(o,'error');
                    } else {
                        am.call(o,'success');
                    }
                },function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.deletePreviousRevision = function (){
            if (previous_revision !== '0' /*&& !on_conflict*/) {
                priv.deleteAFile (
                    command, previous_revision_file_path,
                    empty_fun,empty_fun);
            }
        };
        o.success = function () {
            var a = {ok:true,id:command.getDocId(),rev:current_revision};
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            if (command.getOption('revs')) {
                a.revisions = priv._revs(metadata_file_content,
                                         current_revision);
            }
            if (command.getOption('revs_info')) {
                a.revs_info = priv._revs_info(metadata_file_content);
            }
            if (command.getOption('conflicts')) {
                a.conflicts = conflict_object;
            }
            that.success(a);
        };
        o.error = function (error) {
            var err = error || failerror ||
                {status:0,statusText:'Unknown',error:'unknown_error',
                 message:'Unknown error.',reason:'unknown error'};
            if (current_revision) {
                err.rev = current_revision;
            }
            if (command.getOption('revs')) {
                err.revisions = priv._revs(metadata_file_content,
                                           current_revision);
            }
            if (command.getOption('revs_info')) {
                err.revs_info = priv._revs_info(metadata_file_content);
            }
            if (command.getOption('conflicts')) {
                err.conflicts = conflict_object;
            }
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            that.error(err);
        };
        am.call(o,'getDistantMetadata');
    }; // end put

    /**
     * Load a document from several storages, and send the first retreived
     * document.
     * @method get
     */
    that.get = function (command) {
        var o = {}, am = priv.newAsyncModule(),

        metadata_file_path = command.getDocId() + '.metadata',
        current_revision = command.getOption('rev') || '',
        metadata_file_content = null,
        metadata_only = command.getOption('metadata_only'),
        on_conflict = false, conflict_object = {total_rows:0,rows:[]},
        now = new Date(),
        doc = {_id:command.getDocId()},
        call404 = function (message) {
            am.call(o,'error',[{
                status:404,statusText:'Not Found',error:'not_found',
                message:message,reason:message
            }]);
        };

        o.getDistantMetadata = function (){
            priv.getDistantMetadata (
                command,metadata_file_path,
                function (result) {
                    metadata_file_content = JSON.parse (result.content);
                    if (!metadata_only) {
                        am.wait(o,'success',1);
                    }
                    am.call(o,'affectMetadata');
                    am.call(o,'checkForConflicts');
                },function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.affectMetadata = function () {
            if (current_revision) {
                if (!metadata_file_content[current_revision]) {
                    return call404('Document revision does not exists.');
                }
            } else {
                current_revision = priv.chooseARevision(metadata_file_content);
            }
            doc._last_modified =
                metadata_file_content[current_revision]._last_modified;
            doc._creation_date =
                metadata_file_content[current_revision]._creation_date;
            doc._rev = current_revision;
            if (command.getOption('revs')) {
                doc._revisions = priv._revs(metadata_file_content,
                                            current_revision);
            }
            if (command.getOption('revs_info')) {
                doc._revs_info = priv._revs_info(metadata_file_content);
            }
            if (metadata_only) {
                am.call(o,'success');
            } else {
                am.call(o,'loadRevision');
            }
        };
        o.loadRevision = function (){
            if (!current_revision ||
                metadata_file_content[current_revision]._deleted) {
                return call404('Document has been removed.');
            }
            priv.loadRevision (
                command, doc._id+'.'+current_revision,
                function (result) {
                    doc.content = result.content;
                    am.call(o,'success');
                }, function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.checkForConflicts = function () {
            if (metadata_file_content[current_revision].conflict) {
                on_conflict = true;
                conflict_object =
                    priv.createConflictObject(
                        command,
                        metadata_file_content,
                        current_revision
                    );
            }
            if (command.getOption('conflicts')) {
                doc._conflicts = conflict_object;
            }
            am.call(o,'success');
        };
        o.success = function (){
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            that.success(doc);
        };
        o.error = function (error){
            var gooderror = error || {status:0,statusText:'Unknown',
                                      message:'Unknown error.'};
            if (on_conflict) {
                gooderror.conflict_object = conflict_object;
            }
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            that.error(gooderror);
        };
        am.call(o,'getDistantMetadata');
    };

    /**
     * Get a document list from several storages, and returns the first
     * retreived document list.
     * @method allDocs
     */
    that.allDocs = function (command) {
        var o = {}, am = priv.newAsyncModule(),
        metadata_only = command.getOption('metadata_only'),
        result_list = [], conflict_object = {total_rows:0,rows:[]},
        nb_loaded_file = 0,
        success_count = 0, success_max = 0;
        o.retreiveList = function () {
            var cloned_option = command.cloneOption (),
            success = function (result) {
                am.call(o,'filterTheList',[result]);
            },error = function (error) {
                am.call(o,'error',[error]);
            };
            cloned_option.metadata_only = true;
            that.addJob ('allDocs',priv.secondstorage_spec,null,cloned_option,
                         success,error);
        };
        o.filterTheList = function (result) {
            var i;
            success_max ++;
            for (i = 0; i < result.total_rows; i+= 1) {
                var splitname = result.rows[i].id.split('.') || [];
                if (splitname.length > 0 &&
                    splitname[splitname.length-1] === 'metadata') {
                    success_max ++;
                    splitname.length --;
                    am.call(o,'loadMetadataFile',[splitname.join('.')]);
                }
            }
            am.call(o,'success');
        };
        o.loadMetadataFile = function (path) {
            priv.getDistantMetadata (
                command, path+'.metadata',
                function (data) {
                    data = JSON.parse (data.content);
                    var revision = priv.chooseARevision(data);
                    if (!data[revision]._deleted) {
                        am.call(
                            o,'loadFile',[path,revision,data]
                        );
                    } else {
                        am.call(o,'success');
                    }
                },function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.loadFile = function (path,revision,data) {
            var doc = {
                id: path,key: path,value:{
                    _last_modified:data[revision]._last_modified,
                    _creation_date:data[revision]._creation_date,
                    _rev:revision
                }
            };
            if (command.getOption('revs')) {
                doc.value._revisions = priv._revs(data,revision);
            }
            if (command.getOption('revs_info')) {
                doc.value._revs_info = priv._revs_info(data,revision);
            }
            if (command.getOption('conflicts')) {
                if (data[revision]._conflict) {
                    conflict_object.total_rows ++;
                    conflict_object.rows.push(priv.createConflictRow(
                        command, path, data, revision
                    ));
                }
            }
            if (!metadata_only) {
                priv.loadRevision (
                    command,path+'.'+revision,
                    function (data) {
                        doc.content = data.content;
                        result_list.push(doc);
                        am.call(o,'success');
                    },function (error) {
                        am.call(o,'error',[error]);
                    });
            } else {
                result_list.push(doc);
                am.call(o,'success');
            }
        };
        o.success = function (){
            var obj;
            success_count ++;
            if (success_count >= success_max) {
                am.end();
                obj = {total_rows:result_list.length,rows:result_list};
                if (command.getOption('conflicts')) {
                    obj.conflicts = conflict_object;
                }
                that.success(obj);
            }
        };
        o.error = function (error){
            am.end();
            that.error(error);
        };
        am.call(o,'retreiveList');
    }; // end allDocs

    /**
     * Remove a document from several storages.
     * @method remove
     */
    that.remove = function (command) {
        var o = {}, am = priv.newAsyncModule(),

        metadata_file_path = command.getDocId() + '.metadata',
        current_revision = '',
        current_revision_file_path = '',
        metadata_file_content = null,
        on_conflict = false, conflict_object = {total_rows:0,rows:[]},
        previous_revision = command.getOption('rev') || '0',
        previous_revision_file_path = command.getDocId() + '.' +
            previous_revision,
        now = new Date(),
        failerror;

        o.getDistantMetadata = function (){
            priv.getDistantMetadata (
                command,metadata_file_path,
                function (result) {
                    metadata_file_content = JSON.parse (result.content);
                    if (previous_revision === 'last') {
                        previous_revision =
                            priv.chooseARevision (metadata_file_content);
                        previous_revision_file_path = command.getDocId() + '.' +
                            previous_revision;
                    }
                    var previous_revision_number =
                        parseInt(previous_revision.split('-')[0],10) || 0;
                    // set current revision
                    current_revision = (previous_revision_number + 1) + '-' +
                        hex_sha256 ('' + previous_revision +
                                    JSON.stringify (metadata_file_content));
                    current_revision_file_path = command.getDocId() + '.' +
                        current_revision;
                    am.call(o,'checkForConflicts');
                },function (error) {
                    if (error.status === 404) {
                        am.call(o,'error',[{
                            status:404,statusText:'Not Found',
                            error:'not_found',reason:'missing',
                            message:'Document not found.'
                        }]);
                    } else {
                        am.call(o,'error',[error]);
                    }
                }
            );
        };
        o.checkForConflicts = function () {
            var rev;
            for (rev in metadata_file_content) {
                if (rev !== previous_revision) {
                    on_conflict = true;
                    failerror = {
                        status:409,error:'conflict',
                        statusText:'Conflict',reason:'document update conflict',
                        message:'There is one or more conflicts'
                    };
                    break;
                }
            }
            am.call(o,'updateMetadata');
        };
        o.updateMetadata = function (){
            var previous_creation_date, revision_history = [], id = '';
            if (metadata_file_content[previous_revision]) {
                previous_creation_date = metadata_file_content[
                    previous_revision]._creation_date;
                revision_history = metadata_file_content[
                    previous_revision]._revisions;
                delete metadata_file_content[previous_revision];
            }
            id = current_revision;
            id = id.split('-'); id.shift(); id = id.join('-');
            revision_history.unshift(id);
            metadata_file_content[current_revision] = {
                _creation_date: previous_creation_date || now.getTime(),
                _last_modified: now.getTime(),
                _revisions: revision_history,
                _conflict: on_conflict,
                _deleted: true
            };
            if (on_conflict) {
                conflict_object =
                    priv.createConflictObject(
                        command, metadata_file_content, current_revision
                    );
            }
            am.call(o,'saveMetadataOnDistant');
        };
        o.saveMetadataOnDistant = function (){
            priv.saveMetadataToDistant(
                command, metadata_file_path, metadata_file_content,
                function (result) {
                    am.call(o,'deletePreviousRevision');
                    if (on_conflict) {
                        am.call(o,'error');
                    } else {
                        am.call(o,'success');
                    }
                },function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.deletePreviousRevision = function (){
            if (previous_revision !== '0' /*&& !on_conflict*/) {
                priv.deleteAFile (
                    command, previous_revision_file_path,
                    empty_fun,empty_fun);
            }
        };
        o.success = function (revision){
            var a = {ok:true,id:command.getDocId(),
                     rev:revision || current_revision};
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            if (command.getOption('revs')) {
                a.revisions = priv._revs(metadata_file_content,
                                         current_revision);
            }
            if (command.getOption('revs_info')) {
                a.revs_info = priv._revs_info(metadata_file_content);
            }
            if (command.getOption('conflicts')) {
                a.conflicts = conflict_object;
            }
            that.success(a);
        };
        o.error = function (error){
            var err = error || failerror ||
                {status:0,statusText:'Unknown',error:'unknown_error',
                 message:'Unknown error.',reason:'unknown error'};
            if (current_revision) {
                err.rev = current_revision;
            }
            if (command.getOption('revs')) {
                err.revisions = priv._revs(metadata_file_content,
                                           current_revision);
            }
            if (command.getOption('revs_info')) {
                err.revs_info = priv._revs_info(metadata_file_content);
            }
            if (command.getOption('conflicts')) {
                err.conflicts = conflict_object;
            }
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            that.error(err);
        };
        am.call(o,'getDistantMetadata');
    }; // end remove

    return that;
};
Jio.addStorageType('conflictmanager', newConflictManagerStorage);

}( LocalOrCookieStorage, jQuery, Base64, sjcl, hex_sha256, jio ));
