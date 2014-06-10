/*global window, rJS, RSVP, console, document, JSON, Uint8Array */
/*jslint nomen: true */


(function (window, rJS) {
  "use strict";
  var gk = rJS(window);
  gk.declareAcquiredMethod("getFFTValue", "getFFTValue")
    .declareMethod('showAnimation', function () {
      var that = this,
        canvas = that.canvas,
        mirror = that.mirror,
        canvasCtx = canvas.getContext('2d'),
        mirrorCtx = mirror.getContext('2d'),
        cwidth = canvas.width,
        cheight = canvas.height - 2,
        meterWidth = 10, //width of the meters in the spectrum
        capHeight = 2,
        meterNum = 300,
        array,
        drawFrame,
        step,
        i,
        value,
        gradient = canvasCtx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(1, '#0f0');
      gradient.addColorStop(0.5, '#ff0');
      gradient.addColorStop(0, '#f00');
      that.play = true;
      drawFrame = function () {
        window.cancelAnimationFrame(
          that.animationPlayId
        ); //stop the previous animation
        that.getFFTValue()
          .then(function (e) {
            array = e.array;
            canvasCtx.clearRect(0, 0, cwidth, cheight);
            step = Math.round(e.length / meterNum);
            for (i = 0; i < meterNum; i += 1) {
              value = array[i * step];
              canvasCtx.fillStyle = gradient;
              canvasCtx.fillRect(i * 12,
                                 cheight - value + capHeight,
                                 meterWidth,
                                 cheight); //the meter
            }
            //draw the mirror
            mirrorCtx.clearRect(0, 0, cwidth, cheight);
            mirrorCtx.drawImage(canvas, 0, -100, cwidth, cheight);
            if (that.play === true) {
              that.animationPlayId = window.requestAnimationFrame(drawFrame);
            }
          });
      };
      that.animationPlayId = window.requestAnimationFrame(drawFrame);
    })


    .declareMethod('stopAnimation', function () {
      this.play = false;
      window.cancelAnimationFrame(
        this.animationPlayId
      ); //stop the previous animation
    })
    .declareMethod("display", function (options) {
      this.canvas.style.display = "";
      this.mirror.style.display = "";
      this.visualize.style.display = "";
    })
    .declareMethod("noDisplay", function (options) {
      this.canvas.style.display = "none";
      this.mirror.style.display = "none";
      this.visualize.style.display = "none";
    });

  gk.ready(function (g) {
    g.visualize = g.__element.getElementsByTagName('div')[0];
    g.canvas = g.__element.getElementsByTagName('canvas')[0];
    g.mirror = g.__element.getElementsByTagName('canvas')[1];
  });
}(window, rJS));
