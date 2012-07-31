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
        o.password = priv.password;
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
            callback({status:0,statusText:'Decrypt Fail',
                      message:'Unable to decrypt.'});
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

    /**
     * Saves a document.
     * @method saveDocument
     */
    that.saveDocument = function (command) {
        var new_file_name, new_file_content, am = priv.newAsyncModule(), o = {};
        o.encryptFilePath = function () {
            priv.encrypt(command.getPath(),function(res) {
                new_file_name = res;
                am.call(o,'save');
            });
        };
        o.encryptFileContent = function () {
            priv.encrypt(command.getContent(),function(res) {
                new_file_content = res;
                am.call(o,'save');
            });
        };
        o.save = function () {
            var settings = command.cloneOption(), newcommand;
            settings.success = function () { that.success(); };
            settings.error = function (r) { that.error(r); };
            newcommand = that.newCommand(
                'saveDocument',
                {path:new_file_name,content:new_file_content,option:settings});
            that.addJob (
                that.newStorage( priv.secondstorage_spec ),
                newcommand );
        };
        am.wait(o,'save',1);
        am.call(o,'encryptFilePath');
        am.call(o,'encryptFileContent');
    }; // end saveDocument

    /**
     * Loads a document.
     * @method loadDocument
     */
    that.loadDocument = function (command) {
        var new_file_name, option, am = priv.newAsyncModule(), o = {};
        o.encryptFilePath = function () {
            priv.encrypt(command.getPath(),function(res) {
                new_file_name = res;
                am.call(o,'loadDocument');
            });
        };
        o.loadDocument = function () {
            var settings = command.cloneOption(), newcommand;
            settings.error = o.loadOnError;
            settings.success = o.loadOnSuccess;
            newcommand = that.newCommand (
                'loadDocument',
                {path:new_file_name,option:settings});
            that.addJob (
                that.newStorage ( priv.secondstorage_spec ), newcommand );
        };
        o.loadOnSuccess = function (result) {
            result.name = command.getPath();
            if (command.getOption('metadata_only')) {
                that.success(result);
            } else {
                priv.decrypt (result.content, function(err,res){
                    if (err) {
                        that.error(err);
                    } else {
                        result.content = res;
                        // content only: the second storage should
                        // manage content_only option, so it is not
                        // necessary to manage it.
                        that.success(result);
                    }
                });
            }
        };
        o.loadOnError = function (error) {
            // NOTE : we can re create an error object instead of
            // keep the old ex:status=404,message="document 1y59gyl8g
            // not found in localStorage"...
            that.error(error);
        };
        am.call(o,'encryptFilePath');
    }; // end loadDocument

    /**
     * Gets a document list.
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        var result_array = [], am = priv.newAsyncModule(), o = {};
        o.getDocumentList = function () {
            var settings = command.cloneOption();
            settings.success = o.getListOnSuccess;
            settings.error = o.getListOnError;
            that.addJob (
                that.newStorage ( priv.secondstorage_spec ),
                that.newCommand ( 'getDocumentList', {path:command.getPath(),
                                                      option:settings}) );
        };
        o.getListOnSuccess = function (result) {
            result_array = result;
            var i, decrypt = function (c) {
                priv.decrypt (result_array[c].name,function (err,res) {
                    if (err) {
                        am.call(o,'error',[err]);
                    } else {
                        am.call(o,'pushResult',[res,c,'name']);
                    }
                });
                if (!command.getOption('metadata_only')) {
                    priv.decrypt (result_array[c].content,function (err,res) {
                        if (err) {
                            am.call(o,'error',[err]);
                        } else {
                            am.call(o,'pushResult',[res,c,'content']);
                        }
                    });
                }
            };
            if (command.getOption('metadata_only')) {
                am.wait(o,'success',result.length-1);
            } else {
                am.wait(o,'success',result.length*2-1);
            }
            for (i = 0; i < result_array.length; i+= 1) {
                decrypt(i);
            }
        };
        o.getListOnError = function (error) {
            am.call(o,'error',[error]);
        };
        o.pushResult = function (result,index,key) {
            result_array[index][key] = result;
            am.call(o,'success');
        };
        o.error = function (error) {
            am.end();
            that.error (error);
        };
        o.success = function () {
            am.end();
            that.success (result_array);
        };
        am.call(o,'getDocumentList');
    }; // end getDocumentList

    /**
     * Removes a document.
     * @method removeDocument
     */
    that.removeDocument = function (command) {
        var new_file_name, o = {};
        o.encryptFilePath = function () {
            priv.encrypt(command.getPath(),function(res) {
                new_file_name = res;
                o.removeDocument();
            });
        };
        o.removeDocument = function () {
            var cloned_option = command.cloneOption();
            cloned_option.error = o.removeOnError;
            cloned_option.success = o.removeOnSuccess;
            that.addJob(that.newStorage(priv.secondstorage_spec),
                        that.newCommand(
                            'removeDocument',
                            {path:new_file_name,
                             option:cloned_option}));
        };
        o.removeOnSuccess = function (result) {
            that.success();
        };
        o.removeOnError = function (error) {
            that.error (error);
        };
        o.encryptFilePath();
    };
    return that;
};
Jio.addStorageType('crypt', newCryptedStorage);
