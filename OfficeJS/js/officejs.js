(function () {
    // Tools
    var extend = function (o1,o2) {
        var key; for (key in o2) { o1[key] = o2[key]; } return o1;
    },
    baseName = function (filename) {
        var split = filename.split('.');
        if (split.length > 1) {
            split.length -= 1;
            return split.join('.');
        } else {
            return filename;
        }
    };

    /**
     * OfficeJS Object
     */
    window.OfficeJS = (function () {
        var that = {}, priv = {};
        // Attributes //
        priv.preference_object = {
            default_app:'login',
            login:'login',
            topnavbar:'topnavbar',
            leftnavbar:'leftnavbar',
            documentLister:'slickgrid',
            editpreferences:'simplepreferenceeditor',
            textEditor:'elrte',
            imgEditor:'svg-edit',
            speadsheet:'jquery-sheet'
        };
        priv.app_object = {
            topnavbar: {
                type:'nav',
                path:'component/top_nav_bar.html',
                gadgetid:'page-top_nav_bar'
            },
            leftnavbar: {
                type:'nav',
                path:'component/left_nav_bar.html',
                gadgetid:'page-left_nav_bar',
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
                gadgetid:'page-content',
                getContent: function () {
                    var tmp = {
                        userName: 'NoName',
                        password: 'NoPwd'
                    };
                    // NOTE : stringify or not ?
                    return JSON.stringify (tmp);
                }
            },
            simplepreferenceeditor: {
                // NOTE
                type:'editor',
                path:'',
                // ...
            },
            elrte: {
                type:'editor',  // means it can edit a content
                path:'component/elrte.html',
                gadgetid:'page-content',
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
                        if (typeof param.fileName !== 'undefined') {
                            $('#input_fileName').attr('value',
                                                      baseName(param.fileName));
                            that.load(baseName(param.fileName));
                        } else {
                            $('#input_fileName').attr(
                                'value','untitled');
                        }
                    },1000);
                }
                // TODO : onunload, are you sure? leave without saving?
            },
            'jquery-sheet': {
                type:'editor',
                path:'component/jquery-sheet.html',
                gadgetid:'page-content',
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
                        if (typeof param.fileName !== 'undefined') {
                            $('#input_fileName').attr('value',
                                                      baseName(param.fileName));
                            that.load(baseName(param.fileName));
                        } else {
                            $('#input_fileName').attr(
                                'value','untitled');
                        }
                    },1000);
                }
            },
            'svg-edit': {
                type:'editor',
                path:'component/svg-edit.html',
                gadgetid:'page-content',
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
                        if (typeof param.fileName !== 'undefined') {
                            $('#input_fileName').attr('value',
                                                      baseName(param.fileName));
                            that.load(baseName(param.fileName));
                        } else {
                            $('#input_fileName').attr(
                                'value','untitled');
                        }
                    });
                }
            },
            slickgrid: {
                type:'editor',
                path:'component/slickgrid_document_lister.html',
                gadgetid:'page-content',
                update: function () {
                    OfficeJS.open({app:'documentLister',force:true});
                }
            }
        };
        priv.mime_object = {
            // <pref> if the name of the app set in preferences.
            // If pref does not exist it means that the extension is very
            // specific, so <app> is called instead of the default editor.
            // NOTE : the icon may be set in the app in app_object.
            html:{pref:'imgEditor',app:'elrte',
                  icon:'<i class="icon-font"></i>'},
            svg:{pref:'imgEditor',app:'svg-edit',
                 icon:'<i class="icon-pencil"></i>'},
            jqs:{app:'jquery-sheet',
                 icon:'<i class="icon-signal"></i>'}
        };
        priv.data_object = {
            documentList:[],
            gadget_object:{}, // contains current gadgets id with their location
            currentFile:null,
            currentEditor:null
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
            realapp = priv.getRealApplication (option.app);
            if (!realapp) {
                // cannot get real app
                console.error ('Unknown application: ' + option.app);
                return null;
            }
            realgadgetid = realapp.gadgetid;
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
                default:
                    priv.data_object.currentEditor = null;
                    break;
                }
            }
            // onload call
            if (typeof realapp.onload !== 'undefined') {
                return realapp.onload(option);
            }
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
         * @param {object} applicant The applicant informations
         */
        that.setJio = function (storage,applicant) {
            var leftnavbar;
            if (priv.isJioSet()) {
                alert ('Jio already set.');
                return;
            }
            // if there is not any jio created
            priv.jio = JIO.createNew (storage,applicant);
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
            priv.jio.getDocumentList({
                'sort':{'lastModified':'descending',
                        'fileName':'ascending'},
                'limit':{begin:0,end:50},
                // 'search':{fileName:'a'},
                'maxtries':3,
                'callback':function (result) {
                    if (result.status === 'done') {
                        priv.data_object.documentList = result.return_value;
                        priv.showDocumentListInsideLeftNavBar();
                    } else {
                        console.error (result.message);
                    }
                    priv.loading_object.end_getlist();
                    if (typeof callback !== 'undefined') {
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
            var current_editor = priv.data_object.currentEditor;
            if (!priv.isJioSet()) {
                console.error ('No Jio set yet.');
                return;
            }
            priv.loading_object.save();
            priv.jio.saveDocument({
                'fileName':basename+'.'+current_editor.ext,
                'fileContent':current_editor.getContent(),
                'callback':function (result) {
                    if (result.status === 'fail') {
                        console.error (result.message);
                    }
                    priv.loading_object.end_save();
                    that.getList();
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
            priv.jio.loadDocument({
                'fileName':basename+'.'+current_editor.ext,
                'maxtries':3,
                'callback':function (result) {
                    if (result.status === 'fail') {
                        console.error (result.message);
                    } else {
                        current_editor.setContent(
                            result.return_value.fileContent);
                    }
                    priv.loading_object.end_load();
                }
            });
        };

        /**
         * Removes a document.
         * @method remove
         * @param  {string} name The document name.
         */
        that.remove = function (name) {
            if (!priv.isJioSet()) {
                console.error ('No Jio set yet.');
                return;
            }
            priv.loading_object.remove();
            priv.jio.removeDocument({
                'fileName':name,
                'callback':function (result) {
                    if (result.status === 'fail') {
                        console.error (result.message);
                    }
                    priv.loading_object.end_remove();
                    that.getList();
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
            for (i = 0, l = documentarray.length; i < l; i+= 1) {
                priv.loading_object.remove();
                priv.jio.removeDocument({
                    fileName:documentarray[i],
                    callback:function (result) {
                        cpt += 1;
                        console.log (result);
                        if (cpt === l) {
                            if (typeof current_editor.update !== 'undefined') {
                                that.getList(current_editor.update);
                            }
                        }
                        priv.loading_object.end_remove();
                    }});
            }
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
