/*global window, jQuery, rJS*/
"use strict";
(function (window, $, rJS) {

  var gk = rJS(window),
    default_config = {
      id: "jquerysheet-div",
      style: '',
      jquerySheet: true,
      jquerySheetCss: true,
      parser: true,
      jqueryUiCss: true,
      scrollTo: false,
      jQueryUI: false,
      raphaelJs: false,
      gRaphaelJs: false,
      colorPicker: false,
      colorPickerCss: false,
      elastic: false,
      advancedMath: false,
      finance: false,
      editable: true,
      autoFiller: true,
      urlGet: '../lib/jquery.sheet-2.0.0/new_spreadsheet.html'
    };

  gk.declareMethod('init', function (config) {
    rJS(this).parent = rJS(this).context.find('.jQuerySheet');
    rJS(this).parent.sheet(config);
    rJS(this).updateInstance();
  })

    .declareMethod('getContent', function () {
      var content = JSON.stringify($.sheet.instance[0].exportSheet.json());
      //console.log("getContent: " + content);
      console.log("function getContent" + content);
      return content;
    })

    .declareMethod('putContent', function (content) {
      var config = $.extend({
        buildSheet: $.sheet.makeTable.json(JSON.parse(content))
      }, default_config);
      rJS(this).init(config);
    })

    .declareMethod('resetSheet', function () {
      $.sheet.killAll();
      rJS(this).init(default_config);
    })

    .declareMethod('updateInstance', function () {
      rJS(this).instance = rJS(this).parent.getSheet();
    })

    .declareMethod('getParent', function () {
      return rJS(this).parent;
    })

    .ready(function () {
      rJS(this).init(default_config);
    });

}(window, jQuery, rJS));
