/*global window, rJS, RSVP, console, $, jQuery */
/*jslint nomen: true*/
(function (window, rJS, $) {
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
      )
    ])
      .then(function (all_param) {
        var control = all_param[0],
          animation = all_param[1],
          time = all_param[2],
          volume = all_param[3],
          title = all_param[4],
          animationObject = new AnimationClass(control);
        window.setInterval(function () {    //double click to play
          control.getCurrentTime()
            .then(function (e) {
              time.setValue(e);
            });
        }, 1000);
        volume.setMax(3);
        function nextToPlay() {
          g.currentPlayId = Math.floor(Math.random()
                                       * g.playlist.length);
          control.setSong(g.playlist[g.currentPlayId]);
          control.playSong();
          animation.showAnimation();
          title.setMessage(g.playlist[g.currentPlayId].name);
          control.getTotalTime()
            .then(function (e) {
              time.setMax(e);
            });
        }
        input_context.onchange = function () {
          var tmp,
            index,
            found;
          for (index = 0; index < input_context.files.length; index += 1) {
            found = false;
            for (tmp = 0; tmp < g.playlist.length; tmp += 1) {
              if (g.playlist[tmp].name === input_context.files[index].name) {
                found = true;
                break;
              }
            }
            if (found === false) {
              g.playlist.push(input_context.files[index]);
            }
          }
        };

        //time configure
        time.setAction('onclick', function (e) {
          time.getPositionValue(e).
            then(function (value) {
              control.setCurrentTime(value);
              time.setValue(value);
            });
        });
        //volume configure
        volume.setMax(3);
        volume.setAction('onclick', function (e) {
          volume.getPositionValue(e).
            then(function (value) {
              volume.setValue(value);
              control.setVolume(value);
            });
        });

        //control configure
        control.onended(nextToPlay);
        //animation configure
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
        animation.setAction('ondblclick', nextToPlay);
      })
      .fail(function (e) {
        console.log("[ERROR]: " + e);
      });
  });
}(window, rJS, jQuery));
