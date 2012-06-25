var newConflictManagerStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'handler' ), priv = {};
    spec = spec || {};
    my = my || {};

    priv.username = spec.username || '';
    var storage_exists = (spec.storage?true:false);
    priv.secondstorage_spec = spec.storage || {type:'base'};
    priv.secondstorage_string = JSON.stringify (priv.secondstorage_spec)

    var local_namespace = 'jio/conflictmanager/'+priv.secondstorage_string+'/';

    var super_serialized = that.serialized;
    that.serialized = function () {
        var o = super_serialized();
        o.storage = priv.secondstorage_spec;
        return o;
    };

    that.validateState = function () {
        if (!priv.username || storage_exists) {
            return 'Need at least two parameter: "owner" and "storage".';
        }
        return '';
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

    var super_fail = that.fail;
    that.fail = function (command,error) {
        command.setMaxRetry(1);
        super_fail(error);
    };

    priv.loadMetadataFromDistant = function (command,path,onDone,onFail) {
        var cloned_option = command.cloneOption ();
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
        newcommand.setMaxRetry (0); // inf
        that.addJob ( that.newStorage (priv.secondstorage_spec),
                      newcommand );
    };

    /**
     * Save a document and can manage conflicts.
     * @method saveDocument
     */
    that.saveDocument = function (command) {
        var metadata_file_name = command.getPath() + '.metadata',
        now = new Date(),
        local_metadata_file_name = local_namespace + metadata_file_name,
        local_file_metadata = {}, // local file.metadata
        command_file_metadata = {}, // distant file.metadata
        run_index = 0, previous_revision = 0,
        end = false, is_a_new_file = false,
        local_file_hash = hex_sha256 (command.getContent()),
        run = function (index) {
            switch (index) {
            case 0:
                run_index = 3;
                run (2);
                run (1);
                break;
            case 1:             // update local metadata
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
                run_index ++; run (run_index);
                break;
            case 2:             // load metadata from distant
                priv.loadMetadataFromDistant (
                    command,metadata_file_name,
                    function (result) {
                        command_file_metadata = JSON.parse (result.content);
                        run_index ++; run (run_index);
                    },function (error) {
                        if (error.status === 404) {
                            command_file_metadata = local_file_metadata;
                            is_a_new_file = true;
                            run_index ++; run (run_index);
                        } else {
                            run_index = (-10);
                            end = true;
                            that.fail(command,error);
                        }
                    });
                break;
            case 5:             // check conflicts
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
                    LocalOrCookieStorage.setItem (local_metadata_file_name,
                                                  command_file_metadata);
                    run_index = (98);
                    run (6);    // save metadata
                    run (7);    // save document revision
                    break;
                }
                // if no conflict
                if (local_file_metadata.winner.revision ===
                    command_file_metadata.winner.revision &&
                    local_file_metadata.winner.hash ===
                    command_file_metadata.winner.hash) {
                    // OK! Now, update distant metadata, store them and save
                    updateCommandMetadataNotOnConflict();
                    LocalOrCookieStorage.setItem (local_metadata_file_name,
                                                  command_file_metadata);
                    run_index = 98;
                    run (6);    // save metadata
                    run (7);    // save document revision
                } else {
                    // if conflict
                    var conflict_object = {
                        label: 'revision',
                        path: command.getPath(),
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
                    var i, known_conflict_list =
                        command.getOption('known_conflict_list') || [];
                    var compare_fun = function (v) {
                        return (v.hash === conflict_hash);
                    };
                    for (i = 0; i < known_conflict_list.length; i+= 1) {
                        // if known conflict
                        if (known_conflict_list[i].hash ===
                            conflict_hash) {
                            command_file_metadata.conflict_list =
                                priv.removeValuesFromArrayWhere(
                                    command_file_metadata.conflict_list,
                                    compare_fun);
                            updateCommandMetadataNotOnConflict();
                            run_index = 98;
                            run (6);
                            run (7);
                            return;
                        }
                    }
                    updateCommandMetadataOnConflict();
                    // if unknown conflict
                    command_file_metadata.conflict_list.push (conflict_object);
                    run_index = (-10);
                    end = true;
                    run (6);    // save metadata
                    run (7);    // save document revision
                    that.fail(command); // TODO
                    command.getOption('onConflict')(conflict_object);
                }
                break;
            case 6:             // save metadata
                priv.saveMetadataToDistant (
                    command,metadata_file_name,command_file_metadata,
                    function () {
                        run_index ++; run (run_index);
                    },function (error) {
                        run_index = (-10);
                        end = true;
                        that.fail(command,error);
                    });
                break;
            case 7:             // save document revision
                (function () {
                    var cloned_option = command.cloneOption ();
                    cloned_option.onResponse = function () {};
                    cloned_option.onFail = function (error) {
                        run_index = (-10);
                        end = true;
                        that.fail(command,error);
                    };
                    cloned_option.onDone = function () {
                        run (8);
                    };
                    var newcommand = that.newCommand(
                        'saveDocument',
                        {path:command.getPath() + '.' +
                         command_file_metadata.owner[priv.username].revision +
                         '.' + priv.username,
                         content:command.getContent(),
                         option:cloned_option});
                    newcommand.setMaxRetry (0); // inf
                    that.addJob ( that.newStorage (priv.secondstorage_spec),
                                  newcommand );
                }());
                break;
            case 8:
                (function () {
                    if ( previous_revision !== 0 && (
                        !command_file_metadata.owner[priv.username] ||
                            previous_revision !==
                            command_file_metadata.owner[
                                priv.username].revision ) ) {
                        var cloned_option = command.cloneOption ();
                        cloned_option.onResponse = function () {};
                        cloned_option.onFail = function (error) {
                            run_index = (-10);
                            end = true;
                            that.fail(command,error);
                        };
                        cloned_option.onDone = function () {
                            run_index ++; run (run_index);
                        };
                        var newcommand = that.newCommand(
                            'removeDocument',
                            {path:command.getPath() + '.' +
                             previous_revision + '.' + priv.username,
                             option:cloned_option});
                        newcommand.setMaxRetry (0); // inf
                        that.addJob ( that.newStorage (priv.secondstorage_spec),
                                      newcommand );
                    } else {
                        run_index ++; run (run_index);
                    }
                }());
                break;
            case 100:
                if (!end) {
                    end = true;
                    that.done();
                    return;
                }
                break;
            default:
                break;
            }
        };
        run (0);
    };

    /**
     * Load a document from several storages, and send the first retreived
     * document.
     * @method loadDocument
     */
    that.loadDocument = function (command) {
        var metadata_file_name = command.getPath() + '.metadata',
        local_metadata_file_name = local_namespace + metadata_file_name,
        command_file_metadata = {}, // distant file.metadata
        run_index = 0,
        end = false, owner = '', loaded_file,
        run = function (index) {
            switch (index) {
            case 0:             // load metadata file from distant
                priv.loadMetadataFromDistant (
                    command,metadata_file_name,
                    function (result) {
                        command_file_metadata = JSON.parse (result.content);
                        owner = command.getOption('owner');
                        run_index = 98;
                        // if owner
                        if (owner) {
                            run (3);
                        } else {
                            // if no owner
                            run (2);
                        }
                        run (1);
                    },function (error) {
                        run_index = (-10);
                        end = true;
                        that.fail(command,error);
                    });
                break;
            case 1:             // update local metadata
                LocalOrCookieStorage.setItem (local_metadata_file_name,
                                              command_file_metadata);
                run_index ++; run (run_index);
                break;
            case 2:             // load winner
                (function () {
                    var cloned_option = command.cloneOption ();
                    cloned_option.onResponse = function () {};
                    cloned_option.onFail = function (error) {
                        run_index = (-10);
                        end = true;
                        that.fail(command,error);
                    };
                    cloned_option.onDone = function (result) {
                        loaded_file = result;
                        loaded_file.name = command.getPath();
                        run_index ++; run (run_index);
                    };
                    var newcommand = that.newCommand(
                        'loadDocument',
                        {path:command.getPath() + '.' +
                         command_file_metadata.winner.revision +
                         '.' + command_file_metadata.winner.owner,
                         option:cloned_option});
                    that.addJob ( that.newStorage (priv.secondstorage_spec),
                                  newcommand );
                }());
                break;
            case 3:             // load owner
                (function () {
                    var cloned_option = command.cloneOption ();
                    cloned_option.onResponse = function () {};
                    cloned_option.onFail = function (error) {
                        run_index = (-10);
                        end = true;
                        that.fail(command,error);
                    };
                    cloned_option.onDone = function (result) {
                        loaded_file = result;
                        loaded_file.name = command.getPath();
                        run_index ++; run (run_index);
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
                }());
                break;
            case 100:
                if (!end) {
                    end = true;
                    that.done(loaded_file);
                    return;
                }
                break;
            default: break;
            }
        };
        run (0);
    };

    /**
     * Get a document list from several storages, and returns the first
     * retreived document list.
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        var command_file_metadata_list = [], // distant files metadata
        result_list = [],
        end = false, nb_loaded_file = 0,
        _1 = function () {
            var cloned_option = command.cloneOption ();
            cloned_option.onResponse = function () {};
            cloned_option.onFail = function (error) {
                that.fail(command,error);
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
                    that.done(command_file_metadata_list);
                } else {
                    if (result.length === 0) {
                        return that.done([]);
                    };
                    for (i = 0; i < command_file_metadata_list.length; i+= 1) {
                        LocalOrCookieStorage.setItem (
                            command_file_metadata_list[i].name + '.metadata',
                            result_list[i]);
                        loadFile(command_file_metadata_list[i],
                                 result_list[i].winner.revision,
                                 result_list[i].winner.owner);
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
        }, loadFile = function (doc,revision,owner) {
            var cloned_option = command.cloneOption ();
            cloned_option.onResponse = function () {};
            cloned_option.onFail = function (error) {
                if (!end) {
                    end = true;
                    that.fail(command,error);
                }
            };
            cloned_option.onDone = function (result) {
                if (!end) {
                    doc.content = result.content;
                    nb_loaded_file ++;
                    if (command_file_metadata_list.length === nb_loaded_file) {
                        end = true;
                        that.done(command_file_metadata_list);
                    }
                }
            };
            var newcommand = that.newCommand(
                'loadDocument',
                {path:doc.name + '.' + revision + '.' + owner,
                 option:cloned_option});
            that.addJob ( that.newStorage (priv.secondstorage_spec),
                          newcommand );
        };
        _1();
    };

    /**
     * Remove a document from several storages.
     * @method removeDocument
     */
    that.removeDocument = function (command) {
        var metadata_file_name = command.getPath() + '.metadata',
        local_metadata_file_name = local_namespace + metadata_file_name,
        command_file_metadata = {}, // distant file.metadata
        run_index = 0, previous_revision = 0,
        end = false, is_a_new_file = false,
        run = function (index) {
            switch (index) {
            case 0:
                run_index = 3;
                run (2);
                run (1);
                break;
            case 1:             // update local metadata
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
                run_index ++; run (run_index);
                break;
            case 2:             // load metadata from distant
                priv.loadMetadataFromDistant (
                    command,metadata_file_name,
                    function (result) {
                        command_file_metadata = JSON.parse (result.content);
                        run_index++; run (run_index);
                    },function (error) {
                        if (error.status === 404) {
                            command_file_metadata = local_file_metadata;
                            is_a_new_file = true;
                            run_index++; run (run_index);
                            return;
                        }
                        run_index = (-10);
                        end = true;
                        that.fail(command,error);
                    });
                break;
            case 5:
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
                // if this is a new file
                if (is_a_new_file) {
                    LocalOrCookieStorage.deleteItem (local_metadata_file_name);
                    return that.done();
                }
                // if no conflict
                if (local_file_metadata.winner.revision ===
                    command_file_metadata.winner.revision &&
                    local_file_metadata.winner.hash ===
                    command_file_metadata.winner.hash) {
                    // OK! Now, update distant metadata, store them and remove
                    updateCommandMetadataNotOnConflict();
                    LocalOrCookieStorage.setItem (local_metadata_file_name,
                                                  command_file_metadata);
                    run_index = 98;
                    run (6);    // save metadata
                    run (7);    // remove document revision
                } else {
                    // if conflict
                    var conflict_object = {
                        label: 'revision',
                        path: command.getPath(),
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
                    var i, known_conflict_list =
                        command.getOption('known_conflict_list') || [];
                    var compare_fun = function (v) {
                        return (v.hash === conflict_hash);
                    };
                    for (i = 0; i < known_conflict_list.length; i+= 1) {
                        // if known conflict
                        if (known_conflict_list[i].hash ===
                            conflict_hash) {
                            command_file_metadata.conflict_list =
                                priv.removeValuesFromArrayWhere(
                                    command_file_metadata.conflict_list,
                                    compare_fun);
                            updateCommandMetadataNotOnConflict();
                            run_index = 98;
                            run (6);
                            run (7);
                            return;
                        }
                    }
                    updateCommandMetadataOnConflict();
                    // if unknown conflict
                    command_file_metadata.conflict_list.push (conflict_object);
                    run_index = (-10);
                    end = true;
                    run (6);    // save metadata
                    run (7);    // remove document revision
                    that.fail(command); // TODO
                    command.getOption('onConflict')(conflict_object);
                }
                break;
            case 6:
                priv.saveMetadataToDistant (
                    command,metadata_file_name,command_file_metadata,
                    function () {
                        run_index ++; run (run_index);
                    },function (error) {
                        run_index = (-10);
                        end = true;
                        that.fail(command,error);
                    });
                break;
            case 7:
                (function () {
                    if ( previous_revision !== 0 && (
                        !command_file_metadata.owner[priv.username] ||
                            previous_revision !==
                            command_file_metadata.owner[
                                priv.username].revision ) ) {
                        var cloned_option = command.cloneOption ();
                        cloned_option.onResponse = function () {};
                        cloned_option.onFail = function (error) {
                            run_index = (-10);
                            end = true;
                            that.fail(command,error);
                        };
                        cloned_option.onDone = function () {
                            run_index ++; run (run_index);
                        };
                        var newcommand = that.newCommand(
                            'removeDocument',
                            {path:command.getPath() + '.' +
                             previous_revision + '.' + priv.username,
                             option:cloned_option});
                        newcommand.setMaxRetry (0); // inf
                        that.addJob ( that.newStorage (priv.secondstorage_spec),
                                      newcommand );
                    } else {
                        run_index ++; run (run_index);
                    }
                }());
                break;
            case 100:
                if (!end) {
                    end = true;
                    that.done();
                    return;
                }
                break;
            default: break;
            }
        };
        run (0);
    };

    return that;
};
Jio.addStorageType('replicate', newReplicateStorage);
