const Joi = require("joi");
const express = require("express");
const Teacher = require("../models/teacher_model");
const router = express.Router();

router.get("/:fb_uid", async (req, res) => {
  console.log("✅✅✅TEACHER DASH REQUESTED ✅✅✅  req.params-->", req.params);

  const teacher = await Teacher.find(req.params);
  if (!teacher) {
    console.log("❌❌ No teacher found ❌❌");
    return res.status(404).send("Teacher with the given fb_uid was not found.");
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

router.put("/addclass/:id", async (req, res) => {
  console.log("Class to push:", req.body);

  const teacher = await Teacher.findByIdAndUpdate(
    { _id: req.params.id },
    { $push: { current_classes: req.body } }
  ); //  { new: true }

  if (!teacher) {
    console.log("teacher-->", teacher);
    console.log("❌❌ Problem addding class to teacher record ❌❌");
    return res.status(404).send("Updating teacher record error");
  }

  res.status(200).send(req.body);
});

router.put("/:id", async (req, res) => {
  console.log("----->>>>", req.body);
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
    current_classes: Joi.array(),
    current_groups: Joi.array(),
    current_students: Joi.array()
  };
  return Joi.validate(teacher, schema);
}

module.exports = router;
