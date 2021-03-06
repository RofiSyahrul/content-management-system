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

router.get("/data-date", (req, res) => {
  res.render("data-dates");
});

router.get("/maps", (req, res) => {
  res.render("data-maps");
});

module.exports = router;
