/*jslint nomen: true, maxlen: 200*/
/*global window, rJS, RSVP, console, jQuery, jIO, tv4, JSON */
(function (window, rJS, RSVP) {
  "use strict";

  var gk = rJS(window);

  function getJSON(url) {
    return jIO.util.ajax({
      url: url
    })
      .then(function (evt) {
        return evt.target.responseText;
      });
  }

  function getMetaJSONSchema() {
    return getJSON("../slapos_load_schema/meta.json");
  }

  function validateJSONSchema(json) {
    return getMetaJSONSchema()
      .then(function (meta_schema) {
        if (!tv4.validate(json, meta_schema)) {
          throw new Error("Non valid JSON schema " + json);
        }
        return JSON.parse(json);
      });
  }

  gk
    .declareMethod("loadJSONSchema", function (url) {
      return getJSON(url)
        .then(function (json) {
          return validateJSONSchema(json);
        });
    })

    .declareMethod("validateJSON", function (schema_url, generated_json) {
      return getJSON(schema_url)
        .then(function (json) {
          return tv4.validateMultiple(generated_json, json);
        });
    });

}(window, rJS, RSVP, jQuery));
