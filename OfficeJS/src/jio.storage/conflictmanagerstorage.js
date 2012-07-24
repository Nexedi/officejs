var newConflictManagerStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'handler' ), priv = {};
    spec = spec || {};
    my = my || {};

    priv.username = spec.username || '';
    var storage_exists = (spec.storage?true:false);
    priv.secondstorage_spec = spec.storage || {type:'base'};
    priv.secondstorage_string = JSON.stringify (priv.secondstorage_spec);

    var local_namespace = 'jio/conflictmanager/'+priv.username+'/'+
        priv.secondstorage_string+'/';

    var super_serialized = that.serialized;
    that.serialized = function () {
        var o = super_serialized();
        o.username = priv.username;
        o.storage = priv.secondstorage_spec;
        return o;
    };

    that.validateState = function () {
        if (priv.username && storage_exists) {
            return '';
        }
        return 'Need at least two parameter: "username" and "storage".';
    };

    priv.removeValuesFromArrayWhere = function (array,fun) {
        var i, newarray = [];
        for (i = 0; i < array.length; i+= 1) {
            if (!fun(array[i])) {
                newarray.push(array[i]);
            }
        }
        return newarray;
    };
    priv.removeConflict = function (conflict_array,conflict_hash) {
        var i,tmp = priv.removeValuesFromArrayWhere(
            conflict_array,
            function (v) { return (v.hash === conflict_hash); });
        for (i = 0; i < tmp.length; i+= 1) {
            conflict_array[i] = tmp[i];
        }
        conflict_array.length = tmp.length;
    };
    priv.addConflict = function (conflict_array,conflict_object) {
        var i;
        for (i = 0; i < conflict_array.length; i+= 1) {
            if (conflict_object.hash === conflict_array[i].hash) {
                return;
            }
        }
        conflict_array.push(conflict_object);
    };

    priv.loadMetadataFromDistant = function (command,path,onDone,onFail) {
        var cloned_option = command.cloneOption ();
        cloned_option.metadata_only = false;
        cloned_option.max_retry = 1; // FIXME : wrong ! (redesign jio & storage)
        cloned_option.onResponse = function () {};
        cloned_option.onFail = onFail;
        cloned_option.onDone = onDone;
        var newcommand = that.newCommand(
            'loadDocument',{path:path,
                            option:cloned_option});
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      newcommand );
    };

    priv.saveMetadataToDistant = function (command,path,content,onDone,onFail) {
        var cloned_option = command.cloneOption ();
        cloned_option.onResponse = function () {};
        cloned_option.onFail = onFail;
        cloned_option.onDone = onDone;
        var newcommand = that.newCommand(
            'saveDocument',{path:path,
                            content:JSON.stringify (content),
                            option:cloned_option});
        // newcommand.setMaxRetry (0); // inf
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      newcommand );
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
     * Save a document and can manage conflicts.
     * @method saveDocument
     */
    that.saveDocument = function (command) {
        var o = {}, am = priv.newAsyncModule(),
        metadata_file_name = command.getPath() + '.metadata',
        local_metadata_file_name = local_namespace + metadata_file_name,
        local_file_metadata = {}, // local file.metadata
        command_file_metadata = {}, // distant file.metadata
        previous_revision = 0,
        is_a_new_file = false,
        local_file_hash = hex_sha256 (command.getContent()),
        now = new Date();

        o.updateLocalMetadata = function () {
            var new_owner_object = {revision:0,hash:'',
                                    last_modified:0,
                                    creation_date:now.getTime()};
            local_file_metadata =
                LocalOrCookieStorage.getItem (local_metadata_file_name);
            if ( local_file_metadata ) {
                // if metadata already exists
                if ( !local_file_metadata.owner[priv.username] ) {
                    local_file_metadata.owner[priv.username] =
                        new_owner_object;
                }
            } else {
                local_file_metadata = {
                    winner: {},
                    owner: {},
                    conflict_list: []
                };
                local_file_metadata.winner = {
                    revision:0,owner:priv.username,hash:''};
                local_file_metadata.owner[priv.username] =
                    new_owner_object;
            }
            am.call(o,'checkForConflicts');
        };
        o.loadMetadataFromDistant = function () {
            priv.loadMetadataFromDistant (
                command,metadata_file_name,
                function (result) {
                    command_file_metadata = JSON.parse (result.content);
                    am.call(o,'checkForConflicts');
                },function (error) {
                    if (error.status === 404) {
                        command_file_metadata = local_file_metadata;
                        is_a_new_file = true;
                        am.call(o,'checkForConflicts');
                    } else {
                        am.call(o,'fail',[error]);
                    }
                });
        };
        o.checkForConflicts = function () {
            var saveAndDone = function () {
                LocalOrCookieStorage.setItem (local_metadata_file_name,
                                              command_file_metadata);
                am.wait(o,'done',1);
                am.call(o,'saveMetadata');
                am.call(o,'saveRevision');
            };
            var saveAndFail = function (error) {
                LocalOrCookieStorage.setItem (local_metadata_file_name,
                                              command_file_metadata);
                am.neverCall(o,'done');
                am.call(o,'saveMetadata');
                am.call(o,'saveRevision');
                am.call(o,'fail',[error]);
            };
            var updateMetadataCommon = function () {
                var original_creation_date;

                if (is_a_new_file || !command_file_metadata.owner[
                    command_file_metadata.winner.owner]) {
                    original_creation_date = now.getTime();
                } else {
                    original_creation_date = command_file_metadata.owner[
                        command_file_metadata.winner.owner].
                        creation_date || now.getTime();
                }

                if (command_file_metadata.owner[priv.username]) {
                    previous_revision = command_file_metadata.owner[
                        priv.username].revision;
                } else {
                    command_file_metadata.owner[priv.username] = {};
                }
                command_file_metadata.owner[priv.username].
                    last_modified = now.getTime();
                command_file_metadata.owner[priv.username].
                    creation_date = original_creation_date;
                command_file_metadata.owner[priv.username].hash =
                    local_file_hash;
            };
            var updateCommandMetadataNotOnConflict = function () {
                updateMetadataCommon ();
                command_file_metadata.winner.owner = priv.username;
                command_file_metadata.winner.revision ++;
                command_file_metadata.winner.hash = local_file_hash;
                command_file_metadata.owner[priv.username].revision =
                    command_file_metadata.winner.revision;
            };
            var updateCommandMetadataOnConflict = function () {
                updateMetadataCommon ();
                command_file_metadata.owner[priv.username].revision ++;
            };
            // if this is a new file
            if (is_a_new_file) {
                updateCommandMetadataNotOnConflict();
                saveAndDone();
                return;
            }
            // if no conflict
            if (local_file_metadata.winner.revision ===
                command_file_metadata.winner.revision &&
                local_file_metadata.winner.hash ===
                command_file_metadata.winner.hash && (
                    !command_file_metadata.owner[priv.username] || (
                        priv.username === command_file_metadata.winner.owner ||
                            command_file_metadata.owner[priv.username].
                            revision < command_file_metadata.owner[
                                command_file_metadata.winner.owner].revison))) {
                updateCommandMetadataNotOnConflict();
                saveAndDone();
            } else {
                // if conflict
                var conflict_object = {
                    label: 'revision',
                    path: command.getPath(),
                    method: 'saveDocument',
                    owner: priv.username,
                    conflict_owner: {
                        name: command_file_metadata.winner.owner,
                        revision: command_file_metadata.winner.revision,
                        hash: command_file_metadata.winner.hash}
                },
                // gen hash
                conflict_hash = hex_sha256 (JSON.stringify (
                    conflict_object));
                conflict_object.hash = conflict_hash;
                // browse known conflict list
                var i,j, done = false, known_conflict_list =
                    command.getOption('known_conflict_list') || [];
                for (i = 0; i < known_conflict_list.length; i+= 1) {
                    // if known conflict
                    if (known_conflict_list[i].hash ===
                        conflict_hash) {
                        priv.removeConflict(
                            command_file_metadata.conflict_list,
                            conflict_hash);
                        updateCommandMetadataNotOnConflict();
                        saveAndDone();
                        done = true;
                    }
                    for (j = 0; j < command_file_metadata.conflict_list.length;
                         j+= 1) {
                        if (known_conflict_list[i].hash ===
                            command_file_metadata.conflict_list[j].hash) {
                            // if known other conflict
                            // it is solved but the current conflict is
                            // different than this one.
                            priv.removeConflict(
                                command_file_metadata.conflict_list,
                                known_conflict_list[i].hash);
                        }
                    }
                }
                if (!done) {
                    updateCommandMetadataOnConflict();
                    // if unknown conflict
                    priv.addConflict (command_file_metadata.conflict_list,
                                      conflict_object);
                    saveAndFail({status:0,statusText:'Revision Conflict',
                                 message:'Someone has already'+
                                 ' modified this document.'});
                    var onConflict = command.getOption('onConflict') ||
                        function (){};
                    onConflict(conflict_object);
                }
            }
        };
        o.saveMetadata = function () {
            priv.saveMetadataToDistant (
                command,metadata_file_name,command_file_metadata,
                function () {
                    am.call(o,'done');
                },function (error) {
                    am.call(o,'fail',[error]);
                });
        };
        o.saveRevision = function () {
            var cloned_option = command.cloneOption ();
            cloned_option.onResponse = function () {};
            cloned_option.onFail = function (error) {
                am.call(o,'fail',[error]);
            };
            cloned_option.onDone = function () {
                am.call(o,'deletePreviousRevision');
            };
            var newcommand = that.newCommand(
                'saveDocument',
                {path:command.getPath() + '.' +
                 command_file_metadata.owner[priv.username].revision +
                 '.' + priv.username,
                 content:command.getContent(),
                 option:cloned_option});
            // newcommand.setMaxRetry (0); // inf
            that.addJob ( that.newStorage (priv.secondstorage_spec),
                          newcommand );
        };
        o.deletePreviousRevision = function () {
            if ( previous_revision !== 0 && (
                !command_file_metadata.owner[priv.username] ||
                    previous_revision !==
                    command_file_metadata.owner[
                        priv.username].revision ) ) {
                var cloned_option = command.cloneOption ();
                cloned_option.onResponse = function () {};
                cloned_option.onFail = function (error) {
                    am.call(o,'fail',[error]);
                };
                cloned_option.onDone = function () {
                    am.call(o,'done');
                };
                var newcommand = that.newCommand(
                    'removeDocument',
                    {path:command.getPath() + '.' +
                     previous_revision + '.' + priv.username,
                     option:cloned_option});
                // newcommand.setMaxRetry (0); // inf
                that.addJob ( that.newStorage (priv.secondstorage_spec),
                              newcommand );
            } else {
                am.call(o,'done');
            }
        };
        o.fail = function (error) {
            am.neverCall(o,'fail');
            am.neverCall(o,'done');
            command.setMaxRetry(1);
            that.fail(error);
        };
        o.done = function () {
            am.neverCall(o,'done');
            am.neverCall(o,'fail');
            that.done();
        };
        am.wait(o,'checkForConflicts',1);
        am.call(o,'loadMetadataFromDistant');
        am.call(o,'updateLocalMetadata');
    };

    /**
     * Load a document from several storages, and send the first retreived
     * document.
     * @method loadDocument
     */
    that.loadDocument = function (command) {
        var o = {}, am = priv.newAsyncModule(),
        metadata_file_name = command.getPath() + '.metadata',
        local_metadata_file_name = local_namespace + metadata_file_name,
        command_file_metadata = {}, // distant file.metadata
        owner = '', loaded_file;

        o.loadMetadataFromDistant = function () {
            priv.loadMetadataFromDistant (
                command,metadata_file_name,
                function (result) {
                    command_file_metadata = JSON.parse (result.content);
                    owner = command.getOption('owner');
                    am.wait(o,'done',1);
                    // if owner
                    if (owner) {
                        am.call(o,'loadOwner');
                    } else {
                        // if no owner
                        am.call(o,'loadWinner');
                    }
                    am.call(o,'updateLocalMetadata');
                },function (error) {
                    am.end();
                    am.call(o,'fail',[error]);
                });
        };
        o.updateLocalMetadata = function () {
            LocalOrCookieStorage.setItem (local_metadata_file_name,
                                          command_file_metadata);
            am.call(o,'done');
        };
        o.loadWinner = function () {
            var cloned_option = command.cloneOption ();
            cloned_option.onResponse = function () {};
            cloned_option.onFail = function (error) {
                am.call(o,'fail',[error]);
                am.end();
            };
            cloned_option.onDone = function (result) {
                loaded_file = result;
                loaded_file.name = command.getPath();
                am.call(o,'done');
            };
            var newcommand = that.newCommand(
                'loadDocument',
                {path:command.getPath() + '.' +
                 command_file_metadata.winner.revision +
                 '.' + command_file_metadata.winner.owner,
                 option:cloned_option});
            that.addJob ( that.newStorage (priv.secondstorage_spec),
                          newcommand );
        };
        o.loadOwner = function () {
            var cloned_option = command.cloneOption ();
            cloned_option.onResponse = function () {};
            cloned_option.onFail = function (error) {
                am.end();
                am.call(o,'fail',[error]);
            };
            cloned_option.onDone = function (result) {
                loaded_file = result;
                loaded_file.name = command.getPath();
                am.call(o,'done');
            };
            if (!command_file_metadata.owner[owner]) {
                cloned_option.onFail ({status:404,
                                       statusText:'Not Found',
                                       message:'Document not found.'});
                return;
            }
            var newcommand = that.newCommand(
                'loadDocument',
                {path:command.getPath() + '.' +
                 command_file_metadata.owner[owner].revision +
                 '.' + owner,
                 option:cloned_option});
            that.addJob ( that.newStorage (priv.secondstorage_spec),
                          newcommand );
        };
        o.fail = function (error) {
            am.neverCall(o,'fail');
            am.neverCall(o,'done');
            command.setMaxRetry(1);
            that.fail(error);
        };
        o.done = function () {
            am.neverCall(o,'done');
            am.neverCall(o,'fail');
            that.done(loaded_file);
        };
        am.call(o,'loadMetadataFromDistant');
    };

    /**
     * Get a document list from several storages, and returns the first
     * retreived document list.
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        var o = {}, am = priv.newAsyncModule(),
        command_file_metadata_list = [], // distant files metadata
        result_list = [],
        nb_loaded_file = 0;
        o.retreiveList = function () {
            var cloned_option = command.cloneOption ();
            cloned_option.metadata_only = false;
            cloned_option.onResponse = function () {};
            cloned_option.onFail = function (error) {
                am.call(o,'fail',[error]);
            };
            cloned_option.onDone = function (result) {
                var i;
                for (i = 0; i < result.length; i+= 1) {
                    var splitname = result[i].name.split('.') || [];
                    var content_object;
                    var doc = {};
                    if (splitname[splitname.length-1] === 'metadata') {
                        try {
                            content_object = JSON.parse (result[i].content);
                        } catch (e) {
                            continue;
                        }
                        result_list.push(content_object);
                        splitname.length --;
                        doc.name = splitname.join('.');
                        doc.creation_date = content_object.owner[
                            content_object.winner.owner].creation_date;
                        doc.last_modified = content_object.owner[
                            content_object.winner.owner].last_modified;
                        command_file_metadata_list.push(doc);
                    }
                }
                if (command.getOption('metadata_only')) {
                    am.call(o,'done',[command_file_metadata_list]);
                } else {
                    if (result.length === 0) {
                        return that.done([]);
                    }
                    am.wait(o,'done',command_file_metadata_list.length-1);
                    for (i = 0; i < command_file_metadata_list.length; i+= 1) {
                        LocalOrCookieStorage.setItem (
                            command_file_metadata_list[i].name + '.metadata',
                            result_list[i]);
                        am.call(o,'loadFile',[
                            command_file_metadata_list[i],
                            result_list[i].winner.revision,
                            result_list[i].winner.owner]);
                    }
                    that.end();
                }
            };
            var newcommand = that.newCommand(
                'getDocumentList',
                {path:command.getPath(),
                 option:cloned_option});
            that.addJob ( that.newStorage (priv.secondstorage_spec),
                          newcommand );
        };
        o.loadFile = function (doc,revision,owner) {
            var cloned_option = command.cloneOption ();
            cloned_option.onResponse = function () {};
            cloned_option.onFail = function (error) {
                am.call(o,'fail',[error]);
                am.end();
            };
            cloned_option.onDone = function (result) {
                doc.content = result.content;
                am.call(o,'done',[command_file_metadata_list]);
            };
            var newcommand = that.newCommand(
                'loadDocument',
                {path:doc.name + '.' + revision + '.' + owner,
                 option:cloned_option});
            that.addJob ( that.newStorage (priv.secondstorage_spec),
                          newcommand );
        };
        o.fail = function (error) {
            am.neverCall(o,'fail');
            am.neverCall(o,'done');
            command.setMaxRetry(1);
            that.fail(error);
        };
        o.done = function (value) {
            am.neverCall(o,'done');
            am.neverCall(o,'fail');
            that.done(value);
        };
        am.call(o,'retreiveList');
    };

    /**
     * Remove a document from several storages.
     * @method removeDocument
     */
    that.removeDocument = function (command) {
        var o = {}, am = priv.newAsyncModule(),
        metadata_file_name = command.getPath() + '.metadata',
        local_metadata_file_name = local_namespace + metadata_file_name,
        local_file_metadata = {},
        command_file_metadata = {}, // distant file.metadata
        previous_revision = 0,
        metadata_object_known = true,
        is_a_new_file = false;

        o.updateLocalMetadata = function () {
            var new_owner_object = {revision:0,hash:'',
                                    last_modified:0,
                                    creation_date:0};
            local_file_metadata =
                LocalOrCookieStorage.getItem (local_metadata_file_name);
            if ( local_file_metadata ) {
                // if metadata already exists
                if ( !local_file_metadata.owner[priv.username] ) {
                    local_file_metadata.owner[priv.username] =
                        new_owner_object;
                }
            } else {
                metadata_object_known = false;
                local_file_metadata = {
                    winner: {},
                    owner: {},
                    conflict_list: []
                };
                local_file_metadata.winner = {
                    revision:0,owner:priv.username,hash:''};
                local_file_metadata.owner[priv.username] =
                    new_owner_object;
            }
            am.call(o,'checkForConflicts');
        };
        o.loadMetadataFromDistant = function () {
            priv.loadMetadataFromDistant (
                command,metadata_file_name,
                function (result) {
                    command_file_metadata = JSON.parse (result.content);
                    am.call(o,'checkForConflicts');
                },function (error) {
                    if (error.status === 404) {
                        command_file_metadata = local_file_metadata;
                        is_a_new_file = true;
                        am.call(o,'checkForConflicts');
                        return;
                    }
                    am.call(o,'fail',[error]);
                    am.end();
                });
        };
        o.checkForConflicts = function () {
            var removeAndDone = function () {
                LocalOrCookieStorage.setItem (local_metadata_file_name,
                                              command_file_metadata);
                am.wait(o,'done',1);
                am.call(o,'saveMetadata');
                am.call(o,'removeRevision');
            };
            var updateMetadataCommon = function () {
                if (command_file_metadata.owner[priv.username]) {
                    previous_revision = command_file_metadata.owner[
                        priv.username].revision;
                    delete command_file_metadata.owner[priv.username];
                }
            };
            var updateCommandMetadataNotOnConflict = function () {
                updateMetadataCommon();
                command_file_metadata.winner.owner = priv.username;
                command_file_metadata.winner.revision = 0;
                command_file_metadata.winner.hash = '';
            };
            var updateCommandMetadataOnConflict = function () {
                updateMetadataCommon ();
            };
            // if we don't known what is will be removed fail.
            if (!metadata_object_known) {
                return am.call(o,'fail',[{
                    status:0,statusText:'Unknown Document',
                    message:'You must load the document before delete it.'}]);
            }
            // if this is a new file
            if (is_a_new_file) {
                LocalOrCookieStorage.deleteItem (local_metadata_file_name);
                return am.call(o,'done');
            }
            // if no conflict
            if (local_file_metadata.winner.revision ===
                command_file_metadata.winner.revision &&
                local_file_metadata.winner.hash ===
                command_file_metadata.winner.hash && (
                    !command_file_metadata.owner[priv.username] || (
                        priv.username === command_file_metadata.winner.owner ||
                            command_file_metadata.owner[priv.username].
                            revision < command_file_metadata.owner[
                                command_file_metadata.winner.owner].revison))) {
                // OK! Now, update distant metadata, store them and remove
                updateCommandMetadataNotOnConflict();
                removeAndDone();
            } else {
                // if conflict
                var conflict_object = {
                    label: 'revision',
                    path: command.getPath(),
                    method: 'removeDocument',
                    owner: priv.username,
                    conflict_owner: {
                        name: command_file_metadata.winner.owner,
                        revision: command_file_metadata.winner.revision,
                        hash: command_file_metadata.winner.hash}
                },
                // gen hash
                conflict_hash = hex_sha256 (JSON.stringify (
                    conflict_object));
                conflict_object.hash = conflict_hash;
                // browse known conflict list
                var i,j, done = false, known_conflict_list =
                    command.getOption('known_conflict_list') || [];
                console.log ('1 ' + JSON.stringify (known_conflict_list));
                for (i = 0; i < known_conflict_list.length; i+= 1) {
                    console.log ('2');
                    // if known conflict
                    if (known_conflict_list[i].hash ===
                        conflict_hash) {
                        priv.removeConflict(
                            command_file_metadata.conflict_list,
                            conflict_hash);
                        updateCommandMetadataNotOnConflict();
                        removeAndDone();
                        done = true;
                    }
                    for (j = 0; j < command_file_metadata.conflict_list.length;
                         j+= 1) {
                        console.log ('3');
                        if (known_conflict_list[i].hash ===
                            command_file_metadata.conflict_list[j].hash) {
                            // if known other conflict
                            // it is solved but the current conflict is
                            // different than this one.
                            priv.removeConflict(
                                command_file_metadata.conflict_list,
                                known_conflict_list[i].hash);
                        }
                    }
                }
                if (!done) {
                    updateCommandMetadataOnConflict();
                    // if unknown conflict
                    priv.addConflict (command_file_metadata.conflict_list,
                                      conflict_object);
                    am.neverCall(o,'done');
                    LocalOrCookieStorage.setItem (local_metadata_file_name,
                                                  command_file_metadata);
                    am.call(o,'saveMetadata');
                    // am.call(o,'removeRevision');
                    am.call(o,'fail',[{status:0,statusText:'Revision Conflict',
                                       message:'Someone has already'+
                                       ' modified this document.'}]);
                    var onConflict = command.getOption('onConflict') ||
                        function (){};
                    onConflict(conflict_object);
                }
            }
        };
        o.saveMetadata = function () {
            priv.saveMetadataToDistant (
                command,metadata_file_name,command_file_metadata,
                function () {
                    am.call(o,'done');
                },function (error) {
                    am.call(o,'fail',[error]);
                    am.end();
                });
        };
        o.removeRevision = function () {
            if ( previous_revision !== 0 && (
                !command_file_metadata.owner[priv.username] ||
                    previous_revision !==
                    command_file_metadata.owner[
                        priv.username].revision ) ) {
                var cloned_option = command.cloneOption ();
                cloned_option.onResponse = function () {};
                cloned_option.onFail = function (error) {
                    am.call(o,'fail',[error]);
                    am.end();
                };
                cloned_option.onDone = function () {
                    am.call(o,'done');
                };
                var newcommand = that.newCommand(
                    'removeDocument',
                    {path:command.getPath() + '.' +
                     previous_revision + '.' + priv.username,
                     option:cloned_option});
                // newcommand.setMaxRetry (0); // inf
                that.addJob ( that.newStorage (priv.secondstorage_spec),
                              newcommand );
            } else {
                am.call(o,'done');
            }
        };
        o.fail = function (error) {
            am.neverCall(o,'fail');
            am.neverCall(o,'done');
            command.setMaxRetry(1);
            that.fail(error);
        };
        o.done = function () {
            am.neverCall(o,'done');
            am.neverCall(o,'fail');
            that.done();
        };
        am.wait(o,'checkForConflicts',1);
        am.call(o,'loadMetadataFromDistant');
        am.call(o,'updateLocalMetadata');
    };

    return that;
};
Jio.addStorageType('conflictmanager', newConflictManagerStorage);
