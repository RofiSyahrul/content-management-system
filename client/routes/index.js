var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", (req, res) => {
  res.render("index");
});

// display bar chart
router.get("/bar", (req, res) => {
  res.render("bar");
});

// display pie chart
router.get("/pie", (req, res) => {
  res.render("pie");
});

module.exports = router;
