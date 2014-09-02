/*jslint nomen: true*/
/*global window, rJS, RSVP */
(function (window, rJS, RSVP) {
  "use strict";

  var gk = rJS(window);

  var getJSON = function(url) {
    var promise = new RSVP.Promise(function(resolve, reject){
      var client = new XMLHttpRequest();
      client.open("GET", url);
      client.onreadystatechange = handler;
      client.responseType = "json";
      client.setRequestHeader("Accept", "application/json");
      client.send();
  
      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) { 
            return resolve(this.response) }
          else { 
            return reject(this); }
        }
      };
    });
  
    return promise;
  };
  
  var getMetaJSONSchema = function () {
    return getJSON("../slapos_load_schema/meta.json")
    .then(function(json) {
      return json;
    }, function(error) {
      throw error});
  };
  
  var validateJSON = function(json) {
    
    var promise = new RSVP.Promise(function(resolve, reject) {
      return resolve(getMetaJSONSchema());
    });
    
    return promise.then(function (meta_schema) {
      console.log(tv4.validate(json, meta_schema));
      return json;
    }, function (error) {
      throw error});
  };
  
  gk.declareMethod("loadJSONSchema", function(url) {
    return getJSON(url).then(function(json) {
      return validateJSON(json);
    }, function(error) { 
      throw error});
  });
   
}(window, rJS, RSVP, jQuery));
