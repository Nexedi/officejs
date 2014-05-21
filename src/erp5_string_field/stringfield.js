/*global window, rJS, console, RSVP */
(function (rJS) {
  "use strict";

  rJS(window)
    .ready(function (gadget) {
      return new RSVP.Queue()
        .push(function () {
          return gadget.getElement();
        })
        .push(function (element) {
          gadget.element = element;
        });
    })
    .declareMethod('render', function (options) {
      var input = this.element.getElementsByTagName('input')[0],
        field_json = options.field_json || {};
      input.value = field_json.default || "";
      input.setAttribute('name', field_json.key);
//       input.setAttribute('id', field_json.key);
    })

    .declareMethod('getContent', function () {
      var input = this.element.getElementsByTagName('input')[0],
        result = {};
      result[input.getAttribute('name')] = input.value;
      return result;
    });

}(rJS));
