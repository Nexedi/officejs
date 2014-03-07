/*jslint indent: 2, evil: true*/
/*global window, jQuery, rJS*/
"use strict";

(function (window, $, rJS) {

  function init() {
    this.editor = $('#editor');
    this.editor.wysiwyg();
  }

  rJS(window).declareMethod('getContent', function () {
    return rJS(this).editor.html();
  })

    .declareMethod('setContent', function (content) {
      //console.log('setcontent:' + content);
      rJS(this).editor.html(content);
    })

    .declareMethod('clearContent', function () {
      rJS(this).editor.html('');
    })

    .ready(function () {
      init.apply(rJS(this));
    });

}(window, jQuery, rJS));
