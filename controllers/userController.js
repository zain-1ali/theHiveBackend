const User = require("../models/User");

exports.userAuthenticator = async (req, res, next) => {
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

  try {
    if (!userTelegramData?.telegramId) {
      return res
        .status(400)
        .json({ message: "Invalid user data", userTelegramData });
    }
    let user = await User.findOne({ telegramId: userTelegramData?.telegramId });

    if (!user) {
      const userData = {
        telegramId: userTelegramData?.telegramId,
        firstName: userTelegramData?.userFirstName,
        lastName: userTelegramData?.userLastName,
        username: userTelegramData?.userUsername,
        languageCode: userTelegramData?.userLanguageCode,
        isPremium: userTelegramData?.isPremium,
        userImage: "",
        referredBy: userTelegramData?.refCode || null,
      };

      if (userTelegramData?.refCode?.refCode) {
        const referrer = await User.findOne({
          telegramId: userTelegramData?.refCode,
        });
        if (referrer) {
          const bonusAmount = 100;
          //   isPremium ? 500 :
          //   100;

          // Update referrer's balance and referrals
          //   referrer.balance += bonusAmount;
          //   referrer.referrals.set(userId, {
          //     addedValue: bonusAmount,
          //     firstName: userFirstName,
          //     lastName: userLastName,
          //     userImage,
          //   });
          //   await referrer.save();
        }
        // else {
        //   userData.referredBy = null;
        // }
      }

      console.log(userData);
      user = new User(userData);
      await user.save();
      res.status(201).json({ message: "User created successfully" });
    }
  } catch (error) {
    console.error("Error processing /start command:", error);
    res.status(500).json({ message: "Error. Please try again!", error });
  }
};
