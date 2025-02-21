const TelegramBot = require("node-telegram-bot-api");

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

module.exports = { bot };
