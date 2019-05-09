const Joi = require("joi");
const express = require("express");
const JoinCode = require("../models/joincode_model");
const router = express.Router();

router.get("/:join_code", async (req, res) => {
  const joincode = await JoinCode.find(req.params);
  if (!joincode || !joincode[0]) {
    console.log("❌❌ No joincode found ❌❌");
    return res.status(404).send("joincode was not found.");
  }
  res.status(200).send(joincode);
});

router.post("/", async (req, res) => {
  console.log("🚹 JOINCODE POSTED 🚹 ");
  const { error } = validateJoinCode(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let joincode = new JoinCode(req.body);
  joincode = await joincode.save();
  res.status(200).send(joincode);
});

router.put("/:id", async (req, res) => {
  console.log("🚹🚹🚹 JOINCODE PUT 🚹🚹🚹 ");

  const checkId = await JoinCode.findById(req.params.id);
  if (checkId.students_tentative_ids.includes(req.body._id)) {
    console.log("--->> FOUND IN: students_tentative_ids <<----");
    return res.status(404).send(checkId);
  }

  // REFACTOR to limit db calls
  // - push req.body._id to students_tentative_id
  // - push the object  to students_tentative_cache
  // .save()
  const joincode = await JoinCode.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $push: {
        students_tentative_ids: req.body._id,
        students_tentative_cache: {
          _id: req.body._id,
          first_name: req.body.first_name,
          last_name: req.body.last_name
        }
      }
    }
  );

  if (!joincode) {
    console.log("❌❌ Problem updating record ❌❌");
    return res.status(404).send("Updating joincode record error");
  }

  console.log("🦑🦑🦑 SUCCESS 🦑🦑🦑 ");
  res.send(joincode);
});

/* router.delete("/:id", async (req, res) => {
  const joincode = await JoinCode.findByIdAndRemove(req.params.id);
  if (!joincode)
    return res.status(404).send("The joincode with the given ID was not found.");
  res.send(joincode);
});

router.get("/", async (req, res) => {
  console.log("GET all joincodes");
  const joincodes = await JoinCode.find().sort("name");
  res.send(joincodes);
});
 */
function validateJoinCode(joincode) {
  const schema = {
    join_code: Joi.string().required(),
    grade_level: Joi.string().required(),
    class_description: Joi.string().required(),
    teacher_name: Joi.string().required(),
    teacher_id: Joi.string().required(),

    students_tentative: Joi.array(),
    students_confirmed: Joi.array(),

    school_name: Joi.string().allow(""),
    school_id: Joi.string().allow(""),
    district_name: Joi.string().allow(""),
    district_id: Joi.string().allow(""),
    special_notes: Joi.string().allow("")
  };
  return Joi.validate(joincode, schema);
}

module.exports = router;
