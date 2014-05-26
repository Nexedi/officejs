/*global window, rJS, RSVP, console */
/*jslint nomen: true*/
(function (window, rJS) {
  "use strict";
  function AnimationClass(control) {
    this.canvas = null;
    this.mirror = null;
    this.control = control;
    this.animationPlayId = -1;
  }

  AnimationClass.prototype.setCanvas = function (canvas, mirror) {
    this.canvas = canvas;
    this.mirror = mirror;
  };

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
      meterNum = 3800 / (10 + 2),
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
    drawFrame = function () {
      that.control.getFFTValue()
        .then(function (e) {
          array = e;
          canvasCtx.clearRect(0, 0, cwidth, cheight);
          step = Math.round(array.length / meterNum);
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
          that.animationPlayId = window.requestAnimationFrame(drawFrame);
        });
    };
    that.animationPlayId = window.requestAnimationFrame(drawFrame);
  };
  AnimationClass.prototype.stop = function () {
    var that = this;
    window.cancelAnimationFrame(
      that.animationPlayId
    ); //stop the previous animation
  };

  rJS(window).ready(function (g) {

    var input_context = g.__element.getElementsByTagName('input')[0];
    g.playlist = [];
    g.currentPlayId = 0;
    RSVP.all([
      g.getDeclaredGadget(
        "control"
      ),
      g.getDeclaredGadget(
        "animation"
      ),
      g.getDeclaredGadget(
        "time"
      ),
      g.getDeclaredGadget(
        "volume"
      ),
      g.getDeclaredGadget(
        "title"
      ),
      g.getDeclaredGadget(
        "log"
      )
    ])
      .then(function (all_param) {
        var control = all_param[0],
          animation = all_param[1],
          time = all_param[2],
          volume = all_param[3],
          title = all_param[4],
          log = all_param[5],
          animationObject = new AnimationClass(control);

        input_context.onchange = function () {
          var tmp;
          for (tmp = 0; tmp < input_context.files.length; tmp += 1) {
            g.playlist.push(input_context.files[tmp]);
          }
        };
        animation.setAnimation(animationObject);
        animation.setAction('onclick', function () {
          control.isPaused()
            .then(function (pause) {
              if (pause) {
                control.playSong();
              } else {
                control.stopSong();
              }
            });
        });
        animation.setAction('ondblclick', function () {
          g.currentPlayId = Math.floor(Math.random()
                                       * g.playlist.length);
          control.setSong(g.playlist[g.currentPlayId]);
          control.playSong();
          animation.showAnimation();
          title.setMessage(g.playlist[g.currentPlayId].name);
          window.setInterval(function () {    //double click to play
            control.getCurrentTime()
              .then(function (e) {
                time.setValue(e);
              });
          }, 1000);
          control.getTotalTime()
            .then(function (e) {
              time.setMax(e);
            });
        });
        log.showMessage(volume);
      })
      .fail(function (e) {
        console.log("[ERROR]: " + e);
      });
  });
}(window, rJS));
