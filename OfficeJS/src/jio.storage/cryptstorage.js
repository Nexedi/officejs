var newCryptedStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'handler' ), priv = {};

    var is_valid_storage = spec.storage || false;

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
    priv.encrypt = function (data,callback,index) {
        // end with a callback in order to improve encrypt to an
        // asynchronous encryption.
        var tmp = sjcl.encrypt (priv.username+':'+
                                priv.password, data,
                                priv.encrypt_param_object);
        callback(JSON.parse(tmp).ct,index);
    };
    priv.decrypt = function (data,callback,index,key) {
        var tmp, param = $.extend(true,{},priv.decrypt_param_object);
        param.ct = data || '';
        param = JSON.stringify (param);
        try {
            tmp = sjcl.decrypt (priv.username+':'+
                                priv.password,
                                param);
        } catch (e) {
            callback({status:0,statusText:'Decrypt Fail',
                      message:'Unable to decrypt.'},index,key);
            return;
        }
        callback(tmp,index,key);
    };

    /**
     * Saves a document.
     * @method saveDocument
     */
    that.saveDocument = function (command) {
        var new_file_name, new_file_content,
        _1 = function () {
            priv.encrypt(command.getPath(),function(res) {
                new_file_name = res;
                _2();
            });
        },
        _2 = function () {
            priv.encrypt(command.getContent(),function(res) {
                new_file_content = res;
                _3();
            });
        },
        _3 = function () {
            var settings = command.cloneOption(), newcommand;
            settings.onResponse = function (){};
            settings.onDone = function () { that.done(); };
            settings.onFail = function (r) { that.fail(r); };
            newcommand = that.newCommand(
                'saveDocument',
                {path:new_file_name,content:new_file_content,option:settings});
            that.addJob (
                that.newStorage( priv.secondstorage_spec ),
                newcommand );
        };
        _1();
    }; // end saveDocument

    /**
     * Loads a document.
     * @method loadDocument
     */
    that.loadDocument = function (command) {
        var new_file_name, option,
        _1 = function () {
            priv.encrypt(command.getPath(),function(res) {
                new_file_name = res;
                _2();
            });
        },
        _2 = function () {
            var settings = command.cloneOption(), newcommand;
            settings.onResponse = function(){};
            settings.onFail = loadOnFail;
            settings.onDone = loadOnDone;
            newcommand = that.newCommand (
                'loadDocument',
                {path:new_file_name,option:settings});
            that.addJob (
                that.newStorage ( priv.secondstorage_spec ), newcommand );
        },
        loadOnDone = function (result) {
            result.name = command.getPath();
            if (command.getOption('metadata_only')) {
                that.done(result);
            } else {
                priv.decrypt (result.content, function(res){
                    if (typeof res === 'object') {
                        that.fail({status:0,statusText:'Decrypt Fail',
                                   message:'Unable to decrypt'});
                    } else {
                        result.content = res;
                        // content only: the second storage should
                        // manage content_only option, so it is not
                        // necessary to manage it.
                        that.done(result);
                    }
                });
            }
        },
        loadOnFail = function (error) {
            // NOTE : we can re create an error object instead of
            // keep the old ex:status=404,message="document 1y59gyl8g
            // not found in localStorage"...
            that.fail(error);
        };
        _1();
    }; // end loadDocument

    /**
     * Gets a document list.
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        var new_job, i, l, cpt = 0, array, ok = true,
        _1 = function () {
            var newcommand = command.clone();
            newcommand.onResponseDo (getListOnResponse);
            newcommand.onDoneDo (function(){});
            newcommand.onFailDo (function(){});
            that.addJob (
                that.newStorage ( priv.secondstorage_spec ), newcommand );
        },
        getListOnResponse = function (result) {
            if (result.status.isDone()) {
                array = result.value;
                for (i = 0, l = array.length; i < l; i+= 1) {
                    // cpt--;
                    priv.decrypt (array[i].name,
                                  lastOnResponse,i,'name');
                    // priv.decrypt (array[i].content,
                    //               lastOnResponse,i,'content');
                }
            } else {
                that.fail(result.error);
            }
        },
        lastOnResponse = function (res,index,key) {
            var tmp;
            cpt++;
            if (typeof res === 'object') {
                if (ok) {
                    ok = false;
                    that.fail({status:0,statusText:'Decrypt Fail',
                               message:'Unable to decrypt.'});
                }
                ok = false;
                return;
            }
            array[index][key] = res;
            if (cpt === l && ok) {
                // this is the last callback
                that.done(array);
            }
        };
        _1();
    }; // end getDocumentList

    /**
     * Removes a document.
     * @method removeDocument
     */
    that.removeDocument = function (command) {
        var new_file_name,
        _1 = function () {
            priv.encrypt(command.getPath(),function(res) {
                new_file_name = res;
                _2();
            });
        },
        _2 = function () {
            var cloned_option = command.cloneOption();
            cloned_option.onResponse = removeOnResponse;
            cloned_option.onFail = function () {};
            cloned_option.onDone = function () {};
            that.addJob(that.newStorage(priv.secondstorage_spec),
                        that.newCommand(
                            'removeDocument',
                            {path:new_file_name,
                             option:cloned_option}));
        },
        removeOnResponse = function (result) {
            if (result.status.isDone()) {
                that.done();
            } else {
                that.fail(result.error);
            }
        };
        _1();
    };
    return that;
};
Jio.addStorageType('crypt', newCryptedStorage);
