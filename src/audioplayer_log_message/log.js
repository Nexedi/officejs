/*global window, rJS, RSVP, console, document, JSON */
/*jslint maxlen:80, nomen: true */


(function (window, rJS) {
  "use strict";
  var gk = rJS(window),
    logColor = 0,
    arrayColor = ["white", "cyan"];

  function logGetColor() {
    logColor = (logColor + 1) % arrayColor.length;
    return arrayColor[logColor];
  }


  gk.declareMethod('showMessage', function (msg) {
    var node = document.createElement("pre");
    node.setAttribute(
      "style",
      "background-color:" + logGetColor() +
        ";margin:0;padding:0;"
    );
    if (typeof msg === "string") {
      node.textContent += msg;
    } else {
      node.textContent += JSON.stringify(msg, null, " ");
    }
    this.log.appendChild(node);
  })
    .declareMethod('clear', function () {
      this.log.innerHTML = "";
    });

  gk.ready(function (g) {
    g.log = g.__element.getElementsByTagName('div')[0];
    var node = document.createElement("pre");
    node.setAttribute(
      "style",
      "background-color:" + logGetColor() +
        ";margin:0;padding:0;"
    );
    node.textContent = "use for show message";
    g.log.appendChild(node);
  });
}(window, rJS));
