const Joi = require("joi");
//const mongoose = require("mongoose");
const express = require("express");
const Student = require("../models/student_model");
const router = express.Router();

router.get("/:fb_uid", async (req, res) => {
  console.log("🆔🆔🆔🆔🆔 STUDENT DASH REQUESTED 🆔🆔🆔🆔🆔", req.params);

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
  console.log("======= req.body--> ", req.body);
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
    new_class_code: Joi.string().allow(""),
    /*  new_class: Joi.string(), */
    current_classes: Joi.array(),
    current_groups: Joi.array()
  };
  return Joi.validate(student, schema);
}

module.exports = router;
