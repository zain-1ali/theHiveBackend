require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { bot } = require("./services/telegramService");
const botRoutes = require("./routes/botRoutes");
const { ErrorMiddleware } = require("./middlewares/errorMiddleware");
const { connectDb } = require("./utils/db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

app.use(ErrorMiddleware);
connectDb();
// Routes
// app.use(`/bot${process.env.BOT_TOKEN}`, botRoutes);
app.use(`/api/webhook`, botRoutes);

// Health Check
app.get("/", (req, res) => res.send("Bot is running!"));

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
