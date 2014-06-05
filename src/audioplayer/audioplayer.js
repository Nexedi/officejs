/*global window, rJS, RSVP, console, $, jQuery, URL, location */
/*jslint nomen: true*/

(function (window, rJS, $) {
  "use strict";
  var control,
    animation,
    time,
    volume,
    title,
    io,
    totalId = -1,
    that,
    next_context,
    play_context,
    stop_context,
    addMusic_context,
    currentId = -1,
    initializeFlag = false,
    playlist = [];
  function nextId() {
    if (totalId === -1) {
      return -1;
    }
    currentId += 1;
    currentId %= totalId;
    return currentId;
  }
  rJS(window)
    .declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash")
    .declareAcquiredMethod("showPage", "showPage")
    .declareAcquiredMethod("addPage", "addPage")
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
      var id = nextId(),
        name = playlist[id];

      io.getIO(name).then(function (file) {
        control.setSong(URL.createObjectURL(file)).then(function () {
          control.playSong();
          title.setMessage(name);
          animation.showAnimation();
        });
      });
    })
    .allowPublicAcquisition("sendPlaylist", function (value) {
      playlist = value[0];
      totalId =  playlist.length;  //array parameter
      if (initializeFlag === false) {
        that.render();
        initializeFlag = true;
      }
    })
    .allowPublicAcquisition("sendTotalTime", function (value) {
      time.setMax(value[0]);
    })
    .ready(function (g) {
      next_context = g.__element.getElementsByTagName('a')[0];
      play_context = g.__element.getElementsByTagName('a')[1];
      stop_context = g.__element.getElementsByTagName('a')[2];
      addMusic_context = g.__element.getElementsByTagName('a')[3];
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
        ),
        g.getDeclaredGadget(
          "io"
        )
      ])
        .then(function (all_param) {
          control = all_param[0];
          animation = all_param[1];
          time = all_param[2];
          volume = all_param[3];
          title = all_param[4];
          io = all_param[5];
          that.display();
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

          that.showPage("addMusic").then(function (result) {
            addMusic_context.href = result;
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
    .declareMethod("display", function (options) {
      io.noDisplay();
      title.display();
      time.display();
      volume.display();
      animation.display();
      next_context.style.display = "";
      play_context.style.display = "";
      stop_context.style.display = "";
      addMusic_context.style.display = "";
    })
    .declareMethod("noDisplay", function (options) {
      if (options === "addPage") {
        io.display();
      }
      title.noDisplay();
      time.noDisplay();
      volume.noDisplay();
      animation.noDisplay();
      next_context.style.display = "none";
      play_context.style.display = "none";
      stop_context.style.display = "none";
      addMusic_context.style.display = "none";
    })
    .declareMethod("render", function (options) {
      var id = nextId(),
        name = playlist[id];
      if (initializeFlag === false) {
        return;
      }

      that.showPage(name)
        .then(function (result) {
          next_context.href = result;
        });

      if (options.page !== undefined) {
        if (options.page === "play") {
          control.playSong();
          animation.showAnimation();
          return;
        }
        if (options.page === "stop") {
          control.stopSong();
          animation.stopAnimation();
          return;
        }
        if (options.page === "addMusic") {
          animation.stopAnimation();
          control.stopSong()
            .then(that.addPage());
          return;
        }

        if (playlist.indexOf(options.page) === -1) {
          animation.stopAnimation();
          control.stopSong()
            .then(that.ErrorPage())
            .fail(function (e) {
              console.log("error drop gadget " + e);
            });
          return;
        }
        io.getIO(options.page).then(function (file) {
          control.setSong(URL.createObjectURL(file)).then(function () {
            control.playSong();
            title.setMessage(options.page);
            animation.showAnimation();
          });
        });
      }
    });
}(window, rJS, jQuery));
