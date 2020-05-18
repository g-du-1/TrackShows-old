const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ShowSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  mazeId: {
    type: String,
  },
  lastEpisode: {
    type: String,
  },
  nextEpisode: {
    type: String,
  },
  status: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
  allEpisodes: {
    type: Array,
  },
  lastAiredIndexByDate: {
    type: Number,
  },
  lastSeen: {
    type: Number,
  },
  remainingNew: {
    type: Number,
  },
  hasNewSpecial: {
    type: Boolean,
  },
  user: {
    type: String,
  },
});

module.exports = Show = mongoose.model("show", ShowSchema);
