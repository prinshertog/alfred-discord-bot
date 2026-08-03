import { Message } from "discord.js";
import { getRandomInt } from "../lib/helper.js";
import { logMessage } from "../lib/log.js";

const componentName = "randomChatParticipationLogic"

export function randomChatParticipationLogic(message: Message) {
  if (message.author.bot) return;
  const guildName: string = message.guild?.name ?? "Not found";
  const random: number = getRandomInt(1, 100);
  if (random === 1) {
    message.reply("Gay");
    logMessage("Random message was sent to a user!", componentName, guildName);
  } else if (random === 2) {
    message.reply("UwU");
    logMessage("Random message was sent to a user!", componentName, guildName);
  } else if (random === 3) {
    message.reply("https://klipy.com/gifs/fire-writing-9");
    logMessage("Random message was sent to a user!", componentName, guildName);
  }
}