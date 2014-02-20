/*jslint indent: 2 */
/*global window, jQuery, rJS */
"use strict";
(function (window, $, rJS) {

  $.mobile.ajaxEnabled = false;
  $.mobile.linkBindingEnabled = false;
  $.mobile.hashListeningEnabled = false;
  $.mobile.pushStateEnabled = false;

  rJS(window).ready(function (g) {
    var body = g.element,
      main_context = window.document.getElementById('.ui-content'),
      ioGadgetConfig = {"type": "local",
                        "username": "officejs",
                        "application_name": "officejs"
                       },
      jioGadget;

    function setTitle(title) {
      g.element.find("#headergadget").find("h1").text(title);
      return $('title').text("OfficeJS | " + title);
    }

    function enhanceGadgetRendering(gadget) {
      gadget.element.enhanceWithin();
      return gadget.getTitle()
        .then(setTitle);
    }

    function registerSaveButton(gadget) {
      window.jqs = gadget;
      $("#save-doc").click(function () {
        var fileName = $("#iogadget input").val();
        jioGadget.configureIO(ioGadgetConfig, fileName)
          .then(gadget.getContent)
          .then(function (o) {jioGadget.setIO(o); });
      });
      return gadget;
    }

    function registerLoadButton(gadget) {
      $("#load-doc").click(function () {
        var fileName = $("#iogadget input").val();
        jioGadget.configureIO(ioGadgetConfig, fileName)
          .then(jioGadget.getIO)
          .then(gadget.setContent);
      });
      return gadget;
    }

    function registerClearButton(gadget) {
      $("#new-doc").click(function () {
        gadget.clearContent();
      });
    }

    function registerIOButtons(gadget) {
      registerSaveButton(gadget);
      registerLoadButton(gadget);
      registerClearButton(gadget);
    }

    function initializeRoute() {
      body
        .route("add", "", 1)
        .then(function () {
          $.url.redirect('/login/');
        });

      body
        .route("add", "/about/", 1)
        .then(function () {
          g.declareGadget('./about.html', {element: main_context})
            .then(enhanceGadgetRendering);
        });

      body
        .route("add", "/contact/", 1)
        .then(function () {
          g.declareGadget('./contact.html', {element: main_context})
            .then(enhanceGadgetRendering);
        });

      body
        .route("add", "/login/", 1)
        .then(function () {
          g.declareGadget('./login.html', {element: main_context})
            .then(enhanceGadgetRendering);
        });

      body
        .route("add", "/spreadsheet/", 1)
        .then(function () {
          g.declareGadget('./jqs.html',
                          {sandbox: "iframe", element: main_context})
            .then(registerIOButtons);
        });

      body
        .route("add", "/bootstrap-wysiwyg/", 1)
        .then(function () {
          g.declareGadget('./bootstrap-wysiwyg.html',
                          {sandbox: "iframe", element: main_context})
            .then(registerIOButtons);
        });

      body
        .route("add", "/mercury/", 1)
        .then(function () {
          g.declareGadget('./mercury.html',
                          {sandbox: "iframe", element: main_context})
            .then(registerIOButtons);
        });

      body
        .route("add", "/codemirror/", 1)
        .then(function () {
          g.declareGadget('./codemirror.html',
                          {sandbox: "iframe", element: main_context})
            .then(registerIOButtons);
        });

      body
        .route("add", "/svgedit/", 1)
        .then(function () {
          g.declareGadget('./svg-editor.html',
                          {sandbox: "iframe", element: main_context})
            .then(registerIOButtons);
        });
    }

    g.declareGadget('./io.html',
                    {element: window.document.getElementById("iogadget")})
      .then(function (ioGadget) {
        window.jio = ioGadget;
        jioGadget = ioGadget;
        // Trigger route change
        initializeRoute();
        $.url.onhashchange(function () {
          body.route("go", $.url.getPath())
            .then(null, function () {
              g.declareGadget('./error.html', {element: main_context})
                .then(enhanceGadgetRendering)
                .then(initializeRoute);
            });
        });
      });
  });

}(window, jQuery, rJS));
