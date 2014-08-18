/*global window, rJS, RSVP, console, jQuery, $, JSON, Handlebars,
  loopEventListener, RegExp, ID3, FileAPIReader, Date */
/*jslint maxlen:80, nomen: true */
(function(window, rJS, $, Handlebars, loopEventListener) {
    "use strict";
    var gk = rJS(window), network_source = gk.__template_element.getElementById("network").innerHTML, network = Handlebars.compile(network_source);
    gk.declareAcquiredMethod("allDocs", "allDocs").declareAcquiredMethod("jio_putAttachment", "jio_putAttachment").declareAcquiredMethod("jio_post", "jio_post").declareAcquiredMethod("jio_remove", "jio_remove").declareAcquiredMethod("jio_getAttachment", "jio_getAttachment").declareAcquiredMethod("displayThisPage", "displayThisPage").declareAcquiredMethod("displayThisTitle", "displayThisTitle").declareAcquiredMethod("plEnablePage", "plEnablePage").declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash").declareMethod("render", function(options) {
        var gadget = this, list = gadget.__element.getElementsByTagName("ul")[0];
        return new RSVP.Queue().push(function() {
            return RSVP.all([ gadget.displayThisPage({
                page: "playlist",
                id: "offline"
            }), gadget.displayThisPage({
                page: "playlist",
                id: "online"
            }) ]);
        }).push(function(param_list) {
            var blob;
            gadget.__element.getElementsByClassName("offline")[0].href = param_list[0];
            gadget.__element.getElementsByClassName("online")[0].href = param_list[1];
            if (options.action === "download") {
                return gadget.jio_getAttachment({
                    _id: options.id,
                    _attachment: "enclosure"
                }).then(function(file) {
                    var now = new Date(), type;
                    if (options.id.indexOf(".mp3") === -1) {
                        type = "video/webm";
                    } else {
                        type = "audio/mp3";
                    }
                    blob = file;
                    return gadget.jio_post({
                        title: options.id,
                        type: type,
                        format: type,
                        size: blob.size,
                        artist: "unknown",
                        album: "unknown",
                        year: "unknown",
                        picture: "./unknown.jpg",
                        modified: now.toUTCString(),
                        date: now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate()
                    }, 0);
                }).then(function(res) {
                    gadget.putId = res.id;
                    return gadget.jio_putAttachment({
                        _id: res.id,
                        _attachment: "enclosure",
                        _blob: blob
                    }, 0);
                });
            }
        }).push(function() {
            return gadget.allDocs({
                include_docs: true
            });
        }).push(function(e) {
            var tmp = e.data.rows, i, j, exp;
            Handlebars.registerHelper("compare", function(v1, options) {
                if (v1 === "audio/mp3" || v1 === "audio/mpeg") {
                    return options.fn(this);
                }
                return options.inverse(this);
            });
            if (options.id !== undefined && options.id !== "localhost" && options.action !== "download") {
                tmp = [];
                for (i = 0, j = 0; i < e.data.rows.length; i += 1) {
                    exp = new RegExp(options.id, "i");
                    if (e.data.rows[i].doc.title.search(exp) !== -1) {
                        tmp[j] = e.data.rows[i];
                        j += 1;
                    }
                }
                gadget.id = options.id;
            }
            list.innerHTML = network({
                rows: tmp
            });
            $(list).listview("refresh");
            return gadget.displayThisTitle("localhost playlist: " + tmp.length + " media");
        }).fail(function(error) {
            if (!(error instanceof RSVP.CancellationError)) {
                if (error.target.error !== undefined && error.target.error.name === "QuotaExceededError") {
                    gadget.__element.getElementsByClassName("info")[0].innerHTML = "QuotaError";
                    if (gadget.putId) {
                        return gadget.jio_remove({
                            _id: gadget.putId
                        }, 0);
                    }
                    return;
                }
                gadget.__element.getElementsByClassName("info")[0].innerHTML = "please enable local server";
            }
        });
    }).declareMethod("startService", function() {
        var g = this, research = g.__element.getElementsByClassName("research")[0];
        if (g.id !== undefined) {
            research.value = g.id;
        }
        return new RSVP.Queue().push(function() {
            return g.plEnablePage();
        }).push(function() {
            return loopEventListener(research, "change", false, function() {
                return new RSVP.Queue().push(function() {
                    return g.displayThisPage({
                        page: "playlist",
                        id: research.value
                    });
                }).push(function(url) {
                    window.location = url;
                });
            });
        });
    });
})(window, rJS, jQuery, Handlebars, loopEventListener);