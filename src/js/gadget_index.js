/*global window, jQuery, rJS */
"use strict";
(function (window, $, rJS, undefined) {

  $.mobile.ajaxEnabled = false;
  $.mobile.linkBindingEnabled = false;
  $.mobile.hashListeningEnabled = false;
  $.mobile.pushStateEnabled = false;

  rJS(window).ready(function () {
    var g = rJS(this),
      body = g.context,
      main_context = g.context.find('.ui-content').first();

    function setTitle(title) {
      g.context.find("#headergadget").find("h1").text(title);
      return $('title').text("OfficeJS | " + title);
    }

    function enhanceGadgetRendering(gadget) {
      gadget.context.enhanceWithin();
      return gadget.getTitle()
                   .then(setTitle);
    }

    function initializeRoute() {
      body
        .route("add", "", 1)
        .done(function () {
          $.url.redirect('/login/');
        });

      body
        .route("add", "/about/", 1)
        .done(function () {
          g.declareGadget('./about.html', main_context)
            .then(enhanceGadgetRendering);
        });

      body
        .route("add", "/contact/", 1)
        .done(function () {
          g.declareGadget('./contact.html', main_context)
            .then(enhanceGadgetRendering);
        });

      body
        .route("add", "/login/", 1)
        .done(function () {
          g.declareGadget('./login.html', main_context)
            .then(enhanceGadgetRendering);
        });
    }

    g.declareGadget('./io.html', g.context.find("iogadget"))
      .done(function (io_gadget) {
        // Trigger route change
        initializeRoute();
        $.url.onhashchange(function () {
          body.route("go", $.url.getPath())
            .fail(function () {
              g.declareGadget('./error.html', main_context)
                .then(enhanceGadgetRendering)
                .then(initializeRoute);
            });
        });
      });

  });

}(window, jQuery, rJS));
