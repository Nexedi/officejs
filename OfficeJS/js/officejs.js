// NEXEDI
// Author: Tristan Cavelier <tristan.cavelier@tiolive.com>
// Date: Wed May 16 14:31:08 2012

require.config ({
    paths: {
        LocalOrCookieStorage: '../lib/jio/localorcookiestorage.min',
        jQueryAPI: '../lib/jquery/jquery',
        jQuery: '../js/jquery.requirejs_module',
        JIO: '../src/jio',
        Base64API: '../lib/base64/base64',
        Base64: '../js/base64.requirejs_module',
        JIOStorages: '../src/jio.storage',

        OfficeJS: 'moduleloader'
    }
});
require(['OfficeJS'],function (OJS) {
    // globals
    var JIO = OJS.JIO,
    $ = OJS.jQuery,
    Base64 = OJS.Base64,
    ich = OJS.ich,
    // some vars
    text_editor_loaded_once = false,
    current_hash = '',
    ich_object = {DocumentList:[],CurrentFileName:''},
    current_editor = null,
    route_param = {},
    // conf vars
    routes = {
        'default' : {template:'home'},
        '/home' : {template:'home'},
        '/about' : {template:'about'},
        '/login' : {template:'login'},
        '/doclist' : {template:'document_list'},
        '/texteditor' : {
            template:'text_editor',
            onload:function(){
                var intervalid;
                if (!text_editor_loaded_once) {
                    xinha_init();
                    text_editor_loaded_once = true;
                }
                document.querySelector('#text_editor').style.display = 'block';
                current_editor = 'xinha';
                if (typeof route_param.fileName !== 'undefined') {
                    intervalid = setInterval(function(){
                        try {
                            getCurrentEditor().getHTML();
                        } catch (e) {
                            return;
                        }
                        $('#input_fileName').attr(
                            'value',route_param.fileName);
                        OfficeJS.load();
                        clearInterval(intervalid);
                    },50);
                }
            },
            onunload:function(){
                document.querySelector('#text_editor').style.display = 'none';
                ich_object.CurrentFileName = $('#input_fileName').attr('value');
                current_editor = null;
            },
            onrestart: function(){
                this.onload();
            }
        }
    },
    ////////////////////////////////////////////////////////////////////////////
    // load current page
    loadcurrentpage = function () {
        var new_hash, params, i;
        // get new hash
        new_hash = location.hash.split('#');
        if (typeof new_hash[1] !== "undefined") {
            // new direction
            new_hash = new_hash[1];
            params = new_hash.split(':');
            new_hash = params[0];
            if (typeof routes[new_hash] === "undefined") {
                return current_hash;
            }
            // set route_parameters
            route_param = {};
            for (i = 1; i < params.length; i += 1) {
                var tmp = params[i].split('=');
                route_param[tmp[0]] = tmp[1];
            }
        } else {
            // default home
            new_hash = 'default';
        }
        return new_hash;
    },
    // end load current page
    ////////////////////////////////////////////////////////////////////////////
    // Repaint main page
    repaint = function () {
        $('#main').html(ich[routes[current_hash].template](ich_object,true));
    },
    // end repaint main page
    ////////////////////////////////////////////////////////////////////////////
    // change page according to the event
    hrefClicked = function () {
        var new_hash = loadcurrentpage(), prev_hash = current_hash;
        if (current_hash === '') {
            current_hash = new_hash;
            repaint();
        }
        if (routes[current_hash].template !== routes[new_hash].template) {
            // check if it is necessary to repaint the page.
            current_hash = new_hash;
            if (typeof routes[prev_hash].onunload === 'function') {
                routes[prev_hash].onunload();
            }
            repaint();
            if (typeof routes[current_hash].onload === 'function') {
                routes[current_hash].onload();
            }
        } else {
            if (typeof routes[current_hash].onrestart === 'function') {
                routes[current_hash].onrestart();
            }
        }
    },
    // end change page according to the event
    ////////////////////////////////////////////////////////////////////////////
    // get the currrent editor
    getCurrentEditor = function () {
        switch (current_editor) {
        case 'xinha':
            return xinha_editors['textEditor'];
        case 'svg':
            return null;
        case 'calc':
            return null;
        default:
            return null;
        }
    },
    // end get the current editor
    ////////////////////////////////////////////////////////////////////////////
    // loading function
    loading_object = {
        spinstate: 0,savestate: 0,loadstate: 0,getliststate: 0,removestate: 0,
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
    }
    // end loading function
    ////////////////////////////////////////////////////////////////////////////

    // repaint the page
    hrefClicked();

    window.OfficeJS = (function () {
        var publ = {}, priv = {};
        priv.jioIsSet = function () {
            return (typeof priv.jio === 'object');
        };
        publ.setJio = function () {
            if (priv.jioIsSet()) {
                alert ('Jio already set.');
                return;
            }
            alert ($('#input_json_storage').attr('value'));
            // if there is not any jio created
            priv.jio = JIO.createNew (
                JSON.parse ( $('#input_json_storage').attr('value') ),
                JSON.parse ( $('#input_json_applicant').attr('value') )
            );
            publ.getlist();
        };
        publ.save = function () {
            var filename, filecontent;
            if (!priv.jioIsSet()) {
                alert ('No Jio set yet.');
                return;
            }
            loading_object.save();
            filename = $('#input_fileName').attr('value');
            filecontent = getCurrentEditor().getHTML();
            priv.jio.saveDocument({
                'fileName':filename,
                'fileContent':filecontent,
                'callback':function (result){
                    if (result.status === 'fail') {
                        console.error (result.error);
                    }
                    loading_object.end_save();
                    publ.getlist();
                }
            });
        };
        publ.load = function () {
            var filename;
            if (!priv.jioIsSet()) {
                alert ('No Jio set yet.');
                return;
            }
            loading_object.load();
            filename = $('#input_fileName').attr('value');
            priv.jio.loadDocument({
                'fileName':filename,
                'maxtries':3,
                'callback':function (result){
                    if (result.return_value.fileName) {
                        getCurrentEditor().setHTML(
                            result.return_value.fileContent);
                    } else {
                        console.error (result.error);
                    }
                    loading_object.end_load();
                }
            });
        };
        publ.remove = function () {
            var filename;
            if (!priv.jioIsSet()) {
                alert ('No Jio set yet.');
                return;
            }
            loading_object.remove();
            filename = $('#input_fileName').attr('value');
            priv.jio.removeDocument({
                'fileName':filename,
                'callback':function (result) {
                    if (result.status === 'fail') {
                        console.error (result.error);
                    }
                    loading_object.end_remove();
                    publ.getlist();
                }
            });
        };
        publ.getlist = function () {
            if (!priv.jioIsSet()) {
                alert ('No Jio set yet.');
                return;
            }
            loading_object.getlist();
            priv.jio.getDocumentList({
                'maxtries':3,
                'callback':function (result) {
                    if (result.status === 'done') {
                        var htmlString = '', i, document_array = [];
                        for (i = 0; i < result.return_value.length; i += 1) {
                            htmlString += '<li><a href="#/texteditor:fileName='+
                                result.return_value[i].fileName + '">\n' +
                                result.return_value[i].fileName;
                            result.return_value[i].creationDate =
                                (new Date(result.return_value[i].creationDate)).
                                toLocaleString();
                            result.return_value[i].lastModified =
                                (new Date(result.return_value[i].lastModified)).
                                toLocaleString();
                            document_array.push (result.return_value[i]);
                            htmlString += '</a></li>\n';
                        }
                        if (htmlString === '') {
                            htmlString = 'No document';
                        }
                        ich_object.DocumentList = document_array;
                        document.querySelector ('#document_list').
                            innerHTML = htmlString;
                        loading_object.end_getlist();
                    }
                }
            });
        };
        return publ;
    }());
    // When someone clicks on a <a href..>..</a>, the interface may change.
    $(window).bind('hashchange', hrefClicked);
});
