import { ColorResolvable, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

export async function createEmbed(
    color: ColorResolvable, 
    title: string, 
    description: string
): Promise<EmbedBuilder> {
    return new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp();
}