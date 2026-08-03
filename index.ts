import { loadCommands } from './lib/loadCommands.js';
import { Client, Events, GatewayIntentBits, ActivityType, PresenceStatusData } from 'discord.js';
import dotenv from 'dotenv';
import { logMessage } from './lib/log.js';
import { isString } from './lib/helper.js';
import { handleCommands } from './handlers/commandHandler.js';
import { handleLoungeTimers } from './handlers/loungeTimeHandler.js';
import { updateDatabase } from './database/dynamicUpdater.js';
import { randomChatParticipationLogic } from './logic/randomChatParticipationLogic.js';

dotenv.config();

const { TOKEN, BOT_STATUS_ENV, BOT_STATUS_MSG } = process.env;
const componentName = "main";

if (!isString(BOT_STATUS_MSG)) {
  throw new Error("BOT_STATUS_MSG is missing or not a string");
}

if (!isString(TOKEN)) {
  throw new Error("TOKEN is missing or not a string");
}

let BOT_STATUS: PresenceStatusData = BOT_STATUS_ENV as PresenceStatusData;

loadCommands();
await updateDatabase();

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildMessages
]});

client.on(Events.ClientReady, readyClient => {
  logMessage(`Logged in as ${readyClient.user.tag}!`, componentName);
  readyClient.user.setPresence({
    status: BOT_STATUS,
    activities: [{
      name: BOT_STATUS_MSG,
      type: ActivityType.Playing,
    }]
  })
});

client.on(Events.MessageCreate, async message => {
  randomChatParticipationLogic(message);
})

client.on(Events.InteractionCreate, async interaction => {
  await handleCommands(interaction);
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  await handleLoungeTimers(newState, oldState);
});

client.login(TOKEN);
