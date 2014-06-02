/*global console, rJS, RSVP, Handlebars */
/*jslint nomen: true */
(function (window, rJS, RSVP, Handlebars) {
  "use strict";

  // Precompile the templates while loading the first gadget instance
  var gadget_klass = rJS(window),
    source = gadget_klass.__template_element
                         .getElementById("table-template")
                         .innerHTML,
    table_template = Handlebars.compile(source);

  gadget_klass
    // Assign the element to a variable
    .ready(function (g) {
      return g.getElement()
        .push(function (element) {
          g.element = element;
        });
    })

    .declareAcquiredMethod("aq_allDocs", "allDocs")
    .declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash")
    .declareAcquiredMethod("whoWantToDisplayThisPage",
                           "whoWantToDisplayThisPage")
    .declareAcquiredMethod("whoWantToDisplayThisDocument",
                           "whoWantToDisplayThisDocument")
    .declareMethod("render", function (options) {
      var gadget = this;
      return gadget.aq_allDocs({"select_list": ["title"]})
        .push(function (document_list) {
          var result_list = [gadget.whoWantToDisplayThisPage("new")],
            doc,
            i;
          for (i = 0; i < document_list.data.total_rows; i += 1) {
            doc = document_list.data.rows[i];
            result_list.push(RSVP.all([
              gadget.whoWantToDisplayThisDocument(doc.id),
              doc.value.title
            ]));
          }
          return RSVP.all(result_list);
        })
        .push(function (document_list) {
          // Create new doc if nothing exists
          if (document_list.length === 1) {
            return gadget.pleaseRedirectMyHash(document_list[0]);
          }

          var i,
            parameter_list = [],
            doc;
          for (i = 1; i < document_list.length; i += 1) {
            doc = document_list[i];
            parameter_list[i - 1] = {
              link: doc[0],
              title: doc[1]
            };
          }

          gadget.element.querySelector('a').href = document_list[0];

          gadget.element.querySelector('.document_list').innerHTML =
            table_template({
              documentlist: parameter_list
            });
        });
    });
}(window, rJS, RSVP, Handlebars));
