/*global window, rJS, Strophe, $, DOMParser, RSVP,
  XMLSerializer, Handlebars, $iq, $pres*/
/*jslint nomen: true*/
(function($, Strophe, gadget) {
    "use strict";
    var gadget_klass = rJS(window), offline_contact_source = gadget_klass.__template_element.querySelector(".offline-contact-template").innerHTML, offline_contact_template = Handlebars.compile(offline_contact_source), online_contact_source = gadget_klass.__template_element.querySelector(".online-contact-template").innerHTML, online_contact_template = Handlebars.compile(online_contact_source), status_contact_source = gadget_klass.__template_element.querySelector(".status-contact-template").innerHTML, status_contact_template = Handlebars.compile(status_contact_source);
    function parseXML(xmlString) {
        return new DOMParser().parseFromString(xmlString, "text/xml").children[0];
    }
    function updateContactElement(gadget, contact, new_message, messages_read) {
        var template, options = {};
        if (contact.el) {
            contact.el.remove();
        }
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
        options.new_message = new_message || false;
        return gadget.getConnectionJID().push(function(connection_jid) {
            return gadget.getHash({
                page: "chatbox",
                current_contact_jid: contact.jid,
                jid: connection_jid
            });
        }).push(function(hash) {
            options.hash = hash;
            contact.el = $(template(options));
        }).push(function() {
            if (options.new_message || messages_read) {
                gadget.contactList.el.prepend(contact.el);
                gadget.contactList.el.listview("refresh");
            }
        });
    }
    function updateContact(gadget, contact, presence) {
        contact.status = null;
        if (presence.getAttribute("type") === "unavailable") {
            contact.offline = true;
        } else {
            var show = $(presence).find("show");
            contact.offline = false;
            if (show.length !== 0 && show.text() !== "online") {
                contact.status = show.text();
            }
        }
        return updateContactElement(gadget, contact);
    }
    function createContact(gadget, jid, options) {
        gadget.contactList.list[jid] = {};
        gadget.contactList.list[jid].jid = jid;
        gadget.contactList.list[jid].offline = true;
        gadget.contactList.list[jid].status = null;
        if (typeof options === "object") {
            $.extend(gadget.contactList.list[jid], options);
        }
        return updateContactElement(gadget, gadget.contactList.list[jid]);
    }
    function ContactList(gadget, rosterIq) {
        var that = this, contactItems = rosterIq.childNodes[0].childNodes, queue = new RSVP.Queue();
        this.list = {};
        this.el = $("#contact-list ul");
        this.el.hide();
        this.el.html("");
        that.el.listview();
        [].forEach.call(contactItems, function(item) {
            queue.push(function() {
                var options = {}, jid = $(item).attr("jid");
                [].forEach.call(item.attributes, function(attr) {
                    options[attr.name] = attr.value;
                });
                return createContact(gadget, jid, options);
            }).push(function() {
                var jid = $(item).attr("jid");
                that.el.append(that.list[jid].el);
            });
        });
        queue.push(function() {
            that.el.listview();
            that.el.show();
            gadget.send($pres().toString());
        });
    }
    function updateContactList(gadget, presence) {
        var jid = Strophe.getBareJidFromJid($(presence).attr("from")), contact = gadget.contactList.list[jid];
        if (contact) {
            return updateContact(gadget, contact, presence).push(function() {
                if (contact.offline) {
                    gadget.contactList.el.append(contact.el);
                } else {
                    gadget.contactList.el.prepend(contact.el);
                }
                gadget.contactList.el.listview("refresh");
            });
        }
    }
    gadget.declareAcquiredMethod("getHash", "getHash").declareAcquiredMethod("getConnectionJID", "getConnectionJID").declareAcquiredMethod("send", "send").declareAcquiredMethod("openChat", "openChat").declareMethod("messagesAreRead", function(jid) {
        var contact = this.contactList.list[jid];
        return updateContactElement(this, contact, false, true);
    }).declareMethod("receiveMessage", function(message) {
        var xmlMessage = parseXML(message), jid = Strophe.getBareJidFromJid($(xmlMessage).attr("from")), contact = this.contactList.list[jid];
        return updateContactElement(this, contact, true);
    }).declareMethod("receiveRoster", function(roster) {
        this.contactList = new ContactList(this, parseXML(roster));
    }).declareMethod("receivePresence", function(presence) {
        return updateContactList(this, parseXML(presence));
    });
})($, Strophe, rJS(window));