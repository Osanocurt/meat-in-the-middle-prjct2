const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const authController = require("../controllers/auth");
const users = require("../controllers/users");
const jwt = require("jsonwebtoken");
const secret = require("./tokens").secret;

function secureRoute(req, res, next) {
 if(!req.headers.authorization) return res.status(401).json({ message: "Unauthorized" });

 let token = req.headers.authorization.replace('Bearer ', '');

 jwt.verify(token, secret, (err, payload) => {
   if(err) return res.status(401).json({ message: "Unauthorized" });
   req.user = payload;

   next();
 });
}

router.route("/register")
  .post(authController.register);

router.route("/login")
  .post(authController.login);

router.route("/users")
  .all(secureRoute)
  .get(usersController.index);

router.route("/users/:id/friends")
  .all(secureRoute)
  .get(usersController.friendsIndex)
  .post(usersController.friendsCreate);

router.route("/users/:id/friends/:friendId")
  .all(secureRoute)
  .get(usersController.friendsShow)
  .put(usersController.friendsUpdate)
  .delete(usersController.friendsDelete);

module.exports = router;
