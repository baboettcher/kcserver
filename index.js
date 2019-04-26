const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const users = require("./routes/users");  // investigate reason for this error

const app = express();

mongoose
  .connect("mongodb://adam:go4MojXIE4vuKUX@ds223542.mlab.com:23542/kidcoin3")
  .then(() => console.log("👾👾👾Connected to MongoDB..."))
  .catch(err => console.error("Could not connect to MongoDB..."));

mongoose.Promise = global.Promise;

// middleware to server static files, this comes with express
app.use(express.static("public"));

// use body-parser middleware
app.use(bodyParser.json());

//app.use("/users", require(users)); // investigate reason for this error
//app.use("/users", require(students2));

//app.use("/users", require("./routes/users"));
app.use("/student", require("./routes/students_2"));
app.use("/teacher", require("./routes/teachers_2"));
app.use("/admin", require("./routes/admins_2"));
app.use("/joincode", require("./routes/joincodes_2"));

// error handling middleware - home grown
app.use(function(err, req, res, next) {
  //console.log("middle ware error: ", err);
  res.status(422).send({
    "OOPS! Server side error": err.message
  });
});

// listen for requests
const port = process.env.PORT || 4000;
app.listen(port, function() {
  console.log(`📣📣📣Listening on port ${port}...`);
});
