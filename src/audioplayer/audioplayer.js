/*global window, rJS, RSVP, console, $, jQuery, URL */
/*jslint nomen: true*/
(function (window, rJS, $) {
  "use strict";
  var control,
    animation,
    time,
    volume,
    title,
    totalId = 0;
  function nextId() {
    return Math.floor(Math.random() * totalId);
  }
  rJS(window)
    .allowPublicAcquisition("setCurrentTime", function (value) {
      control.setCurrentTime(value);
    })
    .allowPublicAcquisition("setVolume", function (value) {
      control.setVolume(value);
    })
    .allowPublicAcquisition("getVolume", function () {
      return control.getVolume().then(function (value) {
        return value;
      });
    })
    .allowPublicAcquisition("getFFTValue", function () {
      return control.getFFTValue().then(function (value) {
        return value;
      });
    })
    .allowPublicAcquisition("nextToPlay", function () {
      return nextId();
    })
    .allowPublicAcquisition("sendTotalId", function (value) {
      totalId = value[0];  //array parameter
    })
    .allowPublicAcquisition("allNotify", function () {
      control.getTotalTime().then(function (value) {
        time.setMax(value);
      });
      control.getTitle().then(function (value) {
        title.setMessage(value);
      });
    })
    .allowPublicAcquisition("showAnimation", function () {
      animation.showAnimation();
    })
    .allowPublicAcquisition("stopAnimation", function () {
      animation.stopAnimation();
    })
    .ready(function (g) {
      var  next_context = g.__element.getElementsByTagName('button')[0],
        command_context = g.__element.getElementsByTagName('button')[1];
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
          control = all_param[0];
          animation = all_param[1];
          time = all_param[2];
          volume = all_param[3];
          title = all_param[4];
          window.setInterval(function () {
            control.getCurrentTime()
              .then(function (e) {
                time.setValue(e);
              });
          }, 1000);
          volume.setMax(3);

          next_context.onclick = function () {
            control.setSong(nextId()).then(function () {
              control.playSong();
              animation.showAnimation();
              control.getTotalTime().then(function (value) {
                time.setMax(value);
              });
            });
          };
          command_context.onclick = function () {
            control.isPaused().then(function (paused) {
              if (paused) {
                control.playSong();
              } else {
                control.stopSong();
              }
            });
          };
          //volume configure
          control.getVolume().then(function (value) {
            volume.setValue(value);
          });


        //title configure
          title.setMessage("audio player");
          title.getSize().then(function (size) {
            title.setPosition(size * 2);
          });
        })
        .fail(function (e) {
          console.log("[ERROR]: " + e);
        });
    });
}(window, rJS, jQuery));
