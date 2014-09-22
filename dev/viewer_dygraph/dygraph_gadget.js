/*global console, Dygraph, rJS */
/*jslint nomen: true */
(function (window, rJS, Dygraph) {
  "use strict";
  rJS(window)
    .declareMethod('render', function (data) {
      console.log(this.__element);
      return new Dygraph(
        this.__element,
        data,
        {
          roolPeriod: 7,
          errorBars: true
        }
      );
    });
}(window, rJS, Dygraph));
