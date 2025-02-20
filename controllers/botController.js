const { bot } = require("../services/telegramService");
const User = require("../models/User");
const { connectDb } = require("../utils/db");
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
  console.log(msg.from.first_name);

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
        userImage: "",
        referredBy: refCode || null,
      };

      if (refCode) {
        const referrer = await User.findOne({ telegramId: refCode });
        if (referrer) {
          const refrreReward = isPremium ? 5000 : 500;
          await User.findOneAndUpdate(
            { telegramId: refCode },
            { $inc: { pollens: refrreReward } }
          );

          const historyData = {
            type: "pollens",
            reward: refrreReward,
            userId: userId,
            refererId: refCode,
            message: "accepted your invite",
          };

          const history = new History(historyData);
          await history.save();
        } else {
          userData.referredBy = null;
        }
      }
      user = new User(userData);
      await user.save();
    }

    await bot.sendMessage(msg.chat.id, welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Open hive App",
              web_app: { url: "https://radiant-rabanadas-d68427.netlify.app" },
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
