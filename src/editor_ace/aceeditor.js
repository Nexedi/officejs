/*global ace, rJS */
/*jslint nomen: true*/
(function (window, rJS) {
  "use strict";

  rJS(window)
    .ready(function (g) {
      g.props = {};
      g.editor = ace.edit(g.__element.getElementsByTagName('div')[0]);
      g.editor.setTheme("ace/theme/monokai");
    })
    .ready(function (g) {
      return g.getElement()
        .push(function (element) {
          g.props.element = element;
        });
    })
    .declareMethod('render', function (options) {
      this.props.key = options.key || "";
      this.editor.getSession().setValue(options.value);
    })
    .declareMethod('getContent', function () {
      var form_gadget = this,
        result = {};
      result[form_gadget.props.key] =
        form_gadget.editor.getSession().getValue();
      return result;
    });
}(window, rJS, ace));
