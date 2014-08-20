/*globals window, document, RSVP, XMLSerializer, DOMParser,
  rJS, $, DOMParser, Handlebars, Strophe, $msg*/
/*jslint nomen: true*/
(function($, rJS, Handlebars) {
    "use strict";
    var gadget_klass = rJS(window), message_template_source = gadget_klass.__template_element.querySelector(".message-template").innerHTML, message_template = Handlebars.compile(message_template_source);
    function displayMessage(message) {
        var html_message = message_template({
            time: message.time,
            jid: message.from,
            content: message.content
        });
        $(".talk-box").append(html_message);
    }
    function Message(from, to, time, content) {
        this.from = from;
        this.to = to;
        this.time = time;
        this.content = content;
    }
    function Talk(jid) {
        this.jid = jid;
        this.messages = [];
    }
    function getTime() {
        var date = new Date(), timestamp = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " ";
        return timestamp + date.toTimeString();
    }
    function parseXML(xmlString) {
        return new DOMParser().parseFromString(xmlString, "text/xml").children[0];
    }
    function sendInput(gadget) {
        var content = $(".talk-input").val(), from, to, time, message;
        $(".talk-input").val("");
        if (content) {
            from = gadget.props.jid;
            to = gadget.props.current_contact_jid;
            time = getTime();
            message = new Message(from, to, time, content);
            if (!gadget.props.talks[to]) {
                gadget.props.talks[to] = new Talk(to);
            }
            gadget.props.talks[to].messages.push(message);
            gadget.jio_put({
                _id: "chatbox_history",
                datas: JSON.stringify(gadget.props.talks)
            });
            displayMessage(message);
            gadget.send($msg({
                to: to,
                type: "chat"
            }).c("body").t(content).toString());
        }
    }
    gadget_klass.declareAcquiredMethod("jio_put", "jio_put").declareAcquiredMethod("jio_get", "jio_get").ready(function(g) {
        return g.jio_get({
            _id: "chatbox_history"
        }).push(function(response) {
            return JSON.parse(response.data.datas);
        }).push(function(talks) {
            g.props = {
                talks: talks
            };
        });
    }).declareMethod("render", function(options) {
        var gadget = this, messages;
        this.props.jid = options.jid;
        this.props.current_contact_jid = options.current_contact_jid;
        $('[data-role="page"]').height("100%");
        $(".gadget-container").height("93%");
        $(gadget.__element).find(".talk-box").html("");
        if (this.props.talks[this.props.current_contact_jid]) {
            messages = this.props.talks[this.props.current_contact_jid].messages;
            messages.forEach(function(message) {
                displayMessage(message);
            });
        }
        $(this.__element).find(".send-button").click(function(e) {
            e.preventDefault();
            sendInput(gadget);
        });
        $(this.__element).find(".talk-input").keypress(function(e) {
            var charCode = typeof e.which === "number" ? e.which : e.keyCode;
            if (charCode === 13) {
                e.preventDefault();
                if (!e.shiftKey) {
                    sendInput(gadget);
                } else {
                    $(gadget.__element).find(".talk-input").val($(gadget.__element).find(".talk-input").val() + "\n");
                }
            }
        });
    }).declareAcquiredMethod("send", "send").declareMethod("receive", function(datas) {
        var xmlMessage = parseXML(datas), from = Strophe.getBareJidFromJid($(xmlMessage).attr("from")), to = Strophe.getBareJidFromJid($(xmlMessage).attr("to")), time = getTime(), content = $(xmlMessage).find("body").text(), message = new Message(from, to, time, content);
        if (!this.props.talks[from]) {
            this.props.talks[from] = new Talk(from);
        }
        this.props.talks[from].messages.push(message);
        this.jio_put({
            _id: "chatbox_history",
            datas: JSON.stringify(this.props.talks)
        });
        displayMessage(message);
    });
})($, rJS, Handlebars);