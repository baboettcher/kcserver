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
    default: "ABCD Groups" // ie Math, Reading, Quick Game, etc
  },
  teacher_notes: {
    type: String,
    default: "Explaination on this set of groups" // ie Math, Reading, Quick Game, etc
  },
  date_updated: { type: Date, default: Date.now },
  date_created: { type: Date, default: Date.now },
  groups: { type: [GroupSchema], default: [] }
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

module.exports = JoinCode;
