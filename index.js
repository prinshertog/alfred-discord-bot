import roles from './data/roles.json' with { type: 'json' };
import { loadCommands } from './lib/load_commands.js';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { getAllMembers, createMember, deleteMember, getMemberByDiscordId, updateStanding }  from './logic/members.js';
import { getAllWanted, createWanted, deleteWanted } from './logic/wanted.js';
import dotenv from 'dotenv';
dotenv.config();
const { TOKEN } = process.env;

loadCommands();

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers
] });

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`); 
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (!interaction.isChatInputCommand()) return;
    const member = interaction.member;
    const knownAs = interaction.options.getString("knownas");
    const discordId = interaction.options.getString("discordid");
    const robloxId = interaction.options.getString("robloxid");
    const standing = interaction.options.getInteger("standing");
    const rank = interaction.options.getString("rank");
    const bounty = interaction.options.getInteger("bounty");

    if (interaction.commandName === 'standing') {
      await getMemberByDiscordId(interaction, member.id);
    }

    if (interaction.commandName === 'about') {
      await interaction.reply('This bot is made and maintained by J4ntje')
    }

    if (interaction.commandName === 'help') {
      await interaction.reply(`
          > **Everyone:**
          >  - /standing          - Shows your standing
          >  - /about             - Shows information about the bot
          >  - /help              - Shows this help page
          > 
          > **Admin:**
          >  - /members add       - Adding members to the faction
          >  - /members remove    - Removing members from the faction
          >  - /members show      - Show all members
          >  - /wanted add        - Add a user to the wanted list
          >  - /wanted remove     - Remove a user from the wanted list
          >  - /wanted show       - Show wanted players
        `)
    }

    if (interaction.commandName === 'members') {
      if (!member.roles.cache.has(roles.BotAdmin)) {
        throw new Error("**You do not have access to this command.**");
      }

      if (interaction.options.getSubcommand() === 'show') {
        await getAllMembers(interaction);

      } else if (interaction.options.getSubcommand() === 'add') {
        await createMember(interaction, 
          knownAs, 
          discordId, 
          robloxId, 
          standing, 
          rank
        );

      } else if (interaction.options.getSubcommand() === 'remove') {
        await deleteMember(interaction, knownAs);
      } else if (interaction.options.getSubcommand() === 'updatestanding') {
        await updateStanding(interaction, knownAs, standing);
      }
    }

    if (interaction.commandName === 'wanted') {
      if (!member.roles.cache.has(roles.BotAdmin)) {
        throw new Error("**You do not have access to this command.**");
      }

      if (interaction.options.getSubcommand() === 'show') {
        await getAllWanted(interaction);

      } else if (interaction.options.getSubcommand() === 'add') {
        await createWanted(interaction, 
          knownAs, 
          discordId, 
          robloxId, 
          bounty
        );

      } else if (interaction.options.getSubcommand() === 'remove') {
        await deleteWanted(interaction, knownAs);
      }
    }

  } catch (error) {
    interaction.reply(`${error}`);
  }
});

client.login(TOKEN);