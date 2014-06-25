/*global window, rJS, RSVP, console, URL, Math,
  FileReader, Uint8Array, File, Audio*/
/*jslint nomen: true*/

(function (window, rJS) {
  "use strict";
  var gk = rJS(window),
    arraytmp = [];
  gk.declareMethod('setSong', function (url) {  //configure a song
    var gadget = this;
    gadget.source.connect(gadget.analyser);
    gadget.analyser.connect(gadget.gain);
    gadget.gain.gain.value = gadget.volume;
    gadget.gain.connect(gadget.audioCtx.destination);
    gadget.audio.src = url;
    gadget.audio.onloadedmetadata = function () {
      window.setTimeout(
        function () {
          gadget.sendTotalTime(gadget.audio.duration);
        },
        3000
      );
    };
    gadget.audio.load();
  })
    .declareMethod('stopSong', function () {
      this.audio.pause();
    })
    .declareMethod('playSong', function () {
      this.audio.play();
    })
    .declareMethod('setVolume', function (volume) {
      this.volume = volume;
      this.gain.gain.value = volume;
    })
    .declareMethod('getVolume', function () {
      return this.volume;
    })
    .declareMethod('isPaused', function () {
      return this.audio.paused;
    })
    .declareMethod('getCurrentTime', function () {
      return this.audio.currentTime;
    })
    .declareMethod('setCurrentTime', function (currentTime) {
      this.audio.currentTime = currentTime;
      this.audio.play();
    })
    .declareMethod('getTotalTime', function () {
      console.log(this.audio.duration);
      return this.audio.duration;
    })
    .declareMethod('getFFTValue', function () {
      var gadget = this,
        tmp = {},
        i,
        array = new Uint8Array(gadget.analyser.frequencyBinCount);
      gadget.analyser.getByteFrequencyData(array);
      // if fft failed, random value
      if (array[0] === 0 && array[50] === 0 && array[100] === 0) {
        for (i = 0; i < 1024; i += 1) {
          if (Math.floor(Math.random() * 10) > 5) {
            arraytmp[i] -= 5;
            if (arraytmp[i] < 0) {
              arraytmp[i] = 0;
            }
          } else {
            arraytmp[i] += 5;
            if (arraytmp[i] > 255) {
              arraytmp[i] = 100;
            }
          }
          array[i] = arraytmp[i];
        }
      }
      tmp.array = array;
      tmp.length = array.length;
      return tmp;
    })
    .declareAcquiredMethod("nextToPlay", "nextToPlay")
    .declareAcquiredMethod("sendTotalTime", "sendTotalTime");
  gk.ready(function (g) {
    var i;
    g.volume = 1;
    window.AudioContext = window.AudioContext || window.webkitAudioContext
      || window.mozAudiocontext || window.msAudioContext;
    try {
      g.audioCtx = new window.AudioContext();
    } catch (e) {
      console.log(
        "ERROR:[control] " + e
      );
    }
    for (i = 0; i < 1024; i += 1) {
      arraytmp[i] = Math.floor(Math.random() * 255);
    }
    g.audio = g.__element.getElementsByTagName('audio')[0];
    g.audio.style.display = "none";
    g.source = g.audioCtx.createMediaElementSource(g.audio);
    g.analyser = g.audioCtx.createAnalyser();
    g.gain = g.audioCtx.createGain();
    g.audio.onended = function () {
      g.nextToPlay();
    };
  });
}(window, rJS));
