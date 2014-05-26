/*global window, document, QUnit, jQuery, rJS*/
/*jslint indent: 2, maxerr: 3, maxlen: 79 */

(function (window, $, QUnit, rJS) {
  "use strict";

  QUnit.config.testTimeout = 1000;

  var asyncTest = QUnit.asyncTest,
    start = QUnit.start,
    equal = QUnit.equal,
    bwGadgetURL = 'index.html';

  function iframeSelector(selectorString) {
    return $('iframe').contents().find(selectorString);
  }

  rJS(window).ready(function (g) {
    var gadget_context = $('#qunit-fixture')[0];

    asyncTest("Bootstrap wysiwyg loading", 1, function () {
      g.declareGadget(bwGadgetURL, {
        element: gadget_context,
        sandbox: 'iframe'
      })
        .then(function () {
          var edattr = iframeSelector(".editor").attr('contenteditable');
          equal(edattr, "true");
        })
        .always(start);
    });

    asyncTest("Bootstrap wysiwyg loading : textarea is empty", 1, function () {
      g.declareGadget(bwGadgetURL, {
        element: gadget_context,
        sandbox: 'iframe'
      })
        .then(function () {
          var ed = iframeSelector(".editor");
          equal(ed.html(), "");
        })
        .always(start);
    });

    asyncTest("clear content of editor", 1, function () {
      g.declareGadget(bwGadgetURL, {
        element: gadget_context,
        sandbox: 'iframe'
      })
        .then(function (gadget) {
          iframeSelector('.editor').html('A value');
          return gadget;
        })
        .then(function (gadget) {
          return gadget.clearContent().then(function () {
            equal(iframeSelector('.editor').text(), "");
          });
        })
        .always(start);
    });

    asyncTest("get content of editor", 1, function () {
      g.declareGadget(bwGadgetURL, {
        element: gadget_context,
        sandbox: 'iframe'
      })
        .then(function (gadget) {
          iframeSelector('.editor').html('A value');
          return gadget;
        })
        .then(function (gadget) {
          return gadget.getContent().then(function (content) {
            equal(content, "A value");
          });
        })
        .always(start);
    });

    asyncTest("set content of sheet", 2, function () {
      var gadget, content;

      g.declareGadget(bwGadgetURL, {
        element: gadget_context,
        sandbox: 'iframe'
      })
        .then(function (gd) {
          iframeSelector('.editor').html('A value');
          gadget = gd;
          return gadget.getContent();
        })
        .then(function (c) {
          content = c;
          return gadget.clearContent();
        })
        .then(function () {
          equal(iframeSelector('.editor').text(), "");
          return gadget.setContent(content);
        })
        .then(function () {
          equal(iframeSelector('.editor').text(), "A value");
        })
        .always(start);
    });
  });
}(window, jQuery, QUnit, rJS));
