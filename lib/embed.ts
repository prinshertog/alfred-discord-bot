import { Client, ColorResolvable, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { handleError, isString } from './helper.js';
import { Color } from '../data/global.js';

dotenv.config();

const { CLIENT_ID } = process.env;
const componentName = "embed";

export async function createEmbed(
    color: ColorResolvable, 
    title: string, 
    description: string, 
    client?: Client
): Promise<EmbedBuilder> {
    try {
        if (!isString(CLIENT_ID)) throw new Error("No CLIENT_ID");
        if (client) {
            const user = client.users.fetch(CLIENT_ID);
            return new EmbedBuilder()
                .setColor(color)
                .setTitle(title)
                .setDescription(description)
                .setTimestamp()
                .setFooter({ text: (await user).username});
        } else {
            return new EmbedBuilder()
                .setColor(color)
                .setTitle(title)
                .setDescription(description)
                .setTimestamp();
        }
    } catch (error) {
        handleError(error, componentName);
        return new EmbedBuilder()
            .setColor(Color.Red)
            .setTitle("ERROR")
            .setDescription(`An error occured: ${error}`)
            .setTimestamp()
    }
}