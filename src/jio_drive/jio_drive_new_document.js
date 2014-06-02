/*global console, rJS, RSVP */
(function (window, rJS, RSVP) {
  "use strict";

  function promiseEventListener(target, type, useCapture) {
    //////////////////////////
    // Resolve the promise as soon as the event is triggered
    // eventListener is removed when promise is cancelled/resolved/rejected
    //////////////////////////
    var handle_event_callback;

    function canceller() {
      target.removeEventListener(type, handle_event_callback, useCapture);
    }

    function resolver(resolve) {
      handle_event_callback = function (evt) {
        canceller();
        evt.stopPropagation();
        evt.preventDefault();
        resolve(evt);
        return false;
      };

      target.addEventListener(type, handle_event_callback, useCapture);
    }
    return new RSVP.Promise(resolver, canceller);
  }

  rJS(window)
    .declareAcquiredMethod("aq_post", "jio_post")
    .declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash")
    .declareAcquiredMethod("whoWantToDisplayThisDocument",
                           "whoWantToDisplayThisDocument")
    .declareMethod("render", function (options) {
      var gadget = this,
        filename;

      return this.getElement()
        .push(function (element) {
          var input = element.getElementsByClassName("filename_input")[0];
          input.focus();
          input.select();

          return promiseEventListener(
            element.getElementsByClassName("new_web_page_form")[0],
            'submit',
            false
          );
        })
        .push(function (evt) {
          filename = evt.target[0].value;
          var now = new Date();
          return gadget.aq_post({
            title: filename,
//             type: "Spreadsheet",
//             format: "application/json",
            type: "WebPage",
            format: "text/html",
            date: now.getFullYear() + "-" + (now.getMonth() + 1) + "-" +
              now.getDate()
          });
        })
        .push(function (result) {
          return gadget.whoWantToDisplayThisDocument(result.id);
        })
        .push(function (url) {
          return gadget.pleaseRedirectMyHash(url);
        });
//         .push(undefined, function (error) {
//           if (error.status === 404) {
//           }
//           console.error(error);
//           throw error;
// //           // Unexpected success! File is already there.
// //           return gadget.aq_get(filename);
//         });



    });

}(window, rJS, RSVP));
