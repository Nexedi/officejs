/*global rJS, RSVP */
(function (rJS, RSVP) {
  "use strict";

  var ERP5_GADGET = "../erp5/index.html";

  function keepReferenceToTheGadgetElement(gadget) {
    // Keep reference to the gadget element
    return new RSVP.Queue()
      .push(function () {
        return gadget.getElement();
      })
      .push(function (element) {
        gadget.element = element;
      });
  }

  function getCachedGadgetOrLoad(gadget, scope) {
    return gadget.getDeclaredGadget(scope)
      .fail(function () {
        return gadget.declareGadget(ERP5_GADGET, {
          scope: scope,
          element: gadget.element,
          sandbox: "iframe"
        });
      });
  }

  rJS(window)
    .ready(keepReferenceToTheGadgetElement)
    .ready(function (g) {
      g.render();
    })

    .declareMethod('render', function (options) {
      // Display 2 erp5 gadget side by side
      var gadget = this;
      return RSVP.Queue()
        .push(function () {
          return RSVP.all([
            getCachedGadgetOrLoad(gadget, "erp5_1"),
            getCachedGadgetOrLoad(gadget, "erp5_2")
//             getCachedGadgetOrLoad(gadget, "erp5_3")
          ]);
        })
        .push(function (gadget_list) {
          gadget.state_parameter_dict = options;
          return RSVP.all([
            gadget_list[0].render(options.erp5_1 || {}),
            gadget_list[1].render(options.erp5_2 || {})
//             gadget_list[2].render(options.erp5_3 || {})
          ]);
        });
    });
}(rJS, RSVP));
