'use strict'
import { loadCommands } from './lib/load_commands.js';
import { DiscordId, GameStates, UserGames } from './lib/types.js';
import { Client, Events, GatewayIntentBits, ActivityType, MessageFlags, PresenceStatusData, Interaction, VoiceBasedChannel, Guild } from 'discord.js';
import { getAboutMeForUser, getLeaderBoard, registerIfNotRegistered } from './logic/userLogic.js';
import { startTimer, stopTimer } from './lib/lounge_timer.js';
import { game } from './logic/hangmanLogic.js';
import { createEmbed } from './lib/embed.js';
import { Color } from './data/global.js';
import dotenv from 'dotenv';
import { handleLonelyBot, handleLonelyInteraction, startLonelyTimer, stopLonelyTimer } from './logic/lonelyLogic.js';
dotenv.config();
const { TOKEN, BOT_STATUS_ENV, BOT_STATUS_MSG } = process.env;

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
const lonelyTimers: Map<DiscordId, NodeJS.Timeout> = new Map();
const voiceChannelStates: Map<DiscordId, VoiceBasedChannel> = new Map();

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
  client.user.setPresence({
    status: BOT_STATUS,
    activities: [{
      name: BOT_STATUS_MSG,
      type: ActivityType.Custom,
    }]
  })
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  try {
    const id = interaction?.member?.user.id
    await registerIfNotRegistered(id);
    if (!id) {
      throw new Error("User id not found!");
    }
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
        let letter: string = interaction.options.getString("letter");
        if (letter) letter = letter.toLowerCase();
        await game(id, letter, interaction, userGames, gameStates, client);
        break;
      case "leaderboard":
        let amount = interaction.options.getInteger("entries");
        switch(interaction.options.getSubcommand()) {
          case "streetcred":
            interaction.reply({
              embeds: [await createEmbed(
                Color.Blue,
                "Street Cred Leader Board",
                await getLeaderBoard(amount, "streetcred", client),
                client
              )]
            });
            break;
          case "loungetime":
            interaction.reply({
              embeds: [await createEmbed(
                Color.Blue, 
                "Lounge Time Leader Board", 
                await getLeaderBoard(amount, "loungetime", client),
                client
              )]
            });
            break;
        }
        break;
    }

  } catch (error) {
    interaction.reply(`${error}`);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  await handleLonelyInteraction(interaction, client, voiceChannelStates);
})

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  if (newState.member.user.bot) return; 
  const user = newState.member.user.username;
  const id: DiscordId = newState.member.id;
  if (!oldState.channel && newState.channel) {
    console.log(`${user} joined ${newState.channel.name}`);
    voiceChannelStates.set(newState.member.id, newState.channel);
    await registerIfNotRegistered(id);
    await startTimer(userTimers, user, id);
    await startLonelyTimer(newState, lonelyTimers, id);
    await handleLonelyBot(newState.channel);
  } else if (oldState.channel && !newState.channel) {
    console.log(`${user} left ${oldState.channel.name}`);
    await stopTimer(userTimers, user, id);
    await stopLonelyTimer(lonelyTimers, id);
    if (oldState.channel.members && oldState.channel.members.size === 2) {
      await startLonelyTimer(oldState, lonelyTimers, oldState.channel.members[0].id);
    }
    await handleLonelyBot(oldState.channel);
    voiceChannelStates.delete(id);
  } else if (oldState.channelId !== newState.channelId) {
    console.log(`${user} switched from ${oldState.channel.name} to ${newState.channel.name}`);
    voiceChannelStates.set(id, newState.channel)
    await startLonelyTimer(newState, lonelyTimers, id);
    await handleLonelyBot(newState.channel);
  }
});

client.login(TOKEN);