import type { Interaction } from "discord.js";
import { errorMessage } from "./log.js";
import { createEmbed } from "./embed.js";
import { Color } from "../data/global.js";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isError(value: unknown): value is Error {
  return (
    isObject(value) &&
    typeof value.message === "string"
  );
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export async function handleError(error: unknown, componentName: string, interaction?: Interaction) {
    if (!isError(error)) {
      errorMessage("Unknown error", componentName);
      if (interaction && interaction.isRepliable()) {
        interaction.reply({
          embeds: [await createEmbed(
            Color.Red,
            "ERROR", 
            `${error}`
          )]
        });
      }
    } else {
      errorMessage(error.message, componentName);
      if (interaction && interaction.isRepliable()) {
        interaction.reply({
          embeds: [await createEmbed(
            Color.Red,
            "ERROR", 
            `${error.message}`
          )]
        });
      }
    }
}

export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}