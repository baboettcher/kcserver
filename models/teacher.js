const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// mini schema test

const TeacherSchema = new Schema({
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
    required: [true, "fb_uid field is required"]
  },
  email: {
    type: String,
    required: [true, "email field is required"]
  },

  school_name: {
    type: String,
    required: [true, "school_name is required"]
  },
  current_students: {
    type: Array // LATER: chron job eventually updates in every tecaher record automaticlly for changes in student records
  }, //
  current_classes: {
    type: Array // update later - array of objects
  } //
});

const Teacher = mongoose.model("teacher", TeacherSchema);

module.exports = Teacher;

/*  TeacherSchema:

      REQUIRED TO CREATE TEACHER RECORD:
      - first_name, last_name, school_id
      - school_name populates autmatically from dropdown selection
      
      USE OF APP:
      - student_ids (add a student is added to a class, manually or by Google Classroom)
      
      POPULATED LATER BY FOLLOW-UP DB QUERY:
      - student_mini_records (StudentMiniSchemas)

      LATER:
      - number_of_students, active_in_kidcoin, class_motto, class-sounds, etc
      - differeniate between teachers and classes, allowing students to have multiple teachers

*/
