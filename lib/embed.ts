'use strict'
import { Client, ColorResolvable, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { errorMessage } from './log.js';
dotenv.config();
const { CLIENT_ID } = process.env;
const componentName = "embed";

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
        errorMessage(error, componentName);
    }
}