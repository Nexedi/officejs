/*global window, rJS, document, RSVP, URI, console */
/*jslint maxlen:120, nomen: true */
(function (rJS, document, RSVP, window, URI) {
  "use strict";

  rJS(window)
    .ready(function (g) {
      return new RSVP.Queue()
        .push(function () {
          return g.getElement();
        })
        .push(function (element) {
          g.element = element;
        });
    })
    .declareAcquiredMethod("pleaseAllDocsXXX", "pleaseAllDocsXXX")
    .declareAcquiredMethod("whoWantToDisplayThis", "whoWantToDisplayThis")
    //////////////////////////////////////////////
    // initialize the gadget content
    //////////////////////////////////////////////
    .declareMethod('render', function (options) {
      var gadget = this,
        table = gadget.element.getElementsByTagName('table')[0],
        field_json = options.field_json,
        i,
        url_param = {},
        begin_from = parseInt(options.begin_from, 10) || 0,
        tmp_element_1,
        tmp_element_2,
        tmp_element_3,
        select_list = [];
      console.log("LISTBOX");
      console.log(options);
      for (i = 0; i < field_json.column_list.length; i += 1) {
        select_list.push(field_json.column_list[i][0]);
      }

      gadget.field_json = field_json;

      // Drop the table content
      while (table.firstChild) {
        table.removeChild(table.firstChild);
      }
      tmp_element_1 = document.createElement("thead");
      table.appendChild(tmp_element_1);
      tmp_element_2 = document.createElement("tr");
      tmp_element_1.appendChild(tmp_element_2);

      for (i = 0; i < field_json.column_list.length; i += 1) {
        tmp_element_3 = document.createElement("th");
        tmp_element_3.textContent = field_json.column_list[i][1];
        tmp_element_2.appendChild(tmp_element_3);
      }

      tmp_element_1 = document.createElement("tbody");
      table.appendChild(tmp_element_1);
      return gadget.pleaseAllDocsXXX({
        "query": new URI(field_json.query).query(true).query,
        "limit": [begin_from, begin_from + field_json.lines + 1],
        "select_list": select_list
      }).then(function (result) {
        var promise_list = [result];

        for (i = 0; i < (result.data.rows.length - 1); i += 1) {
          promise_list.push(
            gadget.whoWantToDisplayThis(result.data.rows[i].id)
          );
        }
        return RSVP.all(promise_list);

      }).then(function (result_list) {
//         console.log(result);
        var j,
          tmp,
          result = result_list[0],
          tmp_url;

        tmp_element_1 = gadget.element.getElementsByTagName("tbody")[0];

        for (i = 0; i < (result.data.rows.length - 1); i += 1) {
          tmp_element_2 = document.createElement("tr");
          tmp_element_1.appendChild(tmp_element_2);
// tmp_url = "#/f/" + encodeURIComponent(result.data.rows[i].id) + "/view";
          tmp_url = result_list[i + 1];

          tmp = "";
          for (j = 0; j < gadget.field_json.column_list.length; j += 1) {
            tmp += "<th><a href='" + tmp_url + "'>" +
              (result.data.rows[i].value[gadget.field_json.column_list[j][0]] || "") +
              "</a></th> ";
          }
          tmp_element_2.innerHTML = tmp;
        }

        if (result.data.rows.length > field_json.lines) {
          url_param.begin_from = begin_from + field_json.lines;
        }
//         return gadget.acquire("generateMyUrlXXX", url_param);
        console.log(url_param);
        return RSVP.all([
          gadget.aq_pleasePublishMyState({}),
          gadget.aq_pleasePublishMyState(url_param)
        ]);
//         return gadget.acquire("generateMyUrlXXX", url_param);
//                               [{jio_key: param_list[0]}]);
      }).then(function (lala) {
        console.log(lala);
        if (begin_from !== 0) {
          tmp_element_1.innerHTML += "<a href='" + lala[0] +
                                     "'>Start</a> ";
        }
        tmp_element_1.innerHTML += "<a href='" + lala[1] +
                                   "'>Next page!</a>";
// if (result.data.rows.length > field_json.lines) {
//   tmp_element_1.innerHTML += "<a href='#begin_from=56'>Next page!</a>";
//         window.location = "http://www.free.fr";
// }
      });
    });


}(rJS, document, RSVP, window, URI));
