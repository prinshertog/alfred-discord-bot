import { loadCommands } from './lib/load_commands.js';
import { DiscordId } from './lib/types.js';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { getAboutMeForUser, registerIfNotRegistered } from './logic/members.js';
import { addLoungeTime } from './database/members.js';
import dotenv from 'dotenv';
dotenv.config();
const { TOKEN } = process.env;

loadCommands();

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildVoiceStates
] });

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`); 
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  try {
    if (interaction.commandName === 'aboutme') {
      const id = interaction?.member?.user.id
      await registerIfNotRegistered(id);
      if (!id) {
        throw new Error("User id not found!");
      }
      interaction.reply(`${await getAboutMeForUser(id)}`);
    }

  } catch (error) {
    interaction.reply(`${error}`);
  }
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const user = newState.member.user.username;
  const id: DiscordId = newState.member.id
  let timer;
  if (!oldState.channel && newState.channel) {
    console.log(`${user} joined ${newState.channel.name}`);
    await registerIfNotRegistered(id);
    console.log(`Started timer for user ${user}.`);
    timer = setInterval(() => {
      addLoungeTime(id, 5);
    }, 5000);
  } else if (oldState.channel && !newState.channel) {
    console.log(`${user} left ${oldState.channel.name}`);
    clearInterval(timer);
    console.log(`Stopped timer for user ${user}.`);
  } else if (oldState.channelId !== newState.channelId) {
    console.log(`${user} switched from ${oldState.channel.name} to ${newState.channel.name}`);
  }
});

client.login(TOKEN);