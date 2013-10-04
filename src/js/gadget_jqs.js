/*global window, jQuery, rJS*/
"use strict";
(function (window, $, rJS) {

  var gk = rJS(window);

  gk.declareMethod('init', function () {
    rJS(this).parent = rJS(this).context.find('.jQuerySheet');
    rJS(this).parent.sheet();
    rJS(this).updateInstance();
    rJS(this).instance.newSheet();
  })

    .declareMethod('get', function (name) {
      rJS(this).updateInstance();
      var json = $.sheet.dts.fromTables.json(rJS(this).instance, true);
      console.log("get: " + JSON.stringify(json));
      return JSON.stringify(json);
    })

    .declareMethod('put', function (spreadsheetString) {
      var json = JSON.parse(spreadsheetString),
        html = $.sheet.dts.toTables.json(json, true);
      console.log("put: " + JSON.stringify(json));
      rJS(this).parent.html(html).sheet();
    })

    .declareMethod('clean', function () {
      delete (rJS(this).instance);
      rJS(this).parent.html("");
      rJS(this).parent.sheet();
      rJS(this).instance = rJS(this).parent.getSheet();
      rJS(this).instance.newSheet();
    })

    .declareMethod('updateInstance', function () {
      rJS(this).instance = rJS(this).parent.getSheet();
    })

    .ready(function () {
      rJS(this).init();
    });

}(window, jQuery, rJS));
