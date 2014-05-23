/*global window, rJS, RSVP, console, URL, Math, FileReader, Uint8Array */

(function (window, rJS) {
  "use strict";
  var gk = rJS(window);
  gk.declareMethod('setSong', function (file) {  //configure a song
    var gadget = this;
    gadget.file = file;
    gadget.source.connect(gadget.analyser);
    gadget.analyser.connect(gadget.gain);
    gadget.gain.gain.value = gadget.volume;
    gadget.gain.connect(gadget.audioCtx.destination);
    gadget.audio.stop();
    gadget.audio.src = URL.createObjectURL(file);
    gadget.audio.load();
    gadget.decoded = true;
  })
    .declareMethod('stopSong', function () {
      this.audio.stop();
    })
    .declareMethod('playSong', function () {
      this.audio.play();
    })
    .declareMethod('volumeUp', function () {
      var gadget = this;
      if (gadget.volume < 3) {
        gadget.volume += 0.2;
      }
      gadget.gain.gain.value = gadget.volume;
    })
    .declareMethod('volumeDowm', function () {
      var gadget = this;
      if (gadget.volume > 0) {
        gadget.volume -= 0.2;
        if (gadget.volume < 0) {
          gadget.volume = 0;
        }
      }
      gadget.gain.gain.value = gadget.volume;
    })
    .declareMethod('getVolume', function () {
      return Math.round(this.volume * 100) + "%";
    })
    .declareMethod('getCurrentTime', function () {
      return this.audio.currentTime;
    })
    .declareMethod('getTotalTime', function () {
      return this.getDecodeValue().duration;
    })
    .declareMethod('getFFTValue', function () {
      var gadget = this,
        array = new Uint8Array(gadget.analyser.frequencyBinCount);
      gadget.analyser.getByteFrequencyData(array);
      return array;
    })
    .declareMethod('getDecodeValue', function () {
      var gadget = this,
        promiseReadFile;
      if (gadget.decoded === false) {  //if decoded,return buffer saved 
        return gadget.buffer;
      }
      gadget.decoded = false;

      promiseReadFile = new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onloadend = function (event) {
          if (reader.error) {
            reject(reader.error);
          } else {
            resolve(event.target.result);
          }
        };
        reader.readAsArrayBuffer(gadget.file);
      });


      return promiseReadFile.then(function (response) {
        return new Promise(function (resolve, reject) {
          gadget.audioCtx.decodeAudioData(response, function (buffer) {
            resolve(buffer);
          }, function () {
            reject(-1);
          });
        });
      }).then(function (response) {
        return response;
      }).catch(function (error) {
        return error;
      });
    })
    .declareMethod('onended', function (end) {
      if (typeof end === "function") {
        this.audio.onended = end;
      } else {
        console.log("ERROR:[onended] parameter shoude be a function\n");
      }
    });

  gk.ready(function (g) {
    g.volume = 1;
    window.AudioContext = window.AudioContext || window.webkitAudioContext
      || window.mozAudiocontext || window.msAudioContext;
    try {
      g.audioCtx = new window.AudioContext();
    } catch (e) {
      console.log(
        "ERROR:[configure] Tour browser does not support AudioContext"
      );
    }
    g.audio = new window.Audio();
    g.source = g.audioCtx.createMediaElementSource(g.audio);
    g.analyser = g.audioCtx.createAnalyser();
    g.gain = g.audioCtx.createGain();
    g.decoded = true;
  });
}(window, rJS));