/*global window, rJS, RSVP, console */
/*jslint maxlen:80, nomen: true */


(function (window, rJS) {
  "use strict";
  var gk = rJS(window),
    scroll;
  function BannerObject() {
    this.msg = "it's a test";
    this.out = " ";
    this.Position = 50;
    this.pos = this.Position;
    this.delay = 100;
    this.i = 0;
    this.size = 0;
    this.reset = function () {
      this.pos = this.Position;
    };
  }

  gk.declareMethod('setMessage', function (msg) {
    scroll.msg = msg;
  })
    .declareMethod('setDelay', function (delay) {
      scroll.delay = delay;
    })
    .declareMethod('setPosition', function (position) {
      if (position > this.size) {
        position = this.size;
      }
      scroll.Position = position;
    })
    .declareMethod('setMaxSize', function (size) {
      this.input.size = size;
      scroll.size = size;
    });
  gk.ready(function (g) {
    scroll = new BannerObject();
    g.input = g.__element.getElementsByTagName('input')[0];
    scroll.size = g.input.size;
    function scroller() {
      scroll.out += " ";
      if (scroll.pos > 0) {
        for (scroll.i = 0; scroll.i < scroll.pos; scroll.i += 1) {
          scroll.out += " ";
        }
      }
      if (scroll.pos >= 0) {
        scroll.out += scroll.msg;
      } else {
        scroll.out = scroll.msg.substring(-scroll.pos,
                                          scroll.msg.length);
      }
      g.input.value = scroll.out;
      scroll.out = " ";
      scroll.pos -= 2;
      if (scroll.pos < -(scroll.msg.length)) {
        scroll.reset();
      }
    }

    window.setInterval(function () {
      scroller();
    }, scroll.delay);
  });
}(window, rJS));
