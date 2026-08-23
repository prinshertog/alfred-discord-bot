import { Client, Interaction } from 'discord.js';
import { addLoungeTime, getTopLoungeTimeMembers } from '../database/loungeTimes.js';
import { handleError } from '../lib/helper.js';
import { logMessage } from '../lib/log.js';
import { DiscordId, GuildId } from '../lib/types.js';
import { createEmbed } from '../lib/embed.js';
import { formatLoungeTime, toLoungeTimeData } from '../lib/format.js';
import { Color } from '../data/global.js';

const componentName = "loungeTimerLogic";

export async function startTimer(userTimers: Map<DiscordId, NodeJS.Timeout>, user: string, id: DiscordId, guildId: GuildId, client: Client) {
  try {
    const usedTimer = userTimers.get(id);
    const guildName = (await client.guilds.fetch(guildId)).name;
    if (!usedTimer) {
      const timer = setInterval(() => {
        addLoungeTime(id, guildId, 5);
      }, 5000);
      userTimers.set(id, timer);
      logMessage(`Started timer for user ${user}.`, componentName, guildName);
    }
  } catch (error) {
    handleError(error, componentName);
  }
}

export async function stopTimer(userTimers: Map<DiscordId, NodeJS.Timeout>, user: string, id: DiscordId, guildId: GuildId, client: Client) {
  try {
    const timer = userTimers.get(id);
    const guildName = (await client.guilds.fetch(guildId)).name;
    clearInterval(timer);
    userTimers.delete(id);
    logMessage(`Stopped timer for user ${user}.`, componentName, guildName);
  } catch (error) {
    handleError(error, componentName);
  }
}

export async function replyWithLoungeTimeLeaderboard(amount: number, client: Client, guildId: GuildId, interaction: Interaction) {
  try {
    let message = "";
    let loungeTimeData = await getTopLoungeTimeMembers(amount, guildId);
    if (!loungeTimeData || loungeTimeData.length <= 0) {
      throw Error("Could not find lounge time data! There might not be data yet.");
    }
    if (!interaction.isRepliable()) {
      throw Error("Interaction is not repliable!");
    }

    await interaction.deferReply();

    const guild = await client.guilds.fetch(guildId);
    for (let i = 0; i < loungeTimeData.length; i++) {
      const loungeTime = toLoungeTimeData(loungeTimeData[i]);
      let member = null;
      let userDisplayName = loungeTime.Id;
      try {
        member = await guild.members.fetch(loungeTime.Id);
      } catch (error) {
        logMessage(`Could not find username for user with id ${loungeTime.Id}`, componentName);
      }
      if (member) {
        userDisplayName = member.displayName;
      }
      message +=
        `\n**${i + 1}.** *${userDisplayName}*\n` +
        `${await formatLoungeTime(loungeTime)}\n`;
    }

    await interaction.editReply({
      embeds: [await createEmbed(
        Color.Blue,
        "Lounge Time Leaderboard",
        message
      )]
    });
  } catch (error) {
    handleError(error, componentName, interaction);
  }
}