const express = require("express");
const router = express.Router();
const Data = require("../models/data");

// search
router.post("/search", (req, res) => {
  const filter = req.body;
  Data.find(filter, (err, data) => {
    if (err) console.error(err);
    else if (data) res.status(200).json(data);
  });
});

// get
router.get("/", (req, res) => {
  Data.find((err, data) => {
    if (err) console.error(err);
    else if (data) res.status(200).json(data);
  });
});

// edit
router.put("/:id", (req, res) => {
  const { id } = req.params;
  Data.findByIdAndUpdate(id, req.body, (err, data) => {
    if (err) console.error(err);
    else if (data) {
      data = { _id: id, ...req.body };
      res.status(200).json({
        success: true,
        message: "Data have been updated.",
        data
      });
    }
  });
});

// add
router.post("/", (req, res) => {
  const data = new Data(req.body);
  data.save((err, doc) => {
    if (err) console.error(err);
    else {
      doc.__v = undefined;
      res.status(200).json({
        success: true,
        message: "Data have been added.",
        data: doc
      });
    }
  });
});

// delete
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  Data.findByIdAndDelete(id, (err, doc) => {
    if (err) console.error(err);
    else {
      doc.__v = undefined;
      res.status(200).json({
        success: true,
        message: "Data have been deleted.",
        data: doc
      });
    }
  });
});

// find
router.get("/:id", (req, res) => {
  const { id } = req.params;
  Data.findById(id, (err, doc) => {
    if (err) console.error(err);
    else {
      doc.__v = undefined;
      res.status(200).json({
        success: true,
        message: "Data found.",
        data: doc
      });
    }
  });
});

module.exports = router;
