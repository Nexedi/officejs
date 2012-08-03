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
        cloned_option.error = error;
        cloned_option.success = success;
        var newcommand = that.newCommand(
            'loadDocument',{path:path,
                            option:cloned_option});
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      newcommand );
    };

    priv.saveMetadataToDistant = function (command,path,content,success,error) {
        var cloned_option = command.cloneOption ();
        cloned_option.error = error;
        cloned_option.success = success;
        var newcommand = that.newCommand(
            'saveDocument',{path:path,
                            content:JSON.stringify (content),
                            option:cloned_option});
        // newcommand.setMaxRetry (0); // inf
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      newcommand );
    };

    priv.saveNewRevision = function (command,path,content,success,error) {
        var cloned_option = command.cloneOption ();
        cloned_option.error = error;
        cloned_option.success = success;
        var newcommand = that.newCommand(
            'saveDocument',{path:path,
                            content:content,
                            option:cloned_option});
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      newcommand );
    };

    priv.loadRevision = function (command,path,success,error) {
        var cloned_option = command.cloneOption ();
        cloned_option.error = error;
        cloned_option.success = success;
        var newcommand = that.newCommand (
            'loadDocument',{path:path,
                            option:cloned_option});
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      newcommand );
    };

    priv.deleteAFile = function (command,path,success,error) {
        var cloned_option = command.cloneOption();
        cloned_option.max_retry = 0; // inf
        cloned_option.error = error;
        cloned_option.success = success;
        var newcommand = that.newCommand(
            'removeDocument',{path:path,
                              option:cloned_option});
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      newcommand );
    };

    priv.chooseARevision = function (metadata) {
        var tmp_last_modified = 0, ret_rev = '';
        for (var rev in metadata) {
            if (tmp_last_modified <
                metadata[rev].last_modified) {
                tmp_last_modified =
                    metadata[rev].last_modified;
                ret_rev = rev;
            }
        }
        return ret_rev;
    };

    priv.solveConflict = function (path,content,option) {
        var o = {}, am = priv.newAsyncModule(),

        command = option.command,
        metadata_file_path = path + '.metadata',
        current_revision = '',
        current_revision_file_path = '',
        metadata_file_content = null,
        on_conflict = false, conflict_object = {},
        on_remove = option.deleted,
        previous_revision = option.previous_revision,
        previous_revision_object = option.revision_remove_object || {},
        previous_revision_content_object = previous_revision_object[
            previous_revision] || {},
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
                        hex_sha256 ('' + content +
                                    previous_revision +
                                    JSON.stringify (metadata_file_content));
                    current_revision_file_path = path + '.' +
                        current_revision;
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
                command, current_revision_file_path, content,
                function (result) {
                    am.call(o,'saveMetadataOnDistant');
                }, function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.previousUpdateMetadata = function () {
            for (var prev_rev in previous_revision_object) {
                delete metadata_file_content[prev_rev];
            }
            am.call(o,'checkForConflicts');
        };
        o.checkForConflicts = function () {
            for (var rev in metadata_file_content) {
                var revision_index;
                on_conflict = true;
                failerror = {
                    status:20,
                    statusText:'Conflict',
                    message:'There is one or more conflicts'
                };
                break;
            }
            am.call(o,'updateMetadata');
        };
        o.updateMetadata = function (){
            metadata_file_content[current_revision] = {
                creation_date: previous_revision_content_object.creation_date ||
                    now.getTime(),
                last_modified: now.getTime(),
                conflict: on_conflict,
                deleted: on_remove
            };
            conflict_object =
                priv.createConflictObject(
                    command, metadata_file_content, current_revision
                );
            am.call(o,'saveMetadataOnDistant');
        };
        o.saveMetadataOnDistant = function (){
            priv.saveMetadataToDistant(
                command, metadata_file_path,metadata_file_content,
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
            for (var prev_rev in previous_revision_object) {
                priv.deleteAFile (
                    command, path+'.'+prev_rev, empty_fun, empty_fun );
            }
        };
        o.success = function (){
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            if (option.success) {option.success({revision:current_revision});}
        };
        o.error = function (error){
            var gooderror = error || failerror || {};
            if (on_conflict) {
                gooderror.conflict_object = conflict_object;
            }
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            if (option.error) {option.error(gooderror);}
        };
        am.call(o,'getDistantMetadata');
    };

    priv.createConflictObject = function (command, metadata, revision) {
        var cloned_command = command.clone();
        var conflict_object = {
            path: command.getPath(),
            revision: revision,
            revision_object: metadata,
            getConflictRevisionList: function () {
                return this.revision_object;
            },
            solveConflict: function (content,option) {
                if (metadata[revision].deleted) {
                    option = option || content || {};
                    option.deleted = true;
                } else {
                    option = option || {};
                    option.deleted = false;
                    content = content || '';
                }
                option.previous_revision = this.revision;
                option.revision_remove_object = this.revision_object;
                option.command = cloned_command;
                return priv.solveConflict (
                    this.path, content, option
                );
            }
        };
        return conflict_object;
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

    /**
     * Save a document and can manage conflicts.
     * @method saveDocument
     */
    that.saveDocument = function (command) {
        var o = {}, am = priv.newAsyncModule(),

        metadata_file_path = command.getPath() + '.metadata',
        current_revision = '',
        current_revision_file_path = '',
        metadata_file_content = null,
        on_conflict = false, conflict_object = {},
        previous_revision = command.getOption('previous_revision'),
        previous_revision_file_path = command.getPath() + '.' +
            previous_revision,
        now = new Date(),
        failerror;

        if (!previous_revision) {
            return setTimeout(function () {
                that.error({status:0,statusText:'Parameter missing',
                            message:'Need a previous revision.'});
            });
        }

        o.getDistantMetadata = function (){
            priv.getDistantMetadata (
                command,metadata_file_path,
                function (result) {
                    var previous_revision_number =
                        parseInt(previous_revision.split('-')[0],10);
                    metadata_file_content = JSON.parse (result.content);
                    // set current revision
                    current_revision = (previous_revision_number + 1) + '-' +
                        hex_sha256 ('' + command.getContent() +
                                    previous_revision +
                                    JSON.stringify (metadata_file_content));
                    current_revision_file_path = command.getPath() + '.' +
                        current_revision;
                    am.wait(o,'saveMetadataOnDistant',1);
                    am.call(o,'saveNewRevision');
                    am.call(o,'checkForConflicts');
                },function (error) {
                    if (error.status === 404) {
                        current_revision = '1-' +
                            hex_sha256 (command.getContent());
                        current_revision_file_path = command.getPath() + '.' +
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
                command,current_revision_file_path,command.getContent(),
                function (result) {
                    am.call(o,'saveMetadataOnDistant');
                }, function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.checkForConflicts = function () {
            for (var rev in metadata_file_content) {
                if (rev !== previous_revision) {
                    on_conflict = true;
                    failerror = {
                        status:20,
                        statusText:'Conflict',
                        message:'There is one or more conflicts'
                    };
                    break;
                }
            }
            am.call(o,'updateMetadata');
        };
        o.createMetadata = function (){
            metadata_file_content = {};
            metadata_file_content[current_revision] = {
                creation_date: now.getTime(),
                last_modified: now.getTime(),
                conflict: false,
                deleted: false
            };
            am.call(o,'saveMetadataOnDistant');
        };
        o.updateMetadata = function (){
            var previous_creation_date;
            if (metadata_file_content[previous_revision]) {
                previous_creation_date = metadata_file_content[
                    previous_revision].creation_date;
                delete metadata_file_content[previous_revision];
            }
            metadata_file_content[current_revision] = {
                creation_date: previous_creation_date || now.getTime(),
                last_modified: now.getTime(),
                conflict: on_conflict,
                deleted: false
            };
            if (on_conflict) {
                conflict_object =
                    priv.createConflictObject(
                        command,
                        metadata_file_content,
                        current_revision
                    );
            }
            am.call(o,'saveMetadataOnDistant');
        };
        o.saveMetadataOnDistant = function (){
            priv.saveMetadataToDistant(
                command,metadata_file_path,metadata_file_content,
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
        o.success = function (){
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            that.success({revision:current_revision});
        };
        o.error = function (error){
            var gooderror = error || failerror ||
                {status:0,statusText:'Unknown',
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
     * Load a document from several storages, and send the first retreived
     * document.
     * @method loadDocument
     */
    that.loadDocument = function (command) {
        var o = {}, am = priv.newAsyncModule(),

        metadata_file_path = command.getPath() + '.metadata',
        current_revision = command.getOption('revision') || '',
        metadata_file_content = null,
        metadata_only = command.getOption('metadata_only'),
        on_conflict = false, conflict_object = {},
        now = new Date(),
        doc = {name:command.getPath()},
        call404 = function (message) {
            am.call(o,'error',[{
                status:404,statusText:'Not Found',
                message:message
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
            doc.last_modified =
                metadata_file_content[current_revision].last_modified;
            doc.creation_date =
                metadata_file_content[current_revision].creation_date;
            doc.revision = current_revision;
            doc.revision_object = metadata_file_content;
            if (metadata_only) {
                am.call(o,'success');
            } else {
                am.call(o,'loadRevision');
            }
        };
        o.loadRevision = function (){
            if (!current_revision ||
                metadata_file_content[current_revision].deleted) {
                return call404('Document has been removed.');
            }
            priv.loadRevision (
                command, doc.name+'.'+current_revision,
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
                doc.conflict_object = conflict_object;
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
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        var o = {}, am = priv.newAsyncModule(),
        metadata_only = command.getOption('metadata_only'),
        result_list = [],
        nb_loaded_file = 0,
        success_count = 0, success_max = 0;
        o.retreiveList = function () {
            var cloned_option = command.cloneOption ();
            cloned_option.metadata_only = true;
            cloned_option.error = function (error) {
                am.call(o,'error',[error]);
            };
            cloned_option.success = function (result) {
                am.call(o,'filterTheList',[result]);
            };
            var newcommand = that.newCommand(
                'getDocumentList',{
                    path:command.getPath(),option:cloned_option
                });
            that.addJob ( that.newStorage (priv.secondstorage_spec),
                          newcommand );
        };
        o.filterTheList = function (result) {
            var i;
            success_max ++;
            for (i = 0; i < result.length; i+= 1) {
                var splitname = result[i].name.split('.') || [];
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
                    am.call(
                        o,'loadFile',
                        [path,priv.chooseARevision(data),data]
                    );
                },function (error) {
                    am.call(o,'error',[error]);
                }
            );
        };
        o.loadFile = function (path,revision,data) {
            var doc = {
                name: path,
                last_modified:data[revision].last_modified,
                creation_date:data[revision].creation_date,
                revision:revision,
                revision_object:data
            };
            if (data[revision].conflict) {
                doc.conflict_object = priv.createConflictObject(
                    command, data, revision );
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
            success_count ++;
            if (success_count >= success_max) {
                am.end();
                that.success(result_list);
            }
        };
        o.error = function (error){
            am.end();
            that.error(error);
        };
        am.call(o,'retreiveList');
    };

    /**
     * Remove a document from several storages.
     * @method removeDocument
     */
    that.removeDocument = function (command) {
        var o = {}, am = priv.newAsyncModule(),

        metadata_file_path = command.getPath() + '.metadata',
        current_revision = '',
        current_revision_file_path = '',
        metadata_file_content = null,
        on_conflict = false, conflict_object = {},
        previous_revision = command.getOption('revision'),
        previous_revision_file_path = command.getPath() + '.' +
            previous_revision,
        now = new Date(),
        failerror;

        if (!previous_revision) {
            return setTimeout(function () {
                that.error({status:0,statusText:'Parameter missing',
                            message:'Need a revision.'});
            });
        }

        o.getDistantMetadata = function (){
            priv.getDistantMetadata (
                command,metadata_file_path,
                function (result) {
                    var previous_revision_number =
                        parseInt(previous_revision.split('-')[0],10);
                    metadata_file_content = JSON.parse (result.content);
                    // set current revision
                    current_revision = (previous_revision_number + 1) + '-' +
                        hex_sha256 ('' + previous_revision +
                                    JSON.stringify (metadata_file_content));
                    current_revision_file_path = command.getPath() + '.' +
                        current_revision;
                    am.call(o,'checkForConflicts');
                },function (error) {
                    if (error.status === 404) {
                        am.call(o,'success',['0']);
                    } else {
                        am.call(o,'error',[error]);
                    }
                }
            );
        };
        o.checkForConflicts = function () {
            for (var rev in metadata_file_content) {
                if (rev !== previous_revision) {
                    on_conflict = true;
                    failerror = {
                        status:20,
                        statusText:'Conflict',
                        message:'There is one or more conflicts'
                    };
                    break;
                }
            }
            am.call(o,'updateMetadata');
        };
        o.updateMetadata = function (){
            var previous_creation_date;
            if (metadata_file_content[previous_revision]) {
                previous_creation_date = metadata_file_content[
                    previous_revision].creation_date;
                delete metadata_file_content[previous_revision];
            }
            metadata_file_content[current_revision] = {
                creation_date: previous_creation_date || now.getTime(),
                last_modified: now.getTime(),
                conflict: on_conflict,
                deleted: true
            };
            if (on_conflict) {
                conflict_object =
                    priv.createConflictObject(
                        command,
                        metadata_file_content,
                        current_revision
                    );
            }
            am.call(o,'saveMetadataOnDistant');
        };
        o.saveMetadataOnDistant = function (){
            priv.saveMetadataToDistant(
                command,metadata_file_path,metadata_file_content,
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
        o.success = function (){
            am.neverCall(o,'error');
            am.neverCall(o,'success');
            that.success({revision:current_revision});
        };
        o.error = function (error){
            var gooderror = error || failerror ||
                {status:0,statusText:'Unknown',
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

    return that;
};
Jio.addStorageType('conflictmanager', newConflictManagerStorage);
