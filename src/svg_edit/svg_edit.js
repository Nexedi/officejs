/*global window, jQuery, rJS, svgCanvas, svgEditor */

(function (window, rJS) {
  "use strict";

  svgEditor.setConfig({
    extPath: '../lib/svg-edit-2.6/extensions/',
    imgPath: '../lib/svg-edit-2.6/images/'
  });

  rJS(window)

    .declareMethod('getContent', function () {
      return window.svgCanvas.getSvgString();
    })

    .declareMethod('setContent', function (content) {
      window.svgCanvas.setSvgString(content);
    })

    .declareMethod('clearContent', function () {
      window.svgCanvas.clear();
    });

}(window, rJS));
