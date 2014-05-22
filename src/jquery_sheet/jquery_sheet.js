/*global window, jQuery, rJS*/

(function (window, $, rJS) {
  "use strict";

  function init(config) {
    this.parent = $('.jQuerySheet');
    this.parent.sheet(config);
    this.instance = this.parent.getSheet();
  }

  var default_config = {
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
    urlMenu: '../lib/jquery.sheet-2.0.0/menu.html',
    urlGet: 'new_spreadsheet.html'
  };

  rJS(window)

    .declareMethod('getContent', function () {
      var content = JSON.stringify($.sheet.instance[0].exportSheet.json());
      return content;
    })

    .declareMethod('setContent', function (content) {
      var config = $.extend({
        buildSheet: $.sheet.makeTable.json(JSON.parse(content))
      }, default_config);
      init.apply(this, [config]);
    })

    .declareMethod('clearContent', function () {
      $.sheet.killAll();
      init.apply(this, [default_config]);
    })

    .ready(function (g) {
      init.apply(g, [default_config]);
    });

}(window, jQuery, rJS));
