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
    current_hash = 'default',
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
        var new_hash = loadcurrentpage(), prev_hash = 'default';
        if (routes[current_hash].template !== routes[new_hash].template) {
            // check if it is necessary to repaint the page.
            prev_hash = current_hash;
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
    };
    // end get the current editor
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
            filename = $('#input_fileName').attr('value');
            filecontent = getCurrentEditor().getHTML();
            priv.jio.saveDocument({
                'fileName':filename,
                'fileContent':filecontent,
                'callback':function (result){
                    alert (result.isSaved ? 'Document Saved.' :
                           'Error: ' + result.message);
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
                'callback':function (result){
                    if (result.document.fileName) {
                        getCurrentEditor().setHTML(
                            result.document.fileContent);
                        alert ('Document loaded');
                    } else {
                        alert ('Error: ' + result.message);
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
            filename = $('#input_fileName').attr('value');
            priv.jio.removeDocument({
                'fileName':filename,
                'callback':function (result) {
                    alert (result.isRemoved?'Document Removed.':
                           'Error: '+result.message);
                    publ.getlist();
                }
            });
        };
        publ.getlist = function () {
            if (!priv.jioIsSet()) {
                alert ('No Jio set yet.');
                return;
            }
            priv.jio.getDocumentList({
                'maxtries':3,
                'callback':function (result) {
                    var htmlString = '', i, document_array = [];
                    for (i = 0; i < result.list.length; i += 1) {
                        htmlString += '<li><a href="#/texteditor:fileName='+
                            result.list[i].fileName + '">\n' +
                            result.list[i].fileName;
                        result.list[i].creationDate =
                            (new Date(result.list[i].creationDate)).
                            toLocaleString();
                        result.list[i].lastModified =
                            (new Date(result.list[i].lastModified)).
                            toLocaleString();
                        document_array.push (result.list[i]);
                        htmlString += '</a></li>\n';
                    }
                    if (htmlString === '') {
                        htmlString = 'No document';
                    }
                    ich_object.DocumentList = document_array;
                    document.querySelector ('#document_list').
                        innerHTML = htmlString;
                }
            });
        };
        return publ;
    }());
    // When someone clicks on a <a href..>..</a>, the interface may change.
    $(window).bind('hashchange', hrefClicked);
});
