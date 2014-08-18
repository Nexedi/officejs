/*globals window, document, RSVP, rJS, $, DOMParser, Strophe, $msg, jIO*/
(function($, rJS) {
    "use strict";
    var jio_instance, hist = {}, hist_id = {};
    function getHistoryString(jid, sourceJID, message) {
        var date = new Date(), timestamp = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " ", result;
        timestamp += date.toTimeString();
        result = "[" + timestamp + "]: ";
        result += sourceJID + ": ";
        result += message;
        return result + "\n";
    }
    rJS(window).declareMethod("setJIOConfig", function(jioConf) {
        var rows;
        jio_instance = jIO.createJIO(JSON.parse(jioConf));
        return jio_instance.allDocs().then(function(response) {
            rows = response.data.rows;
        }).then(function() {
            var queue = new RSVP.Queue();
            rows.forEach(function(row) {
                queue.push(function() {
                    return jio_instance.get({
                        _id: row.id
                    });
                }).push(function(response) {
                    var data = response.data;
                    hist_id[data.jid] = row.id;
                    hist[data.jid] = data.history;
                });
            });
            return queue;
        });
    }).declareMethod("addLog", function(jid, sourceJID, message) {
        var history = getHistoryString(jid, sourceJID, message);
        if (!hist_id[jid]) {
            hist[jid] = history;
            return jio_instance.post({
                jid: jid,
                history: hist[jid]
            }).then(function(response) {
                hist_id[jid] = response.data.id;
            });
        }
        hist[jid] += history;
        return jio_instance.put({
            _id: hist_id[jid],
            jid: jid,
            history: hist[jid]
        });
    }).declareMethod("getLogs", function(jid) {
        return jio_instance.get({
            _id: hist_id[jid]
        }).then(function(response) {
            return response.data.history;
        }).fail(function(e) {
            throw new Error(e);
        });
    }).ready(function(g) {
        window.g = g;
    });
})($, rJS);