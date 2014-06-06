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
    .declareAcquiredMethod("setVolume", "setVolume")
    .declareAcquiredMethod("getVolume", "getVolume");   //xxxx
  gk.ready(function (g) {
    g.bar = g.__element.getElementsByTagName('progress')[0];
    g.box = g.__element.getElementsByTagName('div')[0];
    g.bar.max = 1000;
    g.bar.style.width = window.screen.availWidth + "px";
    g.bar.onclick = function (e) {
      var posX = e.clientX,
        targetLeft = $(g.bar).offset().left;
      posX = ((posX - targetLeft) / $(g.bar).width()) * g.bar.max;
      g.setValue(posX);
      g.setVolume(posX);
    };
    g.bar.onmousemove = function (e) {
      g.box.style.left = e.clientX + "px";
      g.box.style.top = e.clientY + "px";
      g.box.style.display = 'block';
      g.box.innerHTML = e.clientX;
    };
  });
}(window, rJS, jQuery));
