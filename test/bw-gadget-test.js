/*global window, document, QUnit, jQuery, rJS, sinon */
/*jslint indent: 2, maxerr: 3, maxlen: 79 */
"use strict";

QUnit.config.testTimeout = 1000;

(function (window, $, QUnit, rJS) {
  //var test = QUnit.test,
  var asyncTest = QUnit.asyncTest,
  //stop = QUnit.stop,
  start = QUnit.start,
  //ok = QUnit.ok,
  equal = QUnit.equal,
  //expect = QUnit.expect,
  //throws = QUnit.throws,
  //deepEqual = QUnit.deepEqual;
  bwGadgetURL = '../deploy/gadget/bootstrap-wysiwyg.html';

  function iframeSelector(selectorString) {
    return $('iframe').contents().find(selectorString);
  }

  rJS(window).ready(function () {
    var g = rJS(this),
      gadget_context = g.context.find('#gadget').first();
  
    asyncTest("Bootstrap wysiwyg loading", 1, function () {
      g.declareIframedGadget(bwGadgetURL, gadget_context)
        .then(function () {
          var edattr = iframeSelector("#editor").attr('contenteditable');
          equal(edattr,"true");
        })
        .always(start);       
    });
      
    asyncTest("Bootstrap wysiwyg loading : textarea is empty", 1, function () {
      g.declareIframedGadget(bwGadgetURL, gadget_context)
        .then(function () {
          var ed = iframeSelector("#editor");
          equal(ed.html(),"");
        })
        .always(start);
    });
    
    asyncTest("clear content of editor", 1, function () {
      g.declareIframedGadget(bwGadgetURL, gadget_context)
        .then(function (gadget) {
          iframeSelector('#editor').html('A value');
          return gadget;
        })
        .then(function (gadget) {
          return gadget.clearContent().then(function () {
            equal(iframeSelector('#editor').text(),"");
          });
        })
        .always(start);
    });

    asyncTest("get content of editor", 1, function () {
      g.declareIframedGadget(bwGadgetURL, gadget_context)
        .then(function (gadget) {
          iframeSelector('#editor').html('A value');
          return gadget;
        })
        .then(function (gadget) {
          return gadget.getContent().then(function (content) {
            equal(content,"A value");
          });
        })
        .always(start);
    });

    asyncTest("set content of sheet", 2, function () {
      var gadget, content;

      g.declareIframedGadget(bwGadgetURL, gadget_context)       
        .then(function (gd) {
          iframeSelector('#editor').html('A value');
          gadget = gd;
          return gadget.getContent();
        })
        .then(function (c) {
          content = c;
          return gadget.clearContent();
        })
        .then(function () {
          equal(iframeSelector('#editor').text(),"");
          return gadget.setContent(content);
        })
        .then(function () {
          equal(iframeSelector('#editor').text(),"A value");
        })
        .always(start); 
    });

  });
} (window, jQuery, QUnit, rJS));
    
