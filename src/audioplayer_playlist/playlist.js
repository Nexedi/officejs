/*global window, rJS, RSVP, console, jQuery, $ */
/*jslint maxlen:80, nomen: true */


(function (window, rJS, $) {
  "use strict";
  var gk = rJS(window);
  gk.declareMethod('display', function (attachment) {
    this.playlist.style.display = "";
    this.home.style.display = "";
  })
    .declareMethod('noDisplay', function (attachment) {
      this.playlist.style.display = "none";
      this.home.style.display = "none";
    })
    .declareMethod('initList', function (playlist) {
      var i,
        docFragment = document.createDocumentFragment(),
        li;
      this.list.innerHTML = "";
      for (i = 0; i < playlist.url.length; i += 1) {
        li = document.createElement("li");
        li.innerHTML =
          "<a href=#page="
          + playlist.url[i]
          + ">"
          + playlist.name[i]
          + "</a> "
          + " <a href=#page="
          + playlist.name[i]
          + "&id=delete "
          + "data-rel=popup "
          + "data-position-to=window "
          + "</a>";
        docFragment.appendChild(li);
      }
      this.list.appendChild(docFragment);
      $(this.list).listview("refresh");
    });
  gk.ready(function (g) {
    g.playlist = g.__element.getElementsByTagName('div')[2];
    g.list = g.__element.getElementsByTagName('ul')[1];
    g.home = g.__element.getElementsByTagName('div')[0];
    $(g.__element).trigger("create");
  });
}(window, rJS, jQuery));
