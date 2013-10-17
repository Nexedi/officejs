/*global window, document, QUnit, jQuery, rJS, sinon */
/*jslint indent: 2, maxerr: 3, maxlen: 79 */
"use strict";

QUnit.config.testTimeout = 500;

(function (window, $, QUnit, sinon, rJS) {
  var test = QUnit.test,
    stop = QUnit.stop,
    start = QUnit.start,
    ok = QUnit.ok,
    equal = QUnit.equal,
    expect = QUnit.expect,
    throws = QUnit.throws,
    deepEqual = QUnit.deepEqual;
  
  function iframeSelector(selectorString) {
    return $('iframe').contents().find(selectorString);
  }

  rJS(window).ready(function () {
    var g = rJS(this),
      jqs_context = g.context.find('.jqs-gadget').first();
   
    asyncTest("jquery.sheet loading", function () {
      expect(2);
      g.declareIframedGadget('../src/gadget/jqs.html', jqs_context);
      
      setTimeout(function () {
        ok(iframeSelector("table.jSheet td#0_table0_cell_c0_r0").length != 0);
        ok(iframeSelector("table.jSheet td#0_table0_cell_c1_r1").length != 0);
        start();
      },100);
    });

    asyncTest("reset sheet", function () {
      expect(2);
      g.declareIframedGadget('../src/gadget/jqs.html', jqs_context)
        .then(function (gadget) {
          iframeSelector("table.jSheet td#0_table0_cell_c0_r0").html('c0r0Value');
          iframeSelector("table.jSheet td#0_table0_cell_c1_r1").html('c1r1Value');
          return gadget;
        })
        .then(function (gadget) {
          gadget.resetSheet().then(function () {
            equal(iframeSelector("table.jSheet td#0_table0_cell_c0_r0").text(),"");
            equal(iframeSelector("table.jSheet td#0_table0_cell_c1_r1").text(),"");
            start();
          });
        });
    });
    
    asyncTest("get content of sheet", function () {
      expect(2);
      var c0r0selector, c1r1selector;
      g.declareIframedGadget('../src/gadget/jqs.html', jqs_context)
        .then(function (gadget) {
          iframeSelector("table.jSheet td#0_table0_cell_c0_r0").html('c0r0Value');
          iframeSelector("table.jSheet td#0_table0_cell_c1_r1").html('c1r1Value');
          return gadget;
        })
        .then(function (gadget) {
          gadget.getContent().then(function (content) {
            var json = JSON.parse(content)[0];
            equal(json.data.r0.c0.value,"c0r0Value");
            equal(json.data.r1.c1.value,"c1r1Value");
            start();
          });
        });
    });

    asyncTest("set content of sheet", function () {
      expect(4);
      var gadget, content; 

      g.declareIframedGadget('../src/gadget/jqs.html', jqs_context)
        .then(function (gd) {
          iframeSelector("table.jSheet td#0_table0_cell_c0_r0").html('c0r0Value');
          iframeSelector("table.jSheet td#0_table0_cell_c1_r1").html('c1r1Value');
          gadget = gd;
        })
        .always(function () {
          gadget.getContent()
            .then(function (c) {content = c;})
            .always(function () {
              gadget.resetSheet().then(function () {
                equal(iframeSelector("table.jSheet td#0_table0_cell_c0_r0").text(),"");
                equal(iframeSelector("table.jSheet td#0_table0_cell_c1_r1").text(),"");
              })
                .always(function () {
                  gadget.putContent(content)
                    .always(function () {
                      equal(iframeSelector("table.jSheet td#2_table0_cell_c0_r0").text(),"c0r0Value");
                      equal(iframeSelector("table.jSheet td#2_table0_cell_c1_r1").text(),"c1r1Value");
                      start();
                    });
                });
            });
        });
    });
  });
} (window, jQuery, QUnit, sinon, rJS));
    
