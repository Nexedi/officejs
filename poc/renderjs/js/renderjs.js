// fallback for IE
if (typeof console === "undefined" || typeof console.log === "undefined") {
  console = {};
  console.log = function() {};
}

/*
 * Generic cache implementation that can fall back to local namespace storage
 * if no "modern" storage like localStorage is available
 */
var is_ready;
is_ready = false; // dirty flag to be removed (indicates if ready event has been handled)

var NameSpaceStorageCachePlugin = {
  /*
   * This plugin saves within current page namespace.
   */
  
  namespace: {},
  
  get: function (cache_id, default_value) {
    /* Get cache key value */
    return this.namespace[cache_id];
  },

  set: function (cache_id, data) {
    /* Set cache key value */
    this.namespace[cache_id] = data;
  }

};


var LocalStorageCachePlugin = {
  /*
   * This plugin saves using HTML5 localStorage.
   */
  
  get: function (cache_id, default_value) {
    /* Get cache key value */
    return $.jStorage.get(cache_id, default_value);
  },

  set: function (cache_id, data) {
    /* Set cache key value */
    $.jStorage.set(cache_id, data);
  }

};

var Cache = {
  
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
      return LocalStorageCachePlugin.get(cache_id, default_value);
    }
    //fallback to javscript namespace cache
    return NameSpaceStorageCachePlugin.get(cache_id, default_value);
  },

  set: function (cache_id, data) {
    /* Set cache key value */
    cache_id = this.getCacheId(cache_id);
    if (this.hasLocalStorage()){
      LocalStorageCachePlugin.set(cache_id, data);}
    else{
      NameSpaceStorageCachePlugin.set(cache_id, data);}
  }

};

/*
 * Generic tabular gadget
 */
var TabbularGadget = {

  toggleVisibility: function(visible_dom) {
    /*
     * Set tab as active visually and mark as not active rest.
     */
    $(".selected").addClass("not_selected"); $(".selected").removeClass("selected");
    visible_dom.addClass("selected");
    visible_dom.removeClass("not_selected");
  },
  
  addNewTabGadget: function(gadget_url, dom_id, gadget_data_handler) {
    // add new gadget and render it
    var html_string;
    var html_string_array;
    tab_container=$('#'+dom_id);
    tab_container.empty();
    // XXX: allow add any gadget,gadget:source items within API
    html_string_array = ['<div class="gadget" ',
                  'gadget="' + gadget_url + '"']
    if (gadget_data_handler !== undefined) {
      html_string_array.push('gadget:data-handler="' + gadget_data_handler + '" ');
      html_string_array.push('gadget:data-source="Form_asJSON?form_id=' + form_id + '">');
    }
    html_string_array.push('</div>')
    html_string = html_string_array.join('\n');
                  
    tab_container.append(html_string);
    tab_gadget = tab_container.find(".gadget");

    //The above line sounds not generic enough
    //Form.setCurrentFormId(form_id);
                
    // render new gadget
    is_ready = false;
    RenderJs.loadGadgetFromUrl(tab_gadget);
    // clear previous events
    GadgetIndex.getRootGadget().getDom().bind("ready", function (){
      if (!is_ready){
        RenderJs.updateGadgetData(tab_gadget);
        is_ready = true;
      }
    });
  }
  
};

/*
  Form field renderer
*/
var Form = {

  // elements marked with this class can be serizlized to server
  SERIALIZE_ABLE_CLASS_NAME: "serialize-able",

  CURRENT_FORM_ID: "",

  getCurrentFormId: function () {
                    /* Get current form ID (return hard coded one for now) */
                    return this.CURRENT_FORM_ID;
  },

  setCurrentFormId: function (form_id) {
                    /* Set current form ID (return hard coded one for now) */
                    this.CURRENT_FORM_ID = form_id;
  },
  
  getFieldId: function(field_id) {
              /* Generate local form field id */
              return "field_" + field_id;
  },

  updateField: function (dom, field_dict) {
              /* General purpose field updater */
              var editable;
              editable = Boolean(field_dict.editable);
              if (editable){
                dom.val(field_dict.value);}
              else{
                // if field is not editable just show its value
                dom.replaceWith(field_dict.value);
              }
  },

  addOptionTagList: function (select_dom, item_list, field_value) {
              /*
               * Update select like dom element
               */
              $.each(item_list, function (index, value){
                  if(value[1]===field_value) {
                    select_dom.append('<option selected value="' + value[1] + '">'  + value[0] + '</option>');
                  }
                  else {
                    select_dom.append('<option value="' + value[1] + '">'  + value[0] + '</option>');
                  }
                });
  },
               
  BaseInputField: function (field_id, field_dict) {
              /* HTML based input field */
              var dom, display_width;
              dom = $("[name=" + this.getFieldId(field_id) + "]");
              this.updateField(dom, field_dict);
              display_width = field_dict.display_width;
              if (display_width){
                dom.attr("size", display_width);}
              return dom;
  },
  
  EditorField: function (field_id, field_dict) {
              /* HTML based input field */
              var dom;
              dom = $("#" + this.getFieldId(field_id));
              this.updateField(dom, field_dict);
              return dom;
  },
  
  ListField: function (field_id, field_dict) {
              /* Select field */
              var field_value, select_dom;
              field_value = field_dict.value;
              select_dom = $("select[name=" + this.getFieldId(field_id) + "]");
              this.addOptionTagList(select_dom, field_dict.items, field_value);
              return select_dom;              
  },
  
  ParallelListField: function (field_id, field_dict) {
              /* mutiple select fields */
              var field_value, select_dom;              
              // XXX: we render only first value but it can be many how to get them ?
              field_value = field_dict.value[0];
              select_dom = $("select[name=subfield_field_" + field_id + "]");
              this.addOptionTagList(select_dom, field_dict.items, field_value);
              return select_dom;
  },
  
  CheckBoxField: function (field_id, field_dict) {
              /* CheckBoxField field */
              var checked, checkbox_dom;
              checked = Boolean(field_dict.value);
              checkbox_dom = $("input[name=" + this.getFieldId(field_id) + "]");
              if (checked) {
                  checkbox_dom.attr('checked', true);
              }
              return checkbox_dom;
  },

  TextAreaField: function (field_id, field_dict) {
              /* TextArea field */
              return this.BaseInputField(field_id, field_dict);
  },
  
  StringField: function (field_id, field_dict) {
              /* String field */
              return this.BaseInputField(field_id, field_dict);
  },
  
  IntegerField: function (field_id, field_dict) {
              /* Int field */
              return this.BaseInputField(field_id, field_dict);
  },
  
  PasswordField: function (field_id, field_dict) {
              /* PasswordField field */
              return this.BaseInputField(field_id, field_dict);
  },

  DateTimeField: function (field_id, field_dict) {
              /* DateTimeField field */
              var date, dom;
              dom = $("[name=" + this.getFieldId(field_id) + "]");
              date = field_dict.value;
              date = new Date(date);
              dom.datepicker({ dateFormat: 'dd/mm/yy' }); // XXX: get format from server!
              dom.datepicker('setDate', date);
              return dom;
  },
  
  EmailField: function (field_id, field_dict) {
              /* Email field */
              return this.BaseInputField(field_id, field_dict);
  },
  
  FormBox: function (field_id, field_dict) {
              /* Email field */
              return this.BaseInputField(field_id, field_dict);
  },

  RelationStringField: function (field_id, field_dict) {
              /* Relation field */
              return this.BaseInputField(field_id, field_dict);
  },

  ImageField:  function (field_id, field_dict) {
              /* Image field */
              var dom;
              dom = $("img[name=" + this.getFieldId(field_id) + "]");
              // XXX: image field should return details like quality, etc ...
              dom.attr("src", field_dict.value + "?quality=75.0&display=thumbnail&format=png");
  },
  
  ListBox:  function (field_id, field_dict) {
              /* Listbox field */
              var listbox_id, navigation_id, listbox_table, current_form_id, listbox_dict, listbox_data_url, colModel, column_title_list;
              listbox_id = "field_" + field_id;
              navigation_id = listbox_id + "_pager";              
              listbox_table = $("#"+listbox_id);
              current_form_id = this.getCurrentFormId();
              
              listbox_dict = field_dict.listbox;
              listbox_data_url = listbox_dict.listbox_data_url;
              colModel = [];
              column_title_list = [];
              $.each(listbox_dict.columns,
                       function(i, value){
                         var index, title, column;
                         index = value[0];
                         title = value[1];
                         column_title_list.push(title);
                         column = {'name': index,
                                   'index': index,
                                   'width': 185,
                                   'align': 'left'};
                         colModel.push(column);
              });

              listbox_table.jqGrid({url:listbox_data_url + '?form_id=' + current_form_id + '&amps;listbox_id=' + field_id,
                            datatype: "json",
                            colNames:  column_title_list,
                            colModel: colModel,
                            rowNum: listbox_dict.lines,
                            pager: '#'+navigation_id,
                            sortname: 'id',
                            viewrecords: true,
                            sortorder: "desc",
                            loadError : function(xhr, textStatus, errorThrown)  {
                                          // XXX: handle better than just alert.
                                          alert("Error occurred during getting data from server.");
                                          },
                            cmTemplate: {sortable:false}, // XXX: until we get list of sortable columns from server
                            caption: field_dict.title});
              listbox_table.jqGrid('navGrid', '#'+navigation_id, {edit:false,add:false,del:false});
              return listbox_table;
  }

};

/* Generic form updater */
var FormUpdater = {
                   

  update: function(data) {
              /* Update form values */
              $.each(data.form_data,
                     function(field_id, field_dict){
                        var type, dom;
                        type = field_dict.type;
                        dom = undefined;
                        if(Form.hasOwnProperty(type)){
                          dom = Form[type](field_id, field_dict);
                        }
                          
                        // add a class that these fields are editable so asJSON
                        // can serialize for for sending to server
                        if (dom!==undefined && dom!==null && field_dict.editable){
                          dom.addClass(Form.SERIALIZE_ABLE_CLASS_NAME);
                        }
                        
                        // mark required fields visually
                        if (field_dict.required){
                          dom.parent().parent().children("label").css("font-weight", "bold");}
                         
                      });
  },

  save: function(){
              /* save form to server*/
              var form_value_dict, converted_value;
              form_value_dict = {};
              $("." + Form.SERIALIZE_ABLE_CLASS_NAME).each(function(index){
                // DOM can change values, i.e. alter checkbox (on / off)
                var element,name, value, type; 
                element = $(this); 
                name = element.attr("name");
                value = element.val();
                type = element.attr("type");
                if (type==="checkbox") {
                  value = element.is(":checked");
                  if (value===true) {
                    converted_value=1;
                  }
                  if(value===false) {
                    converted_value=0;
                  }
                  value = converted_value;  
                  }
                // XXX: how to handle file uploads ?
                form_value_dict[name] = value;
              });
              //console.log(form_value_dict);
              
              // add form_id as we need to know structure we're saving at server side
              form_value_dict.form_id = Form.getCurrentFormId();
                
              // validation happens at server side
              $.ajax({url:'Form_save',
                      data: form_value_dict,
                      dataType: "json",
                      success: function (data) {
                        var field_errors;
                        field_errors = data.field_errors;
                        if (field_errors!==undefined){
                          //console.log(field_errors);
                          $.each(field_errors, function(index, value){
                              var dom, field;
                              dom = $("[name=" + Form.getFieldId(index) + "]");
                              dom.css("border", "1px solid red"); // XXX: use class / css
                              field = dom.parent().parent();
                              if (field.children("span.error").length > 0){
                                // just update message
                                field.children("span.error").html(value);}
                              else{
                                // no validation error message exists
                                field.append('<span class="error">' + value + '</span>');}
                            }
                          );}
                        else{
                          // validation OK at server side
                          $("span.error").each(function(index) {
                            // delete validation messages
                            var element;
                            element = $(this);
                            element.parent().children("div.input").children("." +Form.SERIALIZE_ABLE_CLASS_NAME).css("border", "none");
                            element.remove();
                          });
                          // show a fading portal_status_message
                          $("#portal_status_message").toggle();
                          $("#portal_status_message p").html("Saved");
                          window.setTimeout( '$("#portal_status_message").toggle()', 4000);
                        }
                      }});
  }
};


/*
 * Javascript Gadget representation
 */
function Gadget(id, dom) {
  this.id = id;
  this.dom = dom;
  this.is_ready = false;
}

Gadget.prototype.getId = function() {
  return this.id;
};

Gadget.prototype.getDom = function() {
  return this.dom;
};

Gadget.prototype.isReady = function() {
  /*
   * Return True if remote gadget is loaded into DOM.
   */
  return this.is_ready;
};

Gadget.prototype.setReady = function() {
  /*
   * Return True if remote gadget is loaded into DOM.
   */
  this.is_ready = true;
};


Gadget.prototype.getParent = function() {
  /*
   * Get Gadget's parent by using DOM
   */
  // XXX:
};


/*
 * Generic gadget index placeholder
 */
var GadgetIndex = {

  gadget_list: [],

  getGadgetList: function() {
    /*
     * Return list of registered gadgets
     */
    return this.gadget_list;
  },
  
  registerGadget: function(gadget) {
    /*
     * Register gadget
     */
    this.gadget_list.push(gadget);
  },

  unregisterGadget: function(gadget) {
    /*
     * Unregister gadget
     */
    index = jQuery.inArray(gadget, this.gadget_list);
    if (index!=-1) {
      this.gadget_list.splice(index, 1);
    }       
  },

  getGadgetById: function (gadget_id){
    /*
     * Get gadget javascript representation by its Id
     */
    var gadget;
    gadget = undefined;
    $(this.getGadgetList()).each(
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
};


/*
 * Basic gadget interaction gadget implementation.
 */
var InteractionGadget = {

  bind: function (gadget_dom){
    /*
     * Bind event between gadgets.
     */
    gadget_id = gadget_dom.attr("id");
    gadget_dom.find("connect").each(function (key, value){
      source = $(value).attr("source").split(".");
      source_gadget_id = source[0];
      source_method_id = source[1];
      source_gadget = GadgetIndex.getGadgetById(source_gadget_id);

      destination = $(value).attr("destination").split(".");
      destination_gadget_id = destination[0];
      destination_method_id = destination[1];
      destination_gadget = GadgetIndex.getGadgetById(destination_gadget_id);

      if (source_gadget.hasOwnProperty(source_method_id)){
        // direct javascript use case
        func_body = 'GadgetIndex.getGadgetById("' + source_gadget_id + '")["original_' + source_method_id + '"]();';
        func_body = func_body + '\nGadgetIndex.getGadgetById("' + destination_gadget_id + '")["' + destination_method_id + '"]();';
        func = new Function(func_body);
        source_gadget["original_" + source_method_id] = source_gadget[source_method_id];
        source_gadget[source_method_id] =  func;
      }
      else{
        // this is a custom event attached to HTML gadget representation
        func_body = 'GadgetIndex.getGadgetById("' + destination_gadget_id + '")["' + destination_method_id + '"]();';
        func = new Function(func_body);
        source_gadget.dom.bind(source_method_id, func);
      }
      console.log(source_gadget_id, '.', source_method_id, '-->', destination_gadget_id, '.', destination_method_id);
    }
    );
  }
}


/*
 * Generic Gadget library renderer
 */

var RenderJs = {
   
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
              gadget_js = new Gadget(gadget_id, gadget);
              GadgetIndex.registerGadget(gadget_js);
              
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
                    app_cache = Cache.get(cache_id, undefined);
                    if(app_cache===undefined || app_cache===null){
                      // not in cache so we pull from network and cache
                      //console.log("not in cache: " + cache_id + "  " + url);
                      $.ajax({url:url,
                              yourCustomData: {"gadget_id": gadget_id, "cache_id": cache_id},
                              success: function (data) {
                                          cache_id = this.yourCustomData.cache_id;
                                          gadget_id = this.yourCustomData.gadget_id;
                                          //console.log("set in cache: " + cache_id);
                                          Cache.set(cache_id, data);
                                          GadgetIndex.getGadgetById(gadget_id).setReady();
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
                            GadgetIndex.getGadgetById(gadget_id).setReady();
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

    checkAndTriggerReady: function() {
      /*
       * Trigger "ready" event only if all gadgets were marked as "ready"
       */
      var is_gadget_list_loaded;
      is_gadget_list_loaded = GadgetIndex.isGadgetListLoaded();
      if (is_gadget_list_loaded){
        if (!is_ready) {
          //console.log("trigger");
          GadgetIndex.getRootGadget().getDom().trigger("ready");
        }
        is_ready = true;
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
   }

};