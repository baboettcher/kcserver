const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AddCodeSchema = new Schema({
  join_code: {
    type: String,
    required: [true, "join_code field is required"]
  },
  grade_level: {
    type: String,
    required: [true, "grade field is required"]
  },
  class_description: {
    type: String,
    required: [true, "class_description field is required"]
  },
  teacher_name: {
    type: String,
    required: [true, "teacher_name field is required"]
  }, // later get this from id
  teacher_id: {
    type: String,
    required: [true, "teacher_id field is required"]
  },
  school_name: {
    type: String
  }, // later get this from id
  school_id: {
    type: String
  },
  district_name: {
    type: String
  }, // later get this from id
  district_id: {
    type: String
  },
  special_notes: {
    type: String
  }
});

const AddCode = mongoose.model("addcode", AddCodeSchema);

module.exports = AddCode;