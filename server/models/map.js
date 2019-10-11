const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mapSchema = new Schema({
  title: {type: String, required: true},
  lat: {type: Number, required: true},
  long: {type: Number, required: true}
});

module.exports = mongoose.model("Map", mapSchema);
