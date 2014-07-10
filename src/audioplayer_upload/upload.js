/*global window, rJS, RSVP, jIO, JSON, promiseEventListener, console,
  Error*/
/*jslint nomen: true*/
(function (window, jIO, rJS) {
  "use strict";
  var gk = rJS(window);
  gk.declareAcquiredMethod("jio_post", "jio_post")
    .declareAcquiredMethod("jio_putAttachment", "jio_putAttachment")
    .declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash")
    .declareAcquiredMethod("displayThisPage", "displayThisPage")
    .declareAcquiredMethod("displayThisTitle", "displayThisTitle")
    .declareAcquiredMethod("plEnablePage", "plEnablePage")
    .declareAcquiredMethod("plDisablePage", "plDisablePage")
    .declareMethod("render", function () {
      return this.displayThisTitle("upload");
    })
    .declareMethod("startService", function () {
      var g = this,
        input_context =
          g.__element.getElementsByTagName('input')[0],
        info_context =
          g.__element.getElementsByClassName('info')[0],
        queue,
        uploaded = 0,
        length;
      function post() {
        if (uploaded === length) {
          return;
        }
        var now = new Date();
        return g.jio_post({ "title" : input_context.files[uploaded].name,
                            "type" : "file",
                            "format" :  input_context.files[uploaded].type,
                            "size" : input_context.files[uploaded].size,
                            "modified" : now.toUTCString(),
                            "date" : now.getFullYear() + "-" +
                            (now.getMonth() + 1) + "-" + now.getDate()
                          }, 0)
          .then(function (res) {
            return g.jio_putAttachment({
              "_id" : res.id,
              "_attachment" : "enclosure",
              "_blob": input_context.files[uploaded]
            }, 0);
          })
          .then(function () {
            uploaded += 1;
            info_context.innerHTML += "<li>" +
              input_context.files[uploaded - 1].name
              + "  uploaded " + uploaded + "/" + length + " </li>";
            if (uploaded === length) {
              return g.plEnablePage();
            }
            queue.push(post);
          })
          .fail(function (e) {
            uploaded += 1;
            console.log("error");
            return post();
          });
      }
      queue = new RSVP.Queue();
      queue.push(function () {
        return g.plEnablePage();
      })
        .push(function () {
          return promiseEventListener(input_context, "change", false);
        })
        .push(function () {
          return g.plDisablePage();
        })
        .push(function () {
          length = input_context.files.length;
          queue.push(post);
        });
      return queue;
    });
}(window, jIO, rJS));
