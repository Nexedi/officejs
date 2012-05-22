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
    // conf vars
    routes = {
        'default' : {template:'home'},
        '/home' : {template:'home'},
        '/about' : {template:'about'},
        '/login' : {template:'login'},
        '/texteditor' : {
            template:'text_editor',
            onload:function(){
                // todo
                if (!text_editor_loaded_once) {
                    xinha_init();
                    text_editor_loaded_once = true;
                }
                document.querySelector('#text_editor').style.display = 'block';
                current_editor = 'xinha';
            },
            onunload:function(){
                document.querySelector('#text_editor').style.display = 'none';
                ich_object.CurrentFileName = $('#input_fileName').attr('value');
                current_editor = null;
            },
        }
    },
    ////////////////////////////////////////////////////////////////////////////
    // load current page
    loadcurrentpage = function () {
        var new_hash;
        // get new hash
        new_hash = location.hash.split('#');
        if (typeof new_hash[1] !== "undefined") {
            // new direction
            new_hash = new_hash[1];
            if (typeof routes[new_hash] === "undefined") {
                return current_hash;
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
                    var htmlString = '', i;
                    for (i = 0; i < result.list.length; i += 1) {
                        htmlString += '<li>\n';
                        htmlString += result.list[i].fileName;
                        htmlString += '</li>\n';
                    }
                    if (htmlString === '') {
                        htmlString = 'No document';
                    }
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
