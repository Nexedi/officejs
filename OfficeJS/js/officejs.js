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
            textEditor:'elrte'
        };
        priv.app_object = {
            login: {
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
            elrte: {
                path:'component/elrte.html',
                element:'#elrte_editor',
                getContent: function () {
                    $(this.element).elrte('updateSource');
                    return $(this.element).elrte('val');
                },
                onload: function () {},
                onunload: function () {}
            }
        };
        priv.data_object = {
            documentList:[]
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
         * @method getPreference
         * @param  {string} key The preference
         * @return {object} a clone of the preference object
         */
        that.getPreference = function (key) {
            return priv.preference_object[key];
        };

        /**
         * @method jioIsSet
         * @return {boolean} true if jio is set else false.
         */
        priv.jioIsSet = function () {
            return (typeof priv.jio === 'object');
        };

        /**
         * @method getContentOf
         * @param  {string} app The application name
         * @return {string} The content of the application, or null.
         */
        that.getContentOf = function (app) {
            if (priv.app_object[app] &&
                typeof priv.app_object[app].getContent !== 'undefined') {
                return priv.app_object[app].getContent();
            }
            return null;
        };

        /**
         * @method getPathOf
         * @param  {string} app The application name
         * @return {string} The path of the application component, or null.
         */
        that.getPathOf = function (app) {
            if (priv.app_object[app]) {
                return priv.app_object[app].path;
            }
            return null;
        };

        /**
         * @method setJio
         * @param {object} storage The storage informations
         * @param {object} applicant The applicant informations
         */
        that.setJio = function (storage,applicant) {
            if (priv.jioIsSet()) {
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
            if (!priv.jioIsSet()) {
                console.error ('No Jio set yet.');
                return;
            }
            priv.loading_object.getlist();
            priv.jio.getDocumentList({
                'maxtries':3,
                'callback':function (result) {
                    if (result.status === 'done') {
                        priv.data_object = result.return_value;
                    } else {
                        console.error (result.message);
                    }
                    priv.loading_object.end_getlist();
                    // TODO : show list somewhere
                }
            });
        };

        /**
         * Saves the document.
         * @method save
         * @param  {string} name The document name.
         * @param  {string} content The content of the document.
         */
        that.save = function (name, content) {
            if (!priv.jioIsSet()) {
                console.error ('No Jio set yet.');
                return;
            }
            priv.loading_object.save();
            priv.jio.saveDocument({
                'fileName':name,
                'fileContent':content,
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
            if (!priv.jioIsSet()) {
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
                    }
                    priv.loading_object.end_load();
                    // TODO : show content somewhere
                }
            });
        };

        /**
         * Removes a document.
         * @method remove
         * @param  {string} name The document name.
         */
        that.remove = function (name) {
            if (!priv.jioIsSet()) {
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
    TabbularGadget.addNewTabGadget(
        'component/top_nav_bar.html',
        'page-top_nav_bar',
        undefined);
    TabbularGadget.addNewTabGadget(
        'component/left_nav_bar.html',
        'page-left_nav_bar',
        undefined);
    TabbularGadget.addNewTabGadget(
        'component/login.html',
        'page-content',
        undefined);
}());
