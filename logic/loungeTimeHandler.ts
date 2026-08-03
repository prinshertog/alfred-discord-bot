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
  const id = newState.member?.id;
  if (newState.member?.user.bot) return; 
  if (!userName) return;
  if (!id) return;
  if (!guildId) return;
  if (!oldState.channel && newState.channel) {
    logMessage(`${userName} joined ${newState.channel.name}`, componentName);
    await startTimer(userTimers, userName, id, guildId);
  } else if (oldState.channel && !newState.channel) {
    logMessage(`${userName} left ${oldState.channel.name}`, componentName);
    await stopTimer(userTimers, userName, id);
    voiceChannelStates.delete(id);
  } else if (oldState.channelId !== newState.channelId) {
    logMessage(`${userName} switched from ${oldState.channel?.name} to ${newState.channel?.name}`, componentName);
  }
}