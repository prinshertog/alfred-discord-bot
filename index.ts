import { loadCommands } from './lib/loadCommands.js';
import { DiscordId, GameStates, UserGames } from './lib/types.js';
import { Client, Events, GatewayIntentBits, ActivityType, MessageFlags, PresenceStatusData, VoiceBasedChannel } from 'discord.js';
import { getAboutMeForUser, getLeaderBoard, registerIfNotRegistered } from './logic/userLogic.js';
import { startTimer, stopTimer } from './lib/loungeTimer.js';
import { createEmbed } from './lib/embed.js';
import { Color } from './data/global.js';
import dotenv from 'dotenv';
import { logMessage } from './lib/log.js';
import { handleError, isString } from './lib/helper.js';
import { game } from './logic/hangmanLogic.js';

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

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildVoiceStates
]});

const userTimers: Map<DiscordId, NodeJS.Timeout> = new Map();
const userGames: UserGames = new Map();
const gameStates: GameStates = new Map();
const voiceChannelStates: Map<DiscordId, VoiceBasedChannel> = new Map();
const voteDisconnectUserList: Map<DiscordId, DiscordId[]> = new Map();

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

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  try {
    const id = interaction?.member?.user.id
    if (!id) {
      throw new Error("User id not found!");
    }
    await registerIfNotRegistered(id);
    switch(interaction.commandName) {

      case "aboutme":
        await interaction.reply({
          embeds: [await createEmbed(
            Color.Blue, 
            "About me", 
            `${await getAboutMeForUser(id)}`,
            client
          )],
          flags: MessageFlags.Ephemeral
        });
        break;

      case "hangman":
        let letter: string = interaction.options.getString("letter") ?? "";
        if (letter) {
          letter = letter.toLowerCase();
        } else {
          throw Error("No letter given")
        }
        await game(id, letter, interaction, userGames, gameStates, client);
        break;

      case "leaderboard":
        let value = interaction.options.getInteger("entries");
        let amount = value ? value : 5;
        switch(interaction.options.getSubcommand()) {
          case "loungetime":
            interaction.reply({
              embeds: [await createEmbed(
                Color.Blue, 
                "Lounge Time Leader Board", 
                await getLeaderBoard(amount, "loungetime", client) ?? "Undefined",
                client
              )]
            });
            break;
        }
        break;
      case "votedisconnect":
        let userId: DiscordId = interaction.options.getUser("user").id;
        let votedUserId: DiscordId = interaction.user.id
        interaction.reply({
          embeds: [await createEmbed(
            Color.Blue,
            "Vote Disconnect",
            await voteDisconnect(userId, voteDisconnectUserList, interaction.guild, votedUserId),
            client
          )]
        })
    }

  } catch (error) {
    handleError(error, componentName, interaction);
  }
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  if (newState.member?.user.bot) return; 
  const userName = newState.member?.user.username;
  if (!userName) return;
  const id = newState.member?.id;
  if (!id) throw Error();
  if (!oldState.channel && newState.channel) {
    logMessage(`${userName} joined ${newState.channel.name}`, componentName);
    await registerIfNotRegistered(id);
    await startTimer(userTimers, userName, id);
  } else if (oldState.channel && !newState.channel) {
    logMessage(`${userName} left ${oldState.channel.name}`, componentName);
    await stopTimer(userTimers, userName, id);
    voiceChannelStates.delete(id);
  } else if (oldState.channelId !== newState.channelId) {
    logMessage(`${userName} switched from ${oldState.channel?.name} to ${newState.channel?.name}`, componentName);
  }
});

client.login(TOKEN);