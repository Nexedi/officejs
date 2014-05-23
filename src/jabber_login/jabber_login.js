/*global window, rJS, Strophe, $, $iq, XMLSerializer, DOMParser*/

(function ($, Strophe, rJS) {
  "use strict";

  var serializeXML = function (xml) {
    return (new XMLSerializer()).serializeToString(xml);
  },
    parseXML = function (xmlString) {
      return new DOMParser()
        .parseFromString(xmlString, 'text/xml')
        .children[0];
    };

  rJS(window)

    .declareAcquiredMethod('connected', 'connected')
    .declareAcquiredMethod('disconnected', 'disconnected')
    .declareAcquiredMethod('receive', 'receive')

    .declareMethod('getJID', function () {
      return Strophe.getBareJidFromJid(this.connection.jid);
    })

    .declareMethod('send', function (xmlString) {
      return this.connection.send(parseXML(xmlString));
    })

    .declareMethod('disconnect', function () {
      if (this.connection) {
        return this.connection.disconnect();
      }
    })

    .ready(function (g) {

      function initInputs() {
        g.connection.xmlInput = function (body) {
          [].forEach.call(body.children, function (child) {
            g.receive(serializeXML(child));
          });
        };
      }

      function initConnection(params) {
        g.connection = new Strophe.Connection(params.server);
        g.connection.connect(params.jid, params.passwd, function (status) {
          if (status === Strophe.Status.CONNECTED) {
            initInputs();
            g.connected();
          } else if (status === Strophe.Status.DISCONNECTED) {
            g.disconnected();
          }
        });
        window.connection = g.connection; // for debug purpose
      }

      $(document).on('submit', 'form.login-form', function (e) {
        var params = {};
        $(this).serializeArray().forEach(function (elem) {
          params[elem.name] = elem.value;
        });
        initConnection(params);
        return false;
      });

    });

}($, Strophe, rJS));
