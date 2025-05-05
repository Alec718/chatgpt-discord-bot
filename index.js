require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent // 👈 Needed to read message content
  ]
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!chat')) return;

  const userPrompt = message.content.replace('!chat', '').trim();
  if (!userPrompt) return message.reply("Please provide a message after `!chat`.");

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userPrompt }]
    });

    const response = completion.choices[0].message.content;
    message.reply(response);
  } catch (error) {
    console.error(error);
    message.reply("⚠️ Error with OpenAI request.");
  }
});

client.login(process.env.DISCORD_TOKEN);
