const express = require('express');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const usersController = require("../controllers/users");


const authController = require('../controllers/auth'); //We need to make the auth.js file affects
const pubsController = require('../controllers/pubs');
const secret = require('./tokens').secret; //We need to make the tokens file

//Make the SecureRoute function
function secureRoute(req, res, next) {
 if(!req.headers.authorization) return res.status(401).json({ message: "Unauthorized"}); //If not logged in
 let token = req.headers.authorization.replace('Bearer ', '');
 jwt.verify(token, secret, (err, payload) => {
   if(err) return res.status(401).json({ message: "Unauthorized" }); //If token or secret is incorrectly
   req.user = payload;
   next();
 });
}

router.route("/register")
 .post(authController.register);
router.route("/login")
 .post(authController.login);

 router.route('/users')
   .all(secureRoute)
   .get(usersController.index);
 router.route('/users/:id')
   .all(secureRoute)
   .get(usersController.show)
   .put(usersController.update)
   .delete(usersController.delete);


router.route('/pubs')
 .get(secureRoute, pubsController.index)
 .post(secureRoute, pubsController.create);

router.route('/pubs/:id')
 .all(secureRoute)
 .get(pubsController.show)
 .put(pubsController.update)
 .delete(pubsController.delete);

module.exports = router;
