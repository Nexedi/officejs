/*global window, jQuery, rJS */
"use strict";
(function (window, $, rJS, undefined) {

  rJS(window).ready(function () {
    var g = rJS(this),
      footer_context = g.context.find("#footergadget").last(),
      header_context = g.context.find("#headergadget").last(),
      left_panel_context = g.context.find(".panel").first();

    $.when(
      g.declareGadget('./header.html', header_context),
      g.declareGadget('./left_panel.html', left_panel_context),
      g.declareGadget('./footer.html', footer_context)
    ).done(function (footer_gadget, header_gadget, left_panel_gadget) {
      footer_gadget.context.enhanceWithin();
      header_gadget.context.enhanceWithin();
      left_panel_gadget.context.enhanceWithin();
    });

  });

}(window, jQuery, rJS));
