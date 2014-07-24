/*global window, rJS, RSVP, console, URL, Math, parseInt, document, jIO,
  Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array,
  Audio, loopEventListener, jQuery, promiseEventListener, Blob*/
/*jslint nomen: true, maxlen:180 */

(function (window, rJS, RSVP, loopEventListener, $, promiseEventListener) {
  "use strict";
  var gk = rJS(window),
    MediaSource = window.MediaSource || window.WebKitMediaSource;
  gk.declareAcquiredMethod("jio_getAttachment", "jio_getAttachment")
    .declareAcquiredMethod("jio_get", "jio_get")
    .declareAcquiredMethod("jio_remove", "jio_remove")
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
            return g.jio_getAttachment({"_id" : options.id,
                                        "_attachment" : "enclosure" });
          })
          .push(function (blob) {
            g.sourceBuffer = g.mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
            g.blob = blob;
            g.size = 0;
            g.step =  Math.ceil(blob.size / 16);
            blob = blob.slice(0, g.step);
            g.size += g.step;
            return jIO.util.readBlobAsArrayBuffer(blob).then(function (e) {
              g.sourceBuffer.appendBuffer(new Uint8Array(e.target.result));
              g.video.play();
            });
          })
          .push(undefined, function (error) {
            if (!(error instanceof RSVP.CancellationError)) {
              window.location = g.__element
                .getElementsByClassName("next")[0].href;
              if ((error.status === 404)
                  && (error.method === "getAttachment")) {
                return g.jio_remove({"_id" : error.id});
              }
            }
          });
      }
    })
    .declareMethod("startService", function () {
      var g = this,
        video = g.__element.getElementsByClassName("videoMP4")[0];
      g.video.play();
      return new RSVP.Queue()
        .push(function () {
          return RSVP.any([
            loopEventListener(video, "progress", false, function () {
              var blob;
              if (g.size >= g.blob.size) {
                g.mediaSource.endOfStream();
                return;
              }
              if (g.size + g.step < g.blob.size) {
                blob = g.blob.slice(g.size, g.size + g.step);
              } else {
                blob = g.blob.slice(g.size);
              }
              g.size += g.step;
              return jIO.util.readBlobAsArrayBuffer(blob).then(
                function (e) {
                  return g.sourceBuffer.appendBuffer(new Uint8Array(e.target.result));
                }
              );
            })
          ]);
        });
    });
  gk.ready(function (g) {
    g.video = g.__element.getElementsByTagName('video')[0];
    g.mediaSource = new MediaSource();
    g.video.src = URL.createObjectURL(g.mediaSource);
  });
}(window, rJS, RSVP, loopEventListener, jQuery, promiseEventListener));
