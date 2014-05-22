/*global jQuery, jIO, rJS */
(function (window, $, jIO, rJS) {
  "use strict";

  var gk = rJS(window);

  gk.declareMethod('configureIO', function (key) {
    this.jio = jIO.createJIO({
      "type": "local",
      "username": "couscous",
      "application_name": "renderjs"
    });
    this.jio_key = key;
  })

    .declareMethod('getIO', function () {
      var gadget = this;

      return gadget.jio.getAttachment({
        "_id": gadget.jio_key,
        "_attachment": "body.txt"
      }).then(function (response) {
        return jIO.util.readBlobAsText(response.data);
      }).then(function (response) {
        return response.target.result;
      });
    })

    .declareMethod('setIO', function (value) {
      var gadget = this;

      return gadget.jio.put({"_id": gadget.jio_key})
        .then(function () {
          return gadget.jio.putAttachment({
            "_id": gadget.jio_key,
            "_attachment": "body.txt",
            "_data": value,
            "_mimetype": "text/plain"
          });
        });
    })

    .declareMethod('configureDataSourceCallback', function (that, callback) {
      var g = this;
      $(g.element).find('a').unbind('click').click(function () {
        callback.apply(that).then(function (value) {
          g.setIO(value);
        });
      });
    });

}(window, jQuery, jIO, rJS));
