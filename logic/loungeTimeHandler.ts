import { VoiceBasedChannel, VoiceState } from "discord.js";
import { logMessage } from "../lib/log.js";
import { startTimer, stopTimer } from "./loungeTimerLogic.js";
import { DiscordId } from "../lib/types.js";

const componentName = "loungeTimeHandler";

const userTimers: Map<DiscordId, NodeJS.Timeout> = new Map();
const voiceChannelStates: Map<DiscordId, VoiceBasedChannel> = new Map();

export async function handleLoungeTimers(newState: VoiceState, oldState: VoiceState) {
  const userName = newState.member?.user.username;
  const guildId = newState.member?.guild.id;
  const guildName = newState.member?.guild.name
  const id = newState.member?.id;
  if (newState.member?.user.bot) return; 
  if (!userName) return;
  if (!id) return;
  if (!guildId) return;
  if (!oldState.channel && newState.channel) {
    logMessage(`${userName} joined ${newState.channel.name}`, componentName, guildName);
    await startTimer(userTimers, userName, id, guildId, newState.client);
  } else if (oldState.channel && !newState.channel) {
    logMessage(`${userName} left ${oldState.channel.name}`, componentName, guildName);
    await stopTimer(userTimers, userName, id, guildId, newState.client);
    voiceChannelStates.delete(id);
  } else if (oldState.channelId !== newState.channelId) {
    logMessage(`${userName} switched from ${oldState.channel?.name} to ${newState.channel?.name}`, componentName, guildName);
  }
}