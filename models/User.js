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
},{timestamps: true});
const User = mongoose.model("User", userSchema)
module.exports = User 
