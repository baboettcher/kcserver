const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// mini schema test
const SchoolMiniSchema = new Schema({
  name: String,
  uid: String
});

const DistrictSchema = new Schema({
  name_full: {
    type: String,
    required: [true, "name_full: field is required"]
  },
  name_initials: {
    type: String,
    required: [true, "name_initials: field is required"]
  },
  state: {
    type: String,
    required: [true, "state field is required"]
  },

  school_mini_records: [SchoolMiniSchema]
});

const District = mongoose.model("district", DistrictSchema);

module.exports = District;
