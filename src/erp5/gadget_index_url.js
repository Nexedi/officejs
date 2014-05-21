/*global rJS, RSVP, jQuery, URI, console */
/*jslint nomen: true */
(function (rJS, $, RSVP, URI) {
  "use strict";

  /////////////////////////////////////////////////////////////////
  // Custom Stop Error
  /////////////////////////////////////////////////////////////////
  function StopRenderingError(message) {
    this.name = "StopRenderingError";
    if ((message !== undefined) && (typeof message !== "string")) {
      throw new TypeError('You must pass a string.');
    }
    this.message = message || "StopRendering failed";
  }
  StopRenderingError.prototype = new Error();
  StopRenderingError.prototype.constructor =
    StopRenderingError;

  /////////////////////////////////////////////////////////////////
  // Desactivate jQuery Mobile URL management
  /////////////////////////////////////////////////////////////////
  $.mobile.ajaxEnabled = false;
  $.mobile.linkBindingEnabled = false;
  $.mobile.hashListeningEnabled = false;
  $.mobile.pushStateEnabled = false;

  /////////////////////////////////////////////////////////////////
  // Gadget behaviour
  /////////////////////////////////////////////////////////////////

  function getCachedGadgetOrLoad(gadget, url, scope, element) {
    return gadget.getDeclaredGadget(scope)
      .fail(function () {
        return gadget.declareGadget(url, {
          scope: scope,
          element: element
        });
      });
  }

  var JIO_GADGET = "../jio_bridge/index.html",
    FORM_GADGET = "../erp5_form/index.html";

  rJS(window)
    .ready(function (g) {
      g.render();
    })
    .declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash")

    .declareMethod('render', function (options) {
      var gadget = this;
      gadget.state_parameter_dict = options;
      return RSVP.Queue()
        .push(function () {
          return RSVP.all([
            getCachedGadgetOrLoad(gadget, JIO_GADGET, "jio_gadget"),
            getCachedGadgetOrLoad(gadget, FORM_GADGET, "form_gadget",
                                  document.getElementById('mainarticle'))
          ]);
        })
        .push(function (gadget_list) {
          gadget.sub_gadget_dict = {
            jio_gadget: gadget_list[0],
            form_gadget: gadget_list[1]
          };
          if (options.jio_key === undefined) {
            // 
//           ///////////////////////////////////////////////
//           // Default view
//           ///////////////////////////////////////////////
//           return gadget.sub_gadget_dict.jio_gadget.allDocs(
//             {"query": '__root__'}
//           );
//         })
//         .push(function (result) {
//           console.log("tructruc");
//           // return the default jio_key
//           // return result.data.rows[0].id;
//           // return "person_module";
//           return "computer_module/20130611-5BFC";
//         })
//         .push(function (jio_key) {
//
//             jio_key_hash = "jio_key=" +
// //               encodeURIComponent("computer_module/20130611-5BFC");
//               encodeURIComponent("person_module");

            // XXX TODO try no to wrap into anonymous function
            return new RSVP.Queue()
              .push(function () {
                return gadget.aq_pleasePublishMyState(
                  {jio_key: "person_module"}
                );
              })
              .push(function (lala) {
                return gadget.pleaseRedirectMyHash(lala);
              })
              .push(function () {
                throw new StopRenderingError("No need to do more");
              });
          }
        })
        .push(function () {
          var jio_key = options.jio_key,
            view = options.view || "view";
          ///////////////////////////////////////////////
          // Display erp5 document view
          ///////////////////////////////////////////////
          return gadget.sub_gadget_dict.jio_gadget.get(
            {"_id": jio_key},
            {"_view": view}
          );
        })
        .push(function (result) {
          var uri = new URI(
            result.data._embedded._view._links.form_definition.href
          );
//           if ((uri.scheme() === "urn") &&
//               (uri.segment(0) === "jio") &&
//               (uri.segment(1) === "get")) {
//           }
          return RSVP.all([
            result,
            // XXX
            gadget.sub_gadget_dict.jio_gadget.get(
              {"_id": uri.segment(2)},
              {"_view": "view"}
            )
          ]);
        })
        .push(function (result) {
          var sub_options = options.form_gadget || {};
          sub_options.erp5_document = result[0].data;
          sub_options.form_definition = result[1].data;

          return gadget.sub_gadget_dict.form_gadget.render(sub_options);
        })
        .push(function () {
          // XXX JQuery mobile
          $(gadget.sub_gadget_dict.form_gadget.element).trigger('create');
        })
        .push(undefined, function (error) {
          if (error instanceof StopRenderingError) {
            return;
          }
          throw error;
        });
    })

    .allowPublicAcquisition("pleaseAllDocsXXX", function (param_list) {
      return this.sub_gadget_dict.jio_gadget.allDocs.apply(
        this.sub_gadget_dict.jio_gadget,
        param_list
      );
    })

    .allowPublicAcquisition("whoWantToDisplayThis", function (param_list) {
      // Hey, I want to display some URL
      return this.aq_pleasePublishMyState({jio_key: param_list[0]});
    });

}(rJS, jQuery, RSVP, URI));
