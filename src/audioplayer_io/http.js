/*global window, rJS, RSVP, jIO, JSON, console, indexedDB, Components */
/*jslint nomen: true*/
(function (window, jIO, rJS) {
  "use strict";

  var gk = rJS(window),
    input_context;

  gk.declareMethod('createIO', function (description, key) {

    this.jio = jIO.createJIO(description);
  })
    .declareMethod('getIO', function (attachment) {
      var gadget = this;
      return gadget.jio.getAttachment({
        "_id": attachment
      }).then(function (response) {
        return response.data;
      }).fail(function (response) {
        return "jio getIO error : " + response.target.result;
      });
    })
    .declareMethod('removeIO', function (attachment) {
      var gadget = this,
        index;
      index = gadget.playlist.name.indexOf(attachment);
      gadget.playlist.url.splice(index, 1);
      gadget.playlist.name.splice(index, 1);
      gadget.sendPlaylist(gadget.playlist);
    })
    .declareMethod('display', function (attachment) {
      input_context.style.display = "";
    })
    .declareMethod('noDisplay', function (attachment) {
      input_context.style.display = "none";
    })
    .declareMethod('showAllIO', function () {
      var gadget = this;
      return gadget.jio.allDocs().then(function (result) {
        return result.data.rows[0];
      }).fail(function (error) {
        return "ERROR : " + error;
      });
    })
    .declareAcquiredMethod("sendPlaylist", "sendPlaylist");
  gk.ready(function (g) {
    var index,
      url,
      name,
      urlArray = [],
      nameArray = [];
    input_context = g.__element.getElementsByTagName('input')[0];
    input_context.style.display = "none";
    g.playlist = {};
    g.createIO({ "type" : "http",
                 "database": "http://localhost:8080/"})
      .then(function () {
        g.showAllIO().then(function (result) {
          while (result) {
            index = result.indexOf("href=\"/");
            if (index === -1) {
              break;
            }
            result = result.substring(index + 7);
            index = result.indexOf("\">");
            url = result.substring(0, index);
            if (url.indexOf(".mp3") === -1) {
              result = result.substring(index + 2);
            } else {
              urlArray.push(url);
              result = result.substring(index + 2);
              index = result.indexOf("</a>");
              name = result.substring(0, index);
              nameArray.push(name);
            }
          }
          g.playlist.url = urlArray;
          g.playlist.name = nameArray;
          g.sendPlaylist(g.playlist);
        });
      });
  });
}(window, jIO, rJS));
