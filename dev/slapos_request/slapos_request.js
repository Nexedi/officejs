/*jslint nomen: true*/
/*global rJS */
(function (window, document, $, rJS) {
  "use strict";

  var gk = rJS(window);
  var json_url = "../slapos_load_schema/schema.json";
  var gadget_path_list = {
        parameter: "../slapos_parameter/index.html",
        connection: "../slapos_load_schema/index.html"
  };
  
  gk.declareMethod('render', function(options) {
     if (options.software_release_url === undefined) {
       throw "undefined software_release_url";
     }
     var g = this;
     var gadget = g.declareGadget(gadget_path_list.parameter, {
       software_release_url: options.software_instance_url,
       json_url: json_url
     })
     .push(function(gadget) {
       return gadget.render(options);
       });
       
      var connection_gadget = g.declareGadget(gadget_path_list.connection, {})
    
     
      g.__element.querySelector("div.software_release_url").innerHTML = options.software_release_url;
     
      $(this.__element).find(".update-button").click(function(e) {
        var json_dict = {};
        var input_list = document.getElementsByClassName("slapos-parameter"); 
        for (var key in input_list) {
          if (input_list[key].value !== "") { 
            json_dict[input_list[key].name] = input_list[key].value;
          }
        }
        
        json = connection_gadget.validateJSON(json_url, json_dict);
        
        $('div.debug')[0].innerHTML = JSON.stringify(json_dict);
      });
     });
     
     

}(window, document, $,  rJS));
