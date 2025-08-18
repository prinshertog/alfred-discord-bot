import { getAllWantedDB, createWantedDB, deleteWantedDB } from '../database/wanted.js';

export async function getAllWanted(interaction) {
    try {
        const wanted = await getAllWantedDB();
        let responseString = "";
        for (let user of wanted) {
            responseString += `
                > Known as: **${user.knownAs}**
                > Discord Id: ${user.discordId}
                > Roblox Id: ${user.robloxId}
                > Bounty: ${user.bounty}
            `
        }
        if (responseString.length <= 0) {
            await interaction.reply("No wanted users found!");
        } else {
            await interaction.reply(responseString);
        }
    } catch (error) {
        interaction.reply(`${error}`);
    }
}

export async function createWanted(
    interaction, 
    knownAs, 
    discordId, 
    robloxId, 
    bounty
) {
    try {
        await createWantedDB(
            knownAs, 
            discordId, 
            robloxId, 
            bounty
        );
        interaction.reply("User **" + knownAs + "** is added to wanted list!");
    } catch (error) {
        interaction.reply(`${error}`);
    }
}

export async function deleteWanted(
    interaction, 
    knownAs
) {
    try {
        await deleteWantedDB(knownAs);
        interaction.reply("User **" + knownAs + "** removed from wanted list!");
    } catch (error) {
        interaction.reply(`${error}`);
    }
}