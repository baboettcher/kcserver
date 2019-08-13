const Joi = require("joi");
//const Joi = require("@hapi/joi");

const express = require("express");
const Student = require("../models/student_model");
const router = express.Router();

// need to remove populate methods for
router.get("/all/", async (req, res) => {
  console.log("🔮🔮🔮 STUDENT GET ALL 🔮🔮🔮");

  const students = await Student.find()
    .select("first_name")
    .select("last_name")
    .populate(
      "tentative_classes",
      "teacher_name grade_level -_id class_description"
    )
    .populate(
      "current_classes",
      "teacher_name grade_level -_id class_description"
    );

  if (!students) {
    console.log("❌❌❌❌ No students found ❌❌❌❌");
    return res.status(404).send("No students found", req.params.fb_uid);
  }

  res.send(students);
});

router.get("/:fb_uid", async (req, res) => {
  console.log("🆔🆔🆔 STUDENT DASHBOARD 🆔🆔🆔", req.params);

  const student = await Student.find(req.params)
    .select("first_name last_name")
    .populate(
      "tentative_classes",
      "teacher_name grade_level -_id class_description"
    )
    .populate(
      "current_classes",
      "teacher_name grade_level -_id class_description"
    );

  if (!student) {
    console.log("❌❌ No student found with fb_uid:", req.params.fb_uid);
    return res
      .status(404)
      .send("Student not found w/ fb_uid ", req.params.fb_uid);
  }
  res.send(student);
});

router.post("/", async (req, res) => {
  const { error } = validateStudent(req.body);
  if (error) {
    console.log(
      "💩💩💩 Server error; student post 💩💩💩 ", // should this be a 500 code?
      error.details[0].message
    );
    return res.status(400).send(error.details[0].message);
  }

  let student = new Student(req.body);
  student = await student.save();
  res.send(student);
});

// PUSH NEW CLASS(ADDCODE) TO ARRAY
router.put("/addtentativeclass/:id", async (req, res) => {
  console.log("🆔🆔🆔 STUDENT PUT - ADD TENTATIVE CLASS  🆔🆔🆔");
  // Need to validate addcode?
  // const { error } = validateAddCode(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  // #1 Get tentative_classes
  const checkTentativeClasses = await Student.findById(req.params.id);
  const tentative_classes = checkTentativeClasses.toObject().tentative_classes;
  // #2a If already present in array, send back 404 (CHANGE THIS LATER)
  if (tentative_classes.some(e => e == req.body._id)) {
    console.log("CLASS ALREADY PRESENT IN STUDENT ARRAY");
    res.send(checkTentativeClasses).status(404); // what should response be? 404 doesn't signal error/catch block
  } else {
    // #2b Push to student array (FIX THIS. SHOULD NOT NEED 2nd DB CALL)
    const {
      _id,
      grade_level,
      teacher_name,
      class_description,
      teacher_id
    } = req.body; // no longer needed unless we return to keeping a tentative_classes_cache

    const student = await Student.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $push: {
          tentative_classes: req.body._id
        }
      },
      { new: true } //adds new data to response
    );

    // const TEMP_STUDENT = await student.toJSON();
    //console.log("👛👛👛👛👛👛TEMP_STUDENT==========>", TEMP_STUDENT);

    if (!student) {
      console.log("❌❌ Problem updating record ❌❌");
      return res.status(404).send("Updating joincode record error");
    }

    console.log("🐡🐡🐡 SUCCESS PUSHING CLASS TO STUDENTS 🐡🐡🐡 ");
    res.send(student);
  }
});

/* Models.post.Post.findOneAndUpdate({ _id: res._id }, { $inc: { views: 1 } }, {new: true },function(err, response) {
  if (err) {
  callback(err);
 } else {
  callback(response);
 } */

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
    // credits: Joi.number()
    //   .integer()
    //   .min(0),
    credits: Joi.number().float(),
    updated: Joi.string().allow(""),
    created: Joi.string().allow("")
    // new_class: Joi.string(),
    // current_classes: Joi.array(),
    // current_groups: Joi.array()
  };
  return Joi.validate(student, schema);
}

module.exports = router;
