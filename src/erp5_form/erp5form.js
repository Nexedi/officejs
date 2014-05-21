/*global window, rJS, RSVP, StatelessJS, alert, FormData, document, console */
/*jslint maxlen:80, nomen: true */
(function (rJS) {
  "use strict";

//   function loopEventListener(target, type, useCapture, callback) {
//     //////////////////////////
//     // Infinite event listener (promise is never resolved)
//     // eventListener is removed when promise is cancelled/rejected
//     //////////////////////////
//     var handle_event_callback,
//       callback_promise;
// 
//     function cancelResolver() {
//       if ((callback_promise !== undefined) &&
//           (typeof callback_promise.cancel === "function")) {
//         callback_promise.cancel();
//       }
//     }
// 
//     function canceller() {
//       if (handle_event_callback !== undefined) {
//         target.removeEventListener(type, handle_event_callback, useCapture);
//       }
//       cancelResolver();
//     }
//     function itsANonResolvableTrap(resolve, reject) {
// 
//       handle_event_callback = function (evt) {
//         evt.stopPropagation();
//         evt.preventDefault();
//         cancelResolver();
//         callback_promise = new RSVP.Queue()
//           .push(function () {
//             return callback(evt);
//           })
//           .push(undefined, function (error) {
//             if (!(error instanceof RSVP.CancellationError)) {
//               canceller();
//               reject(error);
//             }
//           });
//       };
// 
//       target.addEventListener(type, handle_event_callback, useCapture);
//     }
//     return new RSVP.Promise(itsANonResolvableTrap, canceller);
//   }

  function clearPreviousGadgetList(form_gadget, element) {
    // Drop the previous gadget fields
    form_gadget.private_gadget_list = [];
  }

  rJS(window)
    .ready(function (g) {
      g.private_gadget_list = [];
    })

    .ready(function (g) {
      return new RSVP.Queue()
        .push(function () {
          return g.getElement();
        })
        .push(function (element) {
          g.element = element;
        });
    })

    .declareMethod('render', function (options) {
      console.log(options.form_definition);
      var i,
        erp5_document = options.erp5_document,
        form_definition = options.form_definition,
        rendered_form = erp5_document._embedded._view,
        group,
        group_list = form_definition.group_list,
        j,
        tmp = "",
        field,
        final_element = document.createElement("div"),
        form_gadget = this,
        result_list = [],
        value_list = [];

//       form_gadget.clear();
      delete options.erp5_document;
      delete options.form_definition;

      options = options.form_gadget || {};
      form_gadget.state_parameter_dict = options;
      clearPreviousGadgetList(form_gadget,
        form_gadget.element.getElementsByTagName('form')[0]);

      for (i = 0; i < group_list.length; i += 1) {
        group = group_list[i][1];
        tmp += "<fieldset " +
          "class='" + group_list[i][0] + "'>";
        for (j = 0; j < group.length; j += 1) {
          if (rendered_form.hasOwnProperty(group[j][0])) {
            // Field is enabled in this context
            field = rendered_form[group[j][0]];
            value_list.push(field);
            tmp += "<div data-role='fieldcontain'><label for='" +
              field.key + "'>" + field.title + "</label></div>";
          }
        }
        tmp += "</fieldset>";
      }

      // XXX Do not attach at the beginning
//       form_gadget.element.getElementsByTagName('form')[0]
//         .appendChild(final_element);

      function generateSetStringFieldContent(i, gadget_url, scope) {
        return function (g) {
//           var label = final_element.getElementsByTagName("label")[i];
          form_gadget.private_gadget_list.push(g);

//           g.on("pleaseAllDocsXXX", function (evt) {
// //             alert("allDocsRequested 2!!!!");
//             console.log("allDocsRequested 2!!!!");
//             console.log(evt);
//             form_gadget.trigger(evt.type, evt);
//           });

// //           label.parentNode.insertBefore(g.element, label.nextSibling);
//           if (gadget_url === './listbox.html') {
//             return RSVP.Queue()
//               .push(function () {
//                 return g.registerUrlForMethod(form_gadget.urlFor);
//               })
//               .push(function () {
//                 return g.render(value_list[i]);
//               });
//           }
          g.id = i;
          var suboptions = options[scope] || {};
          suboptions.field_json = value_list[i];
          return g.render(suboptions);
        };
      }

      function declareGadget(gadget_url, element, scope) {
        return function () {
          if (gadget_url === './listbox.html') {
            // XXX TEST only iframe listbox
            return form_gadget.declareGadget(gadget_url, {
//               sandbox: 'iframe',
              scope: scope,
              element: element
            });
          }
          return form_gadget.declareGadget(gadget_url, {
            scope: scope,
            element: element
          });
        };
      }

      // rJS(this).element.getElementsByTagName('form')[0].innerHTML = tmp;
      final_element.innerHTML = tmp;

//       this.element.getElementsByTagName('form')[0].setAttribute(
//         'action',
//         form_json._actions.put.href
//       );
//       this.element.getElementsByTagName('form')[0].setAttribute(
//         'method',
//         form_json._actions.put.method
//       );

      for (i = 0; i < value_list.length; i += 1) {
        if ((value_list[i].type === 'ListField') ||
            (value_list[i].type === 'ParallelListField') ||
            (value_list[i].type === 'MultiListField')) {
          tmp = '../erp5_list_field/index.html';
        } else if (value_list[i].type === 'ListBox') {
          tmp = '../erp5_listbox/index.html';
        } else {
          tmp = '../erp5_string_field/index.html';
        }
        result_list.push(
          RSVP.Queue()
            .push(declareGadget(tmp,
                final_element.getElementsByTagName("label")[i].parentNode,
                value_list[i].key))
            .push(generateSetStringFieldContent(i, tmp, value_list[i].key))
        );
      }
      // XXX Put a submit button
//       result_list.push(function () {
      if (rendered_form._actions.put !== undefined) {
        result_list.push(RSVP.Queue()
          .push(function () {
            return form_gadget.declareGadget(
              '../erp5_button_field/index.html',
              {
//                 sandbox: 'iframe',
                element: final_element
              }
            );
          })
          .push(function (button_gadget) {
            form_gadget.private_gadget_list.push(button_gadget);
//             return final_element.insertBefore(
//               button_gadget.element,
//               final_element.firstChild
//             );
          })
          );
      }

      return RSVP.Queue()
        .push(function () {
          return RSVP.all(result_list);
        })
        .push(function () {
          var parent_element =
            form_gadget.element.getElementsByTagName('form')[0];
          while (parent_element.firstChild) {
            parent_element.removeChild(parent_element.firstChild);
          }
          parent_element.appendChild(final_element);

//           return form_gadget.listenFormSubmit();

//           return form_gadget.listen();
//         })
//         .push(undefined, function (error) {
//           console.error(error);
//           throw error;
        });
//     })
// 
//     .declareListener('listenFormSubmit', function () {
//       var form_gadget = this;
// 
//       function formSubmit() {
//         var k,
//           field_gadget,
//           count = form_gadget.private_gadget_list.length,
//           // data = new FormData(),
//           data = {"_id": "XXX"},
//           queue = new RSVP.Queue();
// 
//         function extendData(field_data) {
//           var key;
//           for (key in field_data) {
//             if (field_data.hasOwnProperty(key)) {
//               data[key] = field_data[key];
//             }
//           }
//         }
// 
//         function postForm() {
//           return form_gadget.trigger("XXX", data);
// //           return jio_storage.put(data, {"_view": "XXX"});
//         }
// 
// 
// //           return jio_storage.put(
// //             form_gadget.element.getElementsByTagName('form')[0].action,
// //             form_gadget.element.getElementsByTagName('form')[0].method,
// //             {'data': data}
// //           );
// //         }
// 
// //         function handleResponse(response) {
// //           if (response.status === 201) {
// //             // XXX
// //             // window.couscous_app.redirect(
// //             window.location.href =
// //               window.couscous_app.url_for(
// //                 "erp5_doc",
// //                 "GET",
// //                 {url: response.getResponseHeader('Location')}
// //               );
// //     //         );
// //           }
// //         }
// 
//         for (k = 0; k < count; k += 1) {
//           field_gadget = form_gadget.private_gadget_list[k];
//           // XXX Hack until better defined
//           if (field_gadget.getContent !== undefined) {
//             queue
//               .push(field_gadget.getContent.bind(field_gadget))
//               .push(extendData);
//           }
//         }
//         return queue.push(postForm);
// //         return queue.push(postForm).push(handleResponse);
//       }
// 
//       // XXX Listen to form submit
//       return loopEventListener(
//         form_gadget.element.getElementsByTagName('form')[0],
//         'submit',
//         false,
//         formSubmit
//       );

    });


}(rJS));
