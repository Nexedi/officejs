/*global window, rJS, RSVP, jIO, JSON, console, indexedDB */
/*jslint nomen: true*/
(function (window, jIO, rJS) {
  "use strict";

  var gk = rJS(window),
    input_context;

  gk.declareMethod('createIO', function (description, key) {
//    indexedDB.deleteDatabase("jio:test");
    this.jio = jIO.createJIO(description);
    this.key = key;
    return this.jio.put({
      "_id" : key
    }).then(function () {
      description = JSON.stringify(description, null, "  ");
      console.log("JIO created: " + description + "\nwith key: " + key);
      return;
    }).fail(function (e) {
      console.log("jio created error: " + e.target.result);
      return;
    });
  })
    .declareMethod('getIO', function (attachment) {
      var gadget = this;
      return gadget.jio.getAttachment({
        "_id": gadget.key,
        "_attachment": attachment
      }).then(function (response) {
        return response.data;
      }).fail(function (response) {
        return "jio getIO error : " + response.target.result;
      });
    })
    .declareMethod('removeIO', function (attachment) {
      var gadget = this;
      return gadget.jio.removeAttachment({
        "_id": gadget.key,
        "_attachment": attachment
      }).then(function () {
        gadget.playlist.splice(gadget.playlist.indexOf(attachment), 1);
        gadget.sendPlaylist(gadget.playlist);
      }).fail(function (response) {
        return "jio removeIO error : " + response.target.result;
      });
    })
    .declareMethod('display', function (attachment) {
      input_context.style.display = "";
    })
    .declareMethod('noDisplay', function (attachment) {
      input_context.style.display = "none";
    })
    .declareMethod('setIO', function (attachment, file) {
      var gadget = this;
      return gadget.jio.putAttachment({
        "_id": gadget.key,
        "_attachment": attachment,
        "_blob": file
      }).then(function (e) {
        return e;
      }).fail(function (error) {
        return "ERROR : " + error;
      });
    })
    .declareMethod('showAllIO', function () {
      var gadget = this;
      return gadget.jio.allDocs({
        "include_docs": "m"
      }).then(function (result) {
        return result.data.rows[0].doc._attachment;
      }).fail(function (error) {
        return "ERROR : " + error;
      });
    })
    .declareAcquiredMethod("sendPlaylist", "sendPlaylist");
  gk.ready(function (g) {
    input_context = g.__element.getElementsByTagName('input')[0];
    input_context.style.display = "none";
    g.playlist = [];
    g.createIO({ "type" : "indexeddb",
                 "database": "test"},
               "m")
      .then(function () {
        g.showAllIO().then(function (result) {
          if (result !== undefined) {
            var array = Object.keys(result),
              i;
            for (i = 0; i < array.length; i += 1) {
              g.playlist.push(array[i]);
            }
          }
          g.sendPlaylist(g.playlist);
        });
      });
    input_context.onchange = function () {
      var tmp,
        index,
        found;
      for (index = 0; index < input_context.files.length; index += 1) {
        found = false;
        for (tmp = 0; tmp < g.playlist.length; tmp += 1) {
          if (g.playlist[tmp] === input_context.files[index].name) {
            found = true;
            break;
          }
        }
        if (found === false) {
          g.setIO(input_context.files[index].name,
                     input_context.files[index]);
          g.playlist.push(input_context.files[index].name);
        }
      }
      g.sendPlaylist(g.playlist);
    };
  });
}(window, jIO, rJS));
