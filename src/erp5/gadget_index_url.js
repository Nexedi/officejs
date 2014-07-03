/*global rJS, RSVP, jQuery, URI, console */
/*jslint nomen: true */
(function (rJS, $, RSVP, URI) {
  "use strict";

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

  rJS(window)
    /////////////////////////////////////////////////////////////////
    // ready
    /////////////////////////////////////////////////////////////////
    // Configure jIO to use localstorage
    // And load configuration from server
    .ready(function (g) {
      return g.getDeclaredGadget("jio_gadget")
        .push(function (jio_gadget) {
          return jio_gadget.createJio({
            type: "erp5",
            url: "http://192.168.242.62:12002/erp5/web_site_module/hateoas"
          });
        });
    })

    /////////////////////////////////////////////////////////////////
    // handle acquisition
    /////////////////////////////////////////////////////////////////
    .declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash")
    // Bridge to jio gadget
    .allowPublicAcquisition("jio_allDocs", function (param_list) {
      return this.getDeclaredGadget("jio_gadget")
        .push(function (jio_gadget) {
          return jio_gadget.allDocs.apply(jio_gadget, param_list);
        });
    })
    .allowPublicAcquisition("jio_ajax", function (param_list) {
      return this.getDeclaredGadget("jio_gadget")
        .push(function (jio_gadget) {
          return jio_gadget.ajax.apply(jio_gadget, param_list);
        });
    })
    .allowPublicAcquisition("jio_post", function (param_list) {
      return this.getDeclaredGadget("jio_gadget")
        .push(function (jio_gadget) {
          return jio_gadget.post.apply(jio_gadget, param_list);
        });
    })
    .allowPublicAcquisition("jio_remove", function (param_list) {
      return this.getDeclaredGadget("jio_gadget")
        .push(function (jio_gadget) {
          return jio_gadget.remove.apply(jio_gadget, param_list);
        });
    })
    .allowPublicAcquisition("jio_get", function (param_list) {
      return this.getDeclaredGadget("jio_gadget")
        .push(function (jio_gadget) {
          return jio_gadget.get.apply(jio_gadget, param_list);
        });
    })
    .allowPublicAcquisition("jio_putAttachment", function (param_list) {
      return this.getDeclaredGadget("jio_gadget")
        .push(function (jio_gadget) {
          return jio_gadget.putAttachment.apply(jio_gadget, param_list);
        });
    })
    .allowPublicAcquisition("jio_getAttachment", function (param_list) {
      return this.getDeclaredGadget("jio_gadget")
        .push(function (jio_gadget) {
          return jio_gadget.getAttachment.apply(jio_gadget, param_list);
        });
    })

    .allowPublicAcquisition("whoWantToDisplayThis", function (param_list) {
      // Hey, I want to display some URL
      return this.aq_pleasePublishMyState({jio_key: param_list[0]});
    })

    /////////////////////////////////////////////////////////////////
    // declared methods
    /////////////////////////////////////////////////////////////////
    // Render the page
    .declareMethod('render', function (options) {
      var gadget = this;

//       $.mobile.loading('show');
      if (options.jio_key === undefined) {
        // Redirect to the default view
        return gadget.aq_pleasePublishMyState({jio_key: "person_module"})
          .push(gadget.pleaseRedirectMyHash.bind(gadget));
      }
      return gadget.getDeclaredGadget("jio_gadget")
        .push(function (jio_gadget) {
          var jio_key = options.jio_key,
            view = options.view || "view";
          ///////////////////////////////////////////////
          // Display erp5 document view
          ///////////////////////////////////////////////
          return jio_gadget.get({"_id": jio_key}, {"_view": view});
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
            gadget.getDeclaredGadget("jio_gadget")
              .push(function (jio_gadget) {
                return jio_gadget.get(
                  {"_id": uri.segment(2)},
                  {"_view": "view"}
                );
              })
          ]);
        })
        .push(function (result) {
          var sub_options = options.form_gadget || {};
          sub_options.erp5_document = result[0].data;
          sub_options.form_definition = result[1].data;

          return gadget.getDeclaredGadget("form_gadget")
            .push(function (form_gadget) {
              return form_gadget.render(sub_options);
            });
        })
        .push(function () {
          return gadget.getDeclaredGadget("form_gadget");
        })
        .push(function (form_gadget) {
          return form_gadget.getElement();
        })
//         .push(function (element) {
//           // XXX JQuery mobile
// //           $.mobile.loading('hide');
// //           return $(element).trigger("create");
//         })
        .push(undefined, function (error) {
          console.error(error);
          console.error(error.stack);
          $.mobile.loading('hide');
          throw error;
        });
    });

}(rJS, jQuery, RSVP, URI));
