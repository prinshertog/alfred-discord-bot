import { loadCommands } from './lib/load_commands.js';
import { DiscordId } from './lib/types.js';
import { Client, Events, GatewayIntentBits, ActivityType, MessageFlags } from 'discord.js';
import { getAboutMeForUser, getLeaderBoard, registerIfNotRegistered } from './logic/userLogic.js';
import { startTimer, stopTimer } from './lib/lounge_timer.js';
import { game } from './logic/hangmanLogic.js';
import dotenv from 'dotenv';
import { createEmbed } from './lib/embed.js';
dotenv.config();
const { TOKEN } = process.env;

loadCommands();

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildVoiceStates
]});

const userTimers: Map<DiscordId, NodeJS.Timeout> = new Map();
const userGames: Map<DiscordId, boolean> = new Map();
const gameStates = new Map<DiscordId, {currentHangmanSize: number; word: string; guessedLetters: string[], wrongLetters: string[]}>();

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
  client.user.setPresence({
    status: "online",
    activities: [{
      name: "Vengeance!",
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
          embeds: [createEmbed(
            0x0099FF, 
            "About me", 
            `${await getAboutMeForUser(id)}`
          )],
          flags: MessageFlags.Ephemeral
        });
        break;
      case "hangman":
        let letter: string = interaction.options.getString("letter");
        if (letter) letter = letter.toLowerCase();
        await game(id, letter, interaction, userGames, gameStates);
        break;
      case "leaderboard":
        let amount = interaction.options.getInteger("entries");
        switch(interaction.options.getSubcommand()) {
          case "streetcred":
            interaction.reply({
              embeds: [createEmbed(
                0x0099FF,
                "Street Cred Leader Board",
                await getLeaderBoard(amount, "streetcred", client)
              )]
            });
            break;
          case "loungetime":
            interaction.reply({
              embeds: [createEmbed(
                0x0099FF, 
                "Lounge Time Leader Board", 
                await getLeaderBoard(amount, "loungetime", client)
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

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const user = newState.member.user.username;
  const id: DiscordId = newState.member.id;

  if (!oldState.channel && newState.channel) {
    console.log(`${user} joined ${newState.channel.name}`);

    await registerIfNotRegistered(id);
    await startTimer(userTimers, user, id);
  } else if (oldState.channel && !newState.channel) {
    console.log(`${user} left ${oldState.channel.name}`);

    await stopTimer(userTimers, user, id);
  } else if (oldState.channelId !== newState.channelId) {
    console.log(`${user} switched from ${oldState.channel.name} to ${newState.channel.name}`);
  }
});

client.login(TOKEN);