const Joi = require("joi");
//const Joi = require("@hapi/joi");

const express = require("express");
//const mongoose = require("mongoose");

const Teacher = require("../models/teacher_model");
const Student = require("../models/student_model");
const JoinCode = require("../models/joincode_model");

const router = express.Router();

router.get("/:fb_uid", async (req, res) => {
  console.log("✅✅✅TEACHER DASH REQUESTED ✅✅✅", req.params);
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

// Get updated data from default_class_students
router.get("/refreshdefaultclass/:id", async (req, res) => {
  console.log("🕹🕹🕹 YES! GET REFRESH CLASS DATA 🕹🕹🕹 ", req.params.id);

  try {
    const teacher = await Teacher.findById(req.params.id).populate(
      "default_class_id",
      "-teacher_id -__v"
    );
    const { default_class_info } = teacher;

    const arrayOfStudentIdsToPopulate = default_class_info.students_tentative;

    console.log("arrayOfStudentIdsToPopulate:", arrayOfStudentIdsToPopulate);

    //populate updated students
    if (arrayOfStudentIdsToPopulate && arrayOfStudentIdsToPopulate.length > 0) {
      const students = await Student.find({
        _id: {
          $in: arrayOfStudentIdsToPopulate
        }
      });

      // #2 Set updated student data
      teacher.default_class_students = students;
    } else {
      console.log("NO STUDENT TO LOOK UP");
      teacher.default_class_students = [];
    }

    await teacher.save();
    res.send(teacher.default_class_students); // updated student data returned
  } catch (err) {
    res.status(500).send(["Internal server error", err]);
  }
});

router.put("/setdefaultclass/:id", async (req, res) => {
  console.log("⛺️⛺️⛺️ 1.Default class to set to (req.body)\n", req.body);

  try {
    const teacher = await Teacher.findByIdAndUpdate(
      { _id: req.params.id },
      { default_class_id: req.body._id },
      { new: true }
    ) // #1 Populate default class
      .populate("default_class_id", "-teacher_id -__v");

    // #2 Populate default class and set to updatedClassInfo
    const teacher2 = await teacher.toJSON(); // Need to convert to JSON? try and erase?
    const { default_class_id: updatedClassInfo } = teacher2;

    console.log("🔸🔸🔸 2b. updatedClassInfo===> \n", updatedClassInfo);

    // #3 Set updated class data
    teacher.default_class_info = updatedClassInfo;

    // #4 Reset ID (optional -- do to keep response consistant to db entry consistant )
    teacher.default_class_id = updatedClassInfo._id;

    // #5 Update individual student IF they exist
    const arrayOfStudentIdsToPopulate = updatedClassInfo.students_tentative
      .length
      ? updatedClassInfo.students_tentative
      : null;

    console.log(
      "🏳️‍🌈🏳️‍🌈🏳️‍🌈 3.arrayOfStudentIdsToPopulate====>",
      arrayOfStudentIdsToPopulate
    );

    if (arrayOfStudentIdsToPopulate && arrayOfStudentIdsToPopulate.length > 0) {
      const students = await Student.find({
        _id: {
          $in: arrayOfStudentIdsToPopulate
        }
      });

      // #2 Set updated student data
      teacher.default_class_students = students;
    } else {
      console.log("NO STUDENT TO LOOK UP");
      teacher.default_class_students = [];
    }

    await teacher.save();
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

/* try {
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
} */

router.put("/increasecredit/:id", async (req, res) => {
  if (parseFloat(req.body.credits) < 0) {
    return res.status(404).send("Positive values required");
  }

  const student = await Student.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $inc: req.body
      // $inc: { credits: 1 }
    },
    { new: true }
  );

  if (!student) {
    console.log("❌❌ Problem adding credit record ❌❌");
    return res.status(404).send("Updating student record with credit error");
  }

  res.send(student);
  console.log("🈯️🈯️🈯️ SUCCESS adding credits 🈯️🈯️🈯️", req.body.credits);
});

router.put("/decreasecredit/:id", async (req, res) => {
  if (parseFloat(req.body.credits) < 0) {
    return res.status(404).send("Positive values required");
  }

  const makeNegative = parseFloat(req.body.credits) * -1;

  const student = await Student.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $inc: { credits: makeNegative }
      // $inc: { credits: 1 }
    },
    { new: true }
  );

  if (!student) {
    console.log("❌❌ Problem subtracting credit record ❌❌");
    return res.status(404).send("Updating student record with credit error");
  }

  res.send(student);
  console.log("🈯️🈯️🈯️ SUCCESS subtracting credits 🈯️🈯️🈯️", makeNegative);
});

// this is for?
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

router.post("/", async (req, res) => {
  const { error } = validateTeacher(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let teacher = new Teacher(req.body);
  teacher = await teacher.save();
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
    default_class_id: Joi.object(),
    default_class_info: Joi.object(),
    default_class_students: Joi.array()
  };
  return Joi.validate(teacher, schema);
}

module.exports = router;
