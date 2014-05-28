/*global window, rJS, RSVP, console */
/*jslint maxlen:80, nomen: true */


(function (window, rJS) {
  "use strict";
  var gk = rJS(window);
  function BannerObject() {
    this.msg = "";
    this.out = " ";
    this.Position = 0;
    this.pos = 0;
    this.delay = 100;
    this.i = 0;
    this.size = 0;
    this.reset = function () {
      this.pos = this.Position;
    };
  }

  gk.declareMethod('setMessage', function (msg) {
    this.scroll.msg = msg;
  })
    .declareMethod('setDelay', function (delay) {
      this.scroll.delay = delay;
    })
    .declareMethod('setPosition', function (position) {
      this.scroll.Position = position;
      this.scroll.pos = position;
    })
    .declareMethod('setMaxSize', function (size) {
      this.input.size = size;
      this.scroll.size = size;
    })
    .declareMethod('getSize', function (size) {
      return this.input.size;
    });
  gk.ready(function (g) {
    g.scroll = new BannerObject();
    g.input = g.__element.getElementsByTagName('input')[0];
    g.scroll.size = g.input.size;
    function scroller() {
      g.scroll.out += " ";
      if (g.scroll.pos > 0) {
        for (g.scroll.i = 0; g.scroll.i < g.scroll.pos; g.scroll.i += 1) {
          g.scroll.out += " ";
        }
      }
      if (g.scroll.pos >= 0) {
        g.scroll.out += g.scroll.msg;
      } else {
        g.scroll.out = g.scroll.msg.substring(-g.scroll.pos,
                                          g.scroll.msg.length);
      }
      g.input.value = g.scroll.out;
      g.scroll.out = " ";
      g.scroll.pos -= 2;
      if (g.scroll.pos < -(g.scroll.msg.length)) {
        g.scroll.reset();
      }
    }

    window.setInterval(function () {
      scroller();
    }, g.scroll.delay);
  });
}(window, rJS));
