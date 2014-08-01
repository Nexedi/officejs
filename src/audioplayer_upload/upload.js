/*global window, rJS, RSVP, jIO, JSON, promiseEventListener, console,
 Math */
/*jslint nomen: true*/
(function (window, jIO, rJS) {
  "use strict";
  var gk = rJS(window);

  function exit(g) {
    return RSVP.Queue()
      .push(function () {
        return g.plEnablePage();
      })
      .push(function () {
        return g.displayThisPage({page: "playlist"});
      })
      .push(function (url) {
        window.location = url;
      });
  }
  gk.declareAcquiredMethod("jio_post", "jio_post")
    .declareAcquiredMethod("jio_putAttachment", "jio_putAttachment")
    .declareAcquiredMethod("jio_remove", "jio_remove")
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
        post,
        length;
      info_context.innerHTML = "<ul>";
      post = function () {
        var now = new Date(),
          id;
        if (uploaded === length) {
          return;
        }
        return g.jio_post({ "title" : input_context.files[uploaded].name,
                            "type" : input_context.files[uploaded].type,
                            "format" : input_context.files[uploaded].type,
                            "size" : input_context.files[uploaded].size,
                            "modified" : now.toUTCString(),
                            "date" : now.getFullYear() + "-" +
                            (now.getMonth() + 1) + "-" + now.getDate()
                          }, 0)
          .then(function (res) {
            id = res.id;
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
              + "  " + uploaded + "/" + length + "</li>";
            if (uploaded === length) {
              return exit(g);
            }
            queue.push(post);
          })
          .fail(function (error) {
            if (!(error instanceof RSVP.CancellationError)) {
              info_context.innerHTML +=
                input_context.files[uploaded].name + " " +
                  error.target.error.name;
              //xxx
              g.plEnablePage();
              return g.jio_remove({"_id" : id});
            }
            document.getElementsByTagName('body')[0].textContent =
              JSON.stringify(error);
          });
      };

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
