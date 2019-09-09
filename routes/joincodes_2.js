const Joi = require("joi");
const _ = require("lodash");
//const Joi = require("@hapi/joi"); UPDATE!
const express = require("express");
const JoinCode = require("../models/joincode_model").joincode;
const Group = require("../models/joincode_model").group;
const router = express.Router();

// FIND BY JOINCODE (6 digit NOT user id as indicated by :id)
router.get("/:join_code", async (req, res) => {
  // NEEDS try/catch
  const joincode = await JoinCode.find(req.params);
  if (!joincode || !joincode[0]) {
    console.log("❌❌ No joincode found ❌❌");
    return res.status(404).send("joincode was not found.");
  }
  res.status(200).send(joincode);
});

// ??????????????????
router.get("/groups/:id", async (req, res) => {
  // NEEDS try/catch?
  // findById not working, using find
  const joincode = await JoinCode.find({ _id: req.params.id });
  if (!joincode || !joincode[0]) {
    console.log("❌❌ No joincode found ❌❌");
    return res.status(404).send("joincode not found.");
  }
  res.status(200).send(joincode[0].groups);
});

// ??????????????????
router.get("/groupthemes-current-id/:id", async (req, res) => {
  // TODO console.log and simplify
  let joincode;
  try {
    joincode = await JoinCode.find({ _id: req.params.id });
    console.log(
      "🍀🍀🍀🍀🍀🍀🍀🍀🍀🍀 group-themes-current-id found! 🍀🍀🍀🍀🍀🍀🍀🍀🍀🍀🍀🍀🍀🍀",
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

// CREATE NEW JOINCODECLASS
router.post("/", async (req, res) => {
  // NEEDS try/catch?
  console.log("🔮🔮🔮 JOINCODE POSTED 🔮🔮🔮");
  const { error } = validateJoinCode(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let joincode = new JoinCode(req.body);
  joincode = await joincode.save();
  res.status(200).send(joincode);
});

// ADD STUDENT TO JOINCODECLASS
router.put("/:id", async (req, res) => {
  // LATER :id should be :joincode_id
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

// ADD STUDENT TO JOINCODECLASS -- ALT
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

// CREATE NEW THEME
router.put("/add-new-grouptheme/:id", async (req, res) => {
  // LATER  :id should be :joincode_id
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

// REMOVE THEME (all groups erased and NO points distribued)
router.put("/remove-grouptheme/:id", async (req, res) => {
  // LATER  :id should be :joincode_id
  // id of group to remove is req.body.group_theme_id
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

// SET CURRENT THEME
router.put("/set-current-grouptheme/:id", async (req, res) => {
  // Expects: req.body.group_theme_id / LATER :id should be :joincode_id
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

// ADD GROUP TO THEME
router.put("/add-group-to-grouptheme/:joincodeid", async (req, res) => {
  console.log("😀😀😀 Adding GROUP to group_theme_id 😀😀😀 ", req.body);

  const joincode = await JoinCode.findById(req.params.joincodeid);

  try {
    // 1. Find correct groupTheme in all group_themes,
    const groupThemeToUpdate = await joincode.group_themes.id(
      req.body.group_theme_id
    );
    // console.log(
    //   "===== 2 groupThemeToUpdate =====>>>>",
    //   groupThemeToUpdate.toObject()
    // );

    // 2. Get array of the groups.
    const modifiedGroup = groupThemeToUpdate.groups;

    const newGroup = new Group(req.body.group);

    // 3. Push newgroup to array of groups inside group_theme
    modifiedGroup.push(newGroup);

    groupThemeToUpdate.groups = modifiedGroup;

    // update with new groupThemeTo Update
    const joincode2 = await JoinCode.update(
      { _id: req.params.joincodeid },
      {
        $set: {
          //group_themes: [groupThemeToUpdate]
          group_themes: [groupThemeToUpdate]
        } // add the argurment so changes reflected
      }
    );
    res.status(200).send(joincode); //note: joincode2 sends unexpected results
  } catch (err) {
    console.log("❌❌ Error adding group to grouptheme ❌❌", err.message);
    res.status(404).send(err.message);
  }
});

// DELETE GROUP:
router.put("/delete-group-from-grouptheme/:joincodeid", async (req, res) => {
  // This should not be needed elsewhere. Members of group are populated from here on load, no reference is make in student record
  console.log(
    "🦑🦑🦑 Deleting group from group_theme_id 🦑🦑🦑==>",
    req.body.group._id
  ); // make sure points "collected" before deleting.

  const joincode = await JoinCode.findById(req.params.joincodeid);

  try {
    // 1. Find correct groupTheme
    const groupThemeToUpdate = await joincode.group_themes.id(
      req.body.group_theme_id
    );
    // 2. Get array of the groups from group_themes
    const modifiedGroup_pre = groupThemeToUpdate.groups;

    // 3. remove group
    const modifiedGroup = _.remove(modifiedGroup_pre, function(item) {
      return item.toObject()[0]._id.toString() !== req.body.group._id;
    });

    // 4. check if nothing was changed/deleted
    const checkDiff = _.difference(modifiedGroup_pre, modifiedGroup);
    if (!checkDiff.length) {
      return res.status(500).send("INTERNAL ERROR _ NOTHING DELETED");
    }

    // updated with new group info
    groupThemeToUpdate.groups = modifiedGroup;

    // update with new groupThemeTo Update
    const joincode2 = await JoinCode.update(
      { _id: req.params.joincodeid },
      {
        $set: {
          group_themes: [groupThemeToUpdate]
        }
      }
    );
    res.status(200).send(joincode);
  } catch (err) {
    console.log("❌❌ Error DELETING group to grouptheme❌❌", err.message);
    console.log(err); // temp
    res.status(404).send(err.message);
  }
});

// ADD GROUP POINTS
router.put("/add-group-points/:joincodeid", async (req, res) => {
  console.log(
    "🦑🦑🦑 Deleting group from group_theme_id 🦑🦑🦑==>",
    req.body.group._id
  ); // make sure points "collected" before deleting. NO going back

  const joincode = await JoinCode.findById(req.params.id);

  try {
    // 1. Find correct groupTheme
    const groupThemeToUpdate = await joincode.group_themes.id(
      req.body.group_theme_id
    );
    console.log(
      "===== 2 groupThemeToUpdate (REMOVE GROUP)OBJECT=====>>>>",
      groupThemeToUpdate.toObject()
    );

    // 2. Get array of the groups from group_themes
    // Will this work? groups is an array of objects, how deep?
    const modifiedGroup_pre = groupThemeToUpdate.groups;

    // 3. remove group
    const modifiedGroup = _.remove(modifiedGroup_pre, function(item) {
      return item.toObject()[0]._id.toString() !== req.body.group._id;
    });

    // 4. check if nothing was changed/deleted
    const checkDiff = _.difference(modifiedGroup_pre, modifiedGroup);
    if (!checkDiff.length) {
      console.log("INTERNAL ERROR _ NOTHING DELETED");
      return res.status(500).send("INTERNAL ERROR _ NOTHING DELETED");
    }
    //
    // updated with new group info
    groupThemeToUpdate.groups = modifiedGroup;
    // groupThemeToUpdate.groups.pop();
    // groupThemeToUpdate.groups.pop();

    // update with new groupThemeTo Update
    const joincode2 = await JoinCode.update(
      { _id: req.params.joincodeid },
      {
        $set: {
          group_themes: [groupThemeToUpdate]
        }
      }
    );
    res.status(200).send(joincode);
  } catch (err) {
    console.log("❌❌ Error DELETING group to grouptheme❌❌", err.message);
    console.log(err); // temp
    res.status(404).send(err.message);
  }
});

// SUNDAY
// add student - this should POPULATE on each log-in
// remove student

// MONDAY
// list all groups in a group theme
// edit grouptheme

// TUES
// edit group details ?

/* 
If you just want to change the value of favs, you can use a simpler query:
blog.findByIdAndUpdate(entityId, {$set: {'meta.favs': 56}}, function(err, doc) {
    console.log(doc); 
}); */

//--------------//
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
