const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require('cors');

mongoose
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

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const dataRouter = require("./routes/data");
const datadateRouter = require("./routes/datadate");
const mapsRouter = require("./routes/maps");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/data", dataRouter);
app.use("/api/datadate", datadateRouter);
app.use("/api/maps", mapsRouter);

module.exports = app;
