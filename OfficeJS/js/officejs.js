(function () {
    // Tools
    var extend = function (o1,o2) {
        var key; for (key in o2) { o1[key] = o2[key]; } return o1;
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
            textEditor:'elrte'
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
                gadgetid:'page-left_nav_bar'
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
                element:'#elrte_editor',
                getContent: function () {
                    $(this.element).elrte('updateSource');
                    return $(this.element).elrte('val');
                },
                setContent: function (content) {
                    $(this.element).elrte('val', content);
                },
                onload: function (param) {
                    if (typeof param.fileName !== 'undefined') {
                        setTimeout(function () {
                            $('#input_fileName').attr('value',param.fileName);
                            that.load(param.fileName);
                        },50);
                    }
                }
                // TODO : onunload, are you sure? leave without saving?
            },
            slickgrid: {
                type:'editor',
                path:'component/slickgrid_document_lister.html',
                gadgetid:'page-content'
            }
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
            var i, html_string = '<ul>';
            for (i = 0; i < priv.data_object.documentList.length; i += 1) {
                html_string += '<li>' +
                    '<a href="#/texteditor:' +
                    priv.data_object.documentList[i].fileName + '"'+
                    ' onclick="javascript:'+
                    'OfficeJS.open({app:\'textEditor\',fileName:\''+
                    priv.data_object.documentList[i].fileName + '\'});'+
                    'return false;">'+
                    priv.data_object.documentList[i].fileName +
                    '</a>' +
                    '</li>';
            }
            html_string += '</ul>';
            if (html_string === '<ul></ul>') {
                // if there's no document
                html_string = '<ul><li>No document</li></ul>';
            }
            // show list in the left nav bar
            $('#nav_document_list').html(html_string);
            $('#nav_document_list_header').show();
        };

        /**
         * @method getRealApplication
         * @param  {string} appname The app name set in preference.
         * @return {object} The real application object.
         */
        priv.getRealApplication = function (appname) {
            var realappname = that.getPreference (appname);
            if (!realappname) { return; } // undefined
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
         *     - app {string} The app name we want to open, set in preferences
         *     - ... and some other parameters
         */
        that.open = function (option) {
            var realapp, realgadgetid, realpath, acientapp;
            realapp = priv.getRealApplication (option.app);
            realgadgetid = realapp.gadgetid;
            realpath = realapp.path;
            if (!realapp) {
                // cannot get real app
                console.error ('Unknown application: ' +
                               that.getPreference(option.app));
                return null;
            }
            if (priv.data_object.currentEditor !== realapp) {
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
            var realapp = that.getPreference (app);
            if (!realapp) {
                console.error ('Unknown application: ' +
                               that.getPreference(app));
                return null;
            }
            if (priv.app_object[realapp] &&
                typeof priv.app_object[realapp].getContent !== 'undefined') {
                return priv.app_object[realapp].getContent();
            }
            return null;
        };

        /**
         * @method getPathOf
         * @param  {string} app The application name
         * @return {string} The path of the application component, or null.
         */
        that.getPathOf = function (app) {
            var realapp = that.getPreference(app);
            if (!realapp) {
                console.error ('Unknown application: ' +
                               that.getPreference(app));
                return null;
            }
            if (priv.app_object[realapp]) {
                return priv.app_object[realapp].path;
            }
            return null;
        };

        /**
         * @method setJio
         * @param {object} storage The storage informations
         * @param {object} applicant The applicant informations
         */
        that.setJio = function (storage,applicant) {
            if (priv.isJioSet()) {
                alert ('Jio already set.');
                return;
            }
            // if there is not any jio created
            priv.jio = JIO.createNew (storage,applicant);
            that.getList();
        };

        /**
         * Returns the array list in priv.data_object
         * @method getList
         */
        that.getList = function () {
            if (!priv.isJioSet()) {
                console.error ('No Jio set yet.');
                return;
            }
            priv.loading_object.getlist();
            priv.jio.getDocumentList({
                'maxtries':3,
                'callback':function (result) {
                    if (result.status === 'done') {
                        priv.data_object.documentList = result.return_value;
                        priv.showDocumentListInsideLeftNavBar();
                    } else {
                        console.error (result.message);
                    }
                    priv.loading_object.end_getlist();
                }
            });
        };

        that.getCurrentDocumentList = function () {
            // clone document list
            var array = $.extend(true,[],priv.data_object.documentList), i;
            for (i = 0; i < array.length; i += 1) {
                array[i].lastModified = (new Date(array[i].lastModified)).
                    toLocaleString();
                array[i].creationDate = (new Date(array[i].creationDate)).
                    toLocaleString();
            }
            return array;
        };

        /**
         * Saves the document.
         * @method save
         * @param  {string} name The document name.
         * @param  {string} content The content of the document.
         */
        that.save = function (name) {
            var current_editor = priv.data_object.currentEditor;
            if (!priv.isJioSet()) {
                console.error ('No Jio set yet.');
                return;
            }
            priv.loading_object.save();
            priv.jio.saveDocument({
                'fileName':name,
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
         * @param  {string} name The document name.
         */
        that.load = function (name) {
            var current_editor = priv.data_object.currentEditor;
            if (!priv.isJioSet()) {
                console.error ('No Jio set yet.');
                return;
            }
            priv.loading_object.load();
            priv.jio.loadDocument({
                'fileName':name,
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

        // End of class //
        priv.init();
        return that;
    }());                       // end OfficeJS

    // show gadgets
    OfficeJS.open({app:'topnavbar'});
    OfficeJS.open({app:'leftnavbar'});
    OfficeJS.open({app:'login'});
}());
