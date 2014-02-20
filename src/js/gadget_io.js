/*jslint indent: 2, unparam: true*/
/*global window, jIO, rJS, RSVP */
"use strict";
(function (window, jIO, rJS, RSVP) {

  var gk = rJS(window);

  gk.declareMethod('configureIO', function (json_configuration, key) {
    rJS(this).jio = jIO.newJio(json_configuration);
    rJS(this).jio_key = key;
    return key;
  })

    .declareMethod('getIO', function () {

      return new RSVP.Promise(function (resolve, reject) {
        var default_value = "",
          gadget = rJS(this);

        gadget.jio.getAttachment({
          "_id": gadget.jio_key,
          "_attachment": "body.txt"
        }, function (err, response) {
          if (err) {
            if (err.status === 404) {
              resolve(default_value);
            } else {
              reject(err);
            }
          } else {
            resolve(response || default_value);
          }
        });
      });
    })

    .declareMethod('setIO', function (value) {

      return new RSVP.Promise(function (resolve, reject) {
        var gadget = rJS(this);

        gadget.jio.put({
          "_id": gadget.jio_key
        }, function (err, response) {
          if (err) {
            reject(err);
          } else {
            gadget.jio.putAttachment({
              "_id": gadget.jio_key,
              "_attachment": "body.txt",
              "_data": value,
              "_mimetype": "text/plain"
            }, function (err, response) {
              if (err) {
                reject(err);
              } else {
                //console.log("putIO: " + value);
                resolve();
              }
            });
          }
        });
      });

    });

}(window, jIO, rJS, RSVP));
