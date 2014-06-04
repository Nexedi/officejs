/*global window, rJS, RSVP, console, $, jQuery, URL, location */
/*jslint nomen: true*/

(function (window, rJS, $) {
  "use strict";
  var control,
    animation,
    time,
    volume,
    title,
    totalId = -1,
    that,
    next_context,
    play_context,
    stop_context,
    currentId,
    initializeFlag = false;
  function nextId() {
    var tmp;
    if (totalId === -1) {
      return -1;
    }
    do {
      tmp =  Math.floor(Math.random() * totalId);
    } while (currentId === tmp);
    currentId = tmp;
    return tmp;
  }
  rJS(window)
    .declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash")
    .declareAcquiredMethod("showPage", "showPage")
    .declareAcquiredMethod("ErrorPage", "ErrorPage")
    .allowPublicAcquisition("setCurrentTime", function (value) {
      control.setCurrentTime(value[0]);
    })
    .allowPublicAcquisition("setVolume", function (value) {
      control.setVolume(value[0]);
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
    .allowPublicAcquisition("nextTitle", function (tab) { //unused
      this.aq_pleasePublishMyState({page: tab[0]})
        .then(function (url) {
          that.pleaseRedirectMyHash(url);
        });
    })
    .allowPublicAcquisition("sendTotalId", function (value) {
      totalId = value[0];  //array parameter
      if (initializeFlag === false) {
        that.render();
        initializeFlag = true;
      }
    })
    .allowPublicAcquisition("sendTotalTime", function (value) {
      time.setMax(value[0]);
    })
    .allowPublicAcquisition("allNotify", function () {
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
      next_context = g.__element.getElementsByTagName('a')[0];
      play_context = g.__element.getElementsByTagName('a')[1];
      stop_context = g.__element.getElementsByTagName('a')[2];
      that = g;
      initializeFlag = false;
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
          that.showPage("play").then(function (result) {
            play_context.href = result;
          });
          that.showPage("stop").then(function (result) {
            stop_context.href = result;
          });
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
      if (initializeFlag === false) {
        return;
      }
      control.getTitle(nextId()).then(function (title) {
        that.showPage(title)
          .then(function (result) {
            next_context.href = result;
          });
      });
      if (options.page !== undefined) {
        if (options.page === "play") {
          control.playSong();
          return;
        }
        if (options.page === "stop") {
          control.stopSong();
          return;
        }
        control.setSong(options.page).then(function (result) {
          if (result === -1) {
            control.stopSong()
              .then(that.dropGadget("title"))
              .then(that.dropGadget("control"))
              .then(that.dropGadget("animation"))
              .then(that.dropGadget("time"))
              .then(that.dropGadget("volume"))
              .then(that.ErrorPage())
              .fail(function () {
                console.log("error drop gadget");
              });
            return;
          }
          control.playSong();
        });
      }
    });
}(window, rJS, jQuery));
