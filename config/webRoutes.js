const router  = require("express").Router();

router.route("/")
  .get((req, res) => {
    console.log("Request");
    res.sendFile(`${__dirname}/public/index.html`);
  });

module.exports = router;
