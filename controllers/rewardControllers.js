const History = require("../models/History");
const User = require("../models/User");
const { hasDayPassed } = require("../utils/dateHelper");
const { getPercentage } = require("../utils/returnPercentage");

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
    // user.day = (user.day % 7) + 1;
    user.pollens += rewards[user.day - 1];
    user.lastClaimed = now;
    await user.save();

    if (user.referredBy) {
      const refrreReward = user.isPremium
        ? getPercentage(rewards[user.day - 1], 20)
        : getPercentage(rewards[user.day - 1], 10);
      await User.findOneAndUpdate(
        { telegramId: user.referredBy },
        { $inc: { pollens: refrreReward } }
      );

      const historyData = {
        type: "pollens",
        reward: refrreReward,
        userId: telegramId,
        refererId: user.referredBy,
        message: "did some actions on The Hive",
      };

      const history = new History(historyData);
      await history.save();
    }

    res.status(200).json({
      message: `You have claimed ${rewards[user.day - 1]} pollens!`,
      pollens: user.pollens,
      claimedPollens: rewards[user.day - 1],
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while claiming pollens.",
      success: false,
    });
  }
};

exports.getProgress = async (req, res) => {
  const { telegramId } = req.params;
  try {
    const user = await User.findOne({ telegramId });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found.", success: false });
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

exports.checkRewardClaimedToday = async (req, res) => {
  const { telegramId } = req.params;

  try {
    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const now = new Date();
    const lastClaimed = new Date(user.lastClaimed);

    if (
      now.getDate() === lastClaimed.getDate() &&
      now.getMonth() === lastClaimed.getMonth() &&
      now.getFullYear() === lastClaimed.getFullYear()
    ) {
      return res.json({
        claimedToday: true,
        message: "You have already claimed today's reward.",
        day: user.day,
        pollens: user.pollens,
        lastClaimed: user.lastClaimed,
      });
    }

    res.json({
      claimedToday: false,
      message: "You have not claimed today's reward yet.",
      day: user.day,
      pollens: user.pollens,
      lastClaimed: user.lastClaimed,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while checking today's reward." });
  }
};

exports.checkAndUpdateDay = async (req, res) => {
  const { telegramId } = req.params;

  try {
    const user = await User.findOne({ telegramId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const now = new Date();
    const lastClaimed = new Date(user.lastClaimed);

    if (now.getDate() !== lastClaimed.getDate()) {
      // If user missed a day, reset to day 1
      if (now - lastClaimed >= 2 * 86400000) {
        user.day = 1;
        user.lastClaimed = null;
      } else {
        user.day = user.day === 7 ? 1 : (user.day % 7) + 1; // Move to the next day, reset if day 7
        // user.lastClaimed = now;
      }

      await user.save();
    }

    res.json({ message: "Day updated successfully.", day: user.day });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the day." });
  }
};

// exports.checkAndUpdateRewardStatus = async (req, res) => {
//   const { telegramId } = req.params;

//   try {
//     const user = await User.findOne({ telegramId });

//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     const now = new Date();
//     const lastClaimed = new Date(user.lastClaimed);
//     let claimedToday = false;
//     if (
//       now.getDate() === lastClaimed.getDate() &&
//       now.getMonth() === lastClaimed.getMonth() &&
//       now.getFullYear() === lastClaimed.getFullYear()
//     ) {
//       claimedToday = true;
//     } else {
//       if (now - lastClaimed >= 2 * 86400000) {
//         user.day = 1;
//         user.lastClaimed = null;
//       } else {
//         user.day = user.day === 7 ? 1 : (user.day % 7) + 1;
//       }
//       await user.save();
//     }

//     res.json({
//       claimedToday,
//       message: claimedToday
//         ? "You have already claimed today's reward."
//         : "You have not claimed today's reward yet.",
//       day: user.day,
//       pollens: user.pollens,
//       lastClaimed: user.lastClaimed,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message:
//         "An error occurred while checking and updating the reward status.",
//     });
//   }
// };

exports.checkAndUpdateRewardStatus = async (req, res) => {
  const { telegramId } = req.params;

  try {
    const user = await User.findOne({ telegramId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const now = new Date();
    const lastClaimed = new Date(user.lastClaimed);

    // Normalize both dates to midnight (ignore time portion)
    const todayMidnight = new Date(now).setHours(0, 0, 0, 0);
    const lastClaimedMidnight = new Date(lastClaimed).setHours(0, 0, 0, 0);

    let claimedToday = todayMidnight === lastClaimedMidnight;

    // Only update if a new day has started
    if (!claimedToday) {
      if (todayMidnight - lastClaimedMidnight >= 2 * 86400000) {
        user.day = 1; // Missed a day, reset to day 1
      } else {
        user.day = user.day === 7 ? 1 : user.day + 1; // Move to the next day, reset if day 7
      }
      user.lastClaimed = now;
      await user.save();
    }

    res.json({
      claimedToday,
      message: claimedToday
        ? "You have already claimed today's reward."
        : "You have not claimed today's reward yet.",
      day: user.day,
      pollens: user.pollens,
      lastClaimed: user.lastClaimed,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "An error occurred while checking and updating the reward status.",
    });
  }
};
