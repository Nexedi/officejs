/*globals window, document, RSVP, XMLSerializer, DOMParser,
  rJS, $, DOMParser, Strophe, $msg*/

(function ($, gadget) {
  "use strict";

  var main,
    parseXML = function (xmlString) {
      return new DOMParser()
        .parseFromString(xmlString, 'text/xml')
        .children[0];
    };

  function Chat(jid, name) {
    this.jid = jid;
    this.name = name;
  }

  Chat.prototype.sendInput = function () {
    var message = $('#talk-input').val(),
      messageStanzas;
    $('#talk-input').val("");
    if (message) {
      $('#talk').append('<p>Me: ' + message + '</p>');
      messageStanzas = this.getMessageStanzas(message);
      main.send(messageStanzas);
    }
  };

  Chat.prototype.getMessageStanzas = function (message) {
    return $msg({to: this.jid, type: "chat"}).c('body').t(message).toString();
  };

  gadget
    .declareAcquiredMethod('send', 'send')

    .declareMethod('initContact', function (jid, name) {
      this.chat = new Chat(jid, name);
      $('#contact').html(jid);
      return this.chat;
    })

    .declareMethod('receive', function (message) {
      var xmlMessage = parseXML(message);
      $('#talk').append(
        '<p>' + Strophe.getBareJidFromJid($(xmlMessage).attr('from')) +
          ': ' +
          $(xmlMessage).find('body').text() +
          '</p>'
      );
    })

    .ready(function (g) {
      main = g;

      $('#send-button').click(function () {
        g.chat.sendInput();
      });

      $("#talk-input").keypress(function (e) {
        if (e.charCode === 13) {
          e.preventDefault();
          g.chat.sendInput();
        }
      });
    });

}($, rJS(window)));
