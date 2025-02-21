const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  username: { type: String },
  languageCode: { type: String },
  isPremium: { type: Boolean, default: false },
  referredBy: { type: String, default: null },
  userImage: { type: String, default: null },
  lastClaimed: { type: Date, default: null },
  day: { type: Number, default: 1 },
  dayUpdatedAt: { type: Date, default: null },
  pollens: { type: Number, default: 0 },
  nectar: { type: Number, default: 0 },
  xFollowed: { type: Boolean, default: false },
  fbFollowed: { type: Boolean, default: false },
  tgFollowed: { type: Boolean, default: false },
  isQueen: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", userSchema);
