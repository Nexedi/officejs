/*global window, rJS, RSVP, console, URL, Math, parseInt, document, jIO,
  Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array,
  Audio, loopEventListener, jQuery, promiseEventListener, Blob*/
/*jslint nomen: true, maxlen:180 */


/* The MediaSource API only supports MPEG-DASH and 
 * VP8 with keyframed segments currently (on Chrome 35).
 * more info:
 *https://dvcs.w3.org/hg/html-media/raw-file/tip/media-source/media-source.html
 */



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
            g.currentId = options.id;
            return g.jio_get({"_id" : options.id});
          })
          .push(function (result) {
            var share_context = g.__element.getElementsByClassName("share")[0];
            share_context.href =
              "https://twitter.com/intent/tweet?hashtags=MusicPlayer&text="
              + encodeURI(result.data.title);
            g.length = Object.keys(result.data._attachment).length;
            return g.displayThisTitle(options.action + " : "
                                      + result.data.title);
          })
          .push(function () {
            return g.allDocs({"include_docs": true});
          })
          .push(function (e) {
            var list =  e.data.rows,
              id,
              index,
              control = "control";
            if (list.length === 1) {
              id = g.currentId;
            } else {
              do {
                index = Math.floor(Math.random() * list.length);
                id = list[index].id;
              } while (g.currentId === id);
            }
            if (list[index].doc.format === "video/webm") {
              control = "video_control";
            }
            return g.displayThisPage({page: control,
                                      id : id,
                                      action : options.action});
          })
          .push(function (url) {
            g.__element.getElementsByClassName("next")[0].href = url;
            g.index = 0;
            g.id = options.id;
            return g.jio_getAttachment({"_id" : options.id,
                                        "_attachment" : "enclosure0" });
          })
          .push(function (blob) {
            g.sourceBuffer = g.mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
            return jIO.util.readBlobAsArrayBuffer(blob).then(function (e) {
              g.sourceBuffer.appendBuffer(new Uint8Array(e.target.result));
              g.video.play();
              g.fin = true;
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
      var g = this;
      return new RSVP.Queue()
        .push(function () {
          return RSVP.any([
            loopEventListener(g.sourceBuffer, "updateend", false, function () {
              if (!g.fin) {
                return;
              }
              g.fin = false;
              if (g.index >= g.length - 1) {
                g.mediaSource.endOfStream();
                return;
              }
              g.index += 1;
              return g.jio_getAttachment({"_id" : g.id,
                                          "_attachment" : "enclosure" + g.index })
                .then(function (blob) {
                  console.log(g.index);
                  return jIO.util.readBlobAsArrayBuffer(blob);
                })
                .then(function (e) {
                  g.fin = true;
                  return g.sourceBuffer.appendBuffer(new Uint8Array(e.target.result));
                });
            })
          ]);
        })
        .push(function (error) {
          console.log(error);
        });
    });
  gk.ready(function (g) {
    g.video = g.__element.getElementsByTagName('video')[0];
    g.mediaSource = new MediaSource();
    g.video.src = URL.createObjectURL(g.mediaSource);
  });
}(window, rJS, RSVP, loopEventListener, jQuery, promiseEventListener));
