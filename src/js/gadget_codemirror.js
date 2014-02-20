/*jslint indent: 2, evil: true*/
/*global window, jQuery, rJS, CodeMirror*/
"use strict";

(function (window, $, rJS, CodeMirror) {

  rJS(window).declareMethod('getContent', function () {
    return rJS(this).cmInstance.getValue();
  })

    .declareMethod('setContent', function (content) {
      rJS(this).cmInstance.setValue(content);
    })

    .declareMethod('clearContent', function () {
      rJS(this).cmInstance.setValue("");
    })

    .declareMethod('objectInstance', function () {
      return rJS(this).cmInstance;
    })

    .ready(function (g) {
      var textarea = $("textarea#codemirror")[0];
      g.cmInstance = CodeMirror.fromTextArea(textarea);
    });

}(window, jQuery, rJS, CodeMirror));
