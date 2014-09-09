/*jslint nomen: true, maxlen: 200*/
/*global rJS, console */
(function (window, document, rJS) {
  "use strict";

  var gk = rJS(window);

//   var gadget_path_list = {
//         connection: "../slapos_load_schema/index.html"
//   };

  function render_selection(json_field) {
    var input = document.createElement("select"),
      option = document.createElement("option"),
      option_index,
      optionz;
    input.size = 1;
    option.selected = "selected";
    option.value = "";
    input.appendChild(option);
    for (option_index in json_field.enum) {
      if (json_field.enum.hasOwnProperty(option_index)) {
        optionz = document.createElement("option");
        optionz.value = json_field.enum[option_index];
        optionz.textContent = json_field.enum[option_index];
        input.appendChild(optionz);
      }
    }
    return input;
  }

  function render_field(json_field) {

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

    switch (json_field.type) {
    case "integer":
      input.type = "number";
      break;
    default:
      input.type = "text";
    }

    return input;
  }

  gk
    .ready(function (g) {
      g.props = {};
      return g.getElement()
        .push(function (element) {
          g.props.element = element;
        });
    })

    .declareAcquiredMethod("aq_loadJSONSchema", "loadJSONSchema")

//   gk.declareMethod("getJSON", function() {
//       for (var key in document.getElementByTagName("input")) {
//         console.log(input.value);
//       }
//   })
    .declareMethod('render', function (options) {
      if (options.software_release_url === undefined) {
        throw new Error("undefined software_release_url");
      }
      if (options.json_url === undefined) {
        throw new Error("undefined json_url");
      }

      var g = this,
        json_url = options.json_url;

      return g.aq_loadJSONSchema(json_url)
        .push(function (json) {
          var fieldset_list = g.props.element.querySelectorAll('fieldset'),
            key,
            div,
            label,
            input,
            div_input,
            span_error,
            fieldset = fieldset_list[1],
            fieldset_optional = fieldset_list[2];

          for (key in json.properties) {
            if (json.properties.hasOwnProperty(key)) {


              div = document.createElement("div");
              div.setAttribute("class", "field");
              div.title = json.properties[key].description;
              /* console.log(key); */
              label = document.createElement("label");
              label.textContent = json.properties[key].title;
              div.appendChild(label);
              div_input = document.createElement("div");
              div.setAttribute("class", "input");
              input = render_field(json.properties[key]);
              input.name = key;
              input.setAttribute("class", "slapos-parameter");

              div_input.appendChild(input);
              span_error = document.createElement("span");
              span_error.setAttribute("class", "error");
              div_input.appendChild(span_error);
              div.appendChild(div_input);
              if (json.properties[key].optional === true) {
                fieldset_optional.appendChild(div);
              } else {
                fieldset.appendChild(div);
              }


            }
          }
        });
    });

}(window, document, rJS));
