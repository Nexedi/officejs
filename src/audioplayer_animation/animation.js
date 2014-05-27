/*global window, rJS, RSVP, console, document, JSON, Uint8Array */
/*jslint nomen: true */


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
    })
    .declareMethod('setAction', function (type, action) {
      var that = this;
      that.canvas[type] = function () {
        action.call(that);
        that.showAnimation();
      };
    });
  gk.ready(function (g) {
    g.canvas = g.__element.getElementsByTagName('canvas')[0];
    g.mirror = g.__element.getElementsByTagName('canvas')[1];
  });
}(window, rJS));
