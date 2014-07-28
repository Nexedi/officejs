/*global window, rJS, RSVP, console, URL, Math, parseInt, document, jIO,
  Uint8Array, Audio, loopEventListener, jQuery, promiseEventListener*/
/*jslint nomen: true, maxlen:180 */
(function(window, rJS, RSVP, loopEventListener, $, promiseEventListener) {
    "use strict";
    var gk = rJS(window), AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudiocontext || window.msAudioContext, audioCtx = new AudioContext(), MediaSource = window.MediaSource || window.WebKitMediaSource, myLoopEventListener = function(target, type, callback, allowDefault) {
        //////////////////////////
        // Infinite event listener (promise is never resolved)
        // eventListener is removed when promise is cancelled/rejected
        //////////////////////////
        var handle_event_callback, callback_promise;
        function cancelResolver() {
            if (callback_promise !== undefined && typeof callback_promise.cancel === "function") {
                callback_promise.cancel();
            }
        }
        function canceller() {
            if (handle_event_callback !== undefined) {
                target.unbind(type, handle_event_callback);
            }
            cancelResolver();
        }
        function itsANonResolvableTrap(resolve, reject) {
            handle_event_callback = function(evt) {
                evt.stopPropagation();
                if (allowDefault !== true) {
                    evt.preventDefault();
                }
                cancelResolver();
                callback_promise = new RSVP.Queue().push(function() {
                    return callback(evt);
                }).push(undefined, function(error) {
                    if (!(error instanceof RSVP.CancellationError)) {
                        canceller();
                        reject(error);
                    }
                });
            };
            target.bind(type, handle_event_callback);
        }
        return new RSVP.Promise(itsANonResolvableTrap, canceller);
    };
    function timeFormat(seconds) {
        var result = "00:" + Math.round(seconds), min, sec;
        if (seconds > 59) {
            min = Math.floor(seconds / 60);
            sec = Math.floor(seconds % 60);
            result = (min > 9 ? min : "0" + min) + ":" + (sec > 9 ? sec : "0" + sec);
        }
        return result;
    }
    function getTime(context, x) {
        var posX = x, targetLeft = $(context).offset().left;
        posX = (posX - targetLeft) / $(context).width();
        return posX * context.max;
    }
    function getFFTValue(gadget) {
        var array = new Uint8Array(gadget.analyser.frequencyBinCount);
        gadget.analyser.getByteFrequencyData(array);
        return array;
    }
    function set(url) {
        //configure a song
        var gadget = this;
        gadget.source.connect(gadget.filter);
        gadget.filter.connect(gadget.analyser);
        gadget.analyser.connect(gadget.gain);
        gadget.gain.connect(audioCtx.destination);
    }
    function promiseRequestAnimation(callback) {
        var animationId, callback_promise;
        function canceller() {
            window.cancelAnimationFrame(animationId);
            if (callback_promise !== undefined) {
                callback_promise.cancel();
            }
        }
        //xxx
        function resolver(resolve, reject) {
            function tmp() {
                callback_promise = new RSVP.Queue().push(function() {
                    callback();
                    animationId = window.requestAnimationFrame(tmp);
                }).push(undefined, function(error) {
                    canceller();
                    reject(error);
                });
            }
            animationId = window.requestAnimationFrame(tmp);
        }
        return new RSVP.Promise(resolver, canceller);
    }
    function play() {
        var that = this, canvas = that.canvas, canvasCtx = canvas.getContext("2d"), cwidth = canvas.width, cheight = canvas.height - 2, meterWidth = 8, //width of the meters in the spectrum
        capHeight = 2, meterNum = 300, array, drawFrame, step, i, value, bar_context = that.__element.getElementsByClassName("bar")[0], time_context = that.__element.getElementsByClassName("time")[0], gradient = canvasCtx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(1, "#0f0");
        gradient.addColorStop(.5, "#ff0");
        gradient.addColorStop(0, "#f00");
        that.audio.play();
        drawFrame = function() {
            array = getFFTValue(that);
            canvasCtx.clearRect(0, 0, cwidth, cheight);
            step = Math.round(array.length / meterNum);
            bar_context.value = that.audio.currentTime;
            time_context.innerHTML = timeFormat(that.audio.duration - that.audio.currentTime);
            for (i = 0; i < meterNum; i += 1) {
                value = array[i * step];
                canvasCtx.fillStyle = gradient;
                canvasCtx.fillRect(i * 12, cheight - value + capHeight, meterWidth, cheight);
            }
        };
        return promiseRequestAnimation(drawFrame);
    }
    gk.declareAcquiredMethod("jio_getAttachment", "jio_getAttachment").declareAcquiredMethod("jio_get", "jio_get").declareAcquiredMethod("jio_remove", "jio_remove").declareAcquiredMethod("plSave", "plSave").declareAcquiredMethod("plGive", "plGive").declareAcquiredMethod("displayThisPage", "displayThisPage").declareAcquiredMethod("displayThisTitle", "displayThisTitle").declareAcquiredMethod("allDocs", "allDocs").declareAcquiredMethod("plEnablePage", "plEnablePage").declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash").declareMethod("render", function(options) {
        var g = this;
        if (options.id) {
            return new RSVP.Queue().push(function() {
                return g.plGive("type");
            }).push(function(value) {
                g.filter.type = value || 0;
                return g.plGive("value");
            }).push(function(value) {
                value = value || 5e3;
                g.filter.frequency.value = value;
                g.currentId = options.id;
            }).push(function() {
                return g.allDocs({
                    include_docs: true
                });
            }).push(function(e) {
                var list = e.data.rows, id, index = 0, control = "control";
                if (list.length === 1) {
                    id = g.currentId;
                } else {
                    do {
                        index = Math.floor(Math.random() * list.length);
                        id = list[index].id;
                    } while (g.currentId === id);
                }
                if (list[index].doc.format === "video/webm") {
                    control = "video_control";
                }
                return g.displayThisPage({
                    page: control,
                    id: id,
                    action: options.action
                });
            }).push(function(url) {
                g.__element.getElementsByClassName("next")[0].href = url;
                g.index = 0;
                g.id = options.id;
                return g.jio_get({
                    _id: options.id
                });
            }).push(function(result) {
                var share_context = g.__element.getElementsByClassName("share")[0];
                share_context.href = "https://twitter.com/intent/tweet?hashtags=MusicPlayer&text=" + encodeURI(result.data.title);
                g.length = Object.keys(result.data._attachment).length;
                return g.displayThisTitle(options.action + " : " + result.data.title);
            }).push(function() {
                return g.jio_getAttachment({
                    _id: options.id,
                    _attachment: "enclosure0"
                });
            }).push(function(blob) {
                g.sourceBuffer = g.mediaSource.addSourceBuffer("audio/mpeg;");
                return jIO.util.readBlobAsArrayBuffer(blob).then(function(e) {
                    g.sourceBuffer.appendBuffer(new Uint8Array(e.target.result));
                    g.audio.play();
                    g.fin = true;
                });
            }).push(undefined, function(error) {
                if (!(error instanceof RSVP.CancellationError)) {
                    window.location = g.__element.getElementsByClassName("next")[0].href;
                    return g.jio_remove({
                        _id: error.id
                    });
                }
            });
        }
    }).declareMethod("startService", function() {
        var g = this, command_context = g.__element.getElementsByClassName("command")[0], mute_context = g.__element.getElementsByClassName("mute")[0], bar_context = g.__element.getElementsByClassName("bar")[0], box_context = g.__element.getElementsByClassName("box")[0], filter_context = g.__element.getElementsByClassName("filter")[0], filter_type = $("select"), loop_context = g.__element.getElementsByClassName("loop")[0], loop = false, time_context = g.__element.getElementsByClassName("time")[0];
        bar_context.value = 0;
        return new RSVP.Queue().push(function() {
            set.call(g, g.url);
            return RSVP.all([ g.plEnablePage(), g.plGive("loop"), g.plGive("mute") ]);
        }).push(function(list) {
            if (list[1]) {
                loop = true;
                loop_context.innerHTML = "loop on";
            } else {
                loop_context.innerHTML = "loop off";
            }
            if (list[2] !== undefined) {
                g.gain.gain.value = list[2];
                mute_context.innerHTML = list[2] ? "mute off" : "mute on";
            }
            time_context.style.left = bar_context.style.left;
            $(time_context).offset().top = $(bar_context).offset().top + 3;
            time_context.innerHTML = timeFormat(g.audio.duration);
            return RSVP.any([ play.call(g), loopEventListener(g.sourceBuffer, "updateend", false, function() {
                if (!g.fin) {
                    return;
                }
                g.fin = false;
                if (g.index >= g.length - 1) {
                    g.mediaSource.endOfStream();
                    bar_context.max = g.audio.duration;
                    return;
                }
                g.index += 1;
                return g.jio_getAttachment({
                    _id: g.id,
                    _attachment: "enclosure" + g.index
                }).then(function(blob) {
                    return jIO.util.readBlobAsArrayBuffer(blob);
                }).then(function(e) {
                    g.fin = true;
                    return g.sourceBuffer.appendBuffer(new Uint8Array(e.target.result));
                });
            }), loopEventListener(mute_context, "click", false, function() {
                mute_context.innerHTML = g.gain.gain.value ? "mute on" : "mute off";
                g.gain.gain.value = (g.gain.gain.value + 1) % 2;
                return g.plSave({
                    mute: g.gain.gain.value
                });
            }), loopEventListener(g.audio, "ended", false, function() {
                if (loop) {
                    g.audio.currentTime = 0;
                    g.audio.play();
                } else {
                    window.location = g.__element.getElementsByClassName("next")[0].href;
                }
            }), loopEventListener(command_context, "click", false, function() {
                if (g.audio.paused) {
                    g.audio.play();
                    command_context.innerHTML = "stop";
                } else {
                    g.audio.pause();
                    command_context.innerHTML = "play";
                }
            }), loopEventListener(bar_context, "click", false, function(event) {
                g.audio.currentTime = getTime(bar_context, event.clientX);
                bar_context.value = g.audio.currentTime;
                g.audio.play();
                command_context.innerHTML = "stop";
            }), loopEventListener(bar_context, "mousemove", false, function(event) {
                var time = getTime(bar_context, event.clientX);
                box_context.style.left = (event.clientX - 20) / 16 + "em";
                box_context.style.display = "block";
                box_context.innerHTML = timeFormat(time);
            }), loopEventListener(bar_context, "mouseout", false, function() {
                box_context.style.display = "none";
            }), loopEventListener(loop_context, "click", false, function() {
                loop_context.innerHTML = loop ? "loop off" : "loop on";
                loop = !loop;
                return g.plSave({
                    loop: loop
                });
            }), myLoopEventListener($(filter_context), "change", function() {
                g.filter.frequency.value = filter_context.value;
                return g.plSave({
                    value: filter_context.value
                });
            }), myLoopEventListener(filter_type, "change", function() {
                var type = parseInt(filter_type.val(), 10);
                g.filter.type = type;
                return g.plSave({
                    type: type
                });
            }) ]);
        });
    });
    gk.ready(function(g) {
        g.audio = g.__element.getElementsByTagName("audio")[0];
        g.audio.style.display = "none";
        g.source = audioCtx.createMediaElementSource(g.audio);
        g.analyser = audioCtx.createAnalyser();
        g.gain = audioCtx.createGain();
        g.filter = audioCtx.createBiquadFilter();
        g.canvas = g.__element.getElementsByTagName("canvas")[0];
        g.mediaSource = new MediaSource();
        g.audio.src = URL.createObjectURL(g.mediaSource);
    });
})(window, rJS, RSVP, loopEventListener, jQuery, promiseEventListener);