/*global jQuery, rJS */
(function (window, $, rJS) {
  "use strict";

  var gk = rJS(window),
    io_dict = {
      "path" :      "../jio_drive/io.html",
      "title" :     "IO",
      "interface" : "http://www.renderjs.org/interface/io"
    },
    editor_1_dict = {
      "path" :      "../editor_raw/index.html",
      "title" :     "Simple Text Editor Gadget",
      "interface" : "http://www.renderjs.org/interface/editor"
    },
    editor_2_dict = {
      "path" :      "../editor_jqte/index.html",
      "title" :     "JQuery Text Editor Gadget",
      "interface" : "http://www.renderjs.org/interface/editor"
    },
    editor_3_dict = {
      "path" :      "../editor_ace/index.html",
      "title" :     "Ace Editor Gadget",
      "interface" : "http://www.renderjs.org/interface/editor"
    },
    editor_4_dict = {
      "path" :      "../editor_aloha/index.html",
      "title" :     "Aloha Editor Gadget",
      "interface" : "http://www.renderjs.org/interface/editor"
    },
    catalog_list = [
      {
        "path" :      "./officejs.html",
        "title" :     "Office JS",
        "interface" : "http://www.renderjs.org/interface/officejs"
      }
    ];

  catalog_list.push(io_dict);
  catalog_list.push(editor_1_dict);
  catalog_list.push(editor_2_dict);
  catalog_list.push(editor_3_dict);
  catalog_list.push(editor_4_dict);

  gk.declareMethod('allDocs', function (filter) {
    var deferred = $.Deferred();
    if (filter === undefined) {
      deferred.resolve(catalog_list);
    } else if (filter.query ===
        'interface: "http://www.renderjs.org/interface/io"') {
      deferred.resolve([io_dict]);
    } else if (filter.query ===
        'interface: "http://www.renderjs.org/interface/editor"') {
      deferred.resolve([editor_1_dict, editor_2_dict,
                        editor_3_dict, editor_4_dict]);
    } else {
      deferred.reject("Unsupported filter");
    }
    return deferred.promise();
  });

}(window, jQuery, rJS));
