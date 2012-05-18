// fallback for IE
if (typeof console === "undefined" || typeof console.log === "undefined") {
  console = {};
  console.log = function() {};
}


/*
 * Generic Gadget library renderer
 */

var RenderJs = (function () {

  // a variable indicating if current gadget loading is over or not
  var is_ready = false;
  
  return  {
   
          bootstrap: function (root){
                    /* initial load application gadget */
                    RenderJs.loadGadgetFromUrl(root);
                    RenderJs.load(root);
          },

          load: function (root) {
                    /* Load gadget layout by traversing DOM */
                    var gadget_list;
                    gadget_list = root.find("[gadget]");
                    // Load chilren
                    gadget_list.each(function() {
                      RenderJs.loadGadgetFromUrl($(this));
                    });
          },

          updateAndRecurse: function(gadget, data){
                    /* Update current gadget and recurse down */
                    gadget.append(data);
                    // a gadget may contain sub gadgets
                    this.load(gadget);
          },

          loadGadgetFromUrl: function(gadget) {
                    /* Load gadget's SPECs from URL */
                    var url, gadget_id, gadget_property, cacheable, cache_id, app_cache, data, gadget_js;
                    url = gadget.attr("gadget");
                    gadget_id = gadget.attr("id");

                    // register gadget in javascript namespace
                    gadget_js = new RenderJs.Gadget(gadget_id, gadget);
                    RenderJs.GadgetIndex.registerGadget(gadget_js);

                    if (url!==undefined && url!==""){
                      gadget_property = gadget.attr("gadget:property");
                      cacheable = false;
                      if (gadget_property!==undefined) {
                        gadget_property = $.parseJSON(gadget_property);
                        cacheable = Boolean(gadget_property.cacheable);
                      }
                      //cacheable = false ; // to develop faster
                      if (cacheable) {
                          // get from cache if possible, use last part from URL as cache_key
                          cache_id = gadget_property.cache_id;
                          app_cache = RenderJs.Cache.get(cache_id, undefined);
                          if(app_cache===undefined || app_cache===null){
                            // not in cache so we pull from network and cache
                            //console.log("not in cache: " + cache_id + "  " + url);
                            $.ajax({url:url,
                                    yourCustomData: {"gadget_id": gadget_id, "cache_id": cache_id},
                                    success: function (data) {
                                                cache_id = this.yourCustomData.cache_id;
                                                gadget_id = this.yourCustomData.gadget_id;
                                                //console.log("set in cache: " + cache_id);
                                                RenderJs.Cache.set(cache_id, data);
                                                RenderJs.GadgetIndex.getGadgetById(gadget_id).setReady();
                                                RenderJs.updateAndRecurse(gadget, data);
                                                RenderJs.checkAndTriggerReady();
                                      }});
                          }
                          else {
                            // get from cache
                            data = app_cache;
                            gadget_js.setReady();
                            this.updateAndRecurse(gadget, data);
                            this.checkAndTriggerReady();
                          }
                        }
                      else {
                        // not to be cached
                        //console.log("Not to be cached " + url + gadget_id);
                        $.ajax({url:url,
                                yourCustomData: {"gadget_id": gadget_id},
                                success: function (data) {
                                  gadget_id = this.yourCustomData.gadget_id;
                                  RenderJs.GadgetIndex.getGadgetById(gadget_id).setReady();
                                  RenderJs.updateAndRecurse(gadget, data);
                                  RenderJs.checkAndTriggerReady();
                                }});
                      }
                    }
                    else {
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
          
          checkAndTriggerReady: function() {
            /*
            * Trigger "ready" event only if all gadgets were marked as "ready"
            */
            var is_gadget_list_loaded;
            is_gadget_list_loaded = RenderJs.GadgetIndex.isGadgetListLoaded();
            if (is_gadget_list_loaded){
              //console.log("to trigger ");
              if (!RenderJs.isReady()) {
                //console.log("trigger ", RenderJs.GadgetIndex.getGadgetList());
                RenderJs.GadgetIndex.getRootGadget().getDom().trigger("ready");
                RenderJs.setReady(true);
              }
              //is_ready = true;
            }
            return is_gadget_list_loaded;
          },

          update: function (root) {
                    /* update gadget with data from remote source */
                    root.find("[gadget]").each(function(i,v){RenderJs.updateGadgetData($(this));});
          },

          updateGadgetWithDataHandler: function (result) {
                                        var data_handler;
                                        data_handler = this.yourCustomData.data_handler;
                                        if (data_handler!==undefined){
                                          eval(data_handler+ "(result)");
                                        }
          },

          updateGadgetData: function(gadget) {
                    /* Do real gagdet update here */
                    var data_source, data_handler;
                    data_source = gadget.attr("gadget:data-source");
                    data_handler = gadget.attr("gadget:data-handler");
                    // acquire data and pass it to method handler
                    if (data_source!==undefined){
                      $.ajax({url:data_source,
                              dataType: "json",
                              yourCustomData: {"data_handler": data_handler},
                              success: RenderJs.updateGadgetWithDataHandler});}
          },

          Cache : (function() {
                  /*
                  * Generic cache implementation that can fall back to local namespace storage
                  * if no "modern" storage like localStorage is available
                  */

                  return {

                    ROOT_CACHE_ID: 'APP_CACHE',

                    getCacheId: function (cache_id) {
                      /* We should have a way to 'purge' localStorage by setting a ROOT_CACHE_ID in all browser
                      * instances
                      */
                      return this.ROOT_CACHE_ID + cache_id;
                    },

                    hasLocalStorage: function() {
                      /*
                      * Feature test if localStorage is supported
                      */
                      var mod;
                      mod = 'localstorage_test_12345678';
                      try {
                          localStorage.setItem(mod, mod);
                          localStorage.removeItem(mod);
                          return true;
                      }
                      catch (e) {
                          return false;
                      }
                    },

                    get: function (cache_id, default_value) {
                      /* Get cache key value */
                      cache_id = this.getCacheId(cache_id);
                      if (this.hasLocalStorage()) {
                        return this.LocalStorageCachePlugin.get(cache_id, default_value);
                      }
                      //fallback to javscript namespace cache
                      return this.NameSpaceStorageCachePlugin.get(cache_id, default_value);
                    },

                    set: function (cache_id, data) {
                      /* Set cache key value */
                      cache_id = this.getCacheId(cache_id);
                      if (this.hasLocalStorage()){
                        this.LocalStorageCachePlugin.set(cache_id, data);}
                      else{
                        this.NameSpaceStorageCachePlugin.set(cache_id, data);}
                    },

                    LocalStorageCachePlugin : (function() {
                      /*
                      * This plugin saves using HTML5 localStorage.
                      */
                      return {
                              get: function (cache_id, default_value) {
                                /* Get cache key value */
                                return $.jStorage.get(cache_id, default_value);
                              },

                              set: function (cache_id, data) {
                                /* Set cache key value */
                                $.jStorage.set(cache_id, data);
                              }
                      }}()),

                      NameSpaceStorageCachePlugin: (function() {
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

                        }}())

          }}()),

          Gadget: ( function (id, dom) {
                  /*
                  * Javascript Gadget representation
                  */
                  this.id = id;
                  this.dom = dom;
                  this.is_ready = false;

                  this.getId = function() {
                    return this.id;
                  };

                  this.getDom = function() {
                    return this.dom;
                  };

                  this.isReady = function() {
                    /*
                    * Return True if remote gadget is loaded into DOM.
                    */
                    return this.is_ready;
                  };

                  this.setReady = function() {
                    /*
                    * Return True if remote gadget is loaded into DOM.
                    */
                    this.is_ready = true;
                  };
          }),
                
          TabbularGadget : (function () {
                  /*
                  * Generic tabular gadget
                  */
                  return {

                        toggleVisibility: function(visible_dom) {
                          /*
                          * Set tab as active visually and mark as not active rest.
                          */
                          $(".selected").addClass("not_selected"); $(".selected").removeClass("selected");
                          visible_dom.addClass("selected");
                          visible_dom.removeClass("not_selected");
                        },

                        addNewTabGadget: function(dom_id, gadget, gadget_data_handler, gadget_data_source) {
                          /*
                          * add new gadget and render it
                          */
                          var html_string;
                          tab_container=$('#'+dom_id);
                          tab_container.empty();
                          html_string =['<div class="gadget" ',
                                        'gadget="' + gadget + '"',
                                        'gadget:data-handler="' + gadget_data_handler + '" ',
                                        'gadget:data-source="' + gadget_data_source +'"></div>'].join('\n');

                          tab_container.append(html_string);
                          tab_gadget = tab_container.find(".gadget");

                          // XXX: we should unregister all gadgets (if any we replace now in DOM)

                          // render new gadget
                          RenderJs.setReady(false);
                          RenderJs.loadGadgetFromUrl(tab_gadget);
                          // clear previous events
                          RenderJs.GadgetIndex.getRootGadget().getDom().bind("ready", function (){
                            if (!is_ready){
                              RenderJs.updateGadgetData(tab_gadget);
                              is_ready = true;
                            }
                          });
                        }

          }}()),


          GadgetIndex : (function () {
                  /*
                  * Generic gadget index placeholder
                  */
                  var gadget_list = [];

                  return  {

                        getGadgetList: function() {
                          /*
                          * Return list of registered gadgets
                          */
                          return gadget_list;
                        },

                        registerGadget: function(gadget) {
                          /*
                          * Register gadget
                          */
                          gadget_list.push(gadget);
                        },

                        unregisterGadget: function(gadget) {
                          /*
                          * Unregister gadget
                          */
                          var index = $.inArray(gadget, gadget_list);
                          if (index!==-1) {
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
                              if (value.getId()===gadget_id) {
                                gadget = value;
                              }});
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
                          * Return True if all gadgets were loaded from network or cache
                          */
                          var result;
                          result = true;
                          $(this.getGadgetList()).each(
                            function (index, value) {
                              if (value.isReady()===false) {
                                result = false;
                              }
                            });
                          return result;
                        },

                        getSelf: function (){
                          /*
                          * Return Gadget's Javascript representation
                          */
                          // XXX:
                        }

          }}()),

          InteractionGadget : (function () {
                  /*
                  * Basic gadget interaction gadget implementation.
                  */
                  return {

                      bind: function (gadget_dom){
                        /*
                        * Bind event between gadgets.
                        */
                        gadget_id = gadget_dom.attr("id");
                        gadget_dom.find("connect").each(function (key, value){
                          var source, source_gadget_id, source_method_id, source_gadget, destination, destination_gadget_id,
                              destination_method_id, destination_gadget, func_body, func;
                          source = $(value).attr("source").split(".");
                          source_gadget_id = source[0];
                          source_method_id = source[1];
                          source_gadget = RenderJs.GadgetIndex.getGadgetById(source_gadget_id);

                          destination = $(value).attr("destination").split(".");
                          destination_gadget_id = destination[0];
                          destination_method_id = destination[1];
                          destination_gadget = RenderJs.GadgetIndex.getGadgetById(destination_gadget_id);

                          if (source_gadget.hasOwnProperty(source_method_id)){
                            // direct javascript use case
                            func_body = 'RenderJs.GadgetIndex.getGadgetById("' + source_gadget_id + '")["original_' + source_method_id + '"]();';
                            func_body = func_body + '\nRenderJs.GadgetIndex.getGadgetById("' + destination_gadget_id + '")["' + destination_method_id + '"]();';
                            func = new Function(func_body);
                            source_gadget["original_" + source_method_id] = source_gadget[source_method_id];
                            source_gadget[source_method_id] =  func;
                          }
                          else{
                            // this is a custom event attached to HTML gadget representation
                            func_body = 'RenderJs.GadgetIndex.getGadgetById("' + destination_gadget_id + '")["' + destination_method_id + '"]();';
                            func = new Function(func_body);
                            source_gadget.dom.bind(source_method_id, func);
                          }
                          console.log(source_gadget_id, '.', source_method_id, '-->', destination_gadget_id, '.', destination_method_id);
                        }
                        );
                      }
          }}())

  }}());