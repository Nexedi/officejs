/*global window, rJS, RSVP, jIO, JSON, promiseEventListener */
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
      this.__element.getElementsByClassName('info')[0]
        .innerHTML = "";
      return this.displayThisTitle("upload");
    })
    .declareMethod("startService", function () {
      var g = this,
        input_context =
          g.__element.getElementsByTagName('input')[0],
        info_context =
          g.__element.getElementsByClassName('info')[0],
        i,
        queue,
        uploaded = 0,
        length;



      function post(index) {
        var now = new Date();
        return g.jio_post({"title" : input_context.files[index].name,
                           "type" : "file",
                           "format" :  input_context.files[index].type,
                           "size" : input_context.files[index].size,
                           "modified" : now.toUTCString(),
                           "date" : now.getFullYear() + "-" +
                           (now.getMonth() + 1) + "-" + now.getDate()
                          })
          .push(function (res) {
            return g.jio_putAttachment({
              "_id" : res.id,
              "_attachment" : "enclosure",
              "_blob": input_context.files[index]
            });
          })
          .push(function () {
            uploaded += 1;
            info_context.innerHTML += "<li>" + input_context.files[index].name
              + "  uploaded " + uploaded + "/" + length + " </li>";
            if (uploaded === length) {
              return g.plEnablePage();
            }
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
          for (i = 0; i < length; i += 1) {
            queue.push(post(i));
          }
        });
      return queue;
    });
}(window, jIO, rJS));
