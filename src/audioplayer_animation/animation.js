/*global window, rJS, RSVP, console, document, JSON, Uint8Array */
/*jslint maxlen:80, nomen: true */


(function (window, rJS) {
  "use strict";
  var gk = rJS(window);
  /*need a animation class, which contents play stop set methods */
  gk.declareMethod('setAnimation', function (animation) {
    this.animation = animation;
    this.animation.setCanvas(this.canvas, this.mirror);
  })
    .declareMethod('showAnimation', function () {
      this.animation.play();
    })
    .declareMethod('stopAnimation', function () {
      this.animation.stop();
    });
  gk.ready(function (g) {
    g.canvas = g.__element.getElementsByTagName('canvas')[0];
    g.mirror = g.__element.getElementsByTagName('canvas')[1];
  });
}(window, rJS));
