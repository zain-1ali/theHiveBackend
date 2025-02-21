const express = require("express");
const {
  userAuthenticator,
  handleSocialFollowing,
} = require("../controllers/userController");

const router = express.Router();

router.post("/userAuthenticator", userAuthenticator);
router.post("/handleSocialFollowing", handleSocialFollowing);

module.exports = router;
