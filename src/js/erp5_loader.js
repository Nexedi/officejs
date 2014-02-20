/*jslint indent: 2, nomen: true, todo: true, unparam: true */
/*global jQuery, window, document, jIO, confirm, alert */
"use strict";
(function (window, document, $, jIO) {

  var priv = {};

  /* ====================== Attributes ================================ */
  priv.url = "http://192.168.242.67:8080/erp5";
  priv.mode = "generic";
  priv.auth_type = "none";
  priv.username = "zope";
  priv.password = "insecure";
  priv.encoded_login = null;
  priv.dates = {};

  // ERP5 connect
  priv.erp5 = jIO.newJio({
    type: "erp5",
    url: priv.url,
    username: priv.username,
    password: priv.password
  });
  /*
      NOTE: table configuration = ERP CONFIGURE Menu
      NOTE: should be requested and stored by JIO erp5_settings
  */
  priv.erp5_module = {
    "computer": {
      "layout": {
        "type": {
          "mode": "columntoggle",
          "icon": "expand-alt",
          "theme": "slapos-white",
          "text": "Toggle"
        },
        "search_id": "global_search_computers",
        "wrap": {
          "type": "both",
          "top": 4,
          "bottom": 1
        },
        "sorting": "true",
        "checkbox": "true"
      },
      "configuration": {
        "global_search": {
          "show": true
        },
        "group_search": {
          "show": true,
          "slot": 1
        },
        "detail_search": {
          "show": true,
          "slot": 2
        },
        "configure_search": {
          "show": true,
          "slot": 3
        },
        "pagination": {
          "show": true,
          "slot": 5,
          "items_per_page_select": [5, 10, 25, 50],
          "icons": ["step-backward", "backward",
                    "reorder", "forward", "step-forward"]
        },
        "record_info": {
          "show": true
        },
        "select_info": {
          "show": true
        },
        //"toggle": {
        //  "show": true
        //},
        //"sorting": {
        //  "show": true
        //},
        //"editable": {
        //  "show": true,
        //  "autocomplete": true,
        //  "max_suggestions": 10
        //},
        //"lazyload": {
        //  "show": false
        //}
      },
      "fields": {
        "_id": {
          "show": false,
          "priority": 5
        },
        "category": {
          "show": false,
          "priority": 5
        },
        "contributor": {
          "show": false,
          "priority": 2
        },
        "created": {
          "show": false,
          "priority": 4
        },
        "date": {
          "show": false,
          "priority": 4
        },
        "description": {
          "show": false,
          "priority": 5
        },
        "language": {
          "show": false,
          "priority": 4
        },
        "modified": {
          "show": false,
          "priority": 6
        },
        "reference": {
          "show": true,
          "priority": 4
        },
        "title": {
          "show": true,
          "persist": true
        },
        "type": {
          "show": false,
          "priority": 6
        },
        // "foreign" fields
        "state": {
          "show": true,
          "priority": 3,
          "lookup": "getValidationState"
        },
        "status": {
          "show": true,
          "persist": true,
          "lookup": "getValidationStatus"
        }
      }
    }
  };

  /* ====================== methods ================================ */

  // TOOLS //
  /**
  * Replace substrings to another strings
  * @method recursiveReplace
  * @param  {string} string The string to do replacement
  * @param  {array} list_of_replacement An array of couple
  * ["substring to select", "selected substring replaced by this string"].
  * @return {string} The replaced string
  */
  priv.recursiveReplace = function (string, list_of_replacement) {
    var i, split_string = string.split(list_of_replacement[0][0]);
    if (list_of_replacement[1]) {
      for (i = 0; i < split_string.length; i += 1) {
        split_string[i] = priv.recursiveReplace(
          split_string[i],
          list_of_replacement.slice(1)
        );
      }
    }
    return split_string.join(list_of_replacement[0][1]);
  };

  /**
  * Changes & to %26
  * @method convertToUrlParameter
  * @param  {string} parameter The parameter to convert
  * @return {string} The converted parameter
  */
  priv.convertToUrlParameter = function (parameter) {
    return priv.recursiveReplace(parameter, [[" ", "%20"], ["&", "%26"]]);
  };

  /**
    * Create a URL string for authentication (same as ERP5 storage)
    * @method createEncodedLogin
    */
  priv.createEncodedLogin = function () {
    return "__ac_name=" + priv.convertToUrlParameter(priv.username) +
        "&" + (typeof priv.password === "string" ?
                "__ac_password=" +
                priv.convertToUrlParameter(priv.password) + "&" : "");
  };

  /**
    * Modify an ajax object to add default values
    * @method makeAjaxObject
    * @param  {object} json The JSON object
    * @param  {object} option The option object
    * @param  {string} method The erp5 request method
    * @param  {object} ajax_object The ajax object to override
    * @return {object} A new ajax object with default values
    */
  priv.makeAjaxObject = function (key) {
    var ajax_object = {};

    ajax_object.url = priv.url + key + "?" +
                      priv.createEncodedLogin() + "disable_cookie_login__=1";
    // exception: ajax_object.url = priv.username + ":" +
    // priv.password + "@" + priv.url + key;
    ajax_object.dataType = "text/plain";
    ajax_object.async = ajax_object.async === false ? false : true;
    ajax_object.crossdomain = ajax_object.crossdomain === false ? false : true;
    return ajax_object;
  };

  /**
    * Runs all ajax requests for propertyLookups
    * @method getERP5property
    * @param  {string} id The id of the object to query
    * @param  {string} lookup The method to retrieve the property
    * @return {string} The property value
    */
  // NOTE: need a different way because this triggers a ton of http requests!
  // priv.getERP5property = function (id, lookup) {
  //   var key = id + "/" + lookup;
  //   // return $.ajax(priv.makeAjaxObject(key));
  //   return {"error": "foo"};
  // };


  /**
    * Uppercase first letter of a string
    * @method capitaliseFirstLetter
    * @param  {string} string To uppercase first letter
    * @return {string} Capitalized string
    */
  priv.capitaliseFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // CONTENT
  /**
    * Create a checkbox to select table rows
    * @method createCheckbox
    */
  // priv.createCheckbox = function () {

  // };

  /**
    * Create full table
    * @method constructTable
    * @param {object} element Base table to enhance
    */
  // TODO: split into separate functions and remove duplicate code
  priv.constructTable = function (element) {
    var module = element.getAttribute("data-type"),
      lower_case_module = module.toLowerCase(),
      $parent = $(element.parentNode);

    // fetch default/user specified configuration
    // NOTE: hardcoded above

    // fetch data
    priv.erp5.allDocs({
      "query": "type: \"" + module + "\"",
      "limit": [0, (priv.erp5_module.computer.configuration.
                    pagination.items_per_page_select[0] || 30)],
      "wildcard_character": "%",
      "include_docs": true
    }, function (error, response) {
      console.log(response);
      var i,
        j,
        // k,
        l,
        // table setup
        fragment_container,
        global_search,
        controls,
        info_wrap,
        controlbar,
        quickinfo,
        select_info,
        record_info,
        filter_info,
        group_search,
        group_slot,
        detail_search,
        detail_slot,
        configure_search,
        configure_slot,
        pagination_elements,
        pagination_label,
        // pagination_number_of_items,
        pagination_link,
        pagination_clone,
        pagination_option,
        pagination_wrap,
        pagination_slot,
        // table
        table,
        // table_head,
        table_row,
        table_body,
        table_tick_label,
        table_tick_box,
        table_cell,
        table_header,
        table_header_cell,
        // fields,
        property,
        cell,
        row,
        field,
        item,
        value,
        link,
        table_link,
        fetchValue;

      // create fragments
      fragment_container = window.document.createDocumentFragment();
      controls = window.document.createDocumentFragment();
      quickinfo = window.document.createDocumentFragment();
      pagination_elements = window.document.createDocumentFragment();

      // global search
      if (priv.erp5_module.computer.configuration.global_search.show) {
        global_search = document.createElement("input");
        global_search.setAttribute("type", "search");
        global_search.setAttribute(
          "placeholder",
          "Search " + lower_case_module
        );
        global_search.setAttribute("data-icon", "search");
        global_search.setAttribute("data-action-btn", "true");
        global_search.setAttribute(
          "id",
          priv.erp5_module.computer.layout.search_id || ""
        );

        controls.appendChild(global_search);
      }
      // record_info
      if (priv.erp5_module.computer.configuration.record_info.show) {
        record_info = document.createElement("span");
        record_info.setAttribute(
          "class",
          "erp5_" + lower_case_module + "_records_info"
        );
        quickinfo.appendChild(record_info);
      }
      // select_info
      if (priv.erp5_module.computer.configuration.select_info.show) {
        select_info = document.createElement("span");
        select_info.setAttribute(
          "class",
          "erp5_" + lower_case_module + "_select_info"
        );
        quickinfo.appendChild(select_info);
      }
      // filter_info
      if (priv.erp5_module.computer.configuration.group_search.show) {
        filter_info = document.createElement("span");
        filter_info.setAttribute(
          "class",
          "erp5_" + lower_case_module + "_filter_info"
        );
        quickinfo.appendChild(filter_info);
      }
      info_wrap = document.createElement("span");
      info_wrap.setAttribute("class", "ui-plain-text");
      info_wrap.appendChild(quickinfo);

      controls.appendChild(info_wrap);

      // create controlbar
      controlbar = document.createElement("div");
      controlbar.setAttribute("class", "ui-controlbar");
      controlbar.appendChild(controls);

      fragment_container.appendChild(controlbar);

      // wrapper elements
      // group-filter
      if (priv.erp5_module.computer.configuration.group_search.show) {
        group_search = document.createElement("a");
        group_search.setAttribute("href", "#group_search");
        group_search.setAttribute("date-rel", "popup");
        group_search.setAttribute("data-role", "button");
        group_search.setAttribute("data-icon", "sitemap");
        group_search.appendChild(document.createTextNode("Group"));

        group_slot = document.createElement("div");
        group_slot.setAttribute("data-slot", true);
        group_slot.setAttribute(
          "data-slot-id",
          priv.erp5_module.computer.configuration.group_search.slot
        );
        group_slot.appendChild(group_search);

        fragment_container.appendChild(group_slot);
      }

      // detail search
      if (priv.erp5_module.computer.configuration.detail_search.show) {
        detail_search = document.createElement("a");
        detail_search.setAttribute("href", "#detail_search");
        detail_search.setAttribute("date-rel", "popup");
        detail_search.setAttribute("data-role", "button");
        detail_search.setAttribute("data-icon", "filter");
        detail_search.appendChild(document.createTextNode("Filter"));

        detail_slot = document.createElement("div");
        detail_slot.setAttribute("data-slot", true);
        detail_slot.setAttribute(
          "data-slot-id",
          priv.erp5_module.computer.configuration.detail_search.slot
        );
        detail_slot.appendChild(detail_search);

        fragment_container.appendChild(detail_slot);
      }

      // configure search
      if (priv.erp5_module.computer.configuration.configure_search.show) {
        configure_search = document.createElement("a");
        configure_search.setAttribute("href", "#configure_search");
        configure_search.setAttribute("date-rel", "popup");
        configure_search.setAttribute("data-role", "button");
        configure_search.setAttribute("data-icon", "cog");
        configure_search.appendChild(document.createTextNode("Configure"));

        configure_slot = document.createElement("div");
        configure_slot.setAttribute("data-slot", true);
        configure_slot.setAttribute(
          "data-slot-id",
          priv.erp5_module.computer.configuration.configure_search.slot
        );
        configure_slot.appendChild(configure_search);

        fragment_container.appendChild(configure_slot);
      }

      // pagination
      if (priv.erp5_module.computer.configuration.pagination.show) {
        pagination_link = document.createElement("a");
        pagination_link.setAttribute("data-role", "button");
        pagination_link.setAttribute("data-iconpos", "notext");
        pagination_link.setAttribute("href", "#");

        for (i = 0; i < 5; i += 1) {
          if (i !== 2) {
            pagination_clone = pagination_link.cloneNode();
            pagination_clone.setAttribute(
              "data-icon",
              priv.erp5_module.computer.configuration.pagination.icons[i]
            );
            pagination_elements.appendChild(pagination_clone);
          } else {
            pagination_label = document.createElement("label");
            pagination_label.setAttribute(
              "for",
              lower_case_module + "_number_of_records"
            );
            pagination_label.setAttribute("class", "ui-hidden-accessible");
            pagination_label.appendChild(
              document.createTextNode("Number of records")
            );
            pagination_elements.appendChild(pagination_label);

            pagination_clone = document.createElement("select");
            pagination_clone.setAttribute(
              "id",
              lower_case_module + "_number_of_records"
            );
            pagination_clone.setAttribute(
              "name",
              lower_case_module + "_number_of_records"
            );
            pagination_clone.setAttribute("data-iconpos", "notext");
            pagination_clone.setAttribute(
              "data-icon",
              priv.erp5_module.computer.configuration.pagination.icons[i]
            );
            for (
              j = 0;
              j < priv.erp5_module.computer.configuration.pagination.
                items_per_page_select.length;
              j += 1
            ) {
              pagination_option = document.createElement("option");
              pagination_option.setAttribute(
                "value",
                priv.erp5_module.computer.configuration.pagination.
                  items_per_page_select[j]
              );
              pagination_option.appendChild(
                document.createTextNode(priv.erp5_module.computer.
                  configuration.pagination.items_per_page_select[j])
              );
              pagination_clone.appendChild(pagination_option);
            }
            pagination_elements.appendChild(pagination_clone);
          }
        }

        pagination_wrap = document.createElement("div");
        pagination_wrap.setAttribute("data-role", "controlgroup");
        pagination_wrap.setAttribute("data-type", "horizontal");
        pagination_wrap.appendChild(pagination_elements);

        pagination_slot = document.createElement("div");
        pagination_slot.setAttribute("data-slot", true);
        pagination_slot.setAttribute(
          "data-slot-id",
          priv.erp5_module.computer.configuration.pagination.slot
        );
        pagination_slot.appendChild(pagination_wrap);

        fragment_container.appendChild(pagination_slot);
      }

      // create table head
      table = document.createElement("table");
      table_header = document.createElement("thead");
      table_body = document.createElement("tbody");
      table_row = document.createElement("tr");
      table_cell = document.createElement("td");
      table_header_cell = document.createElement("th");

      // table cell links
      table_link = document.createElement("a");

      // header
      row = table_row.cloneNode();
      // tickbox - all
      if (priv.erp5_module.computer.layout.checkbox) {
        cell = table_header_cell.cloneNode();

        table_tick_label = document.createElement("label");
        table_tick_label.setAttribute("for", lower_case_module + "_tick_all");
        table_tick_label.appendChild(document.createTextNode("Select All"));
        table_tick_box = document.createElement("input");
        table_tick_box.setAttribute("type", "checkbox");
        table_tick_box.setAttribute("data-iconpos", "notext");
        table_tick_box.setAttribute("value", "Select All/Unselect All");
        table_tick_box.setAttribute("id", lower_case_module + "_tick_all");
        table_tick_box.setAttribute("name", lower_case_module + "_tick_all");

        cell.appendChild(table_tick_label);
        cell.appendChild(table_tick_box);
        row.appendChild(cell);
      }

      for (property in priv.erp5_module.computer.fields) {
        if (priv.erp5_module.computer.fields.hasOwnProperty(property)) {
          field = priv.erp5_module.computer.fields[property];
          if (field.show) {
            cell = table_header_cell.cloneNode();
            if (field.persist === undefined) {
              cell.setAttribute("data-priority", field.priority || 6);
            }
            if (priv.erp5_module.computer.layout.sorting) {
              cell.setAttribute("data-sortable", "true");
            }
            cell.appendChild(document.createTextNode(
              priv.capitaliseFirstLetter(property)
            ));
            row.appendChild(cell);
          }
        }
      }
      table_header.appendChild(row);

      if (response) {
        // body
        for (l = 0; l < response.total_rows; l += 1) {
          row = table_row.cloneNode();
          // tickbox
          if (priv.erp5_module.computer.layout.checkbox) {
            cell = table_header_cell.cloneNode();
            item = response.rows[l].doc;

            table_tick_label = document.createElement("label");
            table_tick_label.setAttribute("for", item._id);
            table_tick_label.appendChild(
              document.createTextNode("Select " + item.title)
            );
            table_tick_box = document.createElement("input");
            table_tick_box.setAttribute("type", "checkbox");
            table_tick_box.setAttribute("data-iconpos", "notext");
            table_tick_box.setAttribute("class", "select_all");
            table_tick_box.setAttribute("value", "Select All/Unselect All");
            table_tick_box.setAttribute("id", item._id);
            table_tick_box.setAttribute("name", item._id);

            cell.appendChild(table_tick_label);
            cell.appendChild(table_tick_box);
            row.appendChild(cell);
          }
          // loop fields to display
          for (property in priv.erp5_module.computer.fields) {
            if (priv.erp5_module.computer.fields.hasOwnProperty(property)) {
              field = priv.erp5_module.computer.fields[property];
              value = item[property];

              if (value === undefined) {
                fetchValue = priv.getERP5property(item._id, field.lookup);
                if (fetchValue.error) {
                  value = "N/A";
                }
              }
              // link opens instance
              link = table_link.cloneNode();
              link.setAttribute(
                "href",
                "computer.html?mode=edit&item=" + item._id
              );
              link.appendChild(document.createTextNode(value));

              if (field.show) {
                cell = table_cell.cloneNode();
                cell.appendChild(link);
                row.appendChild(cell);
              }
            }
          }
          table_body.appendChild(row);
        }
      } else {
        row = table_row.cloneNode();
        l = 0;

        if (priv.erp5_module.computer.layout.checkbox) {
          l += 1;
        }
        for (property in priv.erp5_module.computer.fields) {
          if (priv.erp5_module.computer.fields.hasOwnProperty(property)) {
            field = priv.erp5_module.computer.fields[property];
            if (field.show) {
              l += 1;
            }
          }
        }
        cell = table_header_cell.cloneNode();
        cell.setAttribute("colspan", l);
        cell.setAttribute("style", "text-align: center; line-height: 2em;");
        cell.appendChild(document.createTextNode(
          "Error retrieving Data! Code: " + error.status +
            ". Message: " + error.message + "."
        ));
        row.appendChild(cell);
        table_body.appendChild(row);
      }

      table.setAttribute("data-role", "table");
      table.setAttribute("data-filter", "true");
      table.setAttribute(
        "data-mode",
        priv.erp5_module.computer.layout.type.mode
      );
      table.setAttribute("id", lower_case_module + "_1");
      table.setAttribute("class", "table-stroke ui-responsive");
      if (priv.erp5_module.computer.configuration.global_search) {
        table.setAttribute(
          "data-input",
          "#" + priv.erp5_module.computer.layout.search_id || ""
        );
      }
      if (priv.erp5_module.computer.layout.type.mode === "columntoggle") {
        table.setAttribute(
          "data-column-btn-text",
          priv.erp5_module.computer.layout.type.text
        );
        table.setAttribute(
          "data-column-btn-icon",
          priv.erp5_module.computer.layout.type.icon
        );
        table.setAttribute(
          "data-column-btn-theme",
          priv.erp5_module.computer.layout.type.theme
        );
      }
      if (priv.erp5_module.computer.layout.wrap) {
        table.setAttribute(
          "data-wrap",
          priv.erp5_module.computer.layout.wrap.type
        );
        table.setAttribute(
          "data-top-grid",
          priv.erp5_module.computer.layout.wrap.top || 1
        );
        table.setAttribute(
          "data-bottom-grid",
          priv.erp5_module.computer.layout.wrap.bottom || 1
        );
      }
      if (priv.erp5_module.computer.layout.sorting) {
        table.setAttribute("data-sort", "true");
      }
      table.appendChild(table_header);
      table.appendChild(table_body);
      // done
      fragment_container.appendChild(table);

      // add to DOM
      $parent.empty().append(fragment_container).enhanceWithin();

    }
      );
  };

  /**
   * Build a string from array
   * @method: buildValue
   * @param: {string/array} value String/Array passed
   * @returns: {string} string
   */
  priv.buildValue = function (value) {
    var i = 0,
      setter = "",
      property;

    if (typeof value === "string") {
      setter = value;
    } else if (typeof value === "object") {
      for (property in value) {
        if (value.hasOwnProperty(property)) {
          setter += (i === 0 ? "" : ", ") + value[property];
          i += 1;
        }
      }
    } else {
      for (i; i < value.length; i += 1) {
        setter += (i === 0 ? "" : ", ") + value[i];
      }
    }
    return setter || "could not generate value";
  };

  /**
   * Append values in form
   * @method: setValue
   * @param: {string} type Type of object
   * @param: {string} key Key to set
   * @param: {string/array} value Value to set key to
   */
  priv.setValue = function (type, key, value) {
    var i,
      j,
      k,
      unit,
      element,
      getter,
      single_option,
      elements = document.getElementsByName(type + "_" + key),
      setter = priv.buildValue(value),
      // ...PFFFFFFFFFFFFFF!
      dublin_core_date_time_fields = [
        "date",
        "created",
        "modified",
        "effective_date",
        "expiration_date"
      ],
      time_fields = ["year", "month", "day"];

    // an't be generic... yet
    for (i = 0; i < dublin_core_date_time_fields.length; i += 1) {
      if (key === dublin_core_date_time_fields[i]) {
        for (k = 0; k < time_fields.length; k += 1) {
          unit = time_fields[k];
          element = document.getElementsByName(
            type + "_" + key + "_" + unit
          );

          if (element.length > 0) {
            single_option = element[0].getElementsByTagName("option");
            switch (unit) {
            case "year":
              getter = new Date(setter).getFullYear();
              break;
            case "month":
              getter = new Date(setter).getMonth() + 1;
              break;
            case "day":
              getter = new Date(setter).getDate();
              break;
            }
            if (single_option.length === 1) {
              single_option[0].setAttribute("value", getter);
              single_option[0].text = getter;
              single_option[0].parentNode.parentNode.
                getElementsByTagName("span")[0].innerHTML = getter;
            } else {
              element[0].value = getter;
            }
          }
        }
      }
    }

    for (j = 0; j < elements.length; j += 1) {
      elements[j].value = setter;
    }
  };

  /**
    * Generate input form for an item
    * @method generateItem
    * @param  {string} mode View Clone/Edit/Add
    * @param  {string} item Element to show
    */
  // NOTE: this should be in another gadget/file
  // priv.generateItem = function (mode, item) {

  //   if (item) {
  //     // fetch data
  //     priv.erp5.get({"_id": item}, function (error, response) {
  //       var property, value, abort;

  //       if (response) {
  //         for (property in response) {
  //           if (response.hasOwnProperty(property)) {
  //             value = response[property];
  //             priv.setValue(response.type.toLowerCase(), property, value);
  //           }
  //         }
  //       } else {
  //         abort = confirm(
  //           "Error trying to retrieve data! Go back to overview?"
  //         );
  //         if (abort === true) {
  //           $.mobile.changePage("computers.html");
  //         }
  //       }
  //     });
  //   }
  // };

  /**
    * Create a serialized object from all values in the form
    * @method serializeObject
    * @param  {object} form Form to serialize
    * @returns  {string} JSON form values
    */
  priv.serializeObject = function (form) {
    var o = {},
      a = form.serializeArray();
    $.each(a, function () {
      if (o[this.name] !== undefined) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  };

  /**
    * Create a serialized object from all values in the form
    * @method validateObject
    * @param  {object} serialized object
    * @returns  {object} object ready to pass to JIO
    */
  // TODO: should be made generic by passing the type and a recipe for
  // which fields to format how
  priv.validateObject = function (object) {
    var validatedObject = {},
      property,
      setter,
      value,
      i,
      j,
      date,
      clean_property,
      add_property,
      date_property,
      date_component,
      new_date,
      // NOTE: ... to time to be generic...
      convertToArray = ["contributor", "category"],
      seperator_character = ",",
      convertToDate = ["effective_date", "expiration_date"];

    for (property in object) {
      if (object.hasOwnProperty(property)) {
        add_property = true;
        if (object.hasOwnProperty(property)) {
          value = object[property];
          clean_property = property.replace("computer_", "");

          // multiple entries
          if (typeof value !== "string") {
            if (value.length > 0) {
              // this should only happen if a field
              // is in the form multiple times!
              // NOTE: not nice
              setter = value[0];
            }
          } else {
            setter = value;
          }

          // convert to array
          for (i = 0; i < convertToArray.length; i += 1) {
            if (convertToArray[i] === clean_property) {
              setter = object[property].split(seperator_character);
            }
          }

          // set up date conversion
          for (j = 0; j < convertToDate.length; j += 1) {
            date_property = convertToDate[j];
            if (clean_property.search(date_property) !== -1) {
              add_property = false;
              if (priv.dates[date_property] === undefined) {
                priv.dates[date_property] = {};
              }
              // ...
              date_component = clean_property.split("_")[2];
              priv.dates[date_property][date_component] = value;
            }
          }
          if (add_property) {
            validatedObject[clean_property] = setter;
          }
        }
      }
    }

    // timestamp modified
    validatedObject.modified = new Date().toJSON();

    // timestamp create and date
    if (validatedObject.date === undefined) {
      validatedObject.date =  validatedObject.modified;
    }
    if (validatedObject.create === undefined) {
      validatedObject.create =  validatedObject.modified;
    }

    // HACK: add missing type!
    if (validatedObject.type === undefined || validatedObject.type === "") {
      validatedObject.type = "Computer";
    }

    // build dates
    for (date in priv.dates) {
      if (priv.dates.hasOwnProperty(date)) {
        new_date = priv.dates[date];
        validatedObject[date] = new Date(
          new_date.year,
          new_date.month,
          new_date.day
        ).toJSON();
        // delete this date
        delete priv.dates[date];
      }
    }
    return validatedObject;
  };

   /**
    * Store object in EPR5
    * @method modifyObject
    * @param  {object} object Validated object
    * @param  {method} string PUT or POST
    */
  priv.modifyObject = function (object, method, callback) {
    priv.erp5[method](object, function (error, response) {
      if (error) {
        console.log(error);
        alert("oops..., an error occurred trying to store");
      } else {
        console.log(response);
        alert("worked");
        if (callback) {
          callback();
        }
      }
    });
  };

  /**
    * Create array of URL parameters
    * @method splitSearchParams
    * @param  {string} url URL to split
    * @returns {array} array of url parameters
    */
  priv.splitSearchParams = function (url) {
    var path;

    if (url === undefined) {
      path = window.location;
    } else {
      path = url;
    }

    return $.mobile.path.parseUrl(path).search.slice(1).split("&");
  };
  // BINDINGS
  // NOTE: done in a hurry...
  $(document).on("pagebeforeshow", "#computers", function () {
    // initialize
    $(".erp5_table").each(function (index, element) {
      priv.constructTable(element);
    });
  })
    .on("pagebeforeshow", "#computer", function (e, data) {
      // NOTE: it should not be necessary to fetch this data from the URL
      // because JQM should pass it in data, too
      var mode,
        item,
        parameters = decodeURIComponent(
          $.mobile.path.parseUrl(window.location.href).search.split("?")[1]
        ).split("&");

      mode = parameters[0].split("=")[1];
      if (parameters.length > 1) {
        item = parameters[1].split("=")[1];
      }

      priv.generateItem(mode, item);
    })
    // load item from table
    .on("click", "table tbody td a, .navbar li a.new_item", function (e) {
      var i,
        item,
        spec = {},
        url = e.target.getAttribute("href").split("?"),
        target = url[0],
        parameters = url[1].split("&");

      e.preventDefault();
      for (i = 0; i < parameters.length; i += 1) {
        item = parameters[i].split("=");
        spec[item[0]] = item[1];
      }

      $.mobile.changePage(target, {
        "transition": "fade",
        "data": spec
      });
    })
    .on("click", "a.remove_item", function (e) {
      var i,
        params = priv.splitSearchParams(),
        parameter,
        callback = function () {
          $.mobile.changePage("computers.html", {
            "transition": "fade",
            "reverse": "true"
          });
        };

      // item in URL?
      for (i = 0; i < params.length; i += 1) {
        parameter = params[i].split("=");
        if (parameter[0] === "item") {
          priv.modifyObject({
            "_id": decodeURIComponent(parameter[1])
          }, "remove", callback);
        }
      }
    })
    // save form
    .on("click", "a.save_object", function (e) {
      var i,
        parameter,
        method,
        object,
        // check the URL for the state we are in
        // NOTE: not nice, change later
        params = priv.splitSearchParams(),
        callback = function () {
          $.mobile.changePage("computers.html", {
            "transition": "fade",
            "reverse": "true"
          });
        };

      for (i = 0; i < params.length; i += 1) {
        parameter = params[i].split("=");
        if (parameter[0] === "mode") {
          switch (parameter[1]) {
          case "edit":
            method = "put";
            break;
          case "clone":
          case "add":
            method = "post";
            break;
          }
          if (method !== undefined) {
            object = priv.validateObject(
              priv.serializeObject($(".display_object"))
            );
            // fallback to eliminate _id on clone
            // TODO: do somewhere else!
            if (method === "post") {
              delete object._id;
            }
            priv.modifyObject(object, method, callback);
          } else {
            alert("missing command!, cannot store");
          }
        }
      }
    })
    // update navbar depending on item selected
    .on("change", "table tbody th input[type=checkbox]", function (e) {
      var allChecks = $(e.target).closest("tbody")
          .find("th input[type=checkbox]:checked"),
        selected = allChecks.length,
        trigger = $(".navbar .new_item");

      if (selected === 1) {
        trigger.addClass("ui-btn-active clone_item")
          .attr("href", "computer.html?mode=clone&item=" + e.target.id);
      } else {
        trigger.removeClass("ui-btn-active clone_item")
          .attr("href", "computer.html?mode=add");
      }
//     })
//     // select all
//     .on("change", "table thead th input[type=checkbox]", function (e) {
    });

}(window, document, jQuery, jIO));
