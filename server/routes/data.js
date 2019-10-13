const express = require("express");
const router = express.Router();
const Data = require("../models/data");

function aggregateGroup(aggregation, groupBy) {
  if (groupBy) {
    return aggregation
      .group({
        _id: `$${groupBy}`,
        minFreq: { $min: "$frequency" },
        maxFreq: { $max: "$frequency" },
        sumFreq: { $sum: "$frequency" },
        avgFreq: { $avg: "$frequency" },
        countFreq: { $sum: 1 }
      })
      .collation({ locale: "id" })
      .sort({ _id: 1 });
  }
  return aggregation.collation({ locale: "id" }).sort({ letter: 1 });
}

function aggregateFilter(aggregation, filter) {
  if (filter) {
    return aggregation.match(filter);
  }
  return aggregation;
}

function countData(groupBy, filter) {
  let aggregation = Data.aggregate();
  aggregation = aggregateGroup(aggregation, groupBy);
  aggregation = aggregateFilter(aggregation, filter);
  return aggregation.count("count").exec();
}

function getData(groupBy, limit, skip, filter) {
  let aggregation = Data.aggregate();
  aggregation = aggregateGroup(aggregation, groupBy);
  aggregation = aggregateFilter(aggregation, filter);
  return aggregation
    .skip(skip)
    .limit(limit)
    .exec();
}

// search
router.post("/search", (req, res) => {
  const filter = Object.keys(req.body).map(JSON.parse)[0];
  const groupBy = req.header("GroupBy");
  let limit = req.header("Limit");
  let skip = Number(req.header("Skip") || 0);

  countData(groupBy, filter).then(result => {
    let numOfPages = 0;
    if (result[0]) {
      if (limit == "all") limit = result[0].count;
      limit = Number(limit || result[0].count);
      numOfPages = Math.ceil((result[0].count || 0) / limit);
      if (skip >= result[0].count) skip -= limit;
    }

    getData(groupBy, limit, skip, filter)
      .then(data => {
        if (groupBy) {
          data = data.map(item => {
            item.letter = item._id;
            return item;
          });
        }
        res.status(200).json({ numOfPages, data });
      })
      .catch(err => console.error(err));
  });
});

// get
router.get("/", (req, res) => {
  const groupBy = req.header("GroupBy");
  let limit = req.header("Limit");
  let skip = Number(req.header("Skip") || 0);
  countData(groupBy)
    .then(result => {
      if (limit == "all") limit = result[0].count;
      limit = Number(limit || result[0].count);
      const numOfPages = Math.ceil((result[0].count || 0) / limit);
      if (skip >= result[0].count) skip -= limit;
      getData(groupBy, limit, skip)
        .then(data => {
          if (groupBy) {
            data = data.map(item => {
              item.letter = item._id;
              return item;
            });
          }
          res.status(200).json({ numOfPages, data });
        })
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
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
