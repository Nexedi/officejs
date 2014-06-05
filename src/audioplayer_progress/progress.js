/*global window, rJS, RSVP, console, $, jQuery */
/*jslint  nomen: true */


(function (window, rJS, $) {
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
    })
    .declareMethod('display', function (attachment) {
      this.bar.style.display = "";
    })
    .declareMethod('noDisplay', function (attachment) {
      this.bar.style.display = "none";
    })
    .declareAcquiredMethod("setCurrentTime", "setCurrentTime");
  gk.ready(function (g) {
    g.bar = g.__element.getElementsByTagName('progress')[0];
    g.bar.value = 0;
    g.bar.max = 1000;
    g.bar.style.width = window.screen.availWidth + "px";
    g.bar.onclick = function (e) {
      var posX = e.clientX,
        targetLeft = $(g.bar).offset().left;
      posX = ((posX - targetLeft) / $(g.bar).width());
      g.setCurrentTime(posX * g.bar.max);
    };
  });
}(window, rJS, jQuery));
