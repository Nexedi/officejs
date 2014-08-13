/*global window, rJS, Strophe, $, DOMParser,
  XMLSerializer, Handlebars, $iq, $pres*/
/*jslint nomen: true*/

(function ($, Strophe, gadget) {
  "use strict";

  var gadget_klass = rJS(window),
    offline_contact_source = gadget_klass.__template_element
      .querySelector(".offline-contact-template").innerHTML,
    offline_contact_template = Handlebars.compile(offline_contact_source),
    online_contact_source = gadget_klass.__template_element
      .querySelector(".online-contact-template").innerHTML,
    online_contact_template = Handlebars.compile(online_contact_source),
    status_contact_source = gadget_klass.__template_element
      .querySelector(".status-contact-template").innerHTML,
    status_contact_template = Handlebars.compile(status_contact_source);

  function parseXML(xmlString) {
    return new DOMParser()
      .parseFromString(xmlString, 'text/xml')
      .children[0];
  }

  function updateContactElement(gadget, contact) {
    var template,
      options = {};

    if (contact.el) { contact.el.remove(); }
    if (contact.offline) {
      template = offline_contact_template;
    } else if (contact.status) {
      template = status_contact_template;
      options.status = contact.status;
    } else {
      template = online_contact_template;
    }
    options.jid = contact.jid;
    options.name = contact.name;
    contact.el = $(template(options));
    contact.el.click(function () {
      gadget.openChat(contact.jid);
    });
  }

  function updateContact(gadget, contact, presence) {
    contact.status = null;
    if (presence.getAttribute('type') === 'unavailable') {
      contact.offline = true;
    } else {
      var show = $(presence).find('show');
      contact.offline = false;
      if (show.length !== 0 && show.text() !== "online") {
        contact.status = show.text();
      }
    }
    updateContactElement(gadget, contact);
  }

  function Contact(gadget, jid, options) {
    this.jid = jid;
    this.offline = true;
    this.status = null;
    if (typeof options === 'object') {
      $.extend(this, options);
    }
    updateContactElement(gadget, this);
  }

  function ContactList(gadget, rosterIq) {
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
      that.list[jid] = new Contact(gadget, jid, options);
      that.el.append(that.list[jid].el);
    });
    this.el.listview();
    gadget.send($pres().toString());
  }

  function updateContactList(gadget, presence) {
    var jid = Strophe.getBareJidFromJid($(presence).attr('from')),
      contact = gadget.contactList.list[jid];

    if (contact) {
      updateContact(gadget, contact, presence);
      if (contact.offline) {
        gadget.contactList.el.append(contact.el);
      } else {
        gadget.contactList.el.prepend(contact.el);
      }
      gadget.contactList.el.listview('refresh');
    }
  }

  gadget

    .declareAcquiredMethod('send', 'send')
    .declareAcquiredMethod('openChat', 'openChat')

    .declareMethod('receiveRoster', function (roster) {
      this.contactList = new ContactList(this, parseXML(roster));
    })

    .declareMethod('receivePresence', function (presence) {
      updateContactList(this, parseXML(presence));
    });

}($, Strophe, rJS(window)));
