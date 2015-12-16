'use strict';
let express = require('express');
let router = express.Router();
let user = require('../controllers/userController')

// router.route('/')
//   .get(user.fetch)
//   .put(user.update)
//   .delete(user.destroy);

router.route('/login')
  .post(user.login);

router.route('/signup')
  .post(user.create);

// router.route("/logout")
//   .get(user.logout);

module.exports = router;
