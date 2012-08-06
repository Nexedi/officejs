(function () {
    // Tools
    var baseName = function (file_name) {
        var split = file_name.split('.');
        if (split.length > 1) {
            split.length -= 1;
            return split.join('.');
        } else {
            return file_name;
        }
    };
    var JIO = jio;

    /**
     * OfficeJS Object
     */
    window.OfficeJS = (function () {
        var that = {}, priv = {};
        // Attributes //
        priv.preference_object = {
            document_lister:'slickgrid',
            edit_preferences:'simplepreferenceeditor',
            text_editor:'elrte',
            img_editor:'svg-edit',
            spreadsheet:'jquery-sheet'
        };
        priv.conflict_solver_object = {
            // ext: "solver_name"
            // default: "basic_conflict_solver"
            // ...
        };
        priv.app_object = {
            topnavbar: {
                type:'nav',
                path:'component/top_nav_bar.html',
                gadget_id:'page-top_nav_bar'
            },
            leftnavbar: {
                type:'nav',
                path:'component/left_nav_bar.html',
                gadget_id:'page-left_nav_bar',
                bar_tools: false,
                update: function () {
                    var elmt;
                    if (priv.isJioSet() && !this.bar_tools) {
                        // add tools to nav bar
                        elmt = document.querySelector ('script#left-nav-tools');
                        document.querySelector ('#left-nav-bar').innerHTML +=
                        elmt.innerHTML;
                        this.bar_tools = true;
                    }
                }
            },
            login: {
                type:'loader',
                path:'component/login.html',
                gadget_id:'page-content',
                getContent: function () {
                    var tmp = {
                        user_name: 'NoName',
                        password: 'NoPwd'
                    };
                    // NOTE : stringify or not ?
                    return JSON.stringify (tmp);
                }
            },
            about: {
                type:'viewer',
                path:'component/about.html',
                gadget_id:'page-content'
            },
            contact: {
                type:'viewer',
                path:'component/contact.html',
                gadget_id:'page-content'
            },
            simplepreferenceeditor: {
                // NOTE
                type:'editor',
                path:''
                // ...
            },
            elrte: {
                type:'editor',  // means it can edit a content
                path:'component/elrte.html',
                gadget_id:'page-content',
                ext:'html',
                element:'#elrte_editor',
                getContent: function () {
                    $(this.element).elrte('updateSource');
                    return $(this.element).elrte('val');
                },
                setContent: function (content) {
                    $(this.element).elrte('val', content);
                },
                onload: function (param) {
                    // FIXME : wait for initialization end
                    setTimeout(function () {
                        if (typeof param.file_name !== 'undefined') {
                            $('#input_file_name').attr('value',
                                                  baseName(param.file_name));
                            that.load(baseName(param.file_name));
                        }
                    },1000);
                }
                // TODO : onunload, are you sure? leave without saving?
            },
            'jquery-sheet': {
                type:'editor',
                path:'component/jquery-sheet.html',
                gadget_id:'page-content',
                ext:'jqs',
                getContent: function () {
                    return JSON.stringify (
                        $.sheet.instance[0].exportSheet.json()
                    );
                },
                setContent: function (content) {
                    $('#jQuerySheet').sheet({
                        title: '',
                        inlineMenu: inlineMenu($.sheet.instance),
                        buildSheet: $.sheet.makeTable.json(
                            JSON.parse(content)
                        ),
                        autoFiller: true
                    });
                },
                onload: function (param) {
                    // FIXME : wait for initialization end
                    setTimeout(function () {
                        if (typeof param.file_name !== 'undefined') {
                            $('#input_file_name').attr('value',
                                                  baseName(param.file_name));
                            that.load(baseName(param.file_name));
                        }
                    },1000);
                }
            },
            'svg-edit': {
                type:'editor',
                path:'component/svg-edit.html',
                gadget_id:'page-content',
                ext:'svg',
                frameid:'svg_edit_frame',
                getContent: function () {
                    return document.getElementById (this.frameid).
                        contentWindow.svgCanvas.getSvgString();
                },
                setContent: function (content) {
                    document.getElementById (this.frameid).
                        contentWindow.svgCanvas.setSvgString(content);
                },
                onload: function (param) {
                    var waitForInit = function (fun) {
                        // FIXME : wait for init end
                        setTimeout(fun,1000);
                    }
                    waitForInit(function () {
                        if (typeof param.file_name !== 'undefined') {
                            $('#input_file_name').attr('value',
                                                  baseName(param.file_name));
                            that.load(baseName(param.file_name));
                        }
                    });
                }
            },
            slickgrid: {
                type:'editor',
                path:'component/slickgrid_document_lister.html',
                gadget_id:'page-content',
                interval_id:null,
                onload: function () {
                    var t = this;
                    if (this.interval_id === null) {
                        this.interval_id = setInterval (function() {
                            that.getList(t.update);
                        }, 5000);
                    }
                },
                update: function () {
                    window.OfficeJS_slickgrid.reload();
                },
                onunload: function () {
                    if (this.interval_id !== null) {
                        clearInterval (this.interval_id);
                        this.interval_id = null;
                    }
                    delete window.OfficeJS_slickgrid;
                    return true;
                }
            },
            workinprogress: {
                type:'viewer',
                path:'component/workinprogress.html',
                gadget_id:'page-content',
                onload: function () {
                    var i = null, wait = function() {
                        // wait for workinprogress initialization end.
                        if (window.work_in_progress) {
                            window.work_in_progress.start();
                            clearInterval(i);
                        }
                    }
                    i = setInterval (wait,100);
                },
                onunload: function () {
                    window.work_in_progress.stop();
                    delete window.work_in_progress;
                    return true;
                }
            },
            basic_conflict_solver: {
                type:'solver',
                path:'component/basic_conflict_solver.html',
                gadget_id:'page-conflict',
                onload: function (param) {
                    var rev_list = [], i;
                    for (var rev in param.conflict_object.revision_object) {
                        rev_list.push(rev);
                    }
                    // FIXME : load jobs are in conflict ! redesign jio !
                    var load = function (rev,i) {
                        if (rev) {
                            i++;
                            setTimeout(function() {
                            priv.jio.loadDocument(
                                param.conflict_object.path,{
                                    revision: rev,
                                    max_retry:3,
                                    success: function (result) {
                                        var doc = {
                                            path:param.conflict_object.path,
                                            content:result.content,
                                            last_modified:result.last_modified,
                                            creation_date:result.creation_date,
                                            revision:rev
                                        };
                                        window.basic_conflict_solver.
                                            conflict_object =
                                            param.conflict_object;
                                        window.basic_conflict_solver.
                                            addRevision(doc);
                                        load(rev_list[i],i);
                                    },
                                    error: function (error) {
                                        var doc = {
                                            path:param.conflict_object.path,
                                            last_modified:result.last_modified,
                                            creation_date:result.creation_date,
                                            revision:rev
                                        };
                                        window.basic_conflict_solver.
                                            conflict_object =
                                            param.conflict_object;
                                        if (error.status === 404) {
                                            window.basic_conflict_solver.
                                                addRemovedRevision(doc);
                                        } else {
                                            console.error (error.message);
                                        }
                                        load(rev_list[i],i);
                                    }
                                });
                            });
                        }
                    };
                    load (rev_list[0],0);
                    // NOTE : improve, don't load already loaded revision
                }
            }
        };
        priv.mime_object = {
            // <preferred_application> if the name of the app set in
            // preferences.
            // If <preferred_application> does not exist it means that the
            // extension is very specific, so <application> is called instead of
            // the default editor.
            // NOTE : the icon may be set in the app in app_object.
            html:{preferred_application:'text_editor',application:'elrte',
                  icon:'<i class="icon-font"></i>'},
            svg:{preferred_application:'img_editor',application:'svg-edit',
                 icon:'<i class="icon-pencil"></i>'},
            jqs:{application:'jquery-sheet',
                 icon:'<i class="icon-signal"></i>'}
        };
        priv.data_object = {
            documentList:[],
            gadget_object:{}, // contains current gadgets id with their location
            currentFile:null,
            currentEditor:null,
            currentSolver:null,
            currentApp:null,
            currentActivity:null,
            currentRevision:null
        };
        priv.loading_object = {
            spinstate: 0,
            savestate: 0,
            loadstate: 0,
            getliststate: 0,
            removestate: 0,
            main: function (string){
                if (this[string+'state'] === 0){
                    document.querySelector ('#loading_'+string).
                        style.display = 'block';
                }
                this[string+'state'] ++;
            },
            end_main: function (string){
                if (this[string+'state']>0) {
                    this[string+'state']--;
                }
                if (this[string+'state']===0){
                    document.querySelector ('#loading_'+string).
                        style.display = 'none';
                }
            },
            spin:function(){this.main('spin');},
            save:function(){this.main('save');this.spin();},
            load:function(){this.main('load');this.spin();},
            getlist:function(){this.main('getlist');this.spin();},
            remove:function(){this.main('remove');this.spin();},
            end_spin:function(){this.end_main('spin');},
            end_save:function(){this.end_main('save');this.end_spin();},
            end_load:function(){this.end_main('load');this.end_spin();},
            end_getlist:function(){this.end_main('getlist');this.end_spin();},
            end_remove:function(){this.end_main('remove');this.end_spin();}
        };
        priv.lastfailure = {};
        // Initializer //
        priv.init = function() {
        };

        // Methods //
        /**
         * Shows a list of document inside the left nav bar
         * @method showDocumentListInsideLeftNavBar
         */
        priv.showDocumentListInsideLeftNavBar = function () {
            $('#nav_document_list_header').show();
        };

        /**
         * @method getRealApplication
         * @param  {string} appname The app name set in preference.
         * @return {object} The real application object.
         */
        priv.getRealApplication = function (appname) {
            var realappname = that.getPreference (appname);
            if (!realappname) {
                return priv.app_object[appname];
            }
            return priv.app_object[realappname];
        };

        /**
         * @method isJioSet
         * @return {boolean} true if jio is set else false.
         */
        priv.isJioSet = function () {
            return (typeof priv.jio === 'object');
        };

        /**
         * Opens an application
         * @method open
         * @param  {object} option Contains some settings:
         *     - app   {string} The app name we want to open, set in preferences
         *     - force {boolean} To reload applications even if it is the same.
         *             (optional)
         *     - ... and some other parameters
         */
        that.open = function (option) {
            var realapp, realgadgetid, realpath, acientapp;
            if (!option) {
                console.error ('open: This function needs a parameter');
                return null;
            };
            realapp = priv.getRealApplication (option.app);
            if (!realapp) {
                // cannot get real app
                console.error ('Unknown application: ' + option.app);
                return null;
            }
            realgadgetid = option.gadget_id || realapp.gadget_id;
            realpath = realapp.path;
            if (option.force || priv.data_object.currentEditor !== realapp) {
                ancientapp = priv.data_object.gadget_object[realgadgetid];
                if (ancientapp) {
                    // if there is already a gadget there, unload it
                    if (typeof ancientapp.onunload !== 'undefined' &&
                        !ancientapp.onunload()) {
                        // if onunload return false, it means that we must not
                        // load a new gadget because this one is not ready to
                        // exit.
                        return null;
                    }
                }
                priv.data_object.gadget_object[realgadgetid] = realapp;
                TabbularGadget.addNewTabGadget(realpath,realgadgetid);
                // set current editor
                switch (realapp.type) {
                case 'editor':
                    priv.data_object.currentEditor = realapp;
                    break;
                case 'solver':
                    priv.data_object.currentSolver = realapp;
                    break;
                default:
                    break;
                }
                priv.data_object.currentApp = realapp;
            }
            // onload call
            if (typeof realapp.onload !== 'undefined') {
                return realapp.onload(option);
            }
        };

        /**
         * Load an empty page in the place of a specific gadget id
         * @method closeGadgetId
         * @param  {string} gadgetid The gadget id
         */
        that.closeGadgetId = function (gadgetid) {
            TabbularGadget.addNewTabGadget('component/empty.html',gadgetid);
        };

        /**
         * @method getPreference
         * @param  {string} key The preference
         * @return {string} The content of the preference.
         */
        that.getPreference = function (key) {
            return priv.preference_object[key];
        };

        /**
         * @method getContentOf
         * @param  {string} app The application name
         * @return {string} The content of the application, or null.
         */
        that.getContentOf = function (app) {
            var realapp = priv.getRealApplication (app);
            if (!realapp) {
                console.error ('Unknown application: ' + app);
                return null;
            }
            if (typeof realapp.getContent !== 'undefined') {
                return realapp.getContent();
            }
            return null;
        };

        /**
         * @method getPathOf
         * @param  {string} app The application name
         * @return {string} The path of the application component, or null.
         */
        that.getPathOf = function (app) {
            var realapp = priv.getRealApplication (app);
            if (!realapp) {
                console.error ('Unknown application: ' + app);
                return null;
            }
            return realapp.path;
        };

        /**
         * Returns the current editor file extension.
         * @return {string} The current editor file extension.
         */
        that.getExt = function () {
            return priv.data_object.currentEditor.ext;
        };

        /**
         * Returns a clone of the mime object having this file [extension].
         * @method getMimeOfExt
         * @param  {string} extension The extension without '.'.
         * @return {object} A clone of the mime object
         */
        that.getMimeOfExt = function (extension) {
            if (typeof priv.mime_object[extension] === 'undefined') {
                return null;
            }
            return $.extend (true,{},priv.mime_object[extension]);
        };

        /**
         * @method setJio
         * @param {object} storage The storage informations
         */
        that.setJio = function (storage) {
            var leftnavbar;
            if (priv.isJioSet()) {
                alert ('Jio already set.');
                return;
            }
            // if there is not any jio created
            priv.jio = JIO.newJio (JSON.parse(storage));
            // update left nav bar
            leftnavbar = priv.getRealApplication ('leftnavbar');
            if (typeof leftnavbar.update !== 'undefined') {
                leftnavbar.update();
            }
            that.getList();
        };

        /**
         * Returns the array list in priv.data_object
         * @method getList
         * @param  {function} callback Another callback called after retrieving
         *         the list. (optional)
         */
        that.getList = function (callback) {
            if (!priv.isJioSet()) {
                console.error ('No Jio set yet.');
                return;
            }
            priv.loading_object.getlist();
            priv.jio.getDocumentList(
                '.',{
                    sort:{last_modified:'descending',
                          name:'ascending'},
                    limit:{begin:0,end:50},
                    // search:{name:'a'},
                    max_retry:3,
                    success: function (result) {
                        priv.data_object.documentList = result;
                        priv.showDocumentListInsideLeftNavBar();
                        priv.loading_object.end_getlist();
                        if (typeof callback === 'function') {
                            callback();
                        }
                    },
                    error: function (error) {
                        priv.lastfailure.path = '.';
                        priv.lastfailure.method = 'getDocumentList';
                        console.error (error.message);
                        priv.loading_object.end_getlist();
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }
                });
        };

        that.cloneCurrentDocumentList = function () {
            // clone document list
            return $.extend(true,[],priv.data_object.documentList);
        };

        /**
         * Saves the document.
         * @method save
         * @param  {string} basename The document name without ext.
         */
        that.save = function (basename) {
            var current_editor = priv.data_object.currentEditor,
            current_content = current_editor.getContent();
            if (!priv.isJioSet()) {
                console.error ('No Jio set yet.');
                return;
            }
            priv.loading_object.save();
            priv.jio.saveDocument(
                basename+'.'+current_editor.ext,
                current_content,{
                    previous_revision: priv.data_object.currentRevision || '0',
                    success: function (result) {
                        if (result && result.revision) {
                            priv.data_object.currentRevision = result.revision;
                        }
                        priv.loading_object.end_save();
                        that.getList();
                    },
                    error: function (error) {
                        priv.lastfailure.path = basename;
                        priv.lastfailure.method = 'saveDocument';
                        console.error (error.message);
                        priv.loading_object.end_save();
                        that.getList();
                        if (error.conflict_object) {
                            priv.onConflict (error.conflict_object);
                        }
                    }
                });
        };

        /**
         * Loads a document.
         * @method load
         * @param  {string} basename The document name without ext.
         */
        that.load = function (basename) {
            var current_editor = priv.data_object.currentEditor;
            if (!priv.isJioSet()) {
                console.error ('No Jio set yet.');
                return;
            }
            priv.loading_object.load();
            priv.jio.loadDocument(
                basename+'.'+current_editor.ext,{
                    max_retry:3,
                    success: function (result) {
                        if (result && result.revision) {
                            priv.data_object.currentRevision = result.revision;
                            if (result.conflict_object) {
                                priv.onConflict(result.conflict_object);
                            }
                        }
                        current_editor.setContent(result.content);
                        priv.loading_object.end_load();
                    },
                    error: function (error) {
                        priv.lastfailure.path = basename;
                        priv.lastfailure.method = 'loadDocument';
                        console.error (error.message);
                        priv.loading_object.end_load();
                    }
                });
        };

        /**
         * Removes a document.
         * @method remove
         * @param  {string} name The document name.
         * @param  {string} revision The document name.
         */
        that.remove = function (name,revision) {
            console.log (arguments);
            if (!priv.isJioSet()) {
                console.error ('No Jio set yet.');
                return;
            }
            priv.loading_object.remove();
            priv.jio.removeDocument(
                name,{
                    revision: revision || 'last',
                    success: function (result) {
                        priv.loading_object.end_remove();
                        that.getList();
                    },
                    error: function (error) {
                        priv.lastfailure.path = name;
                        priv.lastfailure.method = 'removeDocument';
                        console.error (error.message);
                        priv.loading_object.end_remove();
                        that.getList();
                        if (error.conflict_object) {
                            priv.onConflict (error.conflict_object);
                        }
                    }
                });
        };

        /**
         * Removes several files.
         * @method removeSeveralFromArray
         * @param  {array} documentarray Contains all file names ({string}).
         */
        that.removeSeveralFromArray = function (documentarray) {
            var i, l, cpt = 0, current_editor = priv.data_object.currentEditor;
            if (!priv.isJioSet()) {
                console.error ('No Jio set yet.');
                return;
            }
            var onResponse = function (result) {
                cpt += 1;
                if (cpt === l) {
                    if (typeof current_editor.update !== 'undefined') {
                        if (priv.data_object.currentEditor !== null &&
                            current_editor.path ===
                            priv.data_object.currentEditor.path) {
                            that.getList(current_editor.update);
                        } else {
                            that.getList();
                        }
                    }
                }
                priv.loading_object.end_remove();
            };
            for (i = 0, l = documentarray.length; i < l; i+= 1) {
                priv.loading_object.remove();
                priv.jio.removeDocument(
                    documentarray[i],{
                        revision: 'last',
                        success: onResponse,
                        error: onResponse
                    });
            }
        };

        /**
         * Called when there is conflict
         * @method onConflict
         * @param  {object} doc The document object
         * @param  {object} conflict_object The conflict object
         */
        priv.onConflict = function (conflict_object) {
            // get the good conflict solver and load it
            // if (ext && priv.conflict_solver_object[ext]) {
            //     that.open({app:priv.conflict_solver_object[ext],
            //                // local_content:document.content,
            //                conflict_object:conflict_object});
            // } else {
                that.open({app:'basic_conflict_solver',
                           // local_content:document.content,
                           conflict_object:conflict_object});
            // }
        };

        /**
         * Solve the conflict
         * @method solveConflict
         * @param  {object} conflict_data The conflict object
         * @param  {string} data The new content of the new revision
         */
        that.solveConflict = function (conflict_object, data) {
            that.closeGadgetId (priv.data_object.currentSolver.gadget_id);
            priv.data_object.currentSolver = null;
            priv.data_object.currentEditor.setContent(data);
            priv.loading_object.save();
            conflict_object.solveConflict(
                data,{
                    success: function (result) {
                        if (result && result.revision) {
                            priv.data_object.currentRevision = result.revision;
                        }
                        priv.loading_object.end_save();
                        that.getList();
                    },
                    error: function (error) {
                        priv.lastfailure.path = basename;
                        priv.lastfailure.method = 'saveDocument';
                        console.error (error.message);
                        priv.loading_object.end_save();
                        that.getList();
                        if (error.conflict_object) {
                            priv.onConflict (error.conflict_object);
                        }
                    }
                });
        };

        /**
         * Get current activity.
         * @method getActivity
         * @return {array} A list of current states for each current activities.
         */
        that.getActivity = function () {
            var activity = priv.jio.getJobArray ();
            var lastfailure = that.getLastFailure();
            var res = [], i;
            for (i = 0; i < activity.length; i+= 1) {
                switch (activity[i].command.label) {
                case 'saveDocument':
                    res.push(activity[i].storage.type+
                             ': Saving "' + activity[i].command.path + '".');
                    break;
                case 'loadDocument':
                    res.push(activity[i].storage.type+
                             ': Loading "' + activity[i].command.path + '".');
                    break;
                case 'removeDocument':
                    res.push(activity[i].storage.type+
                             ': Removing "' + activity[i].command.path + '".');
                    break;
                case 'getDocumentList':
                    res.push(activity[i].storage.type+
                             ': Get document list' +
                             ' at "' + activity[i].command.path + '".');
                    break;
                default:
                    res.push('Unknown action.');
                    break;
                }
            }
            if (lastfailure.method) {
                switch (lastfailure.method) {
                case 'saveDocument':
                    res.push('<span style="color:red;">LastFailure: '+
                             'Fail to save "'+ lastfailure.path + '"</span>');
                    break;
                case 'loadDocument':
                    res.push('<span style="color:red;">LastFailure: '+
                             'Fail to load "'+ lastfailure.path + '"</span>');
                    break;
                case 'removeDocument':
                    res.push('<span style="color:red;">LastFailure: '+
                             'Fail to remove "'+ lastfailure.path + '"</span>');
                    break;
                case 'getDocumentList':
                    res.push('<span style="color:red;">LastFailure: '+
                             'Fail to retreive list ' +
                             ' at "' + lastfailure.path + '"</span>');
                    break;
                default:
                    break;
                }
            }
            return res;
        };

        /**
         * Returns the last job failure.
         * @method getLastFailure
         * @return {object} The last failure.
         */
        that.getLastFailure = function () {
            return priv.lastfailure;
        };

        // End of class //
        priv.init();
        return that;
    }());                       // end OfficeJS

    // show gadgets
    OfficeJS.open({app:'topnavbar'});
    OfficeJS.open({app:'leftnavbar'});
    OfficeJS.open({app:'login'});
}());
