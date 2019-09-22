const Joi = require("joi");
const _ = require("lodash");
//const Joi = require("@hapi/joi"); UPDATE!
const express = require("express");
const JoinCode = require("../models/joincode_model").joincode;
const GroupTheme = require("../models/joincode_model").grouptheme;
const Group = require("../models/joincode_model").group;

const removeItem = require("./helpers/removeItem.js");

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

// ???
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

// ???
router.get("/groupthemes-current-id/:id", async (req, res) => {
  // TODO console.log and simplify
  let joincode;
  try {
    joincode = await JoinCode.find({ _id: req.params.id });
    console.log(
      "🍀🍀🍀 group-themes-current-id found! 🍀🍀🍀",
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
  console.log("🚹🚹🚹 Add NEW group  🚹🚹🚹 ", req.body);

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

// ADD GROUPTHEME
router.put("/add-grouptheme/:joincodeid", async (req, res) => {
  console.log("🔵🔵🔵 Add NEW groupTheme  🔵🔵🔵 ");

  const joincode = await JoinCode.findById(req.params.joincodeid);

  if (!joincode) {
    console.log("❌❌ Problem updating record ❌❌");
    return res.status(404).send("Updating joincode record error.");
  }

  try {
    const newGroupTheme = new GroupTheme(req.body);
    joincode.group_themes = joincode.group_themes.concat(newGroupTheme);
    joincode.save();
    res.status(200).send(joincode);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//REMOVE GROUPTHEME
router.put("/remove-grouptheme/:joincodeid", async (req, res) => {
  // id of group to remove is req.body.group_theme_id
  console.log("⛔️⛔️⛔️REMOVE groupTheme ⛔️⛔️⛔️  ");

  const joincode = await JoinCode.findById(req.params.joincodeid);

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

router.put("/edit-grouptheme/:joincodeid", async (req, res) => {
  console.log("🚧🚧🚧 EDIT groupTheme  🚧🚧🚧 ");
  const joincode = await JoinCode.findById(req.params.joincodeid);

  try {
    const { groupThemeChanges } = req.body;
    const allGroupThemes = joincode.group_themes;
    const themeToUpdate = allGroupThemes.id(req.body.group_theme_id);
    const updatedTheme = {
      ...themeToUpdate.toObject(),
      ...groupThemeChanges
    };

    // 3. remove old theme (refactored to helpers)
    const { modififedGroupThemes, itemToDelete } = removeItem(
      allGroupThemes,
      req.body.group_theme_id
    );

    modififedGroupThemes.push(updatedTheme);

    await JoinCode.update(
      { _id: req.params.joincodeid },
      {
        $set: {
          group_themes: modififedGroupThemes
        }
      }
    );

    res.status(200).send(updatedTheme); // sned updated theme or itemToDelete?
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
    const allGroupThemes = joincode.group_themes;

    const groupThemeToUpdate = allGroupThemes.id(req.body.group_theme_id);

    // 2. Get array of the groups.
    const modifiedGroups = groupThemeToUpdate.groups;

    const newGroup = new Group(req.body.group);

    // 3. Push newgroup to array of groups inside group_theme
    modifiedGroups.push(newGroup);

    await JoinCode.update(
      { _id: req.params.joincodeid },
      {
        $set: {
          group_themes: allGroupThemes
        }
      }
    );

    res.status(200).send(joincode); //note: joincode2 sends unexpected results
  } catch (err) {
    console.log("❌❌ Error adding group to grouptheme ❌❌", err.message);
    res.status(404).send(err.message);
  }
});

// DELETE GROUP
router.put("/delete-group-from-grouptheme/:joincodeid", async (req, res) => {
  // This should not be needed elsewhere. Members of group are populated from here on load, no reference is make in student record
  console.log(
    "🦑🦑🦑 Deleting group from group_theme_id 🦑🦑🦑==>",
    req.body.group._id
  ); // make sure points "collected" before deleting.

  const joincode = await JoinCode.findById(req.params.joincodeid);

  try {
    // save entire jc object
    const allGroupThemes = joincode.group_themes;

    // 1. Find correct groupTheme
    // remove asych
    const groupThemeToUpdate = joincode.group_themes.id(
      req.body.group_theme_id
    );
    // 2. Get array of the groups from group_themes
    const originalGroups = groupThemeToUpdate.groups;

    // 3. save the group being removed for response object
    const itemToDelete = _.find(originalGroups, function(item) {
      return item._id.toString() === req.body.group._id;
    });

    const modifiedGroup = _.remove(originalGroups, function(item) {
      return item._id.toString() !== req.body.group._id;
    });

    // 4. check if nothing was changed/deleted
    const checkDiff = _.difference(originalGroups, modifiedGroup);
    if (!checkDiff.length) {
      return res.status(500).send("INTERNAL CONFUSION _ NOTHING DELETED");
    }

    // 5. assign new group info
    groupThemeToUpdate.groups = modifiedGroup;

    // 6. update with new groupThemeTo Update
    await JoinCode.update(
      { _id: req.params.joincodeid },
      {
        $set: {
          group_themes: allGroupThemes
        }
      }
    );

    res.status(200).send(itemToDelete);
  } catch (err) {
    console.log("❌❌ Error DELETING group to grouptheme❌❌", err.message);
    console.log(err); // temp
    res.status(404).send(err.message);
  }
});

// ADD POINTS
router.put("/add-group-points/:joincodeid", async (req, res) => {
  console.log("🦑🦑🦑 Adding points 🦑🦑🦑==>", req.body);
  // NOTE: make sure points "collected" before deleting. NO going back

  const joincode = await JoinCode.findById(req.params.joincodeid);

  try {
    const allCurrentGroupThemes = joincode.group_themes;

    // 1. Find groupThemeToUpdate using the id
    const groupThemeToUpdate = await allCurrentGroupThemes.id(
      req.body.group_theme_id
    );
    // toObject hides all the inner goodies, but we lose the id method
    // const groupThemeToUpdate2 = groupThemeToUpdate.toObject();

    // 2. Get array of the groups from group_themes and find targetGroup
    const allGroups = groupThemeToUpdate.groups;

    const targetGroup = allGroups.id(req.body.group_id);
    //console.log("targetGroup==>>", targetGroup.toObject());

    // 3. modify object
    targetGroup.group_points =
      targetGroup.group_points + req.body.points_to_add;
    //NEXT: push transaction record and hash to group_points_transactions

    // 4.  update db
    await JoinCode.update(
      { _id: req.params.joincodeid },
      {
        $set: { group_themes: allCurrentGroupThemes }
      }
    );

    res.status(200).send(targetGroup);
  } catch (err) {
    console.log("❌❌ Error updating group with points ❌❌", err.message);
    console.log(err); // temp
    res.status(404).send(err.message);
  }
});

// SUBTRACT POINTS
router.put("/subtract-group-points/:joincodeid", async (req, res) => {
  console.log("🔺🔺🔺 Subtracting points 🔺🔺🔺", req.body);

  const joincode = await JoinCode.findById(req.params.joincodeid);

  try {
    const allCurrentGroupThemes = joincode.group_themes;

    const groupThemeToUpdate = await joincode.group_themes.id(
      req.body.group_theme_id
    );

    let allGroups = groupThemeToUpdate.groups;

    const targetGroup = allGroups.id(req.body.group_id);

    targetGroup.group_points =
      targetGroup.group_points - req.body.points_to_subtract;

    await JoinCode.update(
      { _id: req.params.joincodeid },
      {
        $set: {
          group_themes: allCurrentGroupThemes
        }
      }
    );

    res.status(200).send(targetGroup);
  } catch (err) {
    console.log("❌❌ Error updating group with points ❌❌", err.message);
    console.log(err); // temp
    res.status(404).send(err.message);
  }
});

router.put("/add-students-to-group/:joincodeid", async (req, res) => {
  /*   { "group_theme_id":"5d82deaa7261e77b60fa4a07",
         "group_id": "5d82e11eb4fddd7dfbeceae8", 
         "new_members_ids": []
        } 
  */

  const { new_member_ids } = req.body;
  console.log(" 🤪🤪🤪Adding students to group 🤪🤪🤪 ==>", new_member_ids);

  const joincode = await JoinCode.findById(req.params.joincodeid);

  try {
    const allCurrentGroupThemes = joincode.group_themes;
    const groupThemeToUpdate = await allCurrentGroupThemes.id(
      req.body.group_theme_id
    );

    // Get array of the groups and targetGroup
    const allGroups = groupThemeToUpdate.groups;
    const targetGroup = allGroups.id(req.body.group_id);
    const currentGroupMembers = targetGroup.members_ids;
    const updatedGroupMembers = currentGroupMembers.concat(new_member_ids);
    console.log("updatedGroupMembers====>>>", updatedGroupMembers);

    console.log("RemoveItem==>", removeItem("All good in the neighborhood!"));

    // NEXT: Finish Remove Item
    // INPUT: groupTheme,
    // OUTPUT
    // Modify targetGroup

    // Push new members

    // 4.  update db
    /*     await JoinCode.update(
      { _id: req.params.joincodeid },
      {
        $set: { group_themes: allCurrentGroupThemes }
      }
    ); */

    res.status(200).send(currentGroupMembers);
  } catch (err) {
    console.log("❌❌ Error updating group new students ❌❌", err.message);
    console.log(err);
    res.status(404).send(err.message);
  }
});

router.put("/remove-student-from-group/:joincodeid", async (req, res) => {});

router.put("/edit-group/:joincodeid", async (req, res) => {
  console.log("✏️✏️✏️ Edit Group ✏️✏️✏️", req.body);

  const joincode = await JoinCode.findById(req.params.joincodeid);

  try {
    const groupThemeToUpdate = await joincode.group_themes.id(
      req.body.group_theme_id
    );

    let allGroups = groupThemeToUpdate.groups;

    // const targetGroup = allGroups.id(req.body.group_id);
    // instead of id the group, pop it off and push the new one
    // but what about the group id?
    // how will we be getting the group id later?
    // will it matter of this changes with very update?

    await JoinCode.update(
      { _id: req.params.joincodeid },
      {
        $set: {
          group_themes: [groupThemeToUpdate]
        }
      }
    );

    res.status(200).send(targetGroup);
  } catch (err) {
    console.log("❌❌ Error editing group ❌❌", err.message);
    console.log(err); // temp
    res.status(404).send(err.message);
  }
});

/* 
      ADD/REMOVE STUDENT expects:
      :id - id
      { group_theme_id: abc123,
      group_id: abc123,
      students : [] <--- concat to this array
      }
  */

// NEXT:
/* 

subtract-group-points 
add-student-to-group
remove-student-from-group
edit-group-info 

-->> populate!! -- how and when??
 
get groupthemes (for use in menu)
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
