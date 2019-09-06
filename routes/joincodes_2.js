const Joi = require("joi");
//const Joi = require("@hapi/joi"); UPDATE!
const express = require("express");
const JoinCode = require("../models/joincode_model").joincode;
const Group = require("../models/joincode_model").group;
const router = express.Router();

// finds by joincode (not id)
// NEEDS try/catch
router.get("/:join_code", async (req, res) => {
  const joincode = await JoinCode.find(req.params);
  if (!joincode || !joincode[0]) {
    console.log("❌❌ No joincode found ❌❌");
    return res.status(404).send("joincode was not found.");
  }
  res.status(200).send(joincode);
});

// findById not working, using find
// NEEDS try/catch?
router.get("/groups/:id", async (req, res) => {
  const joincode = await JoinCode.find({ _id: req.params.id });
  if (!joincode || !joincode[0]) {
    console.log("❌❌ No joincode found ❌❌");
    return res.status(404).send("joincode not found.");
  }
  res.status(200).send(joincode[0].groups);
});

// REMOVE conslogs and simplify
router.get("/groupthemes-current-id/:id", async (req, res) => {
  // joincode is an array, so joincode[0]
  let joincode;
  try {
    joincode = await JoinCode.find({ _id: req.params.id });
    console.log(
      "🍀🍀 group-themes-current-id found! 🍀🍀",
      joincode[0].group_themes_current_id
    );

    res.status(200).send(joincode[0].group_themes_current_id);
  } catch (err) {
    if (!joincode || !joincode[0]) {
      console.log("❌❌ No joincode found ❌❌", req.params);
      return res.status(404).send(req.params);
    } else {
      console.log("❌❌ Error ❌❌", err.message);
      res.status(400).send(err.message);
    }
  }
});

// NEEDS try/catch?
router.get("/groupthemes-current-populated/:id", async (req, res) => {
  const joincode = await JoinCode.find({ _id: req.params.id });
  if (!joincode || !joincode[0]) {
    console.log("❌❌ No joincode found ❌❌");
    return res.status(404).send("joincode was not found.");
  }
  res.status(200).send(joincode[0].group_themes_current_populated);
});

// create new joincode
// NEEDS try/catch?
router.post("/", async (req, res) => {
  console.log("🔮🔮🔮 JOINCODE POSTED 🔮🔮🔮");
  const { error } = validateJoinCode(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let joincode = new JoinCode(req.body);
  joincode = await joincode.save();
  res.status(200).send(joincode);
});

// alt version
router.put("/add-new-group_ALT/:id", async (req, res) => {
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
router.put("/add-new-grouptheme/:id", async (req, res) => {
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
router.put("/remove-grouptheme/:id", async (req, res) => {
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

    // check if currentGroupTheme/ID matches, remove
    if (joincode.group_themes_current_id == req.body.group_theme_id) {
      joincode.group_themes_current_id = "";
      joincode.group_themes_current_populated = { defaultSet: false };
      console.log("🌞🌞🌞 CLEARING group_themes_current_id/populated 🌞🌞🌞");
    }
    joincode.save();
    console.log("success");
    res.status(200).send(groupThemeToRemove);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Expects: req.body.group_theme_id
router.put("/set-current-grouptheme/:id", async (req, res) => {
  console.log("🐥🐥🐥 Set CURRENT theme group  🐥🐥🐥 ", req.body);
  const joincode = await JoinCode.findById(req.params.id);

  // check if id exists subdoc array group_themes
  try {
    const groupTheme = await joincode.group_themes.id(req.body.group_theme_id);
    joincode.group_themes_current_id = groupTheme._id;
    joincode.group_themes_current_populated = groupTheme;
    joincode.save();
    res.status(200).send(groupTheme);
  } catch (err) {
    console.log(
      "❌❌ Invalid group_theme ID. Can not set current group theme ❌❌"
    );
    res.status(404).send(err.message);
  }
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

//// ADD/REMOVE GROUP expects:
// :id - id
// { group_theme_id: abc123,
//  group: {object}
// }
router.put("/add-group-to-grouptheme/:id", async (req, res) => {
  console.log("😀😀😀 Adding GROUP to group_theme_id 😀😀😀 ", req.body);
  const joincode = await JoinCode.findById(req.params.id);
  console.log("==== 1 ==== joincode =====>>>>", joincode.toObject());

  // check if id exists subdoc array group_themes
  try {
    // 1. Find THE groupTheme in all group_themes, then edit
    const groupThemeFoundById = await joincode.group_themes.id(
      req.body.group_theme_id
    );
    console.log(
      "===== 2 === groupThemeFoundById =====>>>>",
      groupThemeFoundById.toObject()
    );

    // 1.5 - MAKE CHANGES groupThemeFoundById

    // 1.75 - UPDATE ARRAY OF GROUP THEME OBJECTS

    // 2. Push new group to array of groups inside group_theme
    // NEXT: update array with actual group objects
    // QUESIION: Why can't I push new group Objects?

    const newGroup1 = new Group({ title: "2-Mountain Lions" });
    const newGroup2 = new Group({ title: "2-Eagles" });
    const newGroup3 = new Group({ title: "2-Sharks" });
    const newGroup4 = new Group({ title: "2-Snakes" });
    const modifiedGroup1 = groupThemeFoundById.groups.toObject();

    modifiedGroup1.push(newGroup1);
    modifiedGroup1.push(newGroup2);
    modifiedGroup1.push(newGroup3);
    modifiedGroup1.push(newGroup4);

    groupThemeFoundById.groups = modifiedGroup1;

    // 3. add the updated group array to group_themes by id

    // 4. Save/update the entire object

    const newThing2 = await JoinCode.update(
      { _id: req.params.id },
      {
        $set: {
          grade_level: "9",
          class_description: "KAKAKA",
          group_themes: [groupThemeFoundById]
        }
      }
    );

    console.log("===== 4 === newThing2 ============ ", newThing2);

    /* 
    If you just want to change the value of favs, you can use a simpler query:

    blog.findByIdAndUpdate(entityId, {$set: {'meta.favs': 56}}, function(err, doc) {
        console.log(doc); 
    }); */

    res.status(200).send(joincode);
  } catch (err) {
    console.log("❌❌ Error adding group to grouptheme❌❌", err.message);
    res.status(404).send(err.message);
  }
});

router.put("/remove-group-from-grouptheme/:id", async (req, res) => {});

// ADD/REMOVE STUDENT expects:
// :id - id
// { group_theme_id: abc123,
//  group_id: abc123,
// students : [] <--- concat to this array
// }
router.put("/add-student-to-group/:id", async (req, res) => {});

router.put("/remove-student-from-group/:id", async (req, res) => {});

// NEXT: get groupthemes (for use in menu)

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

    group_themes: Joi.array(),
    group_themes_current_id: Joi.string().allow(""),
    //group_default_id: Joi.object(),
    group_themes_current_populated: Joi.object()
  };
  return Joi.validate(joincode, schema);
}

module.exports = router;
