/*jslint indent: 2 */
/*global window, jQuery, rJS, svgCanvas, svgEditor */
"use strict";

(function (window, rJS) {

  svgEditor.setConfig({
    extPath: '../lib/svg-edit-2.6/extensions/',
    imgPath: '../lib/svg-edit-2.6/images/'
  });

  rJS(window).declareMethod('getContent', function () {
    console.log(window.svgCanvas.getSvgString());
    return window.svgCanvas.getSvgString();
  }).
    declareMethod('setContent', function (content) {
      console.log(window.content);
      window.svgCanvas.setSvgString(content);
    }).
    declareMethod('clearContent', function () {
      window.svgCanvas.clear();
    });

}(window, rJS));
