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
      function putAll(id, index, file) {
        var blobLength = 4000000,
          size = blobLength * (index + 1),
          blob;
        if (size > file.size) {
          blob = file.slice(blobLength * index, file.size);
        } else {
          blob = file.slice(blobLength * index, size);
        }
        return g.jio_putAttachment({
          "_id" : id,
          "_attachment" : "enclosure" + index,
          "_blob": blob
        }, 0)
          .then(function () {
            var progress = Math.floor((size / file.size) * 100);
            if (progress > 100) {
              progress = 100;
            }
            progress += "%";
            info_context.innerHTML += "<li>" + file.name
              + "  " + progress + "</li>";
            if (size < file.size) {
              return putAll(id, index + 1, file);
            }
            uploaded += 1;
            if (uploaded === length) {
              return exit(g);
            }
            queue.push(post);
          });
      }
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
            var tmp = uploaded + 1;
            id = res.id;
            info_context.innerHTML += "<li>" +
              input_context.files[uploaded].name + " " +
              tmp + "/" + length;
            return putAll(id, 0, input_context.files[uploaded]);
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
