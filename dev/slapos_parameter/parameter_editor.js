/*jslint nomen: true*/
/*global rJS */
(function (window, document, rJS) {
  "use strict";

  var gk = rJS(window);
  var json_url = "../slapos_load_schema/schema.json";
  var gadget_path_list = {
        connection: "../slapos_load_schema/index.html"
  };
  
  var render_selection = function (json_field) {
    var input = document.createElement("select");
    input.size = 1;
    var option = document.createElement("option");
    option.selected = "selected";
    option.value ="";
    input.appendChild(option);
    for (var option_index in json_field.enum) {
      var optionz = document.createElement("option");
      optionz.value = json_field.enum[option_index];
      optionz.textContent = json_field.enum[option_index];
      input.appendChild(optionz);
    }
    return input;
  };
  
  var render_field = function (json_field) {

    if (json_field.enum !== undefined) {
      return render_selection(json_field);
    }
    
    if (json_field.type === "boolean") {
      json_field.enum = [true, false];
      return render_selection(json_field);
    }
    
    var input = document.createElement("input");
         
    if (json_field.default !== undefined) {
     input.value = json_field.default;
    }

    switch(json_field.type) {
      case "integer": input.type = "number"; break;
      default: input.type = "text";
    }
         
    return input;
  };
  
  gk.ready(function (g) {
    g.declareGadget(gadget_path_list.connection, {})
    
    .push(function (gadget) {
      return gadget.loadJSONSchema(json_url);
    })
    .push(function (json) {
       var fieldset = g.__element.getElementsByTagName('fieldset')[0];
       var fieldset_optional = g.__element.getElementsByTagName('fieldset')[1];
       for (var key in json.properties) {
         var div = document.createElement("div");
         div.klass = "field";
         div.title = json.properties[key].description;
         console.log(key);
         var label = document.createElement("label");
         label.textContent = json.properties[key].title;
         div.appendChild(label);
         var div_input = document.createElement("div");
         div.klass = "input";
         var input = render_field(json.properties[key]);
         input.name = key; 
         
         div_input.appendChild(input);
         div.appendChild(div_input);
         if (json.properties[key].optional === true) {
           fieldset_optional.appendChild(div);
         } else {
           fieldset.appendChild(div);
         }
       }
    });
  }).declareMethod("getCouscou", function() {
    var sp = document.createElement("span");
    sp.textContent = "couscous";
    return sp
  });

}(window, document, rJS));
