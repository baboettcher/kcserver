const Joi = require("joi");
//const mongoose = require("mongoose");
const express = require("express");
const Admin = require("../models/admin_model");
const router = express.Router();

router.get("/:fb_uid", async (req, res) => {
  console.log("☣️☣️☣️ ADMIN DASH REQUESTED ☣️☣️☣️  req.params-->", req.params);

  const admin = await Admin.find(req.params);
  if (!admin) {
    console.log("❌❌ No admin found ❌❌");
    return res.status(404).send("Admin with the given fb_uid was not found.");
  }
  res.send(admin);
});

router.post("/", async (req, res) => {
  const { error } = validateAdmin(req.body);
  if (error) {
    console.log("--- ADMIN POST ERROR---", error.details[0].message);
    return res.status(400).send("OOPA-->" + error.details[0].message);
  }
  let admin = new Admin(req.body);
  admin = await admin.save();
  res.send(admin);
});

router.put("/:id", async (req, res) => {
  const { error } = validateAdmin(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    { first_name: req.body.first_name },
    {
      new: true
    }
  );
  if (!admin)
    return res.status(404).send("first_name with the given ID was not found.");
  res.send(admin);
});

router.delete("/:id", async (req, res) => {
  const admin = await Admin.findByIdAndRemove(req.params.id);
  if (!admin)
    return res.status(404).send("The admin with the given ID was not found.");
  res.send(admin);
});

router.get("/", async (req, res) => {
  console.log("GET all admins");
  const admins = await Admin.find().sort("name");
  res.send(admins);
});

function validateAdmin(admin) {
  const schema = {
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    fb_uid: Joi.string().required(),
    email: Joi.string().email({ minDomainAtoms: 2 }),
    state: Joi.string().allow(""),
    school_name: Joi.string().allow(""),
    district_name: Joi.string().allow("")
  };
  return Joi.validate(admin, schema);
}

/*     school_uid: Joi.string(),
    district_uid: Joi.string(), */
module.exports = router;
