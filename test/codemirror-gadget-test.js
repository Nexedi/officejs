/*global window, document, QUnit, jQuery, rJS, sinon */
/*jslint indent: 2, maxerr: 3, maxlen: 79 */
"use strict";

QUnit.config.testTimeout = 1000;

(function (window, $, QUnit, rJS) {
  //var test = QUnit.test,
  var asyncTest = QUnit.asyncTest,
  //stop = QUnit.stop,
  start = QUnit.start,
  ok = QUnit.ok,
  equal = QUnit.equal,
  //expect = QUnit.expect,
  //throws = QUnit.throws,
  //deepEqual = QUnit.deepEqual;
  codemirrorGadgetURL = '../src/gadget/codemirror.html';

  function iframeSelector(selectorString) {
    return $('iframe').contents().find(selectorString);
  }

  rJS(window).ready(function (g) {
    var gadget_context = document.getElementById('qunit-fixture');
  
    asyncTest("[codemirror gadget] loading (iframed)", 1, function () {
      g.declareGadget(codemirrorGadgetURL,
                      {sandbox: "iframe", element: gadget_context})
        .then(function () {
          ok(iframeSelector(".CodeMirror")[0]);
        })
        .always(start);       
    });
      
    asyncTest("[codemirror gadget] empty initial textarea (iframed)", 1, function () {
      g.declareGadget(codemirrorGadgetURL,
                      {sandbox: "iframe", element: gadget_context})
        .then(function (gadget) {
          return gadget.getContent();
        })
        .then(function (content) {
          equal(content,"");
        })
        .always(start);
    });
    
    asyncTest("[codemirror gadget] clear content (iframed)", 1, function () {
      var gadget;
      g.declareGadget(codemirrorGadgetURL,
                      {sandbox: "iframe", element: gadget_context})
        .then(function (g) {
          gadget = g;
          return gadget.setContent("A content");
        })
        .then(function () {
          return gadget.clearContent();
        })
        .then(function () {
          return gadget.getContent();
        })
        .then(function (content) {
          equal(content,"");
        })
        .always(start);
    });

    asyncTest("[codemirror gadget] set/get content (iframed)", 1, function () {
      var gadget;
      g.declareGadget(codemirrorGadgetURL,
                      {sandbox: "iframe", element: gadget_context})
        .then(function (g) {
          gadget = g;
          return gadget.setContent("A content");
        })
        .then(function () {
          return gadget.getContent();
        })
        .then(function (content) {
          equal(content,"A content");
        })
        .always(start);
    });
  });
} (window, jQuery, QUnit, rJS));
    
