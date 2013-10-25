/*global window, document, QUnit, jQuery, rJS, sinon */
/*jslint indent: 2, maxerr: 3, maxlen: 79 */
"use strict";

QUnit.config.testTimeout = 1000;

(function (window, $, QUnit, rJS) {

  var asyncTest = QUnit.asyncTest,
  start = QUnit.start,
  ok = QUnit.ok,
  equal = QUnit.equal,
  jqsGadgetURL = '../deploy/gadget/jqs.html';

  function iframeSelector(selectorString) {
    return $('iframe').contents().find(selectorString);
  }

  function buildSelector(n,i,j) {
    var res = "table.jSheet td#";
    return res+n+"_table0_cell_c"+i+"_r"+j;
  }

  rJS(window).ready(function () {
    var g = rJS(this),
      gadget_context = g.context.find('#gadget').first();
   
    asyncTest("jquery.sheet loading : sheet loads", 2, function () {
      var c0r0 = buildSelector(0,0,0);
      var c1r1 = buildSelector(0,1,1);

      g.declareIframedGadget(jqsGadgetURL, gadget_context)
        .then(function () {
          ok(iframeSelector(c0r0).length != 0);
          ok(iframeSelector(c1r1).length != 0);
        })
      .always(start);
    });
      
    asyncTest("jquery.sheet loading : sheet is empty", 2, function () {
      var c0r0 = buildSelector(0,0,0);
      var c1r1 = buildSelector(0,1,1);
      
      g.declareIframedGadget(jqsGadgetURL, gadget_context)
        .then(function () {
          equal(iframeSelector(c0r0).html(),"");
          equal(iframeSelector(c1r1).html(),"");
        })
        .always(start);
    });
      
    asyncTest("clear content", 2, function () {
      var c0r0 = buildSelector(0,0,0);
      var c1r1 = buildSelector(0,1,1);
 
      g.declareIframedGadget(jqsGadgetURL, gadget_context)
        .then(function (gadget) {
          iframeSelector(c0r0).html('c0r0Value');
          iframeSelector(c1r1).html('c1r1Value');
          return gadget;
        })
        .then(function (gadget) {
          return gadget.clearContent().then(function () {
            equal(iframeSelector(c0r0).text(),"");
            equal(iframeSelector(c1r1).text(),"");
          });
        })
        .always(start);
    });
    
    asyncTest("get content of sheet", 2, function () {
      var c0r0 = buildSelector(0,0,0);
      var c1r1 = buildSelector(0,1,1);
 
      g.declareIframedGadget(jqsGadgetURL, gadget_context)
        .then(function (gadget) {
          iframeSelector(c0r0).html('c0r0Value');
          iframeSelector(c1r1).html('c1r1Value');
          return gadget;
        })
        .then(function (gadget) {
          return gadget.getContent().then(function (content) {
            var json = JSON.parse(content)[0];
            equal(json.data.r0.c0.value,"c0r0Value");
            equal(json.data.r1.c1.value,"c1r1Value");
          });
        })
        .always(start);
    });

    asyncTest("set content of sheet", 4, function () {
      var gadget, content,
      t0c0r0 = buildSelector(0,0,0),
      t0c1r1 = buildSelector(0,1,1),
      t2c0r0 = buildSelector(2,0,0),
      t2c1r1 = buildSelector(2,1,1);

      g.declareIframedGadget(jqsGadgetURL, gadget_context)       
        .then(function (gd) {
          iframeSelector(t0c0r0).html('c0r0Value');
          iframeSelector(t0c1r1).html('c1r1Value');
          gadget = gd;
          return gadget.getContent();
        })
        .then(function (c) {
          content = c;
          return gadget.clearContent();
        })
        .then(function () {
          equal(iframeSelector(t0c0r0).text(),"");
          equal(iframeSelector(t2c1r1).text(),"");
          return gadget.setContent(content);
        })
        .then(function () {
          equal(iframeSelector(t2c0r0).text(),"c0r0Value");
          equal(iframeSelector(t2c1r1).text(),"c1r1Value");
        })
        .always(start); 
    });

  });
} (window, jQuery, QUnit, rJS));
    
