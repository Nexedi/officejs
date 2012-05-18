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
        JIOStorages: '../lib/jio/jio.storage.min',

        OfficeJS: 'moduleloader'
    }
});
require(['OfficeJS'],function (OJS) {
    // globals
    var JIO = OJS.JIO,
    $ = OJS.jQuery,
    Base64 = OJS.Base64,
    ich = OJS.ich,
    // conf vars
    routes = {
        'default' : 'home',
        '/home' : 'home',
        '/about' : 'about',
        '/login' : 'login',
        '/texteditor' : 'text_editor'
    },
    // some vars
    current_page = 'home',
    ich_object = {DocumentList:[]},
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
                return current_page;
            }
        } else {
            // default home
            new_hash = 'default';
        }
        return routes[new_hash];
    },
    // end load current page
    ////////////////////////////////////////////////////////////////////////////
    // Repaint main page
    repaint = function () {
        $('#main').html(ich[current_page](ich_object,true));
    },
    // end repaint main page
    ////////////////////////////////////////////////////////////////////////////
    // change page according to the event
    hrefClicked = function () {
        var new_page = loadcurrentpage();
        if (current_page !== new_page) {
            // check if it is necessary to repaint the page.
            current_page = new_page;
            repaint();
        }
    };
    // end change page according to the event
    ////////////////////////////////////////////////////////////////////////////

    current_page = loadcurrentpage();
    repaint();

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
        };
        publ.save = function () {
            var filename, filecontent;
            if (!priv.jioIsSet()) {
                alert ('No Jio set yet.');
                return;
            }
            filename = $('#input_fileName').attr('value');
            filecontent = $('#input_content').attr('value');
            priv.jio.saveDocument({
                'fileName':filename,
                'fileContent':filecontent,
                'maxtries':3,
                'callback':function (result){
                    alert (result.isSaved ? 'Document Saved.' :
                           'Error: ' + result.message);
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
                'maxtries':3,
                'callback':function (result){
                    if (result.document.fileName) {
                        $('#input_content').attr(
                            'value',result.document.fileContent);
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
                'maxtries':3,
                'callback':function (result) {
                    alert (result.isRemoved?'Document Removed.':
                           'Error: '+result.message);
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
                    var htmlList, i;
                    htmlList = '<ul>\n';
                    for (i in result.list) {
                        htmlList += '<li>\n';
                        htmlList += result.list[i].fileName;
                        htmlList += '</li>\n';
                    }
                    htmlList += '</ul>\n';
                    $('#document_list').html(htmlList);
                    ich_object.DocumentList = result.list;
                    console.log (result.list);
                    alert (result.message);
                }
            });
        };
        return publ;
    }());
    // When someone clicks on a <a href..>..</a>, the interface may change.
    $(window).bind('hashchange', hrefClicked);
});
