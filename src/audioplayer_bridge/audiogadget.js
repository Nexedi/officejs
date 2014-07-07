/*global rJS, jIO, console, RSVP */
/*jslint nomen: true*/
(function (rJS, jIO) {
  "use strict";

  rJS(window)
    .ready(function (gadget) {
      // Initialize the gadget local parameters
      gadget.state_parameter_dict = {};
      gadget.save = {};
    })

    .declareMethod('createJio', function (jio_options) {
      this.state_parameter_dict.jio_storage = jIO.createJIO(jio_options);
    })
    .declareMethod('allDocs', function () {
      var storage = this.state_parameter_dict.jio_storage,
        that = this;
      if (that.save.data !== undefined) {
        return that.save;
      }
      return storage.allDocs.apply(storage, arguments)
        .then(function (result) {
          that.save = result;
          return result;
        });
    })
    .declareMethod('get', function (param) {
      var storage = this.state_parameter_dict.jio_storage,
        result = this.save,
        length,
        i;
      if (result.data !== undefined) {
        length = result.data.rows.length;
        for (i = 0; i < length; i += 1) {
          if ((result.data.rows[i].doc.title === param._id) ||
              (result.data.rows[i].id === param._id)) {  //xxx
            return ({"data": {"title" : result.data.rows[i].doc.title}});
          }
        }
      }
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
