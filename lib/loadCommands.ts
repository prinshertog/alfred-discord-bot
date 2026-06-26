import { REST, Routes } from 'discord.js';
import commands from '../data/commands.json' with { type: 'json' };
import dotenv from 'dotenv';
import { logMessage } from './log.js';
import { handleError } from './helper.js';

dotenv.config();

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;
const componentName = "loadCommands";

export async function loadCommands() {
    if (!TOKEN) {
        throw new Error("No bot token found!");
    }
    if (!CLIENT_ID) {
        throw new Error("No client id found!");
    }
    if (!GUILD_ID) {
        throw new Error("No guild id found!");
    }

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {
        logMessage('Started refreshing application (/) commands.', componentName);
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), 
            {    
                body: commands
            }
        );
    } catch (error) {
        handleError(error, componentName);
    }

    logMessage('Successfully reloaded application (/) commands.', componentName);
}
