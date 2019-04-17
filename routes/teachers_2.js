const Joi = require("joi");
//const mongoose = require("mongoose");
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
  console.log("---POSTED, ERROR---", error);
  if (error) return res.status(400).send("OOPA-->" + error.details[0].message);
  //let teacher = new Teacher({ first_name: req.body.first_name });
  let teacher = new Teacher(req.body);
  teacher = await teacher.save();
  res.send(teacher);
});

router.put("/:id", async (req, res) => {
  const { error } = validateTeacher(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const teacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    { first_name: req.body.first_name },
    {
      new: true
    }
  );
  if (!teacher)
    return res.status(404).send("first_name with the given ID was not found.");
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

// Is joi needed?
function validateTeacher(teacher) {
  const schema = {
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    fb_uid: Joi.string().required(),
    email: Joi.string().email({ minDomainAtoms: 2 }),
    new_class: Joi.string(),
    school_name: Joi.string(),
    current_classes: Joi.array(),
    current_groups: Joi.array(),
    current_students: Joi.array()
  };
  return Joi.validate(teacher, schema);
}

module.exports = router;
