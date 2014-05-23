/*global window, jQuery, rJS*/

(function (window, $, rJS) {
  "use strict";

  rJS(window)

    .declareMethod('getContent', function () {
      return this.editor.html();
    })

    .declareMethod('setContent', function (content) {
      this.editor.html(content);
    })

    .declareMethod('clearContent', function () {
      this.editor.html('');
    })

    .ready(function (g) {
      g.getElement()
        .then(function (element) {
          g.editor = $(element).find('.editor');
          g.editor.wysiwyg();
        });
    });

}(window, jQuery, rJS));
