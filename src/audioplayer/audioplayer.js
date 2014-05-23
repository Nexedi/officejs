/*global window, rJS, RSVP, console */
/*jslint nomen: true*/
(function (window, rJS) {
  "use strict";

  rJS(window).ready(function (g) {
    // First, load the progress gadget
    var input_context = g.__element.getElementsByTagName('input')[0];
    g.declareGadget(
      '../audioplayer_control/index.html'
    )
      .then(function (control) {
        input_context.onchange = function () {
          control.setSong(input_context.files[0]);
          control.playSong();
        };
      })
      .fail(function (e) {
        console.log("[ERROR]: " + e);
      });
  });
}(window, rJS));
