/*global console, jQuery, rJS, RSVP, alert */
(function (window, $, rJS, RSVP) {
  "use strict";

  /////////////////////////////////////////////////////////////////
  // Desactivate jQuery Mobile URL management
  /////////////////////////////////////////////////////////////////
  $.mobile.ajaxEnabled = false;
  $.mobile.linkBindingEnabled = false;
  $.mobile.hashListeningEnabled = false;
  $.mobile.pushStateEnabled = false;

//   function attachIOToEditor(all_param) {
//     var editor = all_param[0],
//       io = all_param[1],
//       id = all_param[2];
//     $(io.__element).trigger('create');
//     $(editor.__element).trigger('create');
// //       .then(function (element) {
// //         element.trigger('create');
// //       });
// //     io.getElement()
// //       .then(function (element) {
// //         element.trigger('create');
// //       });
//
//     return io.configureIO(id)
//       .then(function () {
//         return io.configureDataSourceCallback(editor, editor.getContent);
//       })
//       .then(function () {
//         return io.getIO().fail(function (error) {
//           if (error.status === 404) {
//             return "";
//           }
//           throw error;
//         });
//       })
//       .then(function (value) {
//         return editor.setContent(value);
//       });
//   }
//
//   function handleError(rejectedReason) {
//     var word_list;
//     console.warn(rejectedReason);
//     if (rejectedReason instanceof Error) {
//       word_list = rejectedReason.toString();
//     } else {
//       word_list = JSON.stringify(rejectedReason);
//     }
//     // XXX Escape text
//     document.getElementsByTagName('body')[0].innerHTML = word_list;
//     throw rejectedReason;
//   }
//
//   function createLoadNewEditorCallback(g, editor_path, e_c, io_path, i_c) {
//     return function () {
//       e_c.empty();
//       return RSVP.all([
//         g.declareGadget(editor_path, {element: e_c[0], sandbox: 'iframe'}),
//         g.declareGadget(io_path),
//         "officejs"
//       ])
//         .then(function (all_param) {
//           console.log(all_param);
//           i_c.empty();
//           i_c[0].appendChild(all_param[1].__element);
//           return attachIOToEditor(all_param);
//         })
//         .fail(handleError);
//     };
//   }
//
//   rJS(window).ready(function (g) {
//     var editor_a_context = $(g.__element).find(".editor_a").last(),
//       io_a_context = $(g.__element).find(".editor_a_safe").last();
// //       editor_b_context = g.context.find(".editor_b").last(),
// //       io_b_context = g.context.find(".editor_b_safe").last();
//
//     // First, load the catalog gadget
//     g.getDeclaredGadget('catalog')
//       .then(function (catalog) {
//         // Fetch the list of editor and io gadgets
//         // This is done in 2 different queries to the catalog
//         return RSVP.all([
//           catalog.allDocs(
//             {query: 'interface: "http://www.renderjs.org/interface/editor"'}
//           ),
//           catalog.allDocs(
//             {query: 'interface: "http://www.renderjs.org/interface/io"'}
//           )
//         ]);
//       })
//       .then(function (all_list) {
//         var panel_context = $(g.__element).find(".bare_panel"),
//           editor_list = all_list[0],
//           io_list = all_list[1],
//           editor_definition,
//           i;
//
//         // Load 1 editor and 1 IO and plug them
//         editor_a_context.empty();
//         console.log(editor_list[0].path);
//         console.log(io_list[0].path);
//         return RSVP.all([
//           g.declareGadget(
//             editor_list[0].path,
//             {element: editor_a_context[0], sandbox: 'iframe'}
//           ),
//           g.declareGadget(
//             io_list[0].path,
//             {element: io_a_context[0]}
//           ),// io_a_context),
//           "officejs"
//         ])
//           .then(function (all_param) {
//             console.log(all_param[0]);
//             console.log(all_param[1]);
// //             io_a_context.empty();
// //             io_a_context[0].appendChild(all_param[1].__element);
//             return attachIOToEditor(all_param);
//           })
//           .then(function () {
//             // Fill the panel
//             for (i = 0; i < editor_list.length; i += 1) {
//               editor_definition = editor_list[i];
//               panel_context.append(
//                 '<a href="#" data-role="button" data-icon="edit" ' +
//                   'data-iconpos="left">' + editor_definition.title + '</a>'
//               );
// //               $(editor_definition.element).click(
//               panel_context.find('a').last().click(
//                 createLoadNewEditorCallback(g, editor_definition.path,
//                   editor_a_context, io_list[0].path, io_a_context)
//               );
//               // XXX Handle links
// //               panel_context.find('a').last().click(function () {
// //                 $.when(
// //                   g.declareGadget(editor_definition.path,
// //                                          editor_a_context),
// //                   g.declareGadget(io_list[0].path, io_a_context),
// //                   "officejs"
// //                 ).done(attachIOToEditor);
// //               });
//             }
//             panel_context.trigger('create');
//           });
//
//
//       })
//
//       .fail(handleError);
// //     $.when(
// //       g.declareGadget('./jqteditor.html', editor_a_context),
// //       g.declareGadget('./io.html', io_a_context),
// //       "officejs_a").done(attachIOToEditor);
//
// //     $.when(
// //       g.declareGadget('./editor.html', editor_b_context),
// //       g.declareGadget('./io.html', io_b_context),
// //       "officejs_b").done(attachIOToEditor);


  rJS(window)

    // Assign the element to a variable
    .ready(function (g) {
      return g.getElement()
        .push(function (element) {
          g.element = element;
        });
    })

    // Configure jIO to use indexedDB
    .ready(function (g) {
      return g.getDeclaredGadget("jio")
        .push(function (jio_gadget) {
          return jio_gadget.createJio({
//             "type": "indexeddb",
//             "database": "jio_drive"
            "type": "local",
            "username": "default",
            "application_name": "jio_drive"
          });
        });
    })

    // Create some link on the page
    .ready(function (g) {
      return RSVP.Queue()
        .push(function () {
          return RSVP.all([
            g.aq_pleasePublishMyState({}),
            g.aq_pleasePublishMyState({page: "about"})
          ]);
        })
        .push(function (link_list) {
          g.element.getElementsByClassName("home_link")[0].href =
            link_list[0];
          g.element.getElementsByClassName("about_link")[0].href =
            link_list[1];
        });
    })

    // Bridge to jio gadget
    .allowPublicAcquisition("allDocs", function (param_list) {
      return this.getDeclaredGadget("jio")
        .push(function (jio_gadget) {
          return jio_gadget.allDocs.apply(jio_gadget, param_list);
        });
    })
    .allowPublicAcquisition("jio_get", function (param_list) {
      return this.getDeclaredGadget("jio")
        .push(function (jio_gadget) {
          return jio_gadget.get.apply(jio_gadget, param_list);
        });
    })
    .allowPublicAcquisition("jio_getAttachment", function (param_list) {
      return this.getDeclaredGadget("jio")
        .push(function (jio_gadget) {
          return jio_gadget.getAttachment.apply(jio_gadget, param_list);
        });
    })
    .allowPublicAcquisition("jio_putAttachment", function (param_list) {
      return this.getDeclaredGadget("jio")
        .push(function (jio_gadget) {
          return jio_gadget.putAttachment.apply(jio_gadget, param_list);
        });
    })
    .allowPublicAcquisition("jio_post", function (param_list) {
      return this.getDeclaredGadget("jio")
        .push(function (jio_gadget) {
          return jio_gadget.post.apply(jio_gadget, param_list);
        });
    })

    .allowPublicAcquisition("whoWantToDisplayThisPage", function (param_list) {
      // Hey, I want to display some URL
      return this.aq_pleasePublishMyState({page: param_list[0]});
    })

    .allowPublicAcquisition("whoWantToDisplayThisDocument",
                            function (param_list) {
        // Hey, I want to display some jIO document
        return this.aq_pleasePublishMyState({
          page: "plumb",
          id: param_list[0]
        });
      })

    // Render the page
    .declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash")
    .declareMethod("render", function (options) {
      console.log(options);
      var gadget = this,
        element = gadget.element.getElementsByClassName("gadget_container")[0];
      if (options.page === undefined) {
        // Redirect to the about page
        return gadget.aq_pleasePublishMyState({page: "list"})
          .push(gadget.pleaseRedirectMyHash.bind(gadget));
      }
      // Clear the previous rendering
      element.innerHTML = "";
      return gadget.declareGadget(options.page + ".html", {
        element: element
      }).push(function (g) {
        if (g.render !== undefined) {
          return g.render(options);
        }
      });
    });
}(window, jQuery, rJS, RSVP));
