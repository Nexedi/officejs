/*global console, Dygraph, NoisyData, rJS */
/*jslint nomen: true */
(function (window, rJS, Dygraph, NoisyData) {
  "use strict";
  rJS(window)
    .ready(function (g) {
      g.render();
    })

    .declareMethod('render', function (data) {
      return new Dygraph(
        this.__element,
        data || NoisyData,
        {
          roolPeriod: 7,
          errorBars: true
        }
      );
    });
}(window, rJS, Dygraph, NoisyData));
