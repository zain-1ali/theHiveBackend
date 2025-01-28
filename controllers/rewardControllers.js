const User = require("../models/User");
const { hasDayPassed } = require("../utils/dateHelper");

const rewards = [500, 550, 550, 600, 650, 650, 1000];
exports.claimPollens = async (req, res) => {
  const { telegramId } = req.body;
  if (!telegramId)
    return res.status(400).json({ message: "User ID is required." });

  try {
    let user = await User.findOne({ telegramId });
    const now = new Date();

    if (!user) {
      return res.status(404).json({
        message: "User not found. Please start the bot to claim pollens.",
        success: false,
      });
    }

    // Check if a day has passed since the last claim
    if (!hasDayPassed(user.lastClaimed)) {
      return res
        .status(400)
        .json({ message: "You can only claim pollens once every 24 hours." });
    }

    // Increment the day and add pollens
    user.day = (user.day % 7) + 1;
    user.pollens += rewards[user.day - 1];
    user.lastClaimed = now;
    await user.save();

    res.json({
      message: `You have claimed ${rewards[user.day - 1]} pollens!`,
      pollens: user.pollens,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while claiming pollens." });
  }
};

exports.getProgress = async (req, res) => {
  const { telegramId } = req.params;

  try {
    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ message: "User not found.",success:false });
    }

    res.json({
      day: user.day,
      pollens: user.pollens,
      lastClaimed: user.lastClaimed,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching progress." });
  }
};

exports.resetProgress = async (req, res) => {
  const { telegramId } = req.body;

  try {
    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.day = 1;
    user.pollens = rewards[0];
    user.lastClaimed = new Date();
    await user.save();

    res.json({ message: "Progress has been reset.", pollens: user.pollens });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while resetting progress." });
  }
};

exports.checkAndResetIfDayMissed = async (req, res) => {
  const { telegramId } = req.body;

  if (!telegramId)
    return res.status(400).json({ message: "User ID is required." });

  try {
    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const now = new Date();

    // Check if a day has passed but the user did not claim rewards
    if (
      hasDayPassed(user.lastClaimed) &&
      now - user.lastClaimed >= 2 * 86400000
    ) {
      user.day = 1;
      user.lastClaimed = null;
      await user.save();
      return res.json({
        message: "A day was missed. Progress has been reset to Day 1.",
      });
    }

    res.json({
      message: "No reset was required.",
      day: user.day,
      pollens: user.pollens,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while checking and resetting progress.",
    });
  }
};
