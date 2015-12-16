'use strict';
let mongoose = require('mongoose');

let locationSchema = new mongoose.Schema({
  _userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  city_state: {type: String, required: true},
  lat: {type: Number, required: true},
  lng: {type: Number, required: true},
  created_at: {type: Date, default: Date.now, required: true},
  updated_at: {type: Date, default: Date.now, required: true},
});

let Location = mongoose.model('Location', locationSchema);
module.exports = Location;
