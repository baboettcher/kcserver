const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
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
    required: [true, "email field is required"]
  },
  school_name: String,
  new_class_code: String,

  tentative_classes: [{ type: Schema.ObjectId, ref: "joincode" }],

  current_classes: [{ type: Schema.ObjectId, ref: "joincode" }],

  current_groups: {
    type: Array // array of objects:
  },
  credits: { type: Number, default: 0 },
  updated: { type: Date, default: Date.now },
  created: { type: Date, default: Date.now }
});

const Student = mongoose.model("student", StudentSchema);

module.exports = Student;
