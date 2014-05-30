/*global window, rJS, Strophe, $, $iq,
  XMLSerializer, DOMParser, RSVP, localStorage*/

(function ($, Strophe, rJS) {
  "use strict";

  rJS(window)

    .declareAcquiredMethod('connected', 'connected')
    .declareAcquiredMethod('disconnected', 'disconnected')
    .declareAcquiredMethod('receive', 'receive')

    .declareMethod('getJID', function () {
      return Strophe.getBareJidFromJid(this.connection.jid);
    })

    .declareMethod('send', function (xmlString) {
      return this.connection.send(this.parseXML(xmlString));
    })

    .declareMethod('disconnect', function () {
      if (this.connection && this.connection.connected) {
        return this.connection.disconnect();
      }
      this.disconnected();
    })

    .ready(function (g) {

      g.serializeXML = function (domElement) {
        return new XMLSerializer()
          .serializeToString(domElement);
      };

      g.parseXML = function (xmlString) {
        return new DOMParser()
          .parseFromString(xmlString, 'text/xml')
          .children[0];
      };

      g.showLogin = function (params) {
        $(document).find('.login-box input[name="server"]').val(params.server);
        $(document).find('.login-box input[name="jid"]').val(params.jid);
        $(document).find('.login-box input[name="passwd"]').val(params.passwd);
        $(document).find('.logout-box').hide();
        $(document).find('.login-box').show();
      };

      g.showLogout = function (params) {
        $(document).find('.logout-box .server').html(params.server);
        $(document).find('.logout-box .jid').html(params.jid);
        $(document).find('.login-box').hide();
        $(document).find('.logout-box').show();
      };

      g.login = function (params) {
        g.connection = new Strophe.Connection(params.server);
        g.connection.connect(params.jid, params.passwd, function (status) {
          if (status === Strophe.Status.CONNECTED) {
            // init jabber inputs
            g.connection.xmlInput = function (domElement) {
              [].forEach.call(domElement.children, function (child) {
                g.receive(g.serializeXML(child));
              });
            };
            // inform parent gadget
            g.connected();
            // show logout box
            g.showLogout(params);
            // register params in localStorage
            localStorage.setItem('jabberclient_login', JSON.stringify(params));
          } else if (status === Strophe.Status.DISCONNECTED) {
            // Destroy connection object
            g.connection = null;
            // Inform parent gadget
            g.disconnected();
            // Show login box
            g.showLogin(params);
            // remove params in localStorage
            g.params = null;
            localStorage.removeItem('jabberclient_login');
          }
        });
      };

      g.submitLoginCallback = function (e) {
        g.params = {};
        $(this).serializeArray().forEach(function (elem) {
          g.params[elem.name] = elem.value;
        });
        g.login(g.params);
        return false;
      };

      g.submitLogoutCallback = function (e) {
        g.connection.disconnect();
        g.disconnected();
      };

      g.params = JSON.parse(localStorage.getItem('jabberclient_login'));
      if (g.params !== null &&
          typeof g.params === 'object' &&
          Object.keys(g.params).length === 3) {
        g.login(g.params);
      }
      // DEBUG
      window.g = g;

      return new RSVP.Promise(function (resolve) {
        $(document).on('submit', 'form.login-form', g.submitLoginCallback);
        $(document).on('click', '.logout-box button', g.submitLogoutCallback);
        resolve();
      }, function () {
        $(document).off('submit', 'form.login-form', g.submitLoginCallback);
        $(document).off('click', '.logout-box button', g.submitLogoutCallback);
      });

    });

}($, Strophe, rJS));
