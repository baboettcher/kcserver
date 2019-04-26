const Joi = require("joi");
const express = require("express");
const JoinCode = require("../models/joincode_model");
const router = express.Router();

/* 
router.get("/:_joincode", async (req, res) => {
  console.log("🚹🚹🚹ADDCODE 🚹🚹🚹 req.params-->", req.params);

  const joincode = await JoinCode.find(req.params);
  if (!joincode) {
    console.log("❌❌ No joincode found ❌❌");
    return res
      .status(404)
      .send("JoinCode with the given _joincode was not found.");
  }
  res.send(joincode);
}); 
*/

router.post("/", async (req, res) => {
  console.log("🚹🚹🚹 JOIN POSTED 🚹🚹🚹");
  const { error } = validateJoinCode(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let joincode = new JoinCode(req.body);
  joincode = await joincode.save();
  res.send(joincode);
});

/* router.put("/:id", async (req, res) => {
  const { error } = validateJoinCode(req.body);
  if (error) {
    console.log(
      "❌❌ Problem validating record ❌❌",
      error.details[0].message
    );
    return res.status(400).send(error.details[0].message);
  }

  const joincode = await JoinCode.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });

  if (!joincode) {
    console.log("❌❌ Problem updating record ❌❌");
    return res.status(404).send("Updating joincode record error");
  }

  res.send(joincode);
});
 */
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

    school_name: Joi.string().allow(""),
    school_id: Joi.string().allow(""),
    district_name: Joi.string().allow(""),
    district_id: Joi.string().allow(""),
    special_notes: Joi.string().allow("")
  };
  return Joi.validate(joincode, schema);
}

module.exports = router;
