/*jslint nomen: true*/
/*global rJS */
(function (window, document, $, rJS) {
  "use strict";

  var gk = rJS(window);
  var json_url = "../slapos_load_schema/schema.json";
  var gadget_path_list = {
        connection: "../slapos_load_schema/index.html"
  };
  
  gk.declareMethod('render', function(options) {
     if (options.software_release_url === undefined) {
       throw "undefined software_release_url";
     }
     var g = this;
     this.getDeclaredGadget('software-type')
     .push(function(gadget) {
       options.json_url = "../slapos_load_schema/software_type.json";
       return gadget.render(options);
       })
      .push(function() {
        g.getDeclaredGadget('parameter')
        .push(function(gadget) {
            options.json_url = json_url;
            return gadget.render(options);
        });   
        
      });
     
       
      
       
      var gadget_promise = g.declareGadget(gadget_path_list.connection, {});
    
      g.__element.querySelector("div.software_release_url").innerHTML = options.software_release_url;
     
      $(this.__element).find(".update-button").click(function(e) {
        var json_dict = {};
        $(".slapos-parameter").each(function(key, input) {
          if (input.value !== "") {
            if (input.type === 'number') {
                json_dict[input.name] = parseInt(input.value);
            } else if (input.value === "true") { 
                json_dict[input.name] = true;
            } else if (input.value === "false") { 
                json_dict[input.name] = false;
            } else {
              json_dict[input.name] = input.value;
            }
          }
        });
        
        $("span.error").each(function(i, span) {
          span.textContent = "";
        });
        
        $("div.error-input").each(function(i, div) {
          div.setAttribute("class", "");
        });

        
        gadget_promise.then(function(gadget) {
          return gadget.validateJSON(json_url, json_dict)
          .push(function(validation) {
            if (validation.valid) {
                $('div.debug')[0].innerHTML = JSON.stringify(json_dict); 
              } else {
                for (var error_index in validation.errors) {
                  var field_name = validation.errors[error_index].dataPath.slice(1);
                  var div = $('.slapos-parameter[name=' + field_name  + "]")[0].parentNode;
                  div.setAttribute("class", "slapos-parameter error-input");
                  div.querySelector("span.error").textContent = validation.errors[error_index].message;
                }
                
                for (var missing_index in validation.missing) {
                  var missing_field_name = validation.missing[missing_index].dataPath.slice(1);
                  var divm = $('.slapos-parameter[name=' + missing_field_name  + "]")[0].parentNode;
                  divm.setAttribute("class", "error-input");
                  divm.querySelector("span.error").textContent = validation.errors[missing_index].message;
                }
                
                
              }
          });
        });
        
      });
     });
     
     

}(window, document, $,  rJS));
