/*global console, jQuery, rJS, RSVP, alert */
/*jslint nomen: true*/
(function (window, rJS, $) {
  "use strict";
  var gadget,
    top,
    innerHTML;
  rJS(window)
    .allowPublicAcquisition("ErrorPage", function () {
      top.__element.innerHTML = "ERROR:music does't exist";
      top.dropGadget("audioplayer");
      top.newPage = true;
    })
    .allowPublicAcquisition("addPage", function () {
      innerHTML = top.__element.innerHTML;
      top.__element.innerHTML = " ";
      top.declareGadget("../audioplayer_io/index.html",
                        { element: top.__element,
                          scope : "io"
                        }
                       );
      top.newPage = true;
      top.addPage = true;
    })
    .allowPublicAcquisition("showPage", function (param_list) {
      return this.aq_pleasePublishMyState({page: param_list[0]});
    })
    .ready(function (g) {
      top = g;
      top.newPage = false;
      top.addPage = false;
      top.declareGadget("./audioplayer.html",
                        {element: top.__element}
                       )
        .then(function (result) {
          gadget = result;
        });
    })
    .declareMethod("render", function (options) {
      if (top.newPage === true) {
        if (top.addPage === true) {
          top.addPage = false;
          top.dropGadget("io");
        }
        top.__element.innerHTML = innerHTML;
        top.newPage = false;
      } else {
        if (gadget !== undefined) {
          gadget.render(options);
        }
      }
    });
}(window, rJS, jQuery));
