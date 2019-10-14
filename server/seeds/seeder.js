const fs = require("fs");
const path = require("path");
const Data = require("../models/datadate");

let data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data.json"), "utf8")
);
data = data.map(item => {
  Object.defineProperty(
    item,
    "date",
    Object.getOwnPropertyDescriptor(item, "letter")
  );
  delete item.letter;
  return item;
});

require("mongoose")
  .connect("mongodb://localhost:27017/cmsdb", {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connected");
  })
  .catch(err => {
    console.error(err);
  });

Data.insertMany(data, (err, docs) => {
  if (err) throw err;
  console.log(`${docs.length} has been saved.`);
});
