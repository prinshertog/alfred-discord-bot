import { ColorResolvable } from "discord.js";

export const Color = {
  Red: '#FF0000',
  Green: '#00FF00',
  Blue: '#0000FF',
} as const satisfies Record<string, ColorResolvable>;