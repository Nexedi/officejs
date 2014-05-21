/*global window, rJS, console, RSVP */
(function (rJS, window) {
  "use strict";

  rJS(window)
    .ready(function (g) {
      return new RSVP.Queue()
        .push(function () {
          return g.getElement();
        })
        .push(function (element) {
          g.element = element;
        });
    })
    .declareMethod('render', function (options) {
      var select = this.element.getElementsByTagName('select')[0],
        i,
        field_json = options.field_json,
        tmp = '';
      select.setAttribute('name', field_json.key);
      // XXX Escape the properties
      for (i = 0; i < field_json.items.length; i += 1) {

        if (field_json.items[i][1] === field_json.default[0]) {
          tmp += "<option selected='selected' value='" +
                   field_json.items[i][1] + "'>"
                   + field_json.items[i][0] + "</option>";
        } else {
          tmp += "<option value='" + field_json.items[i][1] + "'>"
            + field_json.items[i][0] + "</option>";
        }
      }
      select.innerHTML += tmp;
    });

}(rJS, window));
