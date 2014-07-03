/*global window, rJS, document, RSVP, URI, console */
/*jslint maxlen:120, nomen: true */
(function (rJS, document, RSVP, window, URI) {
  "use strict";

  rJS(window)
    /////////////////////////////////////////////////////////////////
    // ready
    /////////////////////////////////////////////////////////////////
    // Init local properties
    .ready(function (g) {
      g.props = {};
    })

    // Assign the element to a variable
    .ready(function (g) {
      return g.getElement()
        .push(function (element) {
          g.props.element = element;
        });
    })

    //////////////////////////////////////////////
    // acquired method
    //////////////////////////////////////////////
    .declareAcquiredMethod("jio_allDocs", "jio_allDocs")
    .declareAcquiredMethod("whoWantToDisplayThis", "whoWantToDisplayThis")
    //////////////////////////////////////////////
    // initialize the gadget content
    //////////////////////////////////////////////
    .declareMethod('render', function (options) {
      var gadget = this,
        thead = gadget.props.element.querySelector('thead'),
        field_json = options.field_json,
        tr = document.createElement("tr"),
        th,
        i;

      gadget.props.field_json = field_json;
      gadget.props.begin_from = parseInt(options.begin_from, 10) || 0;

      for (i = 0; i < field_json.column_list.length; i += 1) {
        th = document.createElement("th");
        th.textContent = field_json.column_list[i][1];
        tr.appendChild(th);
      }
      thead.appendChild(tr);
    })

    //////////////////////////////////////////////
    // render the listbox in an asynchronous way
    //////////////////////////////////////////////
    .declareService(function () {
      var gadget = this,
        field_json = gadget.props.field_json,
        begin_from = gadget.props.begin_from,
        table = gadget.props.element.querySelector('table'),
        tbody = document.createElement("tbody"),
        select_list = [],
        i;

      for (i = 0; i < field_json.column_list.length; i += 1) {
        select_list.push(field_json.column_list[i][0]);
      }

      return gadget.jio_allDocs({
        "query": new URI(field_json.query).query(true).query,
        "limit": [begin_from, begin_from + field_json.lines + 1],
        "select_list": select_list
      }).push(function (result) {
        var promise_list = [result];

        for (i = 0; i < (result.data.rows.length - 1); i += 1) {
          promise_list.push(
            gadget.whoWantToDisplayThis(result.data.rows[i].id)
          );
        }
        return RSVP.all(promise_list);

      }).push(function (result_list) {
        var j,
          tr,
          th,
          a,
          result = result_list[0],
          url_param = {},
          tmp_url;

        for (i = 0; i < (result.data.rows.length - 1); i += 1) {
          tr = document.createElement("tr");
// tmp_url = "#/f/" + encodeURIComponent(result.data.rows[i].id) + "/view";
          tmp_url = result_list[i + 1];

          for (j = 0; j < field_json.column_list.length; j += 1) {
            th = document.createElement("th");
            a = document.createElement("a");
            a.href = tmp_url;
            a.textContent = (result.data.rows[i]
                .value[field_json.column_list[j][0]] || "");
            th.appendChild(a);
            tr.appendChild(th);
          }
          tbody.appendChild(tr);
        }

        if (result.data.rows.length > field_json.lines) {
          url_param.begin_from = begin_from + field_json.lines;
        }
//         return gadget.acquire("generateMyUrlXXX", url_param);
        return RSVP.all([
          gadget.aq_pleasePublishMyState({}),
          gadget.aq_pleasePublishMyState(url_param)
        ]);
//         return gadget.acquire("generateMyUrlXXX", url_param);
//                               [{jio_key: param_list[0]}]);
      }).push(function () {
//         if (begin_from !== 0) {
//           tmp_element_1.innerHTML += "<a href='" + lala[0] +
//                                      "'>Start</a> ";
//         }
//         tmp_element_1.innerHTML += "<a href='" + lala[1] +
//                                    "'>Next page!</a>";
        table.appendChild(tbody);
// if (result.data.rows.length > field_json.lines) {
//   tmp_element_1.innerHTML += "<a href='#begin_from=56'>Next page!</a>";
//         window.location = "http://www.free.fr";
// }
      });
    });

}(rJS, document, RSVP, window, URI));
