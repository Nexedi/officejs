var newConflictManagerStorage = function ( spec, my ) {
    var that = Jio.storage( spec, my, 'handler' ), priv = {};

    var local_namespace = 'jio/conflictmanager/';

    priv.username = spec.username || '';
    var storage_exists = (spec.storage?true:false);
    priv.secondstorage_spec = spec.storage || {type:'base'};

    var super_serialized = that.serialized;
    that.serialized = function () {
        var o = super_serialized();
        o.storage = priv.secondstorage_spec;
        return o;
    };

    that.validateState = function () {
        if (!priv.username || storage_exists) {
            return 'Need at least two parameter: "owner" and "storage" '+
                '.';
        }
        return '';
    };

    priv.isTheLatestVersion = function (local,distant) {
        var k;
        if (!distant.owner) {
            return true;
        }
        for (k in distant.owner) {
            if (k !== priv.username) {
                if (local.winner.version <= distant.owner[k].last_version) {
                    return false;
                }
            }
        }
        return true;
    };

    priv.conflictResearch = function () {
        // TODO : ;
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
        run_index = 0,
        end = false, is_a_new_file = false,
        previous_revision = 0,
        local_file_hash = MD5 (command.getContent()),
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
                var cloned_option = command.cloneOption ();
                cloned_option.onResponse = function () {};
                cloned_option.onFail = function (error) {
                    if (error.status === 404) {
                        command_file_metadata = local_file_metadata;
                        run_index ++; run (run_index);
                    } else {
                        run_index = (-10);
                        that.fail(error);
                        end = true;
                    }
                };
                cloned_option.onDone = function (result) {
                    command_file_metadata = JSON.parse (result.content);
                    run_index ++; run (run_index);
                };
                var newcommand = that.newCommand(
                    'loadDocument',{path:metadata_file_name,
                                    option:cloned_option});
                that.addJob ( that.newStorage (priv.secondstorage_spec),
                              newcommand );
                break;
                // wait for 1 and 2
            case 5:             // check conflicts
                var updateCommandMetadata = function () {
                    var original_creation_date;

                    original_creation_date = command_file_metadata.owner[
                        command_file_metadata.winner.owner].
                        creation_date || now.getTime();

                    if (command_file_metadata.owner[priv.username]) {
                        previous_revision = command_file_metadata.owner[
                            priv.username].revision;
                    } else {
                        command_file_metadata.owner[priv.username] = {};
                    }
                    command_file_metadata.winner.owner = priv.username;
                    command_file_metadata.winner.revision ++;
                    command_file_metadata.winner.hash = local_file_hash;
                    command_file_metadata.owner[priv.username].revision =
                        command_file_metadata.winner.revision;
                    command_file_metadata.owner[priv.username].
                        last_modified = now.getTime();
                    command_file_metadata.owner[priv.username].
                        creation_date = original_creation_date;
                    command_file_metadata.owner[priv.username].hash =
                        local_file_hash;

                };
                // if this is a new file
                if (is_a_new_file) {
                    updateCommandMetadata();
                    LocalOrCookieStorage.setItem (local_metadata_file_name,
                                                  command_file_metadata);
                    run_index = (98);
                    run (6);    // save metadata
                    run (7);    // save document revision
                    break;
                }
                if (local_file_metadata.winner.revision ===
                    command_file_metadata.winner.revision &&
                    local_file_metadata.winner.hash ===
                    command_file_metadata.winner.hash) {
                    // OK! Now, update distant metadata, store them and save
                    updateCommandMetadata();
                    LocalOrCookieStorage.setItem (local_metadata_file_name,
                                                  command_file_metadata);
                    run_index = 98;
                    run (6);    // save metadata
                    run (7);    // save document revision
                } else {
                    // var conflict_hash = '';
                    // // gen hash
                    // conflict_hash = MD5 (JSON.stringify ({
                    //     path: command.getPath()
                    //     // TODO : ;
                    // }));
                    // // TODO : ;
                    // command_file_metadata.conflict_list.push ({
                    //     label:'revision',
                    //     hash: conflict_hash,
                    //     path: command.getPath(),
                    //     local_owner: {
                    //         name: priv.username,
                    //         revision: local_file_metadata.owner[
                    //             priv.username].revision + 1,
                    //         hash: local_file_hash
                    //     },
                    //     conflict_owner: {
                    //         name: command_file_metadata.winner.owner,
                    //         revision: command_file_metadata.winner.revision,
                    //         hash: command_file_metadata.winner.hash
                    //     }
                    // });
                    command.getOption('onConflict')();
                    run_index = (-10);
                    end = true;
                    that.fail(); // TODO
                }
                break;
            case 6:             // save metadata
                console.log ('save metadata');
                break;
            case 7:             // save document revision
                console.log ('save document revision');
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
        command.setMaxRetry (1);
    };

    /**
     * Load a document from several storages, and send the first retreived
     * document.
     * @method loadDocument
     */
    that.loadDocument = function (command) {
        that.fail({message:'NIY'});
    };

    /**
     * Get a document list from several storages, and returns the first
     * retreived document list.
     * @method getDocumentList
     */
    that.getDocumentList = function (command) {
        that.fail({message:'NIY'});
    };

    /**
     * Remove a document from several storages.
     * @method removeDocument
     */
    that.removeDocument = function (command) {
        that.fail({message:'NIY'});
    };

    return that;
};
Jio.addStorageType('replicate', newReplicateStorage);
