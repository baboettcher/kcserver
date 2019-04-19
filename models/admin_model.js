const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  first_name: {
    type: String,
    required: [true, "first_name field is required,  1 to 50 char"],
    minlength: 1,
    maxlength: 50
  },

  last_name: {
    type: String,
    required: [true, "last_name field is required, 1 to 50 char"],
    minlength: 1,
    maxlength: 50
  },

  fb_uid: {
    type: String,
    required: [true, "fb_uid field is required"]
  },

  email: {
    type: String,
    required: [true, "valid email required"]
  },
  state: String,
  school_name: String,
  district_name: String

  /*   school_uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "school"
  }, */

  /*   district_uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "district"
  }, */
});

const Admin = mongoose.model("admin", AdminSchema);

module.exports = Admin;
