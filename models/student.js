const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*  StudentSchema:

      REQUIRED TO CREATE STUDENT RECORD:
      - first_name, last_name, school_id, teacher_id
      
      AUTOMATIC DB CALLS (when?)
      - school, teacher
      
      POPULATED BY USE OF APP:
      - credits
      
      LATER:
      - AcademicRecord
      
      */

// sub-record
const AcademicRecordSchema = new Schema({
  hash_of_student_id: {
    type: String
  },
  ela_percentile: {
    type: Number
  },
  math_percentile: {
    type: Number
  }
});

const StudentSchema = new Schema({
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
  school: String,
  teacher_uids: {
    type: Array,
    required: [true, "one or more teacher_ids is required"]
  },
  teachers: Array,
  credits: {
    type: Number,
    default: 1
  },
  academic_record: AcademicRecordSchema
});

const Student = mongoose.model("student", StudentSchema);

module.exports = Student;
