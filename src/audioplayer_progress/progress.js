/*global window, rJS, RSVP, console, $, jQuery, Math */
/*jslint  nomen: true */


(function (window, rJS, $) {
  "use strict";
  var gk = rJS(window),
    that;
  function timeFormat(seconds) {
    var result = '00:' + Math.round(seconds),
      min,
      sec;
    if (seconds > 59) {
      min = Math.floor(seconds / 60);
      sec = Math.floor(seconds % 60);
      result = (min > 9 ? min : ('0' + min)) +
        ':' + (sec > 9 ? sec : ('0' + sec));
    }
    return result;
  }

  function getTime(x) {
    var posX = x,
      targetLeft = $(that.bar).offset().left;
    posX = ((posX - targetLeft) / $(that.bar).width());
    return posX * that.bar.max;
  }

  gk.declareMethod('setValue', function (value) {
    this.bar.value = value;
    this.time.innerHTML = timeFormat(
      this.bar.max - value
    );
  })
    .declareMethod('setMax', function (max) {
      this.bar.max = max;
      this.time.innerHTML = timeFormat(max);
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
    that = g;
    g.bar = g.__element.getElementsByTagName('progress')[0];
    g.box = g.__element.getElementsByTagName('div')[0];
    g.time = g.__element.getElementsByTagName('div')[1];
    g.bar.value = 0;
    g.bar.max = 1000;
    g.bar.style.width = window.screen.availWidth + "px";
    g.time.style.left = g.bar.style.left;
    $(g.time).offset().top = $(g.bar).offset().top + 5;
    g.time.innerHTML = "--";
    g.bar.onclick = function (e) {
      var time = getTime(e.clientX);
      g.setCurrentTime(time);
    };
    g.bar.onmousemove = function (e) {
      var time = getTime(e.clientX);
      g.box.style.left = (e.clientX - 20) + "px";
      g.box.style.display = 'block';
      g.box.innerHTML = timeFormat(time);
    };
    g.bar.onmouseout = function (e) {
      g.box.style.display = "none";
    };
  });
}(window, rJS, jQuery));
