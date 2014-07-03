/*global window, rJS, RSVP, console, $, jQuery, URL, location, webkitURL */
/*jslint nomen: true*/

(function (window, rJS, $, RSVP) {
  "use strict";
  $.mobile.ajaxEnabled = false;
  $.mobile.linkBindingEnabled = false;
  $.mobile.hashListeningEnabled = false;
  $.mobile.pushStateEnabled = false;
  function disablePage(g) {
    var overlay = document.createElement('div'),
      loader = document.createElement('div'),
      controlPanel = g.__element.getElementsByClassName("page")[0],
      i = 0,
      circle;
    overlay.className = 'overlay';
    loader.className = 'loader';
    while (i < 5) {
      circle = document.createElement('div');
      circle.className = 'circle';
      loader.appendChild(circle);
      i += 1;
    }
    overlay.appendChild(loader);
    controlPanel.appendChild(overlay);
  }

  rJS(window)
    .declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash")
    .allowPublicAcquisition("plEnablePage", function () {
      var controlPanel = this.__element.getElementsByClassName('page')[0];
      while (controlPanel.firstChild) {
        controlPanel.removeChild(controlPanel.firstChild);
      }
    })
    .allowPublicAcquisition("plDisablePage", function () {
      disablePage(this);
    })
    .allowPublicAcquisition("displayThisPage", function (param_list) {
      // Hey, I want to display this page
      return this.aq_pleasePublishMyState(param_list[0]);
    })
    .allowPublicAcquisition("allDocs", function (param_list) {
      return this.getDeclaredGadget("jio")
        .push(function (jio_gadget) {
          return jio_gadget.allDocs.apply(jio_gadget, param_list);
        });
    })
    .allowPublicAcquisition("jio_post", function (param_list) {
      return this.getDeclaredGadget("jio")
        .push(function (jio_gadget) {
          return jio_gadget.post.apply(jio_gadget, param_list);
        });
    })
    .allowPublicAcquisition("jio_putAttachment", function (param_list) {
      return this.getDeclaredGadget("jio")
        .push(function (jio_gadget) {
          return jio_gadget.putAttachment.apply(jio_gadget, param_list);
        });
    })
    .allowPublicAcquisition("jio_getAttachment", function (param_list) {
      return this.getDeclaredGadget("jio")
        .push(function (jio_gadget) {
          return jio_gadget.getAttachment.apply(jio_gadget, param_list);
        });
    })
    .allowPublicAcquisition("jio_get", function (param_list) {
      return this.getDeclaredGadget("jio")
        .push(function (jio_gadget) {
          return jio_gadget.get.apply(jio_gadget, param_list);
        });
    })
    .allowPublicAcquisition("displayThisTitle", function (param_list) {
      var header = this.__element.getElementsByTagName("h1")[0];
      header.innerHTML = param_list[0];
    });

  rJS(window)
    .ready(function (g) {
      var jio_gadget;
      return g.getDeclaredGadget("jio")
        .push(function (gadget) {
          jio_gadget = gadget;
          return jio_gadget.createJio(
            { "type" : "indexeddb",
              "database": "test"}
          );
        });
    })
    .declareMethod("render", function (options) {
      var gadget = this,
        page_gadget,
        element,
        page_element;
      element = gadget.__element
        .getElementsByClassName("gadget_container")[0];
      if (options.page === undefined) {
        // Redirect to the about page
        return gadget.aq_pleasePublishMyState({page: "playlist"})
          .push(gadget.pleaseRedirectMyHash.bind(gadget));
      }
      return gadget.declareGadget(
        "../audioplayer_" + options.page + "/index.html"
      ).push(function (g) {
        disablePage(gadget);
        page_gadget = g;
        return page_gadget.getElement();
      }).push(function (result) {
        page_element = result;
        while (element.firstChild) {
          element.removeChild(element.firstChild);
        }
        element.appendChild(page_element);
        $(element).trigger('create');
        if (page_gadget.render !== undefined) {
          return page_gadget.render(options);
        }
      }).push(function () {
        // XXX RenderJS hack to start sub gadget services
        // Only work if this gadget has no parent.
        if (page_gadget.startService !== undefined) {
          return page_gadget.startService(options);
        }
      });
    });
}(window, rJS, jQuery, RSVP));
