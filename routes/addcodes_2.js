const Joi = require("joi");
const express = require("express");
const AddCode = require("../models/addcode_model");
const router = express.Router();

router.get("/:_addcode", async (req, res) => {
  console.log("🚹🚹🚹ADDCODE 🚹🚹🚹 req.params-->", req.params);

  const addcode = await AddCode.find(req.params);
  if (!addcode) {
    console.log("❌❌ No addcode found ❌❌");
    return res
      .status(404)
      .send("AddCode with the given _addcode was not found.");
  }
  res.send(addcode);
});

router.post("/", async (req, res) => {
  const { error } = validateAddCode(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let addcode = new AddCode(req.body);
  addcode = await addcode.save();
  res.send(addcode);
});

router.put("/:id", async (req, res) => {
  const { error } = validateAddCode(req.body);
  if (error) {
    console.log(
      "❌❌ Problem validating  record ❌❌",
      error.details[0].message
    );
    return res.status(400).send(error.details[0].message);
  }

  const addcode = await AddCode.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });

  if (!addcode) {
    console.log("❌❌ Problem updating record ❌❌");
    return res.status(404).send("Updating addcode record error");
  }

  res.send(addcode);
});

router.delete("/:id", async (req, res) => {
  const addcode = await AddCode.findByIdAndRemove(req.params.id);
  if (!addcode)
    return res.status(404).send("The addcode with the given ID was not found.");
  res.send(addcode);
});

router.get("/", async (req, res) => {
  console.log("GET all addcodes");
  const addcodes = await AddCode.find().sort("name");
  res.send(addcodes);
});

function validateAddCode(addcode) {
  const schema = {
    join_code: Joi.string().required(),
    grade_level: Joi.string().required(),
    class_description: Joi.string().required(),
    teacher_name: Joi.string().required(),
    teacher_id: Joi.string().required(),

    school_name: Joi.string().allow(""),
    school_id: Joi.string().allow(""),
    district_name: Joi.string().allow(""),
    district_id: Joi.string().allow(""),
    special_notes: Joi.string().allow("")
  };
  return Joi.validate(addcode, schema);
}

module.exports = router;
