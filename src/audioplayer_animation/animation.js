/*global window, rJS, RSVP, console, document, JSON, Uint8Array */
/*jslint maxlen:80, nomen: true */


(function (window, rJS) {
  "use strict";
  var gk = rJS(window);


  function AnimationClass(canvas, mirror) {
    this.canvas = canvas;
    this.mirror = mirror;
    this.animationPlayId = -1;
  }

  AnimationClass.prototype.play = function () {
    var that = this,
      canvas = that.canvas,
      mirror = that.mirror,
      canvasCtx = canvas.getContext('2d'),
      mirrorCtx = mirror.getContext('2d'),
      cwidth = canvas.width,
      cheight = canvas.height - 2,
      meterWidth = 10, //width of the meters in the spectrum
      capHeight = 2,
      meterNum = 100, //count of the meters 
      capYPositionArray = [],
      capStyle = '#000',
      array,
      drawFrame,
      step,
      i,
      value,
      gradient = canvasCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(1, '#0f0');
    gradient.addColorStop(0.5, '#ff0');
    gradient.addColorStop(0, '#f00');
    window.cancelAnimationFrame(
      that.animationPlayId
    ); //stop the previous animation
    array = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    drawFrame = function () {
      for (i = 0; i < array.length; i += 1) {
        array[i] += Math.random() * 100;
        array[i] = array[i] % 1000;
      }
      canvasCtx.clearRect(0, 0, cwidth, cheight);
      step = Math.round(array.length / meterNum);
      for (i = 0; i < meterNum; i += 1) {
        value = array[i * step];
        if (capYPositionArray.length < Math.round(meterNum)) {
          capYPositionArray.push(value);
        }
        canvasCtx.fillStyle = capStyle;
        if (value < capYPositionArray[i]) {
          capYPositionArray[i] -= 1;
          canvasCtx.fillRect(i * 12, cheight - capYPositionArray[i],
                             meterWidth, capHeight);
        } else {
          canvasCtx.fillRect(i * 12, cheight - value,
                             meterWidth, capHeight);
          capYPositionArray[i] = value;
        }
        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(i * 12,
                           cheight - value + capHeight,
                           meterWidth,
                           cheight); //the meter
      }
      //draw the mirror
      mirrorCtx.clearRect(0, 0, cwidth, cheight);
      mirrorCtx.drawImage(canvas, 0, -100, cwidth, cheight);
      that.animationPlayId = window.requestAnimationFrame(drawFrame);
    };
    that.animationPlayId = window.requestAnimationFrame(drawFrame);
  };

  AnimationClass.prototype.stop = function () {
    var that = this;
    window.cancelAnimationFrame(
      that.animationPlayId
    ); //stop the previous animation
  };
  /*need a animation class, which contents play stop methods */
  gk.declareMethod('setAnimation', function (animationClass) {
    this.animation = new AnimationClass(this.canvas, this.mirror);
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
    g.animation = new AnimationClass(g.canvas, g.mirror);
    g.animation.play();
  });
}(window, rJS));
