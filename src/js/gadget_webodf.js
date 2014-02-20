/*jslint indent: 2 */
/*global window, jQuery, rJS, odf*/
"use strict";

(function (window, $, rJS, odf) {
  rJS(window).ready(function () {
    var gadget = rJS(this);
    gadget.odfElem = $('#odf')[0];
    gadget.odfCanvas = odf.OdfCanvas(gadget.odfElem);
  });

}(window, jQuery, rJS, odf));
