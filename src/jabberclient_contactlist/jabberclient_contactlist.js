/*global window, rJS, Strophe, $, DOMParser,
  XMLSerializer, Handlebars, $iq, $pres*/

(function ($, Strophe, gadget) {
  "use strict";

  var contactTemplate, main;

  function parseXML(xmlString) {
    return new DOMParser()
      .parseFromString(xmlString, 'text/xml')
      .children[0];
  }

  function Contact(jid, options) {
    this.jid = jid;
    this.offline = true;
    this.status = null;
    if (typeof options === 'object') {
      $.extend(this, options);
    }
    this.updateElement();
  }

  Contact.prototype.update = function (presence) {
    this.status = null;
    if (presence.getAttribute('type') === 'unavailable') {
      this.offline = true;
    } else {
      var show = $(presence).find('show');
      this.offline = false;
      if (show.length !== 0 && show.text() !== "online") {
        this.status = show.text();
      }
    }
    this.updateElement();
  };

  Contact.prototype.updateElement = function () {
    var that = this;
    if (this.el) { this.el.remove(); }
    this.el = $(contactTemplate({
      jid: this.jid,
      name: this.name,
      offline: this.offline,
      status: this.status
    }));
    this.el.click(function () {
      main.openChat(that.jid);
    });
  };

  function ContactList(rosterIq) {
    var that = this,
      contactItems = rosterIq.childNodes[0].childNodes,
      jid,
      options;
    this.list = {};
    this.el = $('#contact-list ul');
    [].forEach.call(contactItems, function (item) {
      jid = $(item).attr('jid');
      options = {};
      [].forEach.call(item.attributes, function (attr) {
        options[attr.name] = attr.value;
      });
      that.list[jid] = new Contact(jid, options);
      that.el.append(that.list[jid].el);
      that.el.listview('refresh');
    });
    main.send($pres().toString());
  }
  ContactList.prototype.update = function (presence) {
    var jid = Strophe.getBareJidFromJid($(presence).attr('from')),
      contact = this.list[jid];
    if (contact) {
      contact.update(presence);
      if (contact.offline) {
        this.el.append(contact.el);
      } else {
        this.el.prepend(contact.el);
      }
      this.el.listview('refresh');
    }
  };

  gadget

    .declareAcquiredMethod('send', 'send')
    .declareAcquiredMethod('openChat', 'openChat')

    .declareMethod('receiveRoster', function (roster) {
      this.contactList = new ContactList(parseXML(roster));
    })

    .declareMethod('receivePresence', function (presence) {
      this.contactList.update(parseXML(presence));
    })

    .declareMethod('receive', function (message) {
      var that = this,
        body = parseXML(message);
      if ($(body).find('iq').length !== 0 &&
          $(body).find('query').length !== 0 &&
          $(body).find('query').attr('xmlns') === "jabber:iq:roster") {
        this.contactList = new ContactList($(body).find('iq')[0]);
      } else if ($(body).find('presence')) {
        $(body).find('presence').each(function (index, elem) {
          that.contactList.update(elem);
        });
      }
    })

    .declareMethod('updatePresence', function (presence) {
      presence = parseXML(presence);
      this.contactList.update(presence);
    })

    .ready(function (g) {
      main = g;
      g.getElement()
        .then(function (element) {
          contactTemplate = Handlebars.compile(
            $(element).find('#contact-template').html()
          );
        });
    });

}($, Strophe, rJS(window)));
