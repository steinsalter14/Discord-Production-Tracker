const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ALLOWED_CHANNELS = [
  process.env.TASK_ASSIGNMENTS_CHANNEL_ID,
  process.env.TASK_UPDATES_CHANNEL_ID,
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!ALLOWED_CHANNELS.includes(message.channel.id)) return;

  const content = message.content.trim();
  if (!content.toLowerCase().startsWith("assign") &&
      !content.toLowerCase().startsWith("update")) return;

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: content,
        channel_id: message.channel.id,
        author: message.author.username,
      }),
      redirect: "follow",
    });
  } catch (err) {
    console.error("Error forwarding message:", err);
  }
});

client.login(BOT_TOKEN);
