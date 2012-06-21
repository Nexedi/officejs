var newCryptedStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'handler' ), priv = {};

    priv.username = spec.username || '';
    priv.password = spec.password || '';
    priv.secondstorage_spec = spec.storage || {type:'base'};

    var super_serialized = that.serialized;
    that.serialized = function () {
        var o = super_serialized();
        o.username = priv.username;
        o.password = priv.password;
        return o;
    };

    that.validateState = function () {
        if (priv.username &&
            JSON.stringify (priv.secondstorage_spec) ===
            JSON.stringify ({type:'base'})) {
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
        var tmp = sjcl.encrypt (that.getStorageUserName()+':'+
                                that.getStoragePassword(), data,
                                priv.encrypt_param_object);
        callback(JSON.parse(tmp).ct,index);
    };
    priv.decrypt = function (data,callback,index,key) {
        var tmp, param = $.extend(true,{},priv.decrypt_param_object);
        param.ct = data || '';
        param = JSON.stringify (param);
        try {
            tmp = sjcl.decrypt (that.getStorageUserName()+':'+
                                that.getStoragePassword(),
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
        var new_file_name, newfilecontent,
        _1 = function () {
            priv.encrypt(command.getPath(),function(res) {
                new_file_name = res;
                _2();
            });
        },
        _2 = function () {
            priv.encrypt(command.getContent(),function(res) {
                newfilecontent = res;
                _3();
            });
        },
        _3 = function () {
            var settings = that.cloneOption(), newcommand, newstorage;
            settings.onResponse = function (){};
            settings.onDone = function () { that.done(); };
            settings.onFail = function (r) { that.fail(r); };
            newcommand = that.newCommand(
                {path:new_file_name,
                 content:newfilecontent,
                 option:settings});
            newstorage = that.newStorage( priv.secondstorage_spec );
            that.addJob ( newstorage, newcommand );
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
            var settings = command.cloneOption(), newcommand, newstorage;
            settings.onResponse = function(){};
            settings.onFail = loadOnFail;
            settings.onDone = loadOnDone;
            newcommand = that.newCommand (
                {path:new_file_name,
                 option:settings});
            newstorage = that.newStorage ( priv.secondstorage_spec );
            that.addJob ( newstorage, newcommand );
        },
        loadOnDone = function (result) {
            result.name = command.getPath();
            if (command.getOption('metadata_only')) {
                that.done(result);
            } else {
                priv.decrypt (result.content,function(res){
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
        loadOnFail = function (result) {
            // NOTE : we can re create an error object instead of
            // keep the old ex:status=404,message="document 1y59gyl8g
            // not found in localStorage"...
            that.fail(result);
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
            var newcommand = command.clone(),
            newstorage = that.newStorage ( priv.secondstorage_spec );
            newcommand.onResponseDo (getListOnResponse);
            newcommand.onDoneDo (function(){});
            newcommand.onFailDo (function(){});
            that.addJob ( new_job );
        },
        getListOnResponse = function (result) {
            if (result.status.isDone()) {
                array = result.return_value;
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
    that.removeDocument = function () {
        var new_job, new_file_name,
        _1 = function () {
            priv.encrypt(that.getFileName(),function(res) {
                new_file_name = res;
                _2();
            });
        },
        _2 = function () {
            new_job = that.cloneJob();
            new_job.name = new_file_name;
            new_job.storage = that.getSecondStorage();
            new_job.onResponse = removeOnResponse;
            that.addJob(new_job);
        },
        removeOnResponse = function (result) {
            if (result.status === 'done') {
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
