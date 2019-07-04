const Joi = require("joi");
const express = require("express");
//const mongoose = require("mongoose");

const Teacher = require("../models/teacher_model");
const Student = require("../models/student_model");
const JoinCode = require("../models/joincode_model");

const router = express.Router();

router.get("/:fb_uid", async (req, res) => {
  console.log("✅✅✅TEACHER DASH REQUESTED ✅✅✅  req.params-->", req.params);
  try {
    const teacher = await Teacher.find(req.params).populate(
      "default_class",
      "-teacher_id -__v"
    );
    // invalid teacher returns a [], why?
    if (!teacher.length) {
      console.log("❌❌ No teacher found ❌❌");
      return res
        .status(404)
        .send("Teacher with the given fb_uid was not found.");
    }
    res.send(teacher);
  } catch (err) {
    console.log("ERROR IN GET TEACHER DASHBOARD");
    res.status(500).send("Internal server error");
  }
});

router.post("/", async (req, res) => {
  const { error } = validateTeacher(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let teacher = new Teacher(req.body);
  teacher = await teacher.save();
  res.send(teacher);
});

// new test
router.put("/setdefaultclass/:id", async (req, res) => {
  // console.log(
  //   "⛺️⛺️⛺️⛺️⛺️⛺️⛺️⛺️-1.Default class to set to (req.body)",
  //   req.body
  // );

  try {
    const teacher = await Teacher.findByIdAndUpdate(
      { _id: req.params.id },
      { default_class: req.body._id },
      { new: true }
    ) //
      .populate("default_class", "-teacher_id -__v");

    const teacher2 = await teacher.toJSON();

    const { default_class } = teacher2;
    const arrayOfStudentIdsToPopulate = default_class
      ? default_class.students_tentative
      : null;
    // GET STUDENT INFO:
    // iterate over arrayOfIds and set values to default_class

    console.log(
      "arrayOfStudentIdsToPopulate====>",
      arrayOfStudentIdsToPopulate
    );

    if (arrayOfStudentIdsToPopulate && arrayOfStudentIdsToPopulate.length > 0) {
      const students = await Student.find({
        _id: {
          $in: arrayOfStudentIdsToPopulate
        }
      });

      teacher.default_class_full = students;

      await teacher.save();

      // const finalTest = await teacher.save();
      // const finalTest2 = await teacher.toJSON();
      // console.log("💠💠💠💠💠💠💠finalTest-->💠💠💠💠💠💠💠💠", finalTest2);

      res.status(200).send(teacher);
    } else {
      console.log("NO STUDENT TO LOOK UP");
    }
  } catch (err) {
    console.log("OOPS", err);
    res.status(404).send("Error. Check teacher ID or class ID");
  }
});

//ORIG
router.put("/setdefaultclass_orig/:id", async (req, res) => {
  console.log("🗺🗺🗺🗺🗺🗺🗺🗺-1.Default class to set to (req.body)", req.body);
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      { _id: req.params.id },
      { default_class: req.body._id },
      { new: true }
    ) //
      .populate("default_class", "-teacher_id -__v");

    const teacher2 = await teacher.toJSON();

    console.log("teacher2", teacher2);
    const { default_class } = teacher2;
    const arrayOfIdsToPopulate = default_class
      ? default_class.students_tentative
      : null;
    // GET STUDENT INFO:
    // iterate over arrayOfIds and set values to default_class

    console.log("arrayOfIdsToPopulate====>", arrayOfIdsToPopulate);

    if (arrayOfIdsToPopulate && arrayOfIdsToPopulate.length > 0) {
      /*    const student = await Student.find({
     _id: {
       $in: [
         mongoose.Types.ObjectId("5d197cb138d44c23c8272e91"),
         mongoose.Types.ObjectId("5d197cc638d44c23c8272e92")
       ]
     }
   }); */
      const student = await Student.find({
        _id: {
          $in: arrayOfIdsToPopulate
        }
      });

      console.log(
        "student 🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅🌅=>>>>"
        // student
      );
    } else {
      console.log("NO STUDENT TO LOOK UP");
    }

    res.status(200).send(teacher);
  } catch (err) {
    console.log("OOPS", err);
    res.status(404).send("Error. Check teacher ID or class ID");
  }
});

router.put("/addclass/:id", async (req, res) => {
  const teacher = await Teacher.findByIdAndUpdate(
    { _id: req.params.id },
    { $push: { current_classes: req.body } }
  ); //  { new: true }

  if (!teacher) {
    console.log("❌❌ Problem adding class to teacher record ❌❌");
    return res.status(404).send("Updating teacher record error");
  }

  res.status(200).send(req.body);
});

router.put("/:id", async (req, res) => {
  // console.log("----->>>>", req.body);
  const { error } = validateTeacher(req.body);
  if (error) {
    console.log(
      "❌❌ Problem validating teacher record ❌❌",
      error.details[0].message
    );
    return res.status(400).send(error.details[0].message);
  }

  const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });

  if (!teacher) {
    console.log("❌❌ Problem updating record ❌❌");
    return res.status(404).send("Updating teacher record error");
  }

  res.send(teacher);
});

router.delete("/:id", async (req, res) => {
  const teacher = await Teacher.findByIdAndRemove(req.params.id);
  if (!teacher)
    return res.status(404).send("The teacher with the given ID was not found.");
  res.send(teacher);
});

router.get("/", async (req, res) => {
  console.log("GET all teachers");
  const teachers = await Teacher.find().sort("name");
  res.send(teachers);
});

function validateTeacher(teacher) {
  const schema = {
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    fb_uid: Joi.string().required(),
    email: Joi.string().email({ minDomainAtoms: 2 }),
    school_name: Joi.string().allow(""),
    new_class: Joi.string().allow(""),
    current_classes: Joi.array(), // change to .object()
    current_groups: Joi.array(),
    current_students: Joi.array(),
    default_class: Joi.object() // try!
  };
  return Joi.validate(teacher, schema);
}

module.exports = router;
