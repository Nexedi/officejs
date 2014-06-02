/*global window, rJS, RSVP, console, $, jQuery, URL, location */
/*jslint nomen: true*/

(function (window, rJS, $) {
  "use strict";
  var control,
    animation,
    time,
    volume,
    title,
    totalId = 0,
    that,
    next_context,
    command_context,
    currentId;
  function nextId() {
    var tmp;
    do {
      tmp =  Math.floor(Math.random() * totalId);
    } while (currentId === tmp);
    currentId = tmp;
    return tmp;
  }
  rJS(window)
    .declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash")
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
    .allowPublicAcquisition("nextTitle", function (tab) {
      this.aq_pleasePublishMyState({page: tab[0]})
        .then(function (url) {
          that.pleaseRedirectMyHash(url);
        });
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
      animation.showAnimation();
    })
    .allowPublicAcquisition("showAnimation", function () {
      animation.showAnimation();
    })
    .allowPublicAcquisition("stopAnimation", function () {
      animation.stopAnimation();
    })
    .ready(function (g) {
      next_context = g.__element.getElementsByTagName('a')[0];
      command_context = g.__element.getElementsByTagName('a')[1];
      that = g;
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

  rJS(window)
    .declareMethod("render", function (options) {
      if (options.page !== undefined) {
        control.setSong(options.page).then(function () {
          control.playSong();
          control.getTitle();
        });
      }
      control.getTitle(nextId()).then(function (title) {
        if (title === undefined) {
          title = "start";
        }
        that.aq_pleasePublishMyState({page: title})
          .then(function (result) {
            next_context.href = result;
          });
      });
    });
}(window, rJS, jQuery));
