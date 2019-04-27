const express = require("express");
const router = express.Router();

const District = require("../models/district");
const School = require("../models/school");
const Teacher = require("../zzz_bin/xxteacher");
const Student = require("../models/student");
const Super = require("../models/super");
const AddCode = require("../models/joincode");

// ----- POST ----- //

// april
router.post("/addstudent", function(req, res, next) {
  console.log("STUDENT POST: ", req.body);
  Student.create(req.body)
    .then(function(student) {
      res.send(student);
    })
    .catch(next);
});

// april
router.post("/save_new_addcode", function(req, res, next) {
  const mostRecentlyAddedClass =
    req.body.current_classes[req.body.current_classes.length - 1];
  console.log("mostRecentlyAddedClass-->", mostRecentlyAddedClass);
  AddCode.create(mostRecentlyAddedClass)
    .then(function(addcode_resp) {
      res.send(addcode_resp);
    })
    .catch(next);
});

router.post("/addteacher", function(req, res, next) {
  console.log(req.body);
  Teacher.create(req.body)
    .then(function(teacher_resp) {
      res.send(teacher_resp);
    })
    .catch(next);
});

router.post("/super", function(req, res, next) {
  console.log("SUPER POST: ", req.body);
  Super.create(req.body)
    .then(function(student) {
      res.send(student);
    })
    .catch(next);
});

router.post("/school", function(req, res, next) {
  console.log("SCHOOL POST: ", req.body);
  School.create(req.body)
    .then(function(student) {
      res.send(student);
    })
    .catch(next);
});

router.post("/district", function(req, res, next) {
  console.log("NEW DISTRICT POST: ", req.body);
  District.create(req.body)
    .then(function(district) {
      res.send(district);
    })
    .catch(next);
});

// post new teacher, put updated school record
router.post("/teacher_2", function(req, res, next) {
  console.log("REMINDER: Errors not being send back. Change 'next?'");
  console.log("------------------ CREATE ---------------------------");
  console.log("1) Req.body arrived:  ", req.body);

  Teacher.create(req.body).then(function(teacher) {
    console.log("2) teacher created:  ", teacher);
    console.log("3) Getting school record:" + teacher.school_uid);

    School.findById(teacher.school_uid, (err, schoolRecord) => {
      if (err) return res.status(500).send(err);
      return schoolRecord;
    })

      .then(schoolRecordBundle => {
        // clean up teacher object
        const cleanedUpTeacher = {
          uid: teacher._id.toString(),
          first_name: teacher.first_name,
          last_name: teacher.last_name
        };

        console.log(cleanedUpTeacher);
        console.log(
          "-------------- UPDATED: teacher_mini_records -------------------"
        );
        const updated_teacher_mini_records = schoolRecordBundle.teacher_mini_records.concat(
          cleanedUpTeacher
        );
        console.log(updated_teacher_mini_records);

        console.log("-------------- Updated School Object -------------------");
        const updatedSchoolObject = Object.assign(schoolRecordBundle, {
          teacher_mini_records: updated_teacher_mini_records
        });
        console.log(updatedSchoolObject);
        return updatedSchoolObject;
      })

      .then(function(updatedSchoolObject) {
        "-------------- UPDATE School Object -------------------";

        School.findByIdAndUpdate(
          { _id: updatedSchoolObject._id },
          updatedSchoolObject
        )
          .then(function() {
            School.findOne({ _id: updatedSchoolObject._id }).then(function(
              updatedSchoolObject
            ) {
              res.send(updatedSchoolObject);
            });
          })
          .catch(function(err) {
            err;
          });
      })
      .catch(err => console.log("ERROR inside updatedSchoolObject", err));
  });
});

// ------------- GET ----------- //
router.get("/load_teacher_dashboard", function(req, res, next) {
  console.log("LOAD TEACHER REQUESTED ✅✅✅✅ -->", req.query); //req.params._id);

  Teacher.findOne(req.query)
    .then(teacherRecord => {
      //console.log(result);
      return res.status(200).json(teacherRecord);
    })
    .catch(err => {
      console.log("ERR: ", err);
      return res.status(500).send(err);
    });

  /*   async function getTeachers() {
    const teachers = await Teacher.find();
    console.log("teachers---->>", teachers);
  }
  getTeachers();
 */
  /* 
  Teacher.find(req.query.fb_uid, (err, teacherRecord) => {
    if (err) return res.status(500).send(err);
    return res.status(200).json(teacherRecord);
  }).then(teacherRecord =>
    console.log("teacherRecord", teacherRecord.last_name)
  ); */
});

router.get("/teacher_record", function(req, res, next) {
  console.log("TEACHER RECORD REQUESTED -->", req.query); //req.params._id);

  Teacher.findById(req.query.id, (err, teacherRecord) => {
    if (err) return res.status(500).send(err);
    return res.status(200).json(teacherRecord);
  }).then(teacherRecord =>
    console.log("teacherRecord", teacherRecord.last_name)
  );
});

router.get("/all_supers", function(req, res, next) {
  console.log("GET ALL SUPERS");
  Super.find((err, supers) => {
    if (err) return res.status(500).send(err);

    return res.status(200).send(supers);
  });
});

router.get("/all_districts", function(req, res, next) {
  console.log("GET ALL DISTRICTS");
  District.find((err, districts) => {
    if (err) return res.status(500).send(err);

    return res.status(200).send(districts);
  });
});

router.get("/all_schools", function(req, res, next) {
  console.log("GET ALL SCHOOLS");
  School.find((err, schools) => {
    if (err) return res.status(500).send(err);
    return res.status(200).send(schools);
  });
});

// Store list of school mini_record [ids, name] on the district mongo object to quickly iterate over THEN look up
router.get("/all_schools_in_district", function(req, res, next) {
  console.log("GET ALL SCHOOLS IN DISTRICT", req.query);
  School.find(req.query, (err, schools) => {
    if (err) return res.status(500).send(err);

    return res.status(200).send(schools);
  });
});

router.get("/all_teachers", function(req, res, next) {
  console.log("GET ALL TEACHERS", res);
  Teacher.find((err, teachers) => {
    if (err) return res.status(500).send(err);

    return res.status(200).send(teachers);
  });
});

router.get("/all_students", function(req, res, next) {
  console.log("GET ALL STUDENTS");
  Student.find((err, students) => {
    if (err) return res.status(500).send(err);
    return res.status(200).send(students);
  });
});

router.get("/district_record", function(req, res, next) {
  console.log("DISTRICT RECORD REQUESTED -->", req.query); //req.params._id);

  District.findById(req.query.id, (err, districtRecord) => {
    if (err) return res.status(500).send(err);
    return res.status(200).json(districtRecord);
  })
    .then(districtRecord =>
      console.log("districtRecord", districtRecord.name_full)
    )
    .catch(next);
});

/* router.get("/school_record", function(req, res, next) {
    console.log("SCHOOL RECORD REQUESTED -->", req.query);
    School.findById(req.query.id, (err, schoolRecord) => {
      if (err) return res.status(500).send(err);
      return res.status(200).json(schoolRecord);
    }).then(schoolRecord => console.log("SUP HERE?", schoolRecord.name));
  });
  */

router.get("/school_record_v2", function(req, res, next) {
  console.log("SCHOOL RECORD V2 REQUESTED -->", req.query);
  School.findById(req.query._id, (err, schoolRecord) => {
    if (err) return res.status(500).send(err);
    return res.status(200).json(schoolRecord);
  }).then(schoolRecord => console.log("SCHOOL V2 RECORD", schoolRecord));
});

// ----- PUT / DELETE ----- //

/* 
 Add 
 { "6DIGITCODEFORCLASS" : {
  subject: English,
  numberOfStudent: 90,
  students: [ "sdfsdff", "sdfsdfsdf", "Sdfsfsd"]
}}

 */

router.put("/teacher_add_class/:id", function(req, res, next) {
  console.log(req.body);
  console.log("req.params.id ==>", req.params.id);

  Teacher.findByIdAndUpdate({ _id: req.params.id }, req.body)
    .then(function() {
      Teacher.findOne({ _id: req.params.id }).then(function(updatedTeacher) {
        res.send(updatedTeacher);
      });
    })
    .catch(function(err) {
      console.log("ERROR🆘🆘🆘🆘🆘🆘🆘🆘🆘🆘", err);
    });
});

router.put("/teacher/:id", function(req, res, next) {
  Teacher.findByIdAndUpdate({ _id: req.params.id }, req.body)
    .then(function() {
      Teacher.findOne({ _id: req.params.id }).then(function(updatedTeacher) {
        res.send(updatedTeacher);
      });
    })
    .catch(function(err) {
      err;
    });
});

// #2 experimental: Add students to teacher
// step 1: add student to teacher array in STATES / REDUX
// QUESTION: Are two arrays needed? Seems not. The student ID should be added to the mini_record schema
// step 2: send back success message, but STILL keep...

router.put("/add_student_to_teacher/:id", function(req, res, next) {
  Teacher.findByIdAndUpdate({ _id: req.params.id }, req.body)
    .then(function() {
      Teacher.findOne({ _id: req.params.id }).then(function(updatedTeacher) {
        res.send(updatedTeacher);
      });
    })
    .catch(function(err) {
      err;
    });
});

router.put("/delete_teacher_from_school/:schoolid", function(req, res, next) {
  // (STRUCTURE 2: Double db call from server.
  // - cliente sends schoolid as param
  // - on body there are two properties
  // - 1)teacher_mini_records should be send from client WITH DELETION ALREADY MADE
  // - 2) teacher_id_to_delete: this is used in second db call to delete main teacher record
  //  (make additional db call to check that school updated properly?)

  // ahconsole.log("REQ.BODY #1==>", req.body.teacher_mini_records);

  const { teacher_id_to_delete, teacher_mini_records } = req.body;

  const updatedData = {
    teacher_mini_records: teacher_mini_records
  };

  School.findByIdAndUpdate({ _id: req.params.schoolid }, updatedData)
    .then(function(updatedSchool) {
      res.send(updatedSchool);

      // School.findOne({ _id: req.params.schoolid }).then(function(
      //   updatedSchool
      // ) {
      //   console.log("BANG ZOOM!!!");
      //   res.send(updatedSchool);
      // });
    })
    .then(() => {
      console.log("INSIDE HERE!");
      Teacher.findByIdAndRemove({ _id: teacher_id_to_delete })
        .then(function(data) {
          res.send(data);
        })
        .catch(function(err) {
          err;
        });
    })
    .catch(function(err) {
      err;
    });
});

// ----- SIMPLE DELETE ----- //

router.delete("/district/:id", function(req, res, next) {
  console.log("DELETING DISTRICT-->: ", req.params.id);
  District.findByIdAndRemove({ _id: req.params.id })
    .then(function(data) {
      res.send(data);
    })
    .catch(function(err) {
      err;
    });
});

router.delete("/teacher2/:id", function(req, res, next) {
  console.log("DELETING TEACHER2 (TWO PLACES) ID: ", req.params.id);
  Teacher.findByIdAndRemove({ _id: req.params.id })
    .then(function(data) {
      res.send(data);
    })
    .catch(function(err) {
      err;
    });
});

router.delete("/school/:id", function(req, res, next) {
  console.log("DELETING SCHOOL ID: ", req.params.id);
  School.findByIdAndRemove({ _id: req.params.id })
    .then(function(data) {
      res.send(data);
    })
    .catch(function(err) {
      err;
    });
});

// still need to get reference to any teacher this student is assigned to and delete them there
router.delete("/student/:id", function(req, res, next) {
  console.log("DELETING (Part 1) STUDENT ID: ", req.params.id);
  Student.findByIdAndRemove({ _id: req.params.id })
    .then(function(data) {
      res.send(data);
    })
    .catch(function(err) {
      err;
    });
});

module.exports = router;
