/*global window, jQuery, rJS, svgCanvas */
/*jslint evil: true*/
"use strict";

(function (window, rJS) {

  rJS(window).declareMethod('getContent', function () {
    console.log(window.svgCanvas.getSvgString());
    return window.svgCanvas.getSvgString();
  })
  
    .declareMethod('setContent', function (content) {
      console.log(window.content);
      window.svgCanvas.setSvgString(content);
    })
  
    .declareMethod('clearContent', function () {
      window.svgCanvas.clear();
    });

}(window, rJS));
