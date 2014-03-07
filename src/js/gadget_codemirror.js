/*global window, jQuery, rJS, CodeMirror*/
/*jslint indent: 2 */
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

    .ready(function () {
      var textarea = $("textarea#codemirror")[0];
      rJS(this).cmInstance = CodeMirror.fromTextArea(textarea);
    });

}(window, jQuery, rJS, CodeMirror));
