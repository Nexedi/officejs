/*global window, rJS, RSVP, console, jQuery, $, JSON, Handlebars,
  loopEventListener, RegExp, alert */
/*jslint maxlen:180, nomen: true */


(function (window, rJS, $, Handlebars, loopEventListener) {
  "use strict";
  var gk = rJS(window),
    network_source = gk.__template_element
      .getElementById('network').innerHTML,
    network = Handlebars.compile(network_source);


  function checkIp(ip) {
    var re = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    if (!re.test(ip)) {
      return false;
    }
    return true;
  }

  gk.declareAcquiredMethod("allDocs", "allDocs")
    .declareAcquiredMethod("plSave", "plSave")
    .declareAcquiredMethod("plGive", "plGive")
    .declareAcquiredMethod("displayThisPage", "displayThisPage")
    .declareAcquiredMethod("displayThisTitle", "displayThisTitle")
    .declareAcquiredMethod("plCreateHttpStorage", "plCreateHttpStorage")
    .declareAcquiredMethod("plEnablePage", "plEnablePage")
    .declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash")
    .declareMethod('render', function (options) {
      var gadget = this,
        ipValue,
        list = gadget.__element.getElementsByTagName('ul')[0];
      return new RSVP.Queue()
        .push(function () {
          return RSVP.all([
            gadget.displayThisPage({page: "playlist",
                                    id : "offline"}),
            gadget.displayThisPage({page: "playlist",
                                    id : "localhost"})
          ]);
        })
        .push(function (param_list) {
          gadget.__element.getElementsByClassName('offline')[0]
            .href = param_list[0];
          gadget.__element.getElementsByClassName('localhost')[0]
            .href = param_list[1];
        })
        .push(function () {
          return gadget.plGive("ip");
        })
        .push(function (value) {
          if (value !== undefined) {
            ipValue = value;
            gadget.__element.getElementsByClassName('inputIp')[0]
              .value = value;
          }
          return gadget.allDocs({"include_docs": true});
        })
        .push(function (e) {
          var tmp = e.data.rows,
            i,
            j,
            exp;
          if (options.id !== undefined && options.id !== "online") {
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
          list.innerHTML = network({
            "rows" : tmp
          });
          $(list).listview("refresh");
          return gadget.displayThisTitle("online playlist: " +
                                         tmp.length + " music");
        })
        .fail(function (error) {
          if (!(error instanceof RSVP.CancellationError)) {
            if (ipValue) {
              gadget.__element.getElementsByClassName('info')[0].innerHTML =
                "network error";
            }
            return gadget.displayThisTitle("online playlist: " +
                                           "0 music");
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
              var info = g.__element.getElementsByClassName('info')[0],
                http,
                port,
                ipValue = ip.value;
              http = ipValue.indexOf("http");
              ipValue = ipValue.substring(ipValue.indexOf("//") + 2);
              port = ipValue.indexOf(":");
              if (port !== -1) {
                ipValue = ipValue.substring(0, port);
              }
              if (http === -1) {
                info.innerHTML = " please start ip with http";
                return;
              }
              if (checkIp(ipValue) === false) {
                info.innerHTML =
                  "invalide ip: ip should like xxx.xxx.xxx.xxx(xxx is between 0 ~ 255)";
                return;
              }
              if (port === -1) {
                info.innerHTML = "input port number";
                return;
              }
              return new RSVP.Queue()
                .push(function () {
                  return g.plCreateHttpStorage(ip.value);
                })
                .push(function () {
                  return g.plSave({"ip": ip.value});
                })
                .push(function () {
                  return g.displayThisPage({page: "playlist",
                                            action: ip.value});
                })
                .push(function (url) {
                  window.location = url;
                });
            })
          ]);//any
        });//rsvp
    });//startService
}(window, rJS, jQuery, Handlebars, loopEventListener));
