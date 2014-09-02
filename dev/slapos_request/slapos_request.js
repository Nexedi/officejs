/*jslint nomen: true*/
/*global rJS */
(function (window, document, rJS) {
  "use strict";

  var gk = rJS(window);
  var gadget_path_list = {
        connection: "../slapos_parameter/index.html"
  };
  
  gk.ready(function (g) {
    
    g.declareGadget(gadget_path_list.connection, {})
    .push(function(gadget) {
      return gadget.getCouscou();
    })
    .push(function (element) {
      g.__element.querySelector("div#main").innerHTML = element.innerHTML;
    });
  });

}(window, document, rJS));
