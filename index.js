const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

mongoose.connect(
  "mongodb://adam:go4MojXIE4vuKUX@ds223542.mlab.com:23542/kidcoin3"
);

mongoose.Promise = global.Promise;

// middleware to server static files, this comes with express
app.use(express.static("public"));

// use body-parser middleware
app.use(bodyParser.json());

app.use("/users", require("./routes/users"));

// error handling middleware - home grown
app.use(function(err, req, res, next) {
  //console.log("middle ware error: ", err);
  res.status(422).send({
    "OOPS! Server side error": err.message
  });
});

// listen for requests
app.listen(process.env.port || 4000, function() {
  console.log("now listening for requests");
});
