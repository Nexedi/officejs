/*global window, rJS, Strophe, $, $iq,
  XMLSerializer, DOMParser, RSVP, localStorage*/
/*jslint nomen: true*/

(function ($, Strophe, rJS) {
  "use strict";

  function parseXML(xmlString) {
    return new DOMParser()
      .parseFromString(xmlString, 'text/xml')
      .children[0];
  }

  function serializeXML(xml) {
    return new XMLSerializer().serializeToString(xml);
  }

  function showLogin(gadget, params) {
    var login_box = gadget.props.login_box,
      logout_box = gadget.props.logout_box;
    $(login_box).find('input[name="server"]').val(params.server);
    $(login_box).find('input[name="jid"]').val(params.jid);
    $(login_box).find('input[name="passwd"]').val(params.passwd);
    $(logout_box).hide();
    $(login_box).show();
  }

  function showLogout(gadget, params) {
    var login_box = gadget.props.login_box,
      logout_box = gadget.props.logout_box;
    $(logout_box).find('.server').html(params.server);
    $(logout_box).find('.jid').html(params.jid);
    $(login_box).hide();
    $(logout_box).show();
  }

  function loopConnectionListener(gadget, params) {

    var connection = new Strophe.Connection(params.server),
      connection_callback;

    function canceller() {
      if (connection_callback !== undefined) {
        connection.disconnect();
      }
    }

    function resolver(resolve, reject) {
      connection_callback = function (status) {
        if (status === Strophe.Status.CONNECTED) {
          // init jabber inputs
          connection.xmlInput = function (domElement) {
            [].forEach.call(domElement.children, function (child) {
              gadget.receive(serializeXML(child));
            });
          };
          connection.send(
            $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'}).tree()
          );
          // inform parent gadget
          gadget.publishConnectionState('connected');
          // show logout box
          showLogout(gadget, params);
          // register params in localStorage
          localStorage.setItem('jabberclient_login', JSON.stringify(params));
        } else if (status === Strophe.Status.DISCONNECTED) {
          // Destroy connection object
          gadget.props.connection = null;
          // Inform parent gadget
          gadget.publishConnectionState('disconnected');
          // Show login box
          showLogin(gadget, params);
          // remove params in localStorage
          localStorage.removeItem('jabberclient_login');
        }
      };
      connection.connect(params.jid, params.passwd, connection_callback);
      gadget.props.connection = connection;
    }
    return new RSVP.Promise(resolver, canceller);
  }

  rJS(window)

    .declareAcquiredMethod('pleaseRedirectMyHash', 'pleaseRedirectMyHash')

    .declareAcquiredMethod('publishConnectionState', 'publishConnectionState')

    .declareMethod("isConnected", function () {
      if (this.props.connection) {
        return this.props.connection.connected;
      }
      return false;
    })

    .declareAcquiredMethod('receive', 'receive')

    .declareMethod('getJID', function () {
      return Strophe.getBareJidFromJid(this.props.connection.jid);
    })

    .declareMethod('send', function (xmlString) {
      return this.props.connection.send(parseXML(xmlString));
    })

    .declareMethod('disconnect', function () {
      if (this.connection && this.connection.connected) {
        return this.connection.disconnect();
      }
    })

    .declareMethod("pleaseConnectMe", function () {
      var params = JSON.parse(localStorage.getItem('jabberclient_login'));
      if (params !== null &&
          typeof params === 'object' &&
          Object.keys(params).length === 3) {
        return loopConnectionListener(this, params);
      }
      return this.pleaseRedirectMyHash("#page=connection");
    })

    .ready(function (g) {
      g.props = {
        login_box: g.__element.querySelector('.login-box'),
        logout_box: g.__element.querySelector('.logout_box')
      };

      g.submitLoginCallback = function (e) {
        e.preventDefault();
        g.props.params = {};
        $(this).serializeArray().forEach(function (elem) {
          g.props.params[elem.name] = elem.value;
        });
        loopConnectionListener(g, g.props.params);
        return false;
      };

      g.submitLogoutCallback = function (e) {
        g.connection.disconnect();
        g.publishConnectionState('disconnected');
      };

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
