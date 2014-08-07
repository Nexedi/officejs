/*globals window, document, $, RSVP, rJS, DOMParser,
  XMLSerializer, Strophe, console, $iq*/
/*jslint nomen: true*/
(function (window, document, $, RSVP, rJS) {
  "use strict";

  $.mobile.ajaxEnabled = false;
  $.mobile.linkBindingEnabled = false;
  $.mobile.hashListeningEnabled = false;
  $.mobile.pushStateEnabled = false;

  var gadget_paths = {
    "connection": "../jabberclient_connection/index.html",
    "contactlist": "../jabberclient_contactlist/index.html",
    "chatbox": "../jabberclient_chatbox/index.html",
    "jio": "../jabberclient_jio/index.html",
    "logger": "../jabberclient_logger/index.html"
  };

  function parseXML(xmlString) {
    return new DOMParser()
      .parseFromString(xmlString, 'text/xml')
      .children[0];
  }

  function isRoster(input) {
    var selector = 'iq > query[xmlns="jabber:iq:roster"]';
    return $(input).find(selector).length !== 0;
  }

  function isPresence(input) {
    return input.nodeName === 'presence';
  }

  function isMessage(input) {
    return input.nodeName === "message";
  }

  rJS(window)

    .allowPublicAcquisition('send', function (datas) {
      console.log('[xmpp datas output] : ' + datas);
      return this.getDeclaredGadget("connection")
        .push(function (connection_gadget) {
          return connection_gadget.send(datas[0]);
        });
    })

    .allowPublicAcquisition('receive', function (datas) {
      datas = datas[0];
      console.log('[xmpp datas input] : ' + datas);
      var xmlInput = parseXML(datas);

      if (isRoster(xmlInput)) {
        return this.getDeclaredGadget("contactlist")
          .push(function (contactlist_gadget) {
            return contactlist_gadget.receiveRoster(datas);
          });
      }
      if (isPresence(xmlInput)) {
        return this.getDeclaredGadget("contactlist")
          .push(function (contactlist_gadget) {
            contactlist_gadget.receivePresence(datas);
          });
      }
      if (isMessage(xmlInput)) {
        return this.getDeclaredGadget("chatbox")
          .push(function (chatbox_gadget) {
            return chatbox_gadget.receive(datas);
          });
      }
    })

    .allowPublicAcquisition('publishConnectionState', function (options) {
      var gadget = this,
        state = options[0],
        came_from;

      if (state === "connected") {
        if (this.props.came_from !== undefined) {
          came_from = this.props.came_from;
          delete this.props.came_from;
          return this.aq_pleasePublishMyState(came_from)
            .push(function () {
              gadget.render(came_from);
            });
        }
        return this.aq_pleasePublishMyState({page: "contactlist"})
          .push(this.pleaseRedirectMyHash.bind(this));
      }
      return this.aq_pleasePublishMyState({page: "connection"})
        .push(this.pleaseRedirectMyHash.bind(this));
    })

    .declareMethod('getConnectionJID', function () {
      return this.getDeclaredGadget('connection')
        .push(function (connection_gadget) {
          return connection_gadget.getConnectionJID();
        });
    })

    .allowPublicAcquisition('getConnectionJID', function () {
      return this.getConnectionJid();
    })

    .allowPublicAcquisition('getJID', function () {
      return this.login_gadget.getJID();
    })

    .allowPublicAcquisition('openChat', function (jid) {
      var gadget = this;
      return gadget.getConnectionJID()
        .push(function (connection_jid) {
          return gadget.aq_pleasePublishMyState({
            page: 'chatbox',
            current_contact_jid: jid[0],
            jid: connection_jid
          });
        })
        .push(this.pleaseRedirectMyHash.bind(this));
    })

    .declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash")

  // Initialize header toolbar
    .ready(function (g) {
      g.props = {};
      g.chatbox_gadgets = {};
      $("[data-role='header']").toolbar();
      return g.getDeclaredGadget('jio')
        .push(function (io_gadget) {
          return io_gadget.createJio({
            "type": "local",
            "username": "jabberclient",
            "application_name": "jabberclient"
          });
        })
        .push(function () {
          return g.declareGadget(gadget_paths.connection, {
            scope: "connection"
          });
        })
        .push(function () {
          return g.declareGadget(gadget_paths.contactlist, {
            scope: "contactlist"
          });
        })
        .push(function () {
          return g.declareGadget(gadget_paths.chatbox, {
            scope: "chatbox"
          });
        });
    })

    .declareMethod('render', function (options) {
      var gadget = this,
        element,
        page_gadget,
        page_element;

      element = gadget.__element.querySelector(".gadget-container");
      return this.getDeclaredGadget("connection")
        .push(function (connection_gadget) {
          return connection_gadget.isConnected();
        })
        .push(function (is_connected) {
          // default page
          if (options.page === undefined) {
            return gadget.aq_pleasePublishMyState({page: "contactlist"})
              .push(gadget.pleaseRedirectMyHash.bind(gadget));
          }

          if (!is_connected && options.page !== "connection") {
            gadget.props.came_from = options;
            return gadget.getDeclaredGadget("connection")
              .push(function (connection_gadget) {
                return connection_gadget.pleaseConnectMe();
              });
          }
          return gadget.getDeclaredGadget(options.page)
            .push(function (g) {
              page_gadget = g;
              return page_gadget.getElement();
            })
            .push(function (page_elem) {
              page_element = page_elem;
              while (element.firstChild) {
                element.removeChild(element.firstChild);
              }
              element.appendChild(page_element);
              if (page_gadget.render !== undefined) {
                page_gadget.render(options);
              }
            });
        });
    });

}(window, document, $, RSVP, rJS));
