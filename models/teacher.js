const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// mini schema test
const StudentMiniSchema = new Schema({
  first_name: String,
  last_name: String,
  uid: String
});

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

const TeacherSchema = new Schema({
  first_name: {
    type: String,
    required: [true, "first_name field is required"]
  },
  last_name: {
    type: String,
    required: [true, "last_name field is required"]
  },
  school_uid: {
    type: String,
    required: [true, "school_id is required"]
  },
  school_name: String,

  student_mini_records: [StudentMiniSchema]
});

const Teacher = mongoose.model("teacher", TeacherSchema);

module.exports = Teacher;
