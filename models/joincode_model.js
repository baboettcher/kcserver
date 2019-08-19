const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// LATER: how to use joi to validate sub-docs?
const GroupSchema = new Schema({
  name: {
    type: String,
    default: "Red Apples"
  },
  avatar_url: {
    type: String,
    default:
      "https://images.all-free-download.com/images/graphiclarge/cartoon_goat_clip_art_22215.jpg"
  },
  audio_url: {
    type: String,
    default: "https://freesound.org/people/shadeslayer99/sounds/161194/"
  },
  motto: {
    type: String,
    default: "Believe in yourself!"
  },
  group_points: {
    type: Number,
    default: 0
  },
  group_points_transaction: {
    type: Array,
    default: []
  },

  groupMembers: {
    type: Array,
    default: []
  },
  groupMembersMiniObject: {
    type: Array,
    default: []
  },
  date_updated: { type: Date, default: Date.now },
  date_created: { type: Date, default: Date.now },
  date_last_cleared: { type: Date, default: Date.now }
});

const JoinCodeSchema = new Schema({
  join_code: {
    type: String,
    required: [true, "join_code field is required"]
  },
  grade_level: {
    type: String,
    required: [true, "grade field is required"]
  },
  class_description: {
    type: String,
    required: [true, "class_description field is required"]
  },

  teacher_name: {
    type: String,
    required: [true, "teacher_name field is required"]
  }, // later get this from id

  teacher_id: {
    type: String,
    required: [true, "teacher_id field is required"]
  },

  students_tentative: [{ type: Schema.ObjectId, ref: "student" }],
  students_confirmed: [{ type: Schema.ObjectId, ref: "student" }],

  school_name: {
    type: String
  }, // later get this from id
  school_id: {
    type: String
  },
  district_name: {
    type: String
  }, // later get this from id
  district_id: {
    type: String
  },
  special_notes: {
    type: String
  },

  /*   groups: [GroupSchema],
  group_default_id: String, // should this be an object, as it is in teacher_model?3
  group_default_info: Object */

  groups: { type: [GroupSchema], default: [] },
  group_default_id: { type: String, default: "" }, // should this be an object, as it is in teacher_model?3
  group_default_info: { type: Object, default: { defaultSet: false } }
});

const JoinCodeSchema_5_groups = new Schema({
  join_code: {
    type: String,
    required: [true, "join_code field is required"]
  },
  grade_level: {
    type: String,
    required: [true, "grade field is required"]
  },
  class_description: {
    type: String,
    required: [true, "class_description field is required"]
  },

  teacher_name: {
    type: String,
    required: [true, "teacher_name field is required"]
  }, // later get this from id

  teacher_id: {
    type: String,
    required: [true, "teacher_id field is required"]
  },

  students_tentative: [{ type: Schema.ObjectId, ref: "student" }],
  students_confirmed: [{ type: Schema.ObjectId, ref: "student" }],

  school_name: {
    type: String
  }, // later get this from id
  school_id: {
    type: String
  },
  district_name: {
    type: String
  }, // later get this from id
  district_id: {
    type: String
  },
  special_notes: {
    type: String
  },

  // later make this an ARRAY of groups
  group_1: { type: GroupSchema, default: {} },
  group_2: { type: GroupSchema, default: {} },
  group_3: { type: GroupSchema, default: {} },
  group_4: { type: GroupSchema, default: {} },
  group_5: { type: GroupSchema, default: {} }
});

const JoinCode = mongoose.model("joincode", JoinCodeSchema);

module.exports = JoinCode;
