const express = require("express");
const { userAuthenticator } = require("../controllers/userController");

const router = express.Router();

router.post("/userAuthenticator", userAuthenticator);

module.exports = router;
