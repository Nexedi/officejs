/*global rJS, jIO, console */
(function (rJS, jIO) {
  "use strict";

  rJS(window)

    .ready(function (gadget) {
      // Initialize the gadget local parameters
      gadget.state_parameter_dict = {};
    })

    .declareMethod('createJio', function (jio_options) {
      this.state_parameter_dict.jio_storage = jIO.createJIO(jio_options);
    })
    .declareMethod('allDocs', function () {
      var storage = this.state_parameter_dict.jio_storage;
      return storage.allDocs.apply(storage, arguments);
    })
    .declareMethod('get', function () {
      var storage = this.state_parameter_dict.jio_storage;
      return storage.get.apply(storage, arguments);
    })
    .declareMethod('getAttachment', function () {
      var storage = this.state_parameter_dict.jio_storage;
      return storage.getAttachment.apply(storage, arguments)
        // XXX Where to put this &@! blob reading
        .then(function (response) {
          return response.data;
          //return jIO.util.readBlobAsText(response.data);
        });
      /*
        .then(function (lala) {
        console.log(lala.target.result);
        return lala.target.result;
        });*/
    })
    .declareMethod('putAttachment', function () {
      var storage = this.state_parameter_dict.jio_storage;
      return storage.putAttachment.apply(storage, arguments);
    })
    .declareMethod('post', function () {
      var storage = this.state_parameter_dict.jio_storage;
      return storage.post.apply(storage, arguments);
    });

}(rJS, jIO));
