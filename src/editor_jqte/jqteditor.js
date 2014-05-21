/*global rJS, jQuery */
/*jslint nomen: true*/
(function (window, rJS, $) {
  "use strict";

  var gk = rJS(window);

  gk.declareMethod('setContent', function (value) {
    // return this.context.find('textarea').val(escape_text(value));
    return $(this.__element).find('#textarea-b').jqteVal(value);
  })
    .declareMethod('getContent', function () {
      return $(this.__element).find('#textarea-b').val();
    });

  gk.ready(function (g) {
    $(g.__element).find("#textarea-b").jqte();
  });
}(window, rJS, jQuery));
