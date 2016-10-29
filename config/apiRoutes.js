const express = require("express");
const router = express.Router();
const friendsController = require("../controllers/friends");
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

router.route("/friends")
  .all(secureRoute)
  .get(friendsController.index)
  .post(friendsController.create);

router.route("/friends/:id")
  .all(secureRoute)
  .get(friendsController.show)
  .put(friendsController.update)
  .delete(friendsController.delete);

module.exports = router;
