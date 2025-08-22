import { ColorResolvable, EmbedBuilder } from 'discord.js';

export function createEmbed(color: ColorResolvable, title: string, description: string) {
    return new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp()
        .setFooter({ text: 'Alfred Bot' });
}