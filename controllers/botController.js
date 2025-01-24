const { bot } = require("../services/telegramService");
const User = require("../models/User");
// const { saveUserImage } = require("../utils/storageService");

exports.handleUpdate = async (req, res) => {
  try {
    await bot.processUpdate(req.body);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error in botController:", error);
    res.status(500).send("Error processing update");
  }
};

// /start command handler
bot.onText(/\/start(.*)/, async (msg, match) => {
  const userId = msg.from.id.toString();
  const userFirstName = msg.from.first_name || "User";
  const userLastName = msg.from.last_name || "";
  const userUsername = msg.from.username || "";
  const userLanguageCode = msg.from.language_code || "en";
  const isPremium = msg.from.is_premium || false;
  const refCode = match[1]?.trim().startsWith("ref_")
    ? match[1].trim().substring(4)
    : null;

  const welcomeMessage = `Hi, ${userFirstName}!👋\n\nWelcome to The hive!🥳\n\nHere you can earn pollens by mining them! Invite friends to earn more coins together, and level up faster!🚀`;

  try {
    let user = await User.findOne({ telegramId: userId });

    
    if (!user) {
      //   let userImage = null;

      // Get user profile photo
      //   const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });
      //   if (photos.total_count > 0) {
      //     const fileId = photos.photos[0][0].file_id;
      //     userImage = await saveUserImage(fileId, userId);
      //   }

      const userData = {
        telegramId: userId,
        firstName: userFirstName,
        lastName: userLastName,
        username: userUsername,
        languageCode: userLanguageCode,
        isPremium,
        referrals: {},
        balance: 0,
        mineRate: 0.001,
        isMining: false,
        miningStartedTime: null,
        daily: {
          claimedTime: null,
          claimedDay: 0,
        },
        userImage: "",
        referredBy: refCode || null,
      };

      if (refCode) {
        const referrer = await User.findOne({ telegramId: refCode });
        if (referrer) {
          const bonusAmount = 100;
          //   isPremium ? 500 :
          //   100;

          // Update referrer's balance and referrals
          referrer.balance += bonusAmount;
          referrer.referrals.set(userId, {
            addedValue: bonusAmount,
            firstName: userFirstName,
            lastName: userLastName,
            userImage,
          });
          await referrer.save();
        } else {
          userData.referredBy = null;
        }
      }


      console.log(userData)
      user = new User(userData);
      await user.save();
    }

    await bot.sendMessage(msg.chat.id, welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Open hive App",
              web_app: { url: "https://radiant-rabanadas-d68427.netlify.app/" },
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error("Error processing /start command:", error);
    await bot.sendMessage(msg.chat.id, "Error. Please try again!");
  }
});
