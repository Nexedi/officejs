/*global console, jQuery, rJS, RSVP, alert */
/*jslint nomen: true*/
(function (window, rJS, $) {
  "use strict";
  var gadget,
    top;
  rJS(window)
    .allowPublicAcquisition("ErrorPage", function () {
      top.__element.innerHTML = "ERROR";
      top.error = true;
    })
    .allowPublicAcquisition("showPage", function (param_list) {
      return this.aq_pleasePublishMyState({page: param_list[0]});
    })
    .ready(function (g) {
      top = g;
      top.error = false;
      top.declareGadget("./audioplayer.html",
                        { element: top.__element,
                          scope : "audioplayer"
                        }
                       )
        .then(function (result) {
          gadget = result;
        });
    })
    .declareMethod("render", function (options) {
      if (top.error === true) {
        top.__element.innerHTML = " ";
        top.dropGadget("audioplayer").then(function (e) {
          console.log(e);
          top.declareGadget("./audioplayer.html",
                            { element: top.__element,
                              scope : "audioplayer"}
                           )
            .then(function (result) {
              gadget = result;
              result.render(options);
            });
        });
        top.error = false;
      } else {
        if (gadget !== undefined) {
          gadget.render(options);
        }
      }
    });
}(window, rJS, jQuery));
