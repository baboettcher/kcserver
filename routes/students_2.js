const Joi = require("joi");
//const mongoose = require("mongoose");
const express = require("express");
const Student = require("../models/student_model");
const router = express.Router();

router.get("/:anything", async (req, res) => {
  console.log(
    "🆔🆔🆔🆔🆔 STUDENT DASH REQUESTED 🆔🆔🆔🆔🆔 why is req.query is empty??-->",
    req.query
  );
  const teacher = await Teacher.findOne(req.query);
  const student = await Student.findById(req.params.id);
  if (!student) {
    console.log("❌❌ Student not found ❌❌");
    return res.status(404).send("Student with the given ID was not found.");
  }
  res.send(student);
});

router.post("/", async (req, res) => {
  const { error } = validateStudent(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let student = new Student({ first_name: req.body.first_name });
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
    first_name: Joi.string()
      .min(3)
      .required()
  };
  return Joi.validate(student, schema);
}

module.exports = router;
