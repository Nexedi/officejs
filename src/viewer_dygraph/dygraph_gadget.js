/*global console, Dygraph, NoisyData, rJS */
/*jslint nomen: true */
(function (window, rJS, Dygraph, NoisyData) {
  "use strict";
  rJS(window)
    .ready(function (g) {
      g.render();
    })

    .declareMethod('render', function (data) {
      var gadget = this,
        graph = new Dygraph(
          data || NoisyData,
          {
            roolPeriod: 7,
            errorBars: true
          }
        );
      return graph;

    });
}(window, rJS, Dygraph, NoisyData));
