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
  fb_uid: {
    type: String,
    required: [true, "fb_uid field is required"]
  },
  email: {
    type: String,
    required: [true, "email field is required"]
  },
  current_classes: {
    type: Array // array of objects:
  },
  /* 
  { 
    class_uid : "98ehj0a0j"
    classTeacher: "Mr. Bill",
    classTitle: "The Wild Students of Room 14"
  }
  */

  current_groups: {
    type: Array // array of objects:
  }
  /* 
    { 
      group_uid : "lzdvldjf"
      group_title: "Bobcats"
      arrangementTopic: "Math"
      teacher: "Mr. Lozada"
    }
   */
});

const Student = mongoose.model("student", StudentSchema);

module.exports = Student;
