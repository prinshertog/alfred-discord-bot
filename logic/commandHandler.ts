import { Interaction } from "discord.js";
import { getLeaderBoard } from "./userLogic.js";
import { createEmbed } from "../lib/embed.js";
import { Color } from "../data/global.js";
import { GameStates, UserGames } from "../lib/types.js";
import { game } from "./hangmanLogic.js";
import { handleError } from "../lib/helper.js";

const userGames: UserGames = new Map();
const gameStates: GameStates = new Map();

const componentName = "commandHandler";

export async function handleCommands(interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return;
  const client = interaction.client;
  const guildId = interaction.guildId;
  if (!guildId) return;

  try {
    const id = interaction?.member?.user.id
    if (!id) {
      throw new Error("User id not found!");
    }
    switch(interaction.commandName) {
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
                await getLeaderBoard(amount, "loungetime", client, guildId) ?? "Undefined",
                client
              )]
            });
            break;
        }
        break;
    }
  } catch (error) {
    handleError(error, componentName, interaction);
  }
}