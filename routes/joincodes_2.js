const Joi = require("joi");
//const Joi = require("@hapi/joi");
const express = require("express");
const JoinCode = require("../models/joincode_model");
const router = express.Router();

// ** find by joincde
router.get("/:join_code", async (req, res) => {
  const joincode = await JoinCode.find(req.params);
  if (!joincode || !joincode[0]) {
    console.log("❌❌ No joincode found ❌❌");
    return res.status(404).send("joincode was not found.");
  }
  res.status(200).send(joincode);
});

// findById not working, using find
router.get("/groups/:id", async (req, res) => {
  const joincode = await JoinCode.find({ _id: req.params.id });
  if (!joincode || !joincode[0]) {
    console.log("❌❌ No joincode found ❌❌");
    return res.status(404).send("joincode was not found.");
  }
  res.status(200).send(joincode[0].groups);
});

router.get("/group_default_id/:id", async (req, res) => {
  const joincode = await JoinCode.find({ _id: req.params.id });
  if (!joincode || !joincode[0]) {
    console.log("❌❌ No joincode found ❌❌");
    return res.status(404).send("joincode was not found.");
  }
  // joincode is an array, so must use joincode[0]
  res.status(200).send(joincode[0].group_default_id);
});

router.get("/group_default_info/:id", async (req, res) => {
  const joincode = await JoinCode.find({ _id: req.params.id });
  if (!joincode || !joincode[0]) {
    console.log("❌❌ No joincode found ❌❌");
    return res.status(404).send("joincode was not found.");
  }
  res.status(200).send(joincode[0].group_default_info);
});

// create new joincode
router.post("/", async (req, res) => {
  console.log("🔮🔮🔮 JOINCODE POSTED 🔮🔮🔮");
  const { error } = validateJoinCode(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let joincode = new JoinCode(req.body);
  joincode = await joincode.save();
  res.status(200).send(joincode);
});

// alt version
router.put("/addnewgroup_alt/:id", async (req, res) => {
  console.log("🚹🚹🚹 Add NEW group  🚹🚹🚹 ");
  console.log("req.body", req.body);

  const joincode = await JoinCode.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $push: {
        groups: req.body
      }
    },
    { new: true }
  );

  if (!joincode) {
    console.log("❌❌ Problem updating record ❌❌");
    return res.status(404).send("Updating joincode record error.");
  }

  console.log("🦑🦑🦑 SUCCESS PUSHING STUDENT TO JOINCODE 🦑🦑🦑 ");
  res.send(joincode);
});

// CURRENT
router.put("/addnewgrouptheme/:id", async (req, res) => {
  console.log("🔵🔵🔵 Add NEW group  🔵🔵🔵 ");

  const joincode = await JoinCode.findById(req.params.id);

  if (!joincode) {
    console.log("❌❌ Problem updating record ❌❌");
    return res.status(404).send("Updating joincode record error.");
  }

  try {
    joincode.group_themes = joincode.group_themes.concat(req.body);
    joincode.save();
    res.status(200).send(joincode);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// id of group to remove is req.body.group_theme_id
// :id is joincode id
router.put("/removegrouptheme/:id", async (req, res) => {
  console.log("⛔️⛔️⛔️ REMOVE group ⛔️⛔️⛔️  ");

  const joincode = await JoinCode.findById(req.params.id);

  if (!joincode) {
    console.log("❌❌ Error finding class record ❌❌");
    return res.status(404).send("Error finding class record.");
  }

  try {
    const groupThemeToRemove = joincode.group_themes.id(
      req.body.group_theme_id
    );
    groupThemeToRemove.remove();
    joincode.save();
    res.status(200).send(groupThemeToRemove);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// req.body ==> ID only (this should populated on loading)???
// this should populate when GET used to populated drop down
// NEXT: GET group themes to choose from
router.put("/setcurrentgrouptheme/:id", async (req, res) => {
  console.log("🐥🐥🐥 Set ACTIVE group  🐥🐥🐥 ");
  console.log("req.body", req.body);

  // 1) $set group_themes_current_id TO req.body.group_theme_id
  // 2) Search array "group themes" and assign to  group_themes_current_populated

  // p
  const joincode = await JoinCode.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        group_themes_current_id: "abcdeeeeeee"
      }
    }
  );

  if (!joincode) {
    console.log("❌❌ Problem updating record ❌❌");
    return res.status(404).send("Updating joincode record error.");
  }

  console.log(
    "🈴🈴🈴 SUCCESS SETTING DEFAULT GROUP STUDENT TO JOINCODE 🈴🈴🈴 "
  );
  res.send(joincode);
});

router.put("/:id", async (req, res) => {
  console.log("🚹🚹🚹 JOINCODE PUT/PUSH STUDENT RECORD TO ARRAY 🚹🚹🚹 ");

  const checkTentativeStudents = await JoinCode.findById(req.params.id);

  /*   if (checkTentativeStudents.students_tentative.includes(req.body._id)) {
    console.log("STUDENT ALREADY PRESENT IN JOINCODE ARRAY");
    return res.status(404).send(checkTentativeStudents);
  } */

  const tentative_students = checkTentativeStudents.toObject()
    .students_tentative;

  if (tentative_students && tentative_students.some(e => e == req.body._id)) {
    console.log("STUDENT ALREADY PRESENT IN JOINCODE ARRAY");
    return res.status(404).send(checkTentativeStudents);
  } else {
    const joincode = await JoinCode.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $push: {
          students_tentative: req.body._id

          // tentative_classes_cache: {
          //   _id: req.body._id,
          //   first_name: req.body.first_name,
          //   last_name: req.body.last_name
          // }
        }
      }
    );

    if (!joincode) {
      console.log("❌❌ Problem updating record ❌❌");
      return res.status(404).send("Updating joincode record error.");
    }

    console.log("🦑🦑🦑 SUCCESS PUSHING STUDENT TO JOINCODE 🦑🦑🦑 ");
    res.send(joincode);
  }
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
    special_notes: Joi.string().allow(""),

    groups: Joi.array(),
    group_current_id: Joi.string().allow(""),
    //group_default_id: Joi.object(),
    group_current_populated: Joi.object()
  };
  return Joi.validate(joincode, schema);
}

module.exports = router;
