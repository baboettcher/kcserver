const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SuperSchema = new Schema({
  first_name: {
    type: String,
    required: [true, "first_name field is required"]
  },
  last_name: {
    type: String,
    required: [true, "last_name field is required"]
  },
  fb_uid: {
    type: String,
    required: [true, "fb_uid is required"]
  },
  kc_auth: {
    type: Object
  },
  initials: String
});

const Super = mongoose.model("super", SuperSchema);

module.exports = Super;
