/*global console, require, $, localStorage, document */
"use strict";

/*
 * RenderJs - Generic Gadget library renderer.
 * http://www.renderjs.org/documentation
 */

// by default RenderJs will render all gadgets when page is loaded
// still it's possible to override this and use explicit gadget rendering
var RENDERJS_ENABLE_IMPLICIT_GADGET_RENDERING = true;

if (typeof require !== 'undefined') {
  // example of how we can use requirejs to load external libraries
  //require(["../../../../lib/jstorage/jstorage.js"], function (util) {
  //});
}

// fallback for IE
if (typeof console === "undefined" || typeof console.log === "undefined") {
  console = {};
  console.log = function () {};
}

var RenderJs = (function () {
    // a variable indicating if current gadget loading is over or not
    var is_ready = false;

    return {
        bootstrap: function (root) {
            /* initial load application gadget */
            var gadget_id;
            gadget_id = root.attr("id");
            if (gadget_id!==undefined) {
              // bootstart root gadget only if it is indeed a gadget
              RenderJs.loadGadgetFromUrl(root);
            }
            RenderJs.load(root);
        },

        load: function (root) {
            /* Load gadget layout by traversing DOM */
            var gadget_list;
            gadget_list = root.find("[data-gadget]");
            // Load chilren
            gadget_list.each(function () {
                RenderJs.loadGadgetFromUrl($(this));
            });
        },

        updateAndRecurse: function (gadget, data) {
            /* Update current gadget and recurse down */
            gadget.append(data);
            // a gadget may contain sub gadgets
            this.load(gadget);
        },

        loadGadgetFromUrl: function (gadget) {
            /* Load gadget's SPECs from URL */
            var url, gadget_id, gadget_property, cacheable, cache_id,
                app_cache, data, gadget_js;
            url = gadget.attr("data-gadget");
            gadget_id = gadget.attr("id");
            // register gadget in javascript namespace
            gadget_js = new RenderJs.Gadget(gadget_id, gadget);
            RenderJs.GadgetIndex.registerGadget(gadget_js);

            // update Gadget's instance with contents of "data-gadget-property"
            gadget_property = gadget.attr("data-gadget-property");
            if (gadget_property !== undefined) {
              gadget_property = $.parseJSON(gadget_property);
              $.each(gadget_property, function (key, value) {
                gadget_js[key] = value;
              });
            }

            if (url !== undefined && url !== "") {
                cacheable = gadget.attr("data-gadget-cacheable");
                cache_id = gadget.attr("data-gadget-cache-id");
                if (cacheable !== undefined && cache_id !== undefined) {
                    cacheable = Boolean(parseInt(cacheable, 10));
                }
                //cacheable = false ; // to develop faster
                if (cacheable) {
                    // get from cache if possible, use last part from URL as
                    // cache_key
                    app_cache = RenderJs.Cache.get(cache_id, undefined);
                    if (app_cache === undefined || app_cache === null) {
                        // not in cache so we pull from network and cache
                        $.ajax({
                            url: url,
                            yourCustomData: {
                                "gadget_id": gadget_id,
                                "cache_id": cache_id
                            },
                            success: function (data) {
                                cache_id = this.yourCustomData.cache_id;
                                gadget_id = this.yourCustomData.gadget_id;
                                RenderJs.Cache.set(cache_id, data);
                                RenderJs.GadgetIndex.getGadgetById(gadget_id).
                                    setReady();
                                RenderJs.updateAndRecurse(gadget, data);
                                RenderJs.checkAndTriggerReady();
                            }
                        });
                    } else {
                        // get from cache
                        data = app_cache;
                        gadget_js.setReady();
                        this.updateAndRecurse(gadget, data);
                        this.checkAndTriggerReady();
                    }
                } else {
                    // not to be cached
                    $.ajax({
                        url: url,
                        yourCustomData: {"gadget_id": gadget_id},
                        success: function (data) {
                            gadget_id = this.yourCustomData.gadget_id;
                            RenderJs.GadgetIndex.getGadgetById(gadget_id).
                                setReady();
                            RenderJs.updateAndRecurse(gadget, data);
                            RenderJs.checkAndTriggerReady();
                        }
                    });
                }
            } else {
                // gadget is an inline one so no need to load it from network
                gadget_js.setReady();
                RenderJs.checkAndTriggerReady();
            }
        },

        isReady: function (value) {
            /*
             * Get rendering status
             */
            return is_ready;
        },

        setReady: function (value) {
            /*
             * Update rendering status
             */
            is_ready = value;
        },

        checkAndTriggerReady: function () {
            /*
             * Trigger "ready" event only if all gadgets were marked as "ready"
             */
            var is_gadget_list_loaded;
            is_gadget_list_loaded = RenderJs.GadgetIndex.isGadgetListLoaded();
            if (is_gadget_list_loaded) {
                if (!RenderJs.isReady()) {
                    RenderJs.GadgetIndex.getRootGadget().getDom().
                        trigger("ready");
                    RenderJs.setReady(true);
                }
            }
            return is_gadget_list_loaded;
        },

        update: function (root) {
            /* update gadget with data from remote source */
            root.find("[gadget]").each(function (i, v) {
                RenderJs.updateGadgetData($(this));
            });
        },

        updateGadgetWithDataHandler: function (result) {
            var data_handler;
            data_handler = this.yourCustomData.data_handler;
            if (data_handler !== undefined) {
                eval(data_handler + "(result)");
            }
        },

        updateGadgetData: function (gadget) {
            /* Do real gagdet update here */
            var data_source, data_handler;
            data_source = gadget.attr("data-gadget-source");
            data_handler = gadget.attr("data-gadget-handler");
            // acquire data and pass it to method handler
            if (data_source !== undefined && data_source !== "") {
                $.ajax({
                    url: data_source,
                    dataType: "json",
                    yourCustomData: {"data_handler": data_handler},
                    success: RenderJs.updateGadgetWithDataHandler
                });
            }
        },

        addGadget: function (dom_id, gadget, gadget_data_handler,
                            gadget_data_source) {
            /*
             * add new gadget and render it
             */
            var html_string, tab_container, tab_gadget;
            tab_container = $('#' + dom_id);
            tab_container.empty();
            html_string = [
                '<div class="gadget" ',
                'data-gadget="' + gadget + '"',
                'data-gadget-handler="' + gadget_data_handler + '" ',
                'data-gadget-source="' + gadget_data_source + '"></div>'
            ].join('\n');

            tab_container.append(html_string);
            tab_gadget = tab_container.find(".gadget");
            // render new gadget
            RenderJs.setReady(false);
            RenderJs.loadGadgetFromUrl(tab_gadget);
            // clear previous events
            RenderJs.GadgetIndex.getRootGadget().getDom().bind(
                "ready",
                function () {
                    if (!is_ready) {
                        RenderJs.updateGadgetData(tab_gadget);
                        is_ready = true;
                    }
                }
            );
            return tab_gadget;
        },

        Cache: (function () {
            /*
             * Generic cache implementation that can fall back to local
             * namespace storage if no "modern" storage like localStorage
             * is available
             */
            return {
                ROOT_CACHE_ID: 'APP_CACHE',

                getCacheId: function (cache_id) {
                    /*
                     * We should have a way to 'purge' localStorage by setting a
                     * ROOT_CACHE_ID in all browser instances
                     */
                    return this.ROOT_CACHE_ID + cache_id;
                },

                hasLocalStorage: function () {
                    /*
                     * Feature test if localStorage is supported
                     */
                    var mod;
                    mod = 'localstorage_test_12345678';
                    try {
                        localStorage.setItem(mod, mod);
                        localStorage.removeItem(mod);
                        return true;
                    } catch (e) {
                        return false;
                    }
                },

                get: function (cache_id, default_value) {
                    /* Get cache key value */
                    cache_id = this.getCacheId(cache_id);
                    if (this.hasLocalStorage()) {
                        return this.LocalStorageCachePlugin.
                            get(cache_id, default_value);
                    }
                    //fallback to javscript namespace cache
                    return this.NameSpaceStorageCachePlugin.
                        get(cache_id, default_value);
                },

                set: function (cache_id, data) {
                    /* Set cache key value */
                    cache_id = this.getCacheId(cache_id);
                    if (this.hasLocalStorage()) {
                        this.LocalStorageCachePlugin.set(cache_id, data);
                    } else {
                        this.NameSpaceStorageCachePlugin.set(cache_id, data);
                    }
                },

                LocalStorageCachePlugin: (function () {
                    /*
                     * This plugin saves using HTML5 localStorage.
                     */
                    return {
                        get: function (cache_id, default_value) {
                            /* Get cache key value */
                            if (cache_id in localStorage) {
                              return JSON.parse(localStorage.getItem(cache_id));
                            }
                            else {
                              return default_value;
                            }
                        },

                        set: function (cache_id, data) {
                            /* Set cache key value */
                            localStorage.setItem(cache_id, JSON.stringify(data));
                        }
                    };
                }()),

                NameSpaceStorageCachePlugin: (function () {
                    /*
                     * This plugin saves within current page namespace.
                     */
                    var namespace = {};

                    return {
                        get: function (cache_id, default_value) {
                            /* Get cache key value */
                            return namespace[cache_id];
                        },

                        set: function (cache_id, data) {
                            /* Set cache key value */
                            namespace[cache_id] = data;
                        }
                    };
                }())
            };
        }()),

        Gadget: (function (gadget_id, dom) {
            /*
             * Javascript Gadget representation
             */
            this.id = gadget_id;
            this.dom = dom;
            this.is_ready = false;

            this.getId = function () {
                return this.id;
            };

            this.getDom = function () {
                return this.dom;
            };

            this.isReady = function () {
                /*
                 * Return True if remote gadget is loaded into DOM.
                 */
                return this.is_ready;
            };

            this.setReady = function () {
                /*
                 * Return True if remote gadget is loaded into DOM.
                 */
                this.is_ready = true;
            };
        }),

        TabbularGadget: (function () {
            /*
             * Generic tabular gadget
             */
            return {
                toggleVisibility: function (visible_dom) {
                    /*
                     * Set tab as active visually and mark as not active rest.
                     */
                    $(".selected").addClass("not_selected");
                    $(".selected").removeClass("selected");
                    visible_dom.addClass("selected");
                    visible_dom.removeClass("not_selected");
                },

                addNewTabGadget: function (dom_id, gadget, gadget_data_handler,
                                          gadget_data_source) {
                    /*
                     * add new gadget and render it
                     */
                    var tab_gadget;
                    tab_gadget = RenderJs.addGadget(
                        dom_id, gadget, gadget_data_handler, gadget_data_source
                    );
                    // XXX: we should unregister all gadgets (if any we replace now in DOM)
                }
            };
        }()),

        GadgetIndex: (function () {
            /*
             * Generic gadget index placeholder
             */
            var gadget_list = [];

            return {
                getGadgetList: function () {
                    /*
                     * Return list of registered gadgets
                     */
                    return gadget_list;
                },

                registerGadget: function (gadget) {
                    /*
                     * Register gadget
                     */
                    gadget_list.push(gadget);
                },

                unregisterGadget: function (gadget) {
                    /*
                     * Unregister gadget
                     */
                    var index = $.inArray(gadget, gadget_list);
                    if (index !== -1) {
                        gadget_list.splice(index, 1);
                    }
                },

                getGadgetById: function (gadget_id) {
                    /*
                     * Get gadget javascript representation by its Id
                     */
                    var gadget;
                    gadget = undefined;
                    $(RenderJs.GadgetIndex.getGadgetList()).each(
                        function (index, value) {
                            if (value.getId() === gadget_id) {
                                gadget = value;
                            }
                        }
                    );
                    return gadget;
                },

                getRootGadget: function () {
                    /*
                     * Return root gadget (always first one in list)
                     */
                    return this.getGadgetList()[0];
                },

                isGadgetListLoaded: function () {
                    /*
                     * Return True if all gadgets were loaded from network or
                     * cache
                     */
                    var result;
                    result = true;
                    $(this.getGadgetList()).each(
                        function (index, value) {
                            if (value.isReady() === false) {
                                result = false;
                            }
                        }
                    );
                    return result;
                }
            };
        }()),

        InteractionGadget : (function () {
            /*
             * Basic gadget interaction gadget implementation.
             */
            return {
                bind: function (gadget_dom) {
                    /*
                     * Bind event between gadgets.
                     */
                    var gadget_id, gadget_connection_list;
                    var createMethodInteraction = function (
                        original_source_method_id, source_gadget_id,
                        source_method_id, destination_gadget_id,
                        destination_method_id) {
                        var interaction = function () {
                            RenderJs.GadgetIndex.getGadgetById(
                                source_gadget_id)[original_source_method_id].
                                apply(null, arguments);
                            RenderJs.GadgetIndex.getGadgetById(
                                destination_gadget_id)[destination_method_id]();
                        };
                        return interaction;
                    },
                    createTriggerInteraction = function (
                        destination_gadget_id, destination_method_id) {
                        var interaction = function () {
                            RenderJs.GadgetIndex.getGadgetById(
                                destination_gadget_id)[destination_method_id].
                                apply(null, arguments);
                        };
                        return interaction;
                    };
                    gadget_id = gadget_dom.attr("id");
                    gadget_connection_list = gadget_dom.attr("data-gadget-connection");
                    gadget_connection_list = $.parseJSON(gadget_connection_list);
                    $.each(gadget_connection_list, function (key, value) {
                        var source, source_gadget_id, source_method_id,
                        source_gadget, destination, destination_gadget_id,
                        destination_method_id, destination_gadget,
                        original_source_method_id;
                        source = value['source'].split(".");
                        source_gadget_id = source[0];
                        source_method_id = source[1];
                        source_gadget = RenderJs.GadgetIndex.
                            getGadgetById(source_gadget_id);

                        destination = value['destination'].split(".");
                        destination_gadget_id = destination[0];
                        destination_method_id = destination[1];
                        destination_gadget = RenderJs.GadgetIndex.
                            getGadgetById(destination_gadget_id);

                        if (source_gadget.hasOwnProperty(source_method_id)) {
                            // direct javascript use case
                            original_source_method_id = "original_" +
                                source_method_id;
                            source_gadget[original_source_method_id] =
                                source_gadget[source_method_id];
                            source_gadget[source_method_id] =
                                createMethodInteraction(
                                    original_source_method_id,
                                    source_gadget_id,
                                    source_method_id,
                                    destination_gadget_id,
                                    destination_method_id
                                );
                        }
                        else {
                            // this is a custom event attached to HTML gadget
                            // representation
                            source_gadget.dom.bind(
                                source_method_id,
                                createTriggerInteraction(
                                    destination_gadget_id, destination_method_id
                                )
                            );
                        }
                    });
                }
            };
        }())
    };
}());

// impliticly call RenderJs bootstrap
$(document).ready(function () {
    if (RENDERJS_ENABLE_IMPLICIT_GADGET_RENDERING) {
        RenderJs.bootstrap($('body'));
    }
});
