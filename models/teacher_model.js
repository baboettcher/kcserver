const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TeacherSchema = new Schema({
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

  school_name: String,

  // REMOVE ?
  new_class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "joincode"
  },

  default_class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "joincode"
  },

  default_class_info: {
    type: Object
  },

  default_class_students: {
    type: Array
  },

  current_classes: {
    type: Array // array of objects:
  },

  current_groups: {
    type: Array // array of objects:
  },

  current_students: {
    type: Array // array of objects:
  }
});

const Teacher = mongoose.model("teacher", TeacherSchema);

module.exports = Teacher;
