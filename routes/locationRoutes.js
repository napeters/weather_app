'use strict';
let express = require('express');
let router = express.Router();
let user = require('../controllers/userController')
let location = require('../controllers/locationController');
// let expressJWT = require('express-jwt');
// const secret = "";

router.route('/')
  .get(location.fetch)
  // .all(expressJWT({
  //   secret: secret,
  //   userProperty: 'auth'
  // }))
  .put(location.update)
  .delete(location.destroy)
  .post(location.create);

module.exports = router;
