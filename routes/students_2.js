const Joi = require("joi");
const express = require("express");
const Student = require("../models/student_model");
const router = express.Router();

router.get("/:fb_uid", async (req, res) => {
  const student = await Student.find(req.params);
  if (!student) {
    console.log("❌❌ No student found with fb_uid:", req.params.fb_uid);
    return res
      .status(404)
      .send("Student not found w/ fb_uid ", req.params.fb_uid);
  }
  res.send(student);
});

router.post("/", async (req, res) => {
  const { error } = validateStudent(req.body);
  if (error) {
    console.log(
      "💩💩💩 Server error; student post 💩💩💩 ",
      error.details[0].message
    );
    return res.status(400).send(error.details[0].message);
  }

  let student = new Student(req.body);
  student = await student.save();
  res.send(student);
});

// pushes new class to tentative classes
router.put("/addtentativeclass/:id", async (req, res) => {
  console.log("🆔🆔🆔 STUDENT PUT - ADD TENTATIVE CLASS  🆔🆔🆔", req.params);

  // const { error } = validateStudent(req.body);
  // if (error) return res.status(400).send(error.details[0].message);
  // const student = await Student.findByIdAndUpdate(
  //   req.params.id,
  //   { first_name: req.body.first_name },
  //   {
  //     new: true
  //   }
  // );
  // if (!student) console.log("❌❌ Problem validating newclass/addcode ❌❌");
  //return res.status(404).send("first_name with the given ID was not found.");

  const {
    _id,
    grade_level,
    teacher_name,
    class_description,
    teacher_id
  } = req.body;

  const student = await Student.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $push: {
        tentative_classes_ids: req.body._id,
        tentative_classes_cache: {
          _id,
          grade_level,
          teacher_name,
          class_description,
          teacher_id
        }
      }
    }
  );

  if (!student) {
    console.log("❌❌ Problem updating record ❌❌");
    return res.status(404).send("Updating joincode record error");
  }

  console.log("🐡🐡🐡 SUCCESS PUSHING TO STUDENT 🐡🐡🐡 ");
  res.send(student);
});

// NEXT #1:
// if teacher rejects, remove class from tentative_classes and add message to message_to_user { text: blabla, sender: teacherUID}

// NEXT #2:
// after teacher confirms, push new class to confirmed_classes

// is this route still used?
router.put("/:id", async (req, res) => {
  const { error } = validateStudent(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { first_name: req.body.first_name },
    {
      new: true
    }
  );
  if (!student)
    return res.status(404).send("first_name with the given ID was not found.");
  res.send(student);
});

router.delete("/:id", async (req, res) => {
  const student = await Student.findByIdAndRemove(req.params.id);
  if (!student)
    return res.status(404).send("The student with the given ID was not found.");
  res.send(student);
});

router.get("/", async (req, res) => {
  const students = await Student.find().sort("name");
  res.send(students);
});

function validateStudent(student) {
  const schema = {
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    fb_uid: Joi.string().required(),
    email: Joi.string().email({ minDomainAtoms: 2 }),
    school_name: Joi.string().allow(""),
    new_class_code: Joi.string().allow("")
    // new_class: Joi.string(),
    // current_classes: Joi.array(),
    // current_groups: Joi.array()
  };
  return Joi.validate(student, schema);
}

module.exports = router;
