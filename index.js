require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
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
    const response = await axios.post('http://localhost:11434/v1/chat/completions', {
      model: 'llama3',
      messages: [{ role: 'user', content: userPrompt }]
    });

    const reply = response.data.choices[0].message.content;
    message.reply(reply);
  } catch (error) {
    console.error('❌ Ollama error:', error.message || error);
    message.reply("⚠️ Error with local model response.");
  }
});

client.login(process.env.DISCORD_TOKEN);
