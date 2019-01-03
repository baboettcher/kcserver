const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  SchoolSchema:

      REQUIRED TO CREATE SCHOOL RECORD:
      - name, principal, district
      
      SECONDARY ADDED BY USERS
      - teacher_ids, student_ids
      
      AUTOMATIC DB CALLS (when?)
      - teacher_mini_records, student_mini_records 
      
      LATER:
      - number_of_students, active_in_kidcoin, school_motto
      - make principal_id --> principal
      - make district_id --> district

*/

const StudentMiniSchema = new Schema({
  first_name: String,
  last_name: String,
  uid: String
});

const TeacherMiniSchema = new Schema({
  first_name: String,
  last_name: String,
  uid: String
});

const SchoolSchema = new Schema({
  name: {
    type: String,
    required: [true, "name field is required"]
  },
  principal: {
    type: String,
    required: [true, "principal field is required"]
  },
  district_uid: {
    type: String,
    required: [true, "district field is required"]
  },
  district_name: {
    type: String
  },
  teacher_mini_records: [TeacherMiniSchema],
  student_mini_records: [StudentMiniSchema]
});

const School = mongoose.model("school", SchoolSchema);

module.exports = School;
