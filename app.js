const express = require("express");
//const graphqlHTTP = require("express-graphql");
//const schema = require("./schema/schema");
//const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

let num = 0;
// middleware
// allow cross-origin requests
app.use(cors());

const router = express.Router();

app.get("/users", function(req, res, next) {
  /*   res.json([{ id: 1, username: "samantha" }, { id: 2, username: "willy" }]);
 */
  num++;
  console.log("GET REQUEST RECEIEVED", num);
  res.send([{ 1: "Saw my baby down by the riverside" }]);
});

app.listen(process.env.port || 4444, () => {
  console.log("Escuchando TODO requests on port 4444!!");
});

// options passed due to error. solution here:
// https://stackoverflow.com/questions/30909492/mongoerror-topology-was-destroyed

/* var options = {
  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
}; */
