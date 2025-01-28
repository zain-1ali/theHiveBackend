require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { bot } = require("./services/telegramService");
const botRoutes = require("./routes/botRoutes");
const { ErrorMiddleware } = require("./middlewares/errorMiddleware");
const { connectDb } = require("./utils/db");
const cors = require("cors");
const rewardsRoutes = require("./routes/rewardRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));

// Middleware
app.use(bodyParser.json());

app.use(ErrorMiddleware);

// Routes
// app.use(`/bot${process.env.BOT_TOKEN}`, botRoutes);
app.use(`/api/webhook`, botRoutes);
app.use(`/api/rewards`, rewardsRoutes);
app.use(`/api/user`, userRoutes);

// Health Check
app.get("/", (req, res) => res.send("Bot is running!"));
connectDb();
// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
