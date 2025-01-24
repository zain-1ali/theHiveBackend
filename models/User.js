const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  username: { type: String },
  languageCode: { type: String },
  isPremium: { type: Boolean, default: false },
  referredBy: { type: String, default: null },
  referrals: { type: Map, of: Object, default: {} },
  balance: { type: Number, default: 0 },
  mineRate: { type: Number, default: 0.001 },
  isMining: { type: Boolean, default: false },
  miningStartedTime: { type: Date, default: null },
  daily: {
    claimedTime: { type: Date, default: null },
    claimedDay: { type: Number, default: 0 },
  },
  userImage: { type: String, default: null },
});

module.exports = mongoose.model("User", userSchema);
