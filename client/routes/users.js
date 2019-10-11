var express = require("express");
var router = express.Router();

/* Login */
router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/home", (req, res) => {
  res.render("home");
});

router.get("/data", (req, res) => {
  res.render("data");
});

module.exports = router;
