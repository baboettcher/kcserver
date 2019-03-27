const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AddCodeSchema = new Schema({
  code: {
    type: String,
    required: [true, "code field is required"]
  },
  grade: {
    type: String,
    required: [true, "grade field is required"]
  },
  class_description: {
    type: String,
    required: [true, "class_description field is required"]
  },
  teacher_id: {
    type: String,
    required: [true, "teacher_id field is required"]
  },
  special_notes: {
    type: String
  },
  district_name: {
    type: String
  }
});

const AddCode = mongoose.model("addcode", AddCodeSchema);

module.exports = AddCode;
