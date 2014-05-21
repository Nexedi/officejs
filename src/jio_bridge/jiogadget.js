/*global rJS, jIO, console */
(function (rJS, jIO) {
  "use strict";

  rJS(window)

    .ready(function (gadget) {
      // Initialize the gadget local parameters
      gadget.state_parameter_dict = {};
      gadget.state_parameter_dict.jio_storage = jIO.createJIO({
        "type": "localstorage"
      });
//     })
// 
//     .declareMethod('render', function () {
//       var gadget = this;
//       // Create the Jio storage only the first time
//       if (!gadget.state_parameter_dict.hasOwnProperty("jio_storage")) {
//       }
    })
    .declareMethod('allDocs', function () {
      var storage = this.state_parameter_dict.jio_storage;
      console.log("allDocs");
      return storage.allDocs.apply(storage, arguments);
    })
    .declareMethod('get', function () {
      var storage = this.state_parameter_dict.jio_storage;
      console.log("get");
      return storage.get.apply(storage, arguments);
    });

//     return jio_storage.allDocs({"query": '__root__'})
//         // XXX How to get root information?
//         return jio_storage.get({"_id": undefined});
//                 return jio_storage.get(
//                   {"_id": options.jio_key},
//                   {"_view": options.action_view}
//                 );
//                   jio_storage.get(
//                     {"_id": uri.segment(2)},
//                     {"_view": options.action_view}
//                   )
// 
//       window.jio_storage = jio_storage;

}(rJS, jIO));
