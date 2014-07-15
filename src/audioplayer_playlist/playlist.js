/*global window, rJS, RSVP, console, jQuery, $, JSON, Handlebars,
  loopEventListener, RegExp */
/*jslint maxlen:80, nomen: true */


(function (window, rJS, $, Handlebars, loopEventListener) {
  "use strict";
  var gk = rJS(window),
    rows_template_source = gk.__template_element
      .getElementById('rows-template').innerHTML,
    rows_template = Handlebars.compile(rows_template_source);
  gk.declareAcquiredMethod("allDocs", "allDocs")
    .declareAcquiredMethod("plSave", "plSave")
    .declareAcquiredMethod("plGive", "plGive")
    .declareAcquiredMethod("jio_remove", "jio_remove")
    .declareAcquiredMethod("displayThisPage", "displayThisPage")
    .declareAcquiredMethod("displayThisTitle", "displayThisTitle")
    .declareAcquiredMethod("plCreateHttpStorage", "plCreateHttpStorage")
    .declareAcquiredMethod("plEnablePage", "plEnablePage")
    .declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash")
    .declareMethod('render', function (options) {
      var gadget = this,
        list = gadget.__element.getElementsByTagName('ul')[0];
      return new RSVP.Queue()
        .push(function () {
          return gadget.displayThisTitle("playlist");
        })
        .push(function () {
          return RSVP.all([
            gadget.displayThisPage({page: "playlist",
                                    id : "offline"}),
            gadget.displayThisPage({page: "playlist",
                                    id : "localhost"}),
            gadget.displayThisPage({page: "playlist",
                                    id : "online"})
          ]);
        })
        .push(function (param_list) {
          gadget.__element.getElementsByClassName('offline')[0]
            .href = param_list[0];
          gadget.__element.getElementsByClassName('localhost')[0]
            .href = param_list[1];
          gadget.__element.getElementsByClassName('online')[0]
            .href = param_list[2];
        })
        .push(function () {
          return gadget.plGive("ip");
        })
        .push(function (value) {
          var id = options.id;
          if (value !== undefined) {
            gadget.__element.getElementsByClassName('inputIp')[0]
              .value = value;
          }
          if (options.action === "delete") {
            delete options.id;
            return gadget.jio_remove({"_id" : id});
          }
        })
        .push(function () {
          return gadget.allDocs({"include_docs": true});
        })
        .push(function (e) {
          var tmp = e.data.rows,
            i,
            j,
            exp;
          if (options.id !== undefined && options.id !== "offline"
              && options.id !== "localhost"
              && options.id !== "online") {
            tmp = [];
            for (i = 0, j = 0; i < e.data.rows.length; i += 1) {
              exp = new RegExp(options.id, "i");
              if (e.data.rows[i].doc.title.search(exp) !== -1) {
                tmp[j] = e.data.rows[i];
                j += 1;
              }
            }
            gadget.id = options.id;
          }
          list.innerHTML = rows_template({
            "rows" : tmp
          });
          $(list).listview("refresh");
        })
        .fail(function (error) {
          if (!(error instanceof RSVP.CancellationError)) {
            document.getElementsByTagName('body')[0].textContent =
              "network ip not correct";
          }
        });
    })
    .declareMethod('startService', function () {
      var g = this,
        research = g.__element.getElementsByClassName('research')[0],
        ip = g.__element.getElementsByClassName('inputIp')[0];
      if (g.id !== undefined) {
        research.value = g.id;
      }
      return new RSVP.Queue()
        .push(function () {
          return g.plEnablePage();
        })
        .push(function () {
          return RSVP.any([
            loopEventListener(research, "change", false, function () {
              return new RSVP.Queue()
                .push(function () {
                  return g.displayThisPage({page: "playlist",
                                            id: research.value});
                })
                .push(function (url) {
                  window.location = url;
                });
            }),
            loopEventListener(ip, "change", false, function () {
              return new RSVP.Queue()
                .push(function () {
                  return g.plCreateHttpStorage(ip.value);
                })
                .push(function () {
                  return g.plSave({"ip": ip.value});
                });
            })
          ]);//any
        });//rsvp
    });//startService
}(window, rJS, jQuery, Handlebars, loopEventListener));
