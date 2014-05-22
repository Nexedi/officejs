/*global Aloha, rJS, jQuery */
(function (window, rJS, Aloha, $) {
  "use strict";

  rJS(window)
    .declareMethod('setContent', function (value) {
      $('#editor').empty().append(value);
    })
    .declareMethod('getContent', function () {
      return $('#editor').html();
    })
    .ready(function (g) {
      Aloha.ready(function () {
        Aloha.jQuery('#editor').aloha();
      });
    });

}(window, rJS, Aloha, jQuery));
