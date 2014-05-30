/*globals window, document, $, RSVP, rJS, DOMParser,
  XMLSerializer, Strophe, console, Handlebars, $iq*/

(function (window, document, $, RSVP, rJS) {
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

    .declareMethod('send', function (datas) {
      console.log('--jabberclient gadget (output)--');
      console.log(datas);
      console.log('--------------------------------');
      return this.login_gadget.send(datas);
    })

    .allowPublicAcquisition('send', function (datas) {
      return this.send(datas);
    })

    .declareMethod('receive', function (datas) {
      console.log('--jabberclient gadget (input)--');
      console.log(datas);
      console.log('-------------------------------');

      var xmlInput = parseXML(datas),
        from;

      if (this.isRoster(xmlInput)) {
        return this.contactlist_gadget.receiveRoster(datas);
      }
      if (this.isPresence(xmlInput)) {
        return this.contactlist_gadget.receivePresence(datas);
      }
      if (this.isMessage(xmlInput)) {
        from = Strophe.getBareJidFromJid($(xmlInput).attr('from'));
        if (!this.chatbox_gadget[from]) {
          return this.openChat(from)
            .then(function (chatGadget) {
              return this.chatbox_gadget.receive(datas);
            });
        }
        return this.chatbox_gadget[from].receive(datas);
      }
    })

    .allowPublicAcquisition('receive', function (datas) {
      return this.receive(datas);
    })

    .allowPublicAcquisition('connected', function () {
      console.log("connected !");
      var iq = $iq({type: 'get'})
        .c('query', {xmlns: 'jabber:iq:roster'}).tree();
      $.mobile.pageContainer.content('change', $('.contactlist-page'));
      return this.send(serializeXML(iq));
    })
    .declareMethod('setUserJID', function (jid) {
      this.userJID = Strophe.getBareJidFromJid(jid);
    })

    .declareMethod('getUserJID', function () {
      return this.userJID;
    })

    .declareMethod('openChat', function (jid) {
      var container = document.createElement('div');
      $('.chatboxes-page .ui-content').append(container);
      return this.declareGadget("../jabberclient_chatbox/", {
        element: container
      })
        .then(function (chatbox_gadget) {
          this.chatbox_gadgets[jid] = chatbox_gadget;
          $.mobile.pageContainer.content('change', $('.chatboxes-page'));
          return chatbox_gadget.initContact(jid);
        });
    })

    .allowPublicAcquisition('getJID', function () {
      return this.login_gadget.getJID();
    })

    .allowPublicAcquisition('openChat', function (jid) {
      return this.openChat(jid[0]);
    })

    .ready(function (g) {

      g.chatbox_gadgets = {};

      g.isRoster = function (input) {
        var selector = 'iq > query[xmlns="jabber:iq:roster"]';
        return $(input).find(selector).length !== 0;
      };

      g.isPresence = function (input) {
        return input.nodeName === 'presence';
      };

      g.isMessage = function (input) {
        return input.nodeName === "message";
      };

      g.processReceivedDatas = function (input) {
        var xmlInput = parseXML(input),
          from;
        if (g.isRoster(xmlInput)) {
          return g.contactlist_gadget.receiveRoster(input);
        }
        if (g.isPresence(xmlInput)) {
          return g.contactlist_gadget.receivePresence(input);
        }
        if (g.isMessage(xmlInput)) {
          from = Strophe.getBareJidFromJid($(xmlInput).attr('from'));
          if (!g.chatboxes_gadget[from]) {
            return g.openChat(from)
              .then(function (chatGadget) {
                return chatGadget.receive(input);
              });
          }
        }
      };

      // Initialize header toolbar
      $("[data-role='header']").toolbar();

      // Initialize login gadget
      g.declareGadget("../jabberclient_login/", {
        element: $(document).find('.login-page .ui-content')[0],
        scope: 'login'
      })
        .then(function (login_gadget) {
          g.login_gadget = login_gadget;
          console.log('couscous');
          return g.login_gadget.getElement();
        })
        .then(function (element) {
          console.log(element);
          $(element).enhanceWithin();
        })
        .fail(function (e) {
          // XXX Replace with proper method
          console.log(e);
          console.log("Can't initialize login gadget");
        });

      // Initialize contactlist gadget
      g.declareGadget("../jabberclient_contactlist/", {
        element: $(document).find('.contactlist-page .ui-content')[0],
        scope: "contactlist"
      })
        .then(function (contactlist_gadget) {
          g.contactlist_gadget = contactlist_gadget;
          return g.contactlist_gadget.getElement();
        })
        .then(function (element) {
          $(element).enhanceWithin();
        })
        .fail(function (e) {
          // XXX Replace with proper method
          console.log("Can't initialize contactlist gadget");
        });
    });

}(window, document, $, RSVP, rJS));
