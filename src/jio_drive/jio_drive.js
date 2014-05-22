/*global console, jQuery, rJS, RSVP */
/*jslint nomen: true*/
(function (window, $, rJS, RSVP) {
  "use strict";

  function attachIOToEditor(all_param) {
    var editor = all_param[0],
      io = all_param[1],
      id = all_param[2];
    $(io.__element).trigger('create');
    $(editor.__element).trigger('create');
//       .then(function (element) {
//         element.trigger('create');
//       });
//     io.getElement()
//       .then(function (element) {
//         element.trigger('create');
//       });

    return io.configureIO(id)
      .then(function () {
        return io.configureDataSourceCallback(editor, editor.getContent);
      })
      .then(function () {
        return io.getIO().fail(function (error) {
          if (error.status === 404) {
            return "";
          }
          throw error;
        });
      })
      .then(function (value) {
        return editor.setContent(value);
      });
  }

  function handleError(rejectedReason) {
    var word_list;
    console.warn(rejectedReason);
    if (rejectedReason instanceof Error) {
      word_list = rejectedReason.toString();
    } else {
      word_list = JSON.stringify(rejectedReason);
    }
    // XXX Escape text
    document.getElementsByTagName('body')[0].innerHTML = word_list;
    throw rejectedReason;
  }

  function createLoadNewEditorCallback(g, editor_path, e_c, io_path, i_c) {
    return function () {
      e_c.empty();
      return RSVP.all([
        g.declareGadget(editor_path, {element: e_c[0], sandbox: 'iframe'}),
        g.declareGadget(io_path),
        "officejs"
      ])
        .then(function (all_param) {
          i_c.empty();
          i_c[0].appendChild(all_param[1].__element);
          return attachIOToEditor(all_param);
        })
        .fail(handleError);
    };
  }

  rJS(window).ready(function (g) {
    var editor_a_context = $(g.__element).find(".editor_a").last(),
      io_a_context = $(g.__element).find(".editor_a_safe").last();
//       editor_b_context = g.context.find(".editor_b").last(),
//       io_b_context = g.context.find(".editor_b_safe").last();

    // First, load the catalog gadget
    g.declareGadget('../catalog_static/index.html')
      .then(function (catalog) {
        // Fetch the list of editor and io gadgets
        // This is done in 2 different queries to the catalog
        return RSVP.all([
          catalog.allDocs(
            {query: 'interface: "http://www.renderjs.org/interface/editor"'}
          ),
          catalog.allDocs(
            {query: 'interface: "http://www.renderjs.org/interface/io"'}
          )
        ]);
      })
      .then(function (all_list) {
        var panel_context = $(g.__element).find(".bare_panel"),
          editor_list = all_list[0],
          io_list = all_list[1],
          editor_definition,
          i;

        // Load 1 editor and 1 IO and plug them
        editor_a_context.empty();
        return RSVP.all([
          g.declareGadget(
            editor_list[0].path,
            {element: editor_a_context[0], sandbox: 'iframe'}
          ),
          g.declareGadget(io_list[0].path),// io_a_context),
          "officejs"
        ])
          .then(function (all_param) {
            io_a_context.empty();
            io_a_context[0].appendChild(all_param[1].__element);
            return attachIOToEditor(all_param);
          })
          .then(function () {
            // Fill the panel
            for (i = 0; i < editor_list.length; i += 1) {
              editor_definition = editor_list[i];
              panel_context.append(
                '<a href="#" data-role="button" data-icon="edit" ' +
                  'data-iconpos="left">' + editor_definition.title + '</a>'
              );
//               $(editor_definition.element).click(
              panel_context.find('a').last().click(
                createLoadNewEditorCallback(g, editor_definition.path,
                  editor_a_context, io_list[0].path, io_a_context)
              );
              // XXX Handle links
//               panel_context.find('a').last().click(function () {
//                 $.when(
//                   g.declareGadget(editor_definition.path,
//                                          editor_a_context),
//                   g.declareGadget(io_list[0].path, io_a_context),
//                   "officejs"
//                 ).done(attachIOToEditor);
//               });
            }
            panel_context.trigger('create');
          });


      })

      .fail(handleError);
//     $.when(
//       g.declareGadget('./jqteditor.html', editor_a_context),
//       g.declareGadget('./io.html', io_a_context),
//       "officejs_a").done(attachIOToEditor);

//     $.when(
//       g.declareGadget('./editor.html', editor_b_context),
//       g.declareGadget('./io.html', io_b_context),
//       "officejs_b").done(attachIOToEditor);

  });
}(window, jQuery, rJS, RSVP));
