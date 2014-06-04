/*global window, rJS, RSVP, console, URL, Math,
  FileReader, Uint8Array, File */
/*jslint nomen: true*/

(function (window, rJS) {
  "use strict";
  var gk = rJS(window);
  gk.declareMethod('setSong', function (url) {  //configure a song
    var gadget = this;
    gadget.source.connect(gadget.analyser);
    gadget.analyser.connect(gadget.gain);
    gadget.gain.gain.value = gadget.volume;
    gadget.gain.connect(gadget.audioCtx.destination);
    gadget.audio.src = url;
    gadget.audio.onloadedmetadata = function () {
      gadget.sendTotalTime(gadget.audio.duration);
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
    .declareMethod('getTitle', function (id) {
      if (id === undefined) {
        id = this.currentPlayId;
      }
      return this.playlist[id];
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
        array = new Uint8Array(gadget.analyser.frequencyBinCount);
      gadget.analyser.getByteFrequencyData(array);
      tmp.array = array;
      tmp.length = array.length;
      return tmp;
    })
    .declareAcquiredMethod("nextToPlay", "nextToPlay")
    .declareAcquiredMethod("sendTotalTime", "sendTotalTime");
  gk.ready(function (g) {
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
    g.audio = new window.Audio();
    g.source = g.audioCtx.createMediaElementSource(g.audio);
    g.analyser = g.audioCtx.createAnalyser();
    g.gain = g.audioCtx.createGain();
    g.audio.onended = function () {
      g.nextToPlay();
    };
  });
}(window, rJS));
