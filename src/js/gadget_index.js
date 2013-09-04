/*global window, jQuery, rJS */
"use strict";
(function (window, $, rJS, undefined) {

  var gk = rJS(window);

  $.mobile.ajaxEnabled = false;
  $.mobile.linkBindingEnabled = false;
  $.mobile.hashListeningEnabled = false;
  $.mobile.pushStateEnabled = false;

  // Set the header title
  gk.declareMethod('setTitle', function (title) {
    var g = rJS(this);
    g.context.find("#headergadget").find("h1").text(title);
    $('title').text(title);
  });

  rJS(window).ready(function () {
    var g = rJS(this),
      body = g.context,
      main_context = g.context.find('.ui-content').first();

    function setTitle(title) {
      return g.setTitle(title);
    }

    function initializeRoute() {
      body
        .route("add", "", 1)
        .done(function () {
          $.url.redirect('/about/');
        });

      body
        .route("add", "/about/", 1)
        .done(function () {
          g.declareGadget('./about.html', main_context)
            .done(function (main_gadget) {
              main_gadget.context.enhanceWithin();
              main_gadget.getTitle()
                         .then(setTitle);
            });
        });

      body
        .route("add", "/contact/", 1)
        .done(function () {
          g.declareGadget('./contact.html', main_context)
            .done(function (main_gadget) {
              main_gadget.context.enhanceWithin();
              main_gadget.getTitle()
                         .then(setTitle);
            });
        });
    }

    // Trigger route change
    initializeRoute();
    $.url.onhashchange(function () {
      body.route("go", $.url.getPath())
        .fail(function () {
          g.declareGadget('./error.html', main_context)
            .done(function (main_gadget) {
              main_gadget.context.enhanceWithin();
              main_gadget.getTitle()
                         .then(setTitle);
              initializeRoute();
            });
        });
    });

  });

}(window, jQuery, rJS));
