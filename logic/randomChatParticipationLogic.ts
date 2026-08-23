import { Message } from "discord.js";
import { getRandomInt } from "../lib/helper.js";
import { logMessage } from "../lib/log.js";
import data from "../data/randomMessages.json" with {type: "json"};

const randomMessages = data.messages;
const componentName = "randomChatParticipationLogic"

export function randomChatParticipationLogic(message: Message) {
  if (message.author.bot) return;
  const guildName: string = message.guild?.name ?? "Not found";
  const random: number = getRandomInt(1, 100);
  if (random === 1) {
    const randomForMessage = getRandomInt(0, 2);
    message.reply(randomMessages[randomForMessage]);
    logMessage("Random message was sent to a user!", componentName, guildName);
  }
}