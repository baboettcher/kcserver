const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// LATER: use joi to validate sub-docs?
const GroupSchema = new Schema({
  title: {
    type: String,
    default: "Red Apples"
  },
  avatar_url: {
    type: String,
    default: "https://PLACEHOLDER.jpg"
  },
  audio_url: {
    type: String,
    default: "https://PLACEHOLDER.mp3"
  },
  motto: {
    type: String,
    default: "Believe in UFOs"
  },
  group_points: {
    type: Number,
    default: 0
  },
  group_points_transactions: {
    // lots later
    type: Array,
    default: []
  },

  members_ids: {
    type: Array,
    default: []
  },
  members_populated: {
    // this populated using groupMemberIds, data retrieved from joinCode cache?
    type: Array,
    default: []
  },
  date_updated: { type: Date, default: Date.now },
  date_created: { type: Date, default: Date.now },
  date_last_cleared: { type: Date, default: Date.now }
});

const GroupThemeSchema = new Schema({
  name: {
    type: String,
    default: "ABCD Generic Groups" // ie Math, Reading, Quick Game, etc
  },
  teacher_notes: {
    type: String,
    default: "Explanation of extraterrestrial life" // ie Math, Reading, Quick Game, etc
  },
  date_updated: { type: Date, default: Date.now },
  date_created: { type: Date, default: Date.now },

  groups: { type: [GroupSchema], default: [] } // originally this did not work
  //groups: { type: Array, default: [] }
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
  }, // later get this from populated from teacher_id

  teacher_id: {
    type: String,
    required: [true, "teacher_id field is required"]
  },

  students_tentative: [{ type: Schema.ObjectId, ref: "student" }], // populate on login and used to populate groups
  students_confirmed: [{ type: Schema.ObjectId, ref: "student" }], // later swtich to this

  school_name: {
    type: String
  }, // later get this populated from school_id
  school_id: {
    type: String
  },
  district_name: {
    type: String
  }, // later get this populated from district_id
  district_id: {
    type: String
  },
  special_notes: {
    type: String
  },
  group_themes: { type: [GroupThemeSchema], default: [] },
  group_themes_current_id: { type: String, default: "" },
  group_themes_current_populated: {
    // HOW much will be populated?c current theme and all students?
    type: Object,
    default: { defaultSet: false }
  }
  // temp solution if no object present
});

const JoinCode = mongoose.model("joincode", JoinCodeSchema);
const GroupTheme = mongoose.model("grouptheme", GroupThemeSchema);
const Group = mongoose.model("group", GroupSchema);

//module.exports = JoinCode;
module.exports.joincode = JoinCode;
module.exports.grouptheme = GroupTheme;
module.exports.group = Group;
