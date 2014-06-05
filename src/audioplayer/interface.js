/*global window, rJS, RSVP*/
/*jslint nomen: true*/
(function (window, rJS) {
  "use strict";
  var gadget,
    top,
    error;
  rJS(window)
    .allowPublicAcquisition("ErrorPage", function () {
      error.display();
      gadget.noDisplay();
      top.newPage = true;
    })
    .allowPublicAcquisition("addPage", function () {
      gadget.noDisplay("addPage");
      top.newPage = true;
    })
    .allowPublicAcquisition("showPage", function (param_list) {
      return this.aq_pleasePublishMyState({page: param_list[0]});
    })
    .ready(function (g) {
      top = g;
      top.newPage = false;
      top.addPage = false;
      RSVP.all([
        g.getDeclaredGadget(
          "audioplayer"
        ),
        g.getDeclaredGadget(
          "error"
        )
      ])
        .then(function (all_param) {
          gadget = all_param[0];
          error = all_param[1];
          error.noDisplay();
        });
    })
    .declareMethod("render", function (options) {
      if (top.newPage === true) {
        top.newPage = false;
        error.noDisplay();
        gadget.display();
        return;
      }
      if (gadget !== undefined) {
        gadget.render(options);
      }
    });
}(window, rJS));
