/*global window, jQuery, rJS*/
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
    });

}(window, jQuery, rJS));
