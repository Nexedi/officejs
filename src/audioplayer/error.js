/*global  rJS, window*/
/*jslint nomen: true*/

(function (window, rJS) {
  "use strict";
  var h2_context;
  rJS(window)
    .ready(function (g) {
      h2_context = g.__element.getElementsByTagName('div')[0];
    })
    .declareMethod("display", function (options) {
      h2_context.innerHTML = " <h2>ERROR:Music not found</h2>";
    })
    .declareMethod("noDisplay", function (options) {
      h2_context.innerHTML = "";
    });
}(window, rJS));
