import { REST, Routes } from 'discord.js';
import commands from '../data/commands.json' with { type: 'json' };
import dotenv from 'dotenv';
dotenv.config();
const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

export async function loadCommands() {
    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), 
        { 
            body: commands
        }
    );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}