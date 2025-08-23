'use strict'
import { Client, ColorResolvable, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();
const { CLIENT_ID } = process.env;

export async function createEmbed(color: ColorResolvable, title: string, description: string, client: Client) {
    try {
        const user = client.users.fetch(CLIENT_ID);
        return new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp()
            .setFooter({ text: (await user).username});
    } catch (error) {
        console.error(error);
    }
}