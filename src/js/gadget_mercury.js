/*global window, jQuery, rJS*/
/*jslint evil: true*/
"use strict";

(function (window, $, rJS) {

  rJS(window).declareMethod('getContent', function () {
    console.log("stub content get");
    console.log($(window));
    return "content stub";
  })

    .declareMethod('setContent', function () {
      console.log("set content");
    })

    .declareMethod('clearContent', function () {
      console.log("clear content");
    })

    .ready(function () {
      var xhr = new window.XMLHttpRequest();
      xhr.open('GET', '../lib/mercury/mercury_loader.js?pack=all', false);
      xhr.send();
      eval(xhr.responseText);
    });

}(window, jQuery, rJS));
