const { Client, GatewayIntentBits } = require("discord.js");
const fetch = require("node-fetch");

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxEsLfjJY6Bj2RkzKVQM3ugt30KeKNoko90Fat1M5cZD2uDkzmYD_PRyrgddIy96i7HMA/exec";
const BOT_TOKEN = "MTUxMzIyOTM3ODQ0NjgxOTU4OA.Gm5x6a.V6kydQa9ig7qDICzekWgRWU6-WTGZh8LopKAis";

const ALLOWED_CHANNELS = [
  "1513229048975855756",
  "1513229114633355487",
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
