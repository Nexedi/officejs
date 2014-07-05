
/*global window, rJS, RSVP, console, URL, Math, parseInt, document,
  Uint8Array, File, Audio, loopEventListener, jQuery, promiseEventListener*/
/*jslint nomen: true*/

(function (window, rJS, RSVP, loopEventListener, $, promiseEventListener) {
  "use strict";
  var gk = rJS(window),
    AudioContext = window.AudioContext || window.webkitAudioContext
      || window.mozAudiocontext || window.msAudioContext,
    audioCtx = new AudioContext(),
    myLoopEventListener = function (target, type, callback,
                                    allowDefault) {
      //////////////////////////
      // Infinite event listener (promise is never resolved)
      // eventListener is removed when promise is cancelled/rejected
      //////////////////////////
      var handle_event_callback,
        callback_promise;
      function cancelResolver() {
        if ((callback_promise !== undefined) &&
            (typeof callback_promise.cancel === "function")) {
          callback_promise.cancel();
        }
      }
      function canceller() {
        if (handle_event_callback !== undefined) {
          target.unbind(type, handle_event_callback);
        }
        cancelResolver();
      }
      function itsANonResolvableTrap(resolve, reject) {
        handle_event_callback = function (evt) {
          evt.stopPropagation();
          if (allowDefault !== true) {
            evt.preventDefault();
          }
          cancelResolver();
          callback_promise = new RSVP.Queue()
            .push(function () {
              return callback(evt);
            })
            .push(undefined, function (error) {
              if (!(error instanceof RSVP.CancellationError)) {
                canceller();
                reject(error);
              }
            });
        };
        target.bind(type, handle_event_callback);
      }
      return new RSVP.Promise(itsANonResolvableTrap, canceller);
    };



  function timeFormat(seconds) {
    var result = '00:' + Math.round(seconds),
      min,
      sec;
    if (seconds > 59) {
      min = Math.floor(seconds / 60);
      sec = Math.floor(seconds % 60);
      result = (min > 9 ? min : ('0' + min)) +
        ':' + (sec > 9 ? sec : ('0' + sec));
    }
    return result;
  }

  function getTime(context, x) {
    var posX = x,
      targetLeft = $(context).offset().left;
    posX = ((posX - targetLeft) / $(context).width());
    return posX * context.max;
  }

  function getFFTValue(gadget) {
    var array = new Uint8Array(gadget.analyser.frequencyBinCount);
    gadget.analyser.getByteFrequencyData(array);
    return array;
  }
  function setSong(url) {  //configure a song
    var gadget = this;
    gadget.source.connect(gadget.filter);
    gadget.filter.connect(gadget.analyser);
    gadget.analyser.connect(gadget.gain);
    gadget.gain.connect(audioCtx.destination);
    gadget.audio.src = url;
    gadget.audio.load();
  }

  function promiseRequestAnimation(callback) {
    var animationId;
    function canceller() {
      window.cancelAnimationFrame(animationId);
    }
    function resolver(resolve) {
      animationId = window.requestAnimationFrame(callback);
    }
    return new RSVP.Promise(resolver, canceller);
  }

  function playSong() {
    var that = this,
      canvas = that.canvas,
      canvasCtx = canvas.getContext('2d'),
      cwidth = canvas.width,
      cheight = canvas.height - 2,
      meterWidth = 8, //width of the meters in the spectrum
      capHeight = 2,
      meterNum = 300,
      array,
      drawFrame,
      step,
      i,
      value,
      bar_context = that.__element.getElementsByClassName("bar")[0],
      time_context = that.__element.getElementsByClassName('time')[0],
      gradient = canvasCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(1, '#0f0');
    gradient.addColorStop(0.5, '#ff0');
    gradient.addColorStop(0, '#f00');
    that.audio.play();
    drawFrame = function () {
      array = getFFTValue(that);
      canvasCtx.clearRect(0, 0, cwidth, cheight);
      step = Math.round(array.length / meterNum);
      bar_context.value = that.audio.currentTime;
      time_context.innerHTML = timeFormat(that.audio.duration -
                                          that.audio.currentTime);
      for (i = 0; i < meterNum; i += 1) {
        value = array[i * step];
        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(i * 12,
                           cheight - value + capHeight,
                           meterWidth,
                           cheight); //the meter
      }
      return promiseRequestAnimation(drawFrame);
    };
    return promiseRequestAnimation(drawFrame);
  }
  function nextToPlay(g) {
    return new RSVP.Queue()
      .push(function () {
        return g.allDocs({"include_docs": true});
      })
      .push(function (e) {
        var list =  e.data.rows,
          id;
        do {
          id = list[Math.floor(Math.random() * list.length)].id;
        } while (g.currentId === id);
        return g.displayThisPage({page: "control",
                                  id : id});
      });
  }
  gk.declareAcquiredMethod("jio_getAttachment", "jio_getAttachment")
    .declareAcquiredMethod("jio_get", "jio_get")
    .declareAcquiredMethod("plSave", "plSave")
    .declareAcquiredMethod("plGive", "plGive")
    .declareAcquiredMethod("displayThisPage", "displayThisPage")
    .declareAcquiredMethod("displayThisTitle", "displayThisTitle")
    .declareAcquiredMethod("allDocs", "allDocs")
    .declareAcquiredMethod("plEnablePage", "plEnablePage")
    .declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash")
    .declareMethod("render", function (options) {
      var g = this;
      if (options.id) {
        return new RSVP.Queue()
          .push(function () {
            return g.plGive("type");
          })
          .push(function (value) {
            g.filter.type = value;
            return g.plGive("value");
          })
          .push(function (value) {
            g.filter.frequency = value;
          })
          .push(function () {
            g.currentId = options.id;
            return g.jio_get({"_id" : options.id});
          })
          .push(function (result) {
            var share_context = g.__element.getElementsByClassName("share")[0];
            share_context.href =
              "https://twitter.com/intent/tweet?hashtags=MusicPlayer&text="
              + result.data.title;
            return g.displayThisTitle(result.data.title);
          })
          .push(function () {
            return nextToPlay(g);
          })
          .push(function (url) {
            g.__element.getElementsByClassName("next")[0].href = url;
            return g.jio_getAttachment({"_id" : options.id,
                                        "_attachment" : "enclosure" });
          })
          .push(function (blob) {
            g.url = URL.createObjectURL(blob);
          })
          .push(undefined, function (error) {
            throw error;
          });
      }
    })
    .declareMethod("startService", function () {
      var g = this,
        command_context = g.__element.getElementsByClassName("command")[0],
        mute_context = g.__element.getElementsByClassName("mute")[0],
        bar_context = g.__element.getElementsByClassName("bar")[0],
        box_context = g.__element.getElementsByClassName("box")[0],
        filter_context = g.__element.getElementsByClassName("filter")[0],
        filter_type = $('select'),
        time_context = g.__element.getElementsByClassName("time")[0];
      bar_context.value = 0;
      return new RSVP.Queue()
        .push(function () {
          setSong.call(g, g.url);
          return promiseEventListener(g.audio, "loadedmetadata", false);
        })
        .push(function () {
          return g.plEnablePage();
        })
        .push(function () {
          bar_context.max = g.audio.duration;
          time_context.style.left = bar_context.style.left;
          $(time_context).offset().top = $(bar_context).offset().top + 3;
          time_context.innerHTML = timeFormat(g.audio.duration);
          return RSVP.any([
            playSong.call(g),
            loopEventListener(mute_context, "click", false, function () {
              g.gain.gain.value = (g.gain.gain.value + 1) % 2;
            }),

            loopEventListener(g.audio, "ended", false, function () {
              return nextToPlay(g)
                .push(function (url) {
                  window.location = url;
                });
            }),

            loopEventListener(command_context, "click", false, function () {
              if (g.audio.paused) {
                g.audio.play();
                command_context.innerHTML = "stop";
              } else {
                g.audio.pause();
                command_context.innerHTML = "play";
              }
            }),

            loopEventListener(bar_context, "click", false, function (event) {
              g.audio.currentTime = getTime(bar_context, event.clientX);
              bar_context.value = g.audio.currentTime;
              g.audio.play();
              command_context.innerHTML = "stop";
            }),

            loopEventListener(bar_context, "mousemove",
                              false, function (event) {
                var time = getTime(bar_context, event.clientX);
                box_context.style.left = ((event.clientX - 20) / 16) + "em";
                box_context.style.display = 'block';
                box_context.innerHTML = timeFormat(time);
              }),
            loopEventListener(bar_context, "mouseout",
                              false, function () {
                box_context.style.display = "none";
              }),

            myLoopEventListener($(filter_context), "change", function () {
              g.filter.frequency.value = filter_context.value;
              return g.plSave({"value": filter_context.value});
            }),
            myLoopEventListener(filter_type, "change", function () {
              var type = parseInt(filter_type.val(), 10);
              g.filter.type = type;
              return g.plSave({"type": type});
            })
          ]);
        });
    });
  gk.ready(function (g) {
    g.audio = g.__element.getElementsByTagName('audio')[0];
    g.audio.style.display = "none";
    g.source = audioCtx.createMediaElementSource(g.audio);
    g.analyser = audioCtx.createAnalyser();
    g.gain = audioCtx.createGain();
    g.filter = audioCtx.createBiquadFilter();
    g.canvas = g.__element.getElementsByTagName('canvas')[0];
  });
}(window, rJS, RSVP, loopEventListener, jQuery, promiseEventListener));
