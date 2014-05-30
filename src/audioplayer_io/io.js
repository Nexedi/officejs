/*global window, rJS, RSVP, jIO, JSON, console, indexedDB */
/*jslint nomen: true*/
(function (window, jIO, rJS) {
  "use strict";

  var gk = rJS(window);

  gk.declareMethod('createIO', function (description, key) {
   // indexedDB.deleteDatabase("jio:test");
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
    });
}(window, jIO, rJS));
