const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MonsterSchema = new Schema({
  name: {
    type: String,
    required: [true, "first_name field is required"]
  },

  credits: {
    type: Number,
    default: 1
  },

  teacher_uids: [String],

  groups_uid: [String]
});

const Monster = mongoose.model("monster", MonsterSchema);

module.exports = Monster;
