import type { Interaction } from "discord.js";
import { errorMessage } from "./log.js";

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

export function handleError(error: unknown, componentName: string, interaction?: Interaction) {
    if (!isError(error)) {
      errorMessage("Unknown error", componentName);
      if (interaction && interaction.isRepliable()) {
        interaction.reply(`${error}`)
      }
    } else {
      errorMessage(error.message, componentName);
      if (interaction && interaction.isRepliable()) {
        interaction.reply(`${error.message}`)
      }
    }
}
