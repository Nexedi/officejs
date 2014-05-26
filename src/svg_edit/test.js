/*global window, document, QUnit, jQuery, rJS, sinon, XMLSerializer */
/*jslint indent: 2, maxerr: 3, maxlen: 79 */

(function (window, $, QUnit, rJS) {
  "use strict";
  QUnit.config.testTimeout = 1000;

  var asyncTest = QUnit.asyncTest,
    start = QUnit.start,
    ok = QUnit.ok,
    svgeditGadgetURL = 'index.html';

  function iframeSelector(selectorString) {
    return $('iframe').contents().find(selectorString);
  }

  rJS(window).ready(function (g) {
    var gadget_context = document.getElementById('qunit-fixture');

    asyncTest("[svgedit gadget] loading (iframed)", 1, function () {
      g.declareGadget(svgeditGadgetURL,
                      {sandbox: "iframe", element: gadget_context})
        .then(function () {
          ok(iframeSelector("svg")[0]);
        })
        .always(start);
    });

    asyncTest("[svgedit gadget] initial textarea (iframed)", 1, function () {
      g.declareGadget(svgeditGadgetURL,
                      {sandbox: "iframe", element: gadget_context})
        .then(function (gadget) {
          return gadget.getContent();
        })
        .then(function (content) {
          ok(content.indexOf('Layer 1') !== -1);
        })
        .always(start);
    });

    asyncTest("[svgedit gadget] clear content (iframed)", 2, function () {
      var gadget;
      g.declareGadget(svgeditGadgetURL,
                      {sandbox: "iframe", element: gadget_context})
        .then(function (g) {
          gadget = g;
          gadget.setContent($("#svgedit-fixtures #fixture-1").html())
            .then(gadget.getContent)
            .then(function (content) {
              ok(content.indexOf('rect') !== -1);
            })
            .then(gadget.clearContent)
            .then(gadget.getContent)
            .then(function (content) {
              ok(content.indexOf('rect') === -1);
            })
            .always(start);
        });
    });

    asyncTest("[svgedit gadget] set/get content (iframed)", 1, function () {
      var gadget;
      g.declareGadget(svgeditGadgetURL,
                      {sandbox: "iframe", element: gadget_context})
        .then(function (g) {
          gadget = g;
          g.setContent($("#svgedit-fixtures #fixture-1").html())
            .then(gadget.getContent)
            .then(function (content) {
              ok(content.indexOf('rect') !== -1);
            })
            .always(start);
        });
    });
  });
}(window, jQuery, QUnit, rJS));
