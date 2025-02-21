const { catchAsyncError } = require("../middlewares/catchAsyncError");
const History = require("../models/History");
const User = require("../models/User");
const { ErrorHandler } = require("../utils/ErrorHandler");

exports.userAuthenticator = catchAsyncError(async (req, res, next) => {
  const { telegramId, firstName, lastName, username, languageCode, isPremium } =
    req.body;

  const userTelegramData = {
    telegramId,
    firstName,
    lastName,
    username,
    languageCode,
    isPremium,
  };

  if (!userTelegramData?.telegramId) {
    next(new ErrorHandler("Invalid user data", 400));
  }
  let user = await User.findOne({ telegramId: userTelegramData?.telegramId });

  if (!user) {
    const userData = {
      telegramId: userTelegramData?.telegramId,
      firstName: userTelegramData?.firstName,
      lastName: userTelegramData?.lastName,
      username: userTelegramData?.username,
      languageCode: userTelegramData?.languageCode,
      isPremium: userTelegramData?.isPremium,
      userImage: "",
      referredBy: userTelegramData?.refCode || null,
    };

    if (userTelegramData?.refCode?.refCode) {
      const referrer = await User.findOne({
        telegramId: userTelegramData?.refCode,
      });
    }

    console.log(userData);
    user = new User(userData);
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  }
});

exports.handleSocialFollowing = catchAsyncError(async (req, res, next) => {
  const { telegramId, followingPlatform } = req.body;
  if (!telegramId) next(new ErrorHandler("User ID is required.", 400));

  let user = await User.findOne({ telegramId });

  if (!user) {
    next(
      new ErrorHandler(
        "User not found. Please start the bot to claim pollens",
        404
      )
    );
  }

  user[`${followingPlatform}Followed`] = true;

  if (followingPlatform === "tg") {
    if (user.pollens < 100000 && user.pollens + 1000 >= 100000) {
      user.isQueen = true;
    }
    user.pollens += 1000;
  } else {
    if (user.pollens < 100000 && user.pollens + 100 >= 100000) {
      user.isQueen = true;
    }
    user.pollens += 100;
  }

  if (user.xFollowed && user.fbFollowed && user.tgFollowed) {
    user.nectar += 10;
    const historyData = {
      type: "nectar",
      reward: 10,
      userId: "",
      refererId: telegramId,
      message:
        "You gained nectar by following all the social platforms of the hive.",
    };

    const history = new History(historyData);
    await history.save();
  }
  await user.save();

  const historyData = {
    type: "pollens",
    reward: followingPlatform === "tg" ? 1000 : 100,
    userId: "",
    refererId: telegramId,
    message: `You gained pollens by ${
      followingPlatform === "tg"
        ? "joining hive telegram channel"
        : followingPlatform === "fb"
        ? "following hive facebook page"
        : "following hive twitter account"
    }.`,
  };

  const history = new History(historyData);
  await history.save();

  res
    .status(200)
    .json({ message: "Social following updated successfully", success: true });
});

exports.getUser = catchAsyncError(async (req, res, next) => {
  const { telegramId } = req.params;

  const user = await User.findOne({ telegramId });

  if (!user) {
    next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({ user });
});
