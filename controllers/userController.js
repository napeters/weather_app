'use strict';
let User = require('../models/user');

function create(req, res){
  let newUser = new User(req.body);

  newUser.save(function(err) {
    if (err){
      res.status(401).send(err);
    } else {
      res.status(200).send({currentUser: newUser})
    // res.status(200).send({token: jwt.sign(newUser, secret), currentUser: newUser})
    }
  })
}

// function fetch(req, res){ //May not need this function -- need to transform data as results show password
//   User.find({}, function(err, users){
//     res.send(users);
//   })
// }
//
// function update(req, res){
//   let userParams = req.body.user;
//   User.findOne({ email: userParams.email }, function(err, user) {
//     user.update(
//       { email: userParams.email },
//       { email: userParams.newEmail, name: userParams.newName },
//       function(err, user){
//         res.send(user);
//       });
//   });
// }
//
// function destroy(req, res){
//   let userParams = req.body.user;
//   User.findOne({ email : userParams.email }, function (err, user) {
//     if (err) {
//       return;
//     }
//     user.remove(function (err) {
//       res.send({"record" : "deleted"});
//     });
//   });
// }

function login(req, res){
  let userParams = req.body;
  if (userParams.email == undefined || userParams.password == undefined) {
    return res.status(401).send({message: "Incorrect Login Information"});
  }
  User.findOne({ email: userParams.email }, function(err, user) {
    if (user == null) {
      return res.status(401).send({message: "Invalid Credentials"});
    } else {
      user.authenticate(userParams.password, function (err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          return res.status(200).send({currentUser: user});
          // return res.status(200).send({message: "Valid Credentials", token: jwt.sign(user, secret), currentUser: user});
        } else {
          return res.status(401).send({message: "Invalid Credentials"});
        }
      });
    }
  });
}

// function logout(req, res) {
//   console.log(req.headers.token);
//   res.status(200).send();
// }

module.exports = {
  create: create,
  // fetch: fetch,
  // update: update,
  // destroy: destroy,
  login: login,
  // logout: logout
}
