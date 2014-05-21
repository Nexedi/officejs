/*jslint nomen: true*/
/*global rJS */
(function (window, rJS) {
  "use strict";

  function escape_text(text) {
    // &, ", ', <, >, /
    return text.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;");
  }

  var gk = rJS(window);

  gk.declareMethod('setContent', function (value) {
    this.__element.getElementsByTagName('textarea')[0].value =
      escape_text(value);
  })
    .declareMethod('getContent', function () {
      return this.__element.getElementsByTagName('textarea')[0].value;
    });

}(window, rJS));
