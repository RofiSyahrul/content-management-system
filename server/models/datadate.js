const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const dataDateSchema = new Schema({
  date: String,
  frequency: Number
});

module.exports = mongoose.model("Datadate", dataDateSchema);
