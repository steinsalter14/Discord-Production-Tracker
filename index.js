const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const fetch = require("node-fetch");

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TASK_ASSIGNMENTS_CHANNEL_ID = process.env.TASK_ASSIGNMENTS_CHANNEL_ID;
const TASK_UPDATES_CHANNEL_ID = process.env.TASK_UPDATES_CHANNEL_ID;

const commands = [
  {
    name: "assign",
    description: "Assign a person to a cut task",
    options: [
      { name: "seq", description: "Sequence number (e.g. 1 or SEQ_1)", type: 3, required: true },
      { name: "cut", description: "Cut number (e.g. 1)", type: 3, required: true },
      { name: "task", description: "Task type", type: 3, required: true,
        choices: [
          { name: "Layout", value: "Layout" },
          { name: "Genga / Animation", value: "Genga / Animation" },
          { name: "Douga / Clean Up", value: "Douga / Clean Up" },
          { name: "Color", value: "Color" },
          { name: "BG", value: "BG" },
        ]
      },
      { name: "user", description: "Who to assign", type: 3, required: true },
      { name: "status", description: "Task status", type: 3, required: true,
        choices: [
          { name: "Not Assigned", value: "Not Assigned" },
          { name: "In Progress", value: "In Progress" },
          { name: "Completed", value: "Completed" },
        ]
      },
      { name: "notes", description: "Optional notes", type: 3, required: false },
    ],
  },
  {
    name: "update",
    description: "Update a cut task",
    options: [
      { name: "seq", description: "Sequence number (e.g. 1 or SEQ_1)", type: 3, required: true },
      { name: "cut", description: "Cut number (e.g. 1)", type: 3, required: true },
      { name: "task", description: "Task type", type: 3, required: true,
        choices: [
          { name: "Layout", value: "Layout" },
          { name: "Genga / Animation", value: "Genga / Animation" },
          { name: "Douga / Clean Up", value: "Douga / Clean Up" },
          { name: "Color", value: "Color" },
          { name: "BG", value: "BG" },
        ]
      },
      { name: "user", description: "Who to assign", type: 3, required: true },
      { name: "status", description: "Task status", type: 3, required: true,
        choices: [
          { name: "Not Assigned", value: "Not Assigned" },
          { name: "In Progress", value: "In Progress" },
          { name: "Completed", value: "Completed" },
        ]
      },
      { name: "notes", description: "Optional notes", type: 3, required: false },
    ],
  },
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", async () => {
  console.log(`Bot is online as ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log("Slash commands registered!");
  } catch (err) {
    console.error("Error registering commands:", err);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;

  await interaction.deferReply();

  // Parse seq — accept "1" or "SEQ_1"
  let seq = options.getString("seq");
  if (!seq.toUpperCase().startsWith("SEQ_")) seq = `SEQ_${seq}`;

  const cut    = `CUT ${options.getString("cut")}`;
  const task   = options.getString("task");
  const user   = options.getString("user");
  const status = options.getString("status");
  const notes  = options.getString("notes") || "";

  const message = `${commandName} | ${seq} | ${cut} | ${task} | ${user} | ${status}${notes ? ` | ${notes}` : ""}`;

  console.log(`Forwarding message: ${message}`);

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: message,
        channel_id: interaction.channel.id,
        author: interaction.user.username,
      }),
      redirect: "follow",
    });

    console.log("Apps Script response: " + res.status);

    const statusEmoji = { "Completed": "✅", "In Progress": "🟡", "Not Assigned": "🔴" }[status] ?? "📋";

    if (commandName === "assign") {
      await interaction.editReply(
        `${statusEmoji} **${seq} — ${cut} — ${task}** assigned to **${user}** · Status: **${status}**${notes ? `\n📝 ${notes}` : ""}`
      );
    } else if (commandName === "update") {
      await interaction.editReply(
        `${statusEmoji} **${seq} — ${cut} — ${task}** updated · Assigned to **${user}** · Status: **${status}**${notes ? `\n📝 ${notes}` : ""}`
      );
    }

  } catch (err) {
    console.error("Error:", err);
    await interaction.editReply("❌ Something went wrong. Please try again.");
  }
});

client.login(BOT_TOKEN);
