/*global window, rJS, RSVP, console */
/*jslint maxlen:80, nomen: true */


(function (window, rJS) {
  "use strict";
  var gk = rJS(window);

  gk.declareMethod('setValue', function (value) {
    this.bar.value = value;
  })
    .declareMethod('setMax', function (max) {
      this.bar.max = max;
    })
    .declareMethod('getValue', function () {
      return this.bar.value;
    })
    .declareMethod('getMax', function () {
      return this.bar.max;
    });
  gk.ready(function (g) {
    g.bar = g.__element.getElementsByTagName('progress')[0];
    g.bar.value = 10;
    g.bar.max = 100;
  });

}(window, rJS));
