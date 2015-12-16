'use strict';
let Location = require('../models/location');

function create(req, res){
  let newLocation = new Location(req.body);
  newLocation.save(function(err) {
    if (err){
      console.log(err);
      res.status(400).send(err);
    } else {
      res.status(200).send(newLocation)
    }
  });
}

function fetch(req, res) {
  Location.find({}, function(err, locations) {
    res.send(locations);
  });
}

function update(req, res) {
  let locationParams = req.body.location;
  Location.findOne({_id: locationParams.id }, function(err, user) {
    location.update(
      {},
      function(err, location) {
        res.send(location);
      });
  });
}

function destroy(req, res) {
  let locationParams = req.body.location;
  Location.findOne({ _id: locationParams.id }, function(err, location) {
    if (err) {
      return;
    }
    location.remove(function (err) {
      res.send({"record" : "deleted"});
    });
  });
}

module.exports = {
  create: create,
  fetch: fetch,
  update: update,
  destroy: destroy
}
