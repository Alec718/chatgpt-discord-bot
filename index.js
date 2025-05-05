require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch'); // Make sure to install this if you haven't: npm install node-fetch

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const OLLAMA_URL = 'http://localhost:11434/api/generate';

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  let model = '';
  let prompt = '';

  if (message.content.startsWith('!chat')) {
    model = 'llama3';
    prompt = message.content.replace('!chat', '').trim();
  } else if (message.content.startsWith('!code')) {
    model = 'codellama';
    prompt = message.content.replace('!code', '').trim();
  } else {
    return; // Ignore messages that don’t use the bot commands
  }

  if (!prompt) return message.reply("⚠️ Please provide a message after the command.");

  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false
      })
    });

    const data = await res.json();

    if (data.error) {
      console.error('Ollama Error:', data.error);
      return message.reply("❌ Error from the local model.");
    }

    const responseText = data.response || "⚠️ No response from model.";
    message.reply(responseText.substring(0, 2000)); // Discord max message length is 2000
  } catch (error) {
    console.error(error);
    message.reply("❌ An error occurred while contacting the local model.");
  }
});

client.login(process.env.DISCORD_TOKEN);
