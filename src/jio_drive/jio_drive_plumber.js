/*global console, rJS, RSVP */
/*jslint nomen: true */
(function (window, rJS, RSVP) {
  "use strict";

  function loopEventListener(target, type, useCapture, callback) {
    //////////////////////////
    // Infinite event listener (promise is never resolved)
    // eventListener is removed when promise is cancelled/rejected
    //////////////////////////
    var handle_event_callback,
      callback_promise;

    function cancelResolver() {
      if ((callback_promise !== undefined) &&
          (typeof callback_promise.cancel === "function")) {
        callback_promise.cancel();
      }
    }

    function canceller() {
      if (handle_event_callback !== undefined) {
        target.removeEventListener(type, handle_event_callback, useCapture);
      }
      cancelResolver();
    }
    function itsANonResolvableTrap(resolve, reject) {

      handle_event_callback = function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        cancelResolver();
        callback_promise = new RSVP.Queue()
          .push(function () {
            return callback(evt);
          })
          .push(undefined, function (error) {
            if (!(error instanceof RSVP.CancellationError)) {
              canceller();
              reject(error);
            }
          });
      };

      target.addEventListener(type, handle_event_callback, useCapture);
    }
    return new RSVP.Promise(itsANonResolvableTrap, canceller);
  }

  rJS(window)
    // Assign the element to a variable
    .ready(function (g) {
      return g.getElement()
        .push(function (element) {
          g.element = element;
        });
    })

    .declareAcquiredMethod("aq_get", "jio_get")
    .declareAcquiredMethod("aq_getAttachment", "jio_getAttachment")
    .declareAcquiredMethod("aq_putAttachment", "jio_putAttachment")

    .declareMethod("render", function (options) {
      var gadget = this,
        editor_gadget,
        doc;

      return gadget.aq_get({"_id": options.id})
        .push(function (result) {
          var element = gadget.element.querySelector("div");
          doc = result.data;

          gadget.element.querySelector("h2").textContent = doc.title || "";
          // XXX Non stateless
          element.innerHTML = "";
          if (doc.type === "WebPage") {
            return gadget.declareGadget("../editor_jqte/index.html", {
              element: element,
              scope: "editor"
            });
          }
          if (doc.type === "Spreadsheet") {
            return gadget.declareGadget("../jquery_sheet/index.html", {
              element: element,
              scope: "editor"
//               sandbox: "iframe"
            });
          }
          throw new Error("Can not display " + JSON.stringify(result.data));
        })

        .push(function (new_gadget) {
          editor_gadget = new_gadget;
          return gadget.aq_getAttachment({
            "_id": doc._id,
            "_attachment": "body"
          });
        })

        .push(function (attachment) {
          console.log(attachment);
          return editor_gadget.setContent(attachment);
        }, function (error) {
          if ((error.status === 404) && (error.method === "getAttachment")) {
            return;
          }
          throw error;
        })

        .push(function () {

          function formSubmit() {
            return editor_gadget.getContent()
              .then(function (value) {
                return gadget.aq_putAttachment({
                  "_id": doc._id,
                  "_attachment": "body",
                  "_data": value,
                  "_mime_type": doc.format
                });
              });
          }

          return loopEventListener(
            gadget.element.querySelector("form"),
            'submit',
            false,
            formSubmit
          );
        });
    });
}(window, rJS, RSVP));
