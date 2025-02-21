const express = require("express");
const {
  userAuthenticator,
  handleSocialFollowing,
  getUser,
} = require("../controllers/userController");

const router = express.Router();

router.post("/userAuthenticator", userAuthenticator);
router.post("/handleSocialFollowing", handleSocialFollowing);
router.get("/getUser/:telegramId", getUser);

module.exports = router;
