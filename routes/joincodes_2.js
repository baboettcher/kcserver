const Joi = require("joi");
const _ = require("lodash");
//const Joi = require("@hapi/joi"); UPDATE!
const express = require("express");
const JoinCode = require("../models/joincode_model").joincode;
const GroupTheme = require("../models/joincode_model").grouptheme;
const Group = require("../models/joincode_model").group;

const removeItemGroupTheme = require("./helpers/removeItem.js");

const router = express.Router();

router.get("/all/", async (req, res) => {
  console.log("🔮🔮🔮JOINCODE GET ALL 🔮🔮🔮");

  const joincodes = await JoinCode.find()
    .select("grade_level")
    .select("class_description")
    .select("teacher_name")
    .select("special_notes")
    .select("teacher_id")
    .populate(
      "students_tentative",
      "-updated -created -__v -current_groups -current_classes -tentative_classes"
    );
  //   "teacher_name grade_level -_id class_description"
  // )
  // .populate(
  //   "current_classes",
  //   "teacher_name grade_level -_id class_description"
  // );

  if (!joincodes) {
    console.log("❌❌❌❌ No joincodes found ❌❌❌❌");
    return res.status(404).send("No joincodes found");
  }

  res.send(joincodes);
});

router.get("/single/:joincodeid", async (req, res) => {
  console.log("🎃🎃🎃 GET SINGLE JOINCODE 🎃🎃🎃");

  // FRIDAY EVENING
  // 1. One GET route to send back all the data of ONE joincode grouptheme, with updated group
  //       OR
  //    A PUT route which iterates over the populate-the-students which first updates the groups in the grouptheme, and then returns updated groupTheme info
  //
  // 2. Another route populate-the-students to update the array of students (tentative and confirmed) to be used with
  //
  //
  const joincode = await JoinCode.find({ _id: req.params.joincodeid })
    .select("grade_level")
    .select("class_description")
    .select("teacher_name")
    .select("special_notes")
    .select("teacher_id")
    .select("group_themes_current_populated");
  //    -date_updated -date_created -__v -current_groups -current_classes -tentative_classes
  // .populate(
  //   "students_tentative",
  //   "-updated -created -__v -current_groups -current_classes -tentative_classes"
  // );

  //   "teacher_name grade_level -_id class_description"
  // )
  // .populate(
  //   "current_classes",
  //   "teacher_name grade_level -_id class_description"
  // );

  if (!joincode || !joincode[0]) {
    console.log("❌❌ No joincode found ❌❌");
    return res.status(404).send("joincode not found.");
  }

  res.status(200).send(joincode);
  // res.status(200).send(joincode[0].groups);
});

// FIND BY JOINCODE (6 digit NOT user id as indicated by :id)
// BUG! if left alone, the user could enter 'all' and trigger /all/ path above
//      make this /jc/:join_code
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

// REMOVE GROUPTHEME
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

// EDIT GROUPTHEME
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
    const { modifiedGroupThemes, itemDeleted } = removeItemGroupTheme(
      allGroupThemes,
      req.body.group_theme_id
    );

    modifiedGroupThemes.push(updatedTheme);

    await JoinCode.update(
      { _id: req.params.joincodeid },
      {
        $set: {
          group_themes: modifiedGroupThemes
        }
      }
    );

    res.status(200).send(updatedTheme); // sned updated theme or itemToDelete?
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// SET CURRENT GROUPTHEME - ORIG
router.put("/set-current-grouptheme_ORIG/:id", async (req, res) => {
  // Expects: req.body.group_theme_id / LATER :id should be :joincode_id
  console.log("🐥🐥🐥 (orig) Set CURRENT theme group  🐥🐥🐥 ", req.body);
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

// SET CURRENT THEME
// iterate through all groups in the theme and update student basic info
//  -- name, motto, urls
router.put("/set-current-grouptheme/:groupid", async (req, res) => {
  console.log("🐥🐥🐥 Set CURRENT theme group  🐥🐥🐥 ", req.body);
  const joincode = await JoinCode.findById(req.params.groupid);

  try {
    const { group_theme_id } = req.body;
    const groupTheme = await joincode.group_themes.id(group_theme_id);

    // simply set id (remove later?)
    joincode.group_themes_current_id = groupTheme._id;

    const groupsToPopulate = groupTheme.groups;
    console.log("groupsToPopulate===>", groupsToPopulate.toObject());
    groupsToPopulate.forEach((e, i) => {
      console.log(e.group_points, i);
      // iterate over each members_id array
      // set "members_populated":  {}
    });

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

// POPULATE ON LOG-IN / CHRON JOB
// this checks arras "students_confirmed": [] &  "students_tentative": []
// and populated
router.put("/populate-joincode-members/:joincodeid", async (req, res) => {});

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
  const joincode = await JoinCode.findById(req.params.joincodeid);
  const { new_members_ids } = req.body;
  console.log(" 🤪🤪🤪Adding students to group 🤪🤪🤪 ==>", new_members_ids);

  try {
    const { group_theme_id, group_id } = req.body;
    const allCurrentGroupThemes = joincode.group_themes;
    const groupThemeToUpdate = await allCurrentGroupThemes.id(group_theme_id);

    // Get array of the groups and targetGroup
    const allGroups = groupThemeToUpdate.groups;
    const targetGroup = allGroups.id(group_id);
    const currentGroupMembers = targetGroup.members_ids;
    // LATER: check to see if any members being added are already present.
    // indexOF or find

    const updatedGroupMembers = currentGroupMembers.concat(new_members_ids);
    targetGroup.members_ids = updatedGroupMembers;

    // 4.  update db
    await JoinCode.update(
      { _id: req.params.joincodeid },
      {
        $set: { group_themes: allCurrentGroupThemes }
      }
    );

    res.status(200).send(currentGroupMembers);
  } catch (err) {
    console.log("❌❌ Error updating group new students ❌❌", err.message);
    console.log(err);
    res.status(404).send(err.message);
  }
});

router.put("/remove-student-from-group/:joincodeid", async (req, res) => {
  /*   { "group_theme_id":"5d82deaa7261e77b60fa4a07",
         "group_id": "5d82e11eb4fddd7dfbeceae8", 
         "member_id": ""
        } 
  */
  const joincode = await JoinCode.findById(req.params.joincodeid);
  const { member_id } = req.body;
  console.log(" 😮😮😮 Remove single student from group 😮😮😮 ==>", member_id);

  try {
    const { group_theme_id, group_id } = req.body;
    const allCurrentGroupThemes = joincode.group_themes;
    const groupThemeToUpdate = await allCurrentGroupThemes.id(group_theme_id);

    // Get array of the groups and targetGroup
    const allGroups = groupThemeToUpdate.groups;
    const targetGroup = allGroups.id(group_id);
    const currentGroupMembers = targetGroup.members_ids;

    const modifiedGroup = _.remove(currentGroupMembers, function(item) {
      return item.toString() !== member_id;
    });

    const updatedGroupMembers = modifiedGroup;
    targetGroup.members_ids = updatedGroupMembers;

    console.log("allGroups ====>>>", allGroups.toObject());

    await JoinCode.update(
      { _id: req.params.joincodeid },
      {
        $set: { group_themes: allCurrentGroupThemes }
      }
    );

    res.status(200).send(currentGroupMembers);
  } catch (err) {
    console.log("❌❌ Error updating group new students ❌❌", err.message);
    console.log(err);
    res.status(404).send(err.message);
  }
});

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

router.put("/update-all-student-data/:joincodeid", async (req, res) => {
  console.log(" 📕📗📘 Updating all student data 📕📗📘 ");
  try {
    const joincode = await JoinCode.findById(req.params.joincodeid)
      .select("grade_level")
      .select("class_description")
      .select("teacher_name")
      .select("special_notes")
      .select("teacher_id")
      .populate(
        "students_tentative",
        "-updated -created -__v -current_groups -current_classes -tentative_classes"
      )
      .populate(
        "students_confirmed",
        "-updated -created -__v -current_groups -current_classes -tentative_classes"
      );

    const updated_students_tentative = joincode.toObject().students_tentative;
    console.log("updated_students_tentative--->", updated_students_tentative);
    // update cache
    joincode.students_tentative_cache = updated_students_tentative;

    const updated_students_confirmed = joincode.toObject().students_confirmed;
    console.log("updated_students_confirmed--->", updated_students_confirmed);
    // update cache
    joincode.students_confirmed_cache = updated_students_confirmed;

    joincode.save();

    res.status(200).send(joincode);
  } catch (err) {
    console.log("❌❌ Error updating group new students ❌❌", err.message);
    console.log(err);
    res.status(404).send(err.message);
  }
});

router.put(
  "/update-all-group-data-within-grouptheme/:joincodeid",
  async (req, res) => {
    try {
      const joincode = await JoinCode.findById(req.params.joincodeid);
      const { students_tentative_cache } = joincode;
      const allCurrentGroupThemes = joincode.group_themes;
      const { group_theme_id } = req.body;
      const allTenativeStudents = students_tentative_cache.toObject();
      // const allConfirmedStudents = students_confirmed_cache.toObject();
      console.log(
        "This is array of all students in this joincode, students_tentative_cache: ",
        allTenativeStudents,
        Array.isArray(allTenativeStudents)
      );

      // 1. get groupThemeToUpdate
      const groupThemeToUpdate = await allCurrentGroupThemes.id(group_theme_id);
      console.log(
        "🎉🎉🎉 Updating all groups, subsequent members, in grouptheme 🎉🎉:  ",
        groupThemeToUpdate.toObject().name
      );

      // 2. Get array of the groups from group_themes
      const allGroups = groupThemeToUpdate.groups.toObject();
      const iterator = allGroups[Symbol.iterator]();
      let item = {
        value: 1,
        done: false
      };
      let updatedMemberIds;

      while (item.done === false) {
        updatedMemberIds = [];

        item = iterator.next();
        if (!item.value) {
          break;
        }

        console.log("title: ", item.value.title);
        console.log(
          "ITEM.VALUE.MEMBERS_IDS============>",
          item.value.members_ids,
          "\n"
        );
        item.value.members_ids.forEach(memberId => {
          // check against allTenativeStudents
          console.log("memberId:", memberId);

          const checkForStudent = _.find(allTenativeStudents, {
            _id: memberId.toString()
          });

          console.log("checkForStudent==>>", checkForStudent);
          // push to array!
        });

        console.log("ITEM.DONE:", item.done);
        console.log("\n");
      }
      //console.log(_.find(allTenativeStudents, { first_name: "Fabio" }));
      //console.log(set.has(65));

      // console.log("allGroups===>", allGroups);
      // console.log("allGroups===>", Array.isArray(allGroups));
      // 3. This is array of all students in this joincode. Use this.

      // 4.  update db
      // await JoinCode.update(
      //   { _id: req.params.joincodeid },
      //   {
      //     $set: { group_themes: allCurrentGroupThemes }
      //   }
      // );

      res.status(200).send(joincode);
    } catch (err) {
      console.log("❌❌ Error updating grouptheme data ❌❌", err.message);
      console.log(err);
      res.status(404).send(err.message);
    }
  }
);

//

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

 
get groupthemes (for use in menu)
 */

/* router.delete("/:id", async (req, res) => {
  const joincode = await JoinCode.findByIdAndRemove(req.params.id);
  if (!joincode)
    return res.status(404).send("The joincode with the given ID was not found.");
  res.send(joincode);
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
    students_tentative_cache: Joi.array(),
    students_confirmed: Joi.array(),
    students_confirmed_cache: Joi.array(),

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
