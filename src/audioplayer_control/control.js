/*global window, rJS, RSVP, console, URL, Math,
  FileReader, Uint8Array, File */
/*jslint nomen: true*/

(function (window, rJS) {
  "use strict";
  var gk = rJS(window);
  gk.declareMethod('setSong', function (id) {  //configure a song
    var gadget = this;
    if (typeof id === "string") {
      id = gadget.playlist.indexOf(id);
    }
    if ((id >= gadget.lenght) || (id < 0)) {
      console.log("invalide play id");
      return -1;
    }
    if (gadget.currentPlayId !== id) {
      gadget.decoded = true;
    }
    gadget.currentPlayId = id;
    gadget.source.connect(gadget.analyser);
    gadget.analyser.connect(gadget.gain);
    gadget.gain.gain.value = gadget.volume;
    gadget.gain.connect(gadget.audioCtx.destination);
    return gadget.io.getIO(gadget.playlist[id]).then(function (file) {
      gadget.audio.src =  URL.createObjectURL(file);
      gadget.audio.onloadedmetadata = function () {
        gadget.sendTotalTime(gadget.audio.duration);
      };
      gadget.file = file;
      gadget.audio.load();
      gadget.allNotify();
    });
  })
    .declareMethod('stopSong', function () {
      this.audio.pause();
      this.stopAnimation();
    })
    .declareMethod('playSong', function () {
      this.audio.play();
      this.showAnimation();
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
    .declareMethod('getDecodeValue', function () {  //unused
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
            gadget.buffer = buffer;
            resolve(buffer);
          }, function () {
            reject("decode error");
          });
        });
      }).then(function (response) {
        return response;
      }).catch(function (error) {
        return error;
      });
    })
    .declareAcquiredMethod("sendTotalId", "sendTotalId")
    .declareAcquiredMethod("nextToPlay", "nextToPlay")
    .declareAcquiredMethod("nextTitle", "nextTitle")
    .declareAcquiredMethod("allNotify", "allNotify")
    .declareAcquiredMethod("sendTotalTime", "sendTotalTime")
    .declareAcquiredMethod("showAnimation", "showAnimation")
    .declareAcquiredMethod("stopAnimation", "stopAnimation");
  gk.ready(function (g) {
    var input_context = g.__element.getElementsByTagName('input')[0];
    g.volume = 1;
    g.playlist = [];
    g.currentPlayId = 0;
    window.AudioContext = window.AudioContext || window.webkitAudioContext
      || window.mozAudiocontext || window.msAudioContext;
    try {
      g.audioCtx = new window.AudioContext();
    } catch (e) {
      console.log(
        "ERROR:[configure] Your browser does not support AudioContext"
      );
    }
    g.getDeclaredGadget("io").then(function (e) {
      g.io = e;
      g.io.createIO({ "type" : "indexeddb",
                      "database": "test"},
                    "m")
        .then(function () {
          g.io.showAllIO().then(function (result) {
            var array = Object.keys(result),
              i;
            for (i = 0; i < array.length; i += 1) {
              g.playlist.push(array[i]);
            }
            g.sendTotalId(g.playlist.length);
          });
        });
    });
    g.audio = new window.Audio();
    g.source = g.audioCtx.createMediaElementSource(g.audio);
    g.analyser = g.audioCtx.createAnalyser();
    g.gain = g.audioCtx.createGain();
    g.decoded = true;
    g.audio.onended = function () {
      g.nextToPlay().then(function (id) {
        g.setSong(id).then(function () {
          g.playSong();
          g.allNotify();
        });
      });
    };
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
          g.io.setIO(input_context.files[index].name,
                     input_context.files[index]);
          g.playlist.push(input_context.files[index].name);
        }
      }
      g.sendTotalId(g.playlist.length);
    };
  });
}(window, rJS));
