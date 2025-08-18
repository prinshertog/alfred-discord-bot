import { getAllMembersDB, createMemberDB, deleteMemberDB, getMemberByDiscordIdDB, updateStandingDB, getMemberByKnownAsDB } from '../database/members.js';
export async function getAllMembers(interaction) {
    try {
        const members = await getAllMembersDB();
        let responseString = "";
        for (let member of members) {
            responseString += `
                > Known as: **${member.knownAs}**
                > Discord Id: ${member.discordId}
                > Roblox Id: ${member.robloxId}
                > Standing: ${member.standing}
                > Rank: ${member.rank}
                `
        }
        if (responseString.length <= 0) {
            await interaction.reply("No members found!");
        } else {
            await interaction.reply(responseString);
        }
    } catch (error) {
        interaction.reply(`${error}`);
    }
}

export async function createMember(
    interaction, 
    knownAs, 
    discordId, 
    robloxId, 
    standing, 
    rank
) {
    try {
        await createMemberDB(knownAs, 
            discordId, 
            robloxId, 
            standing, 
            rank);
        interaction.reply("User added **" + knownAs + "** successfully!");
    } catch (error) {
        interaction.reply(`${error}`);
    }
}

export async function deleteMember(
    interaction, 
    knownAs
) {
    try {
        await deleteMemberDB(knownAs);
        interaction.reply("User **" + knownAs + "** was deleted!");
    } catch (error) {
        interaction.reply(`${error}`);
    }
}

export async function getMemberByDiscordId (
    interaction,
    knownAs
) {
    try {
        const member = await getMemberByDiscordIdDB(knownAs);
        if (member === null) {
            throw new Error("No standing found!")
        }
        await interaction.reply(`Your standing is: **${member.standing}**`);
    } catch (error) {
        interaction.reply(`${error}`);
    }
}

export async function updateStanding(
    interaction, 
    knownAs, 
    standing
) {
    try {
        await updateStandingDB(knownAs, standing);
        const member = await getMemberByKnownAsDB(knownAs);
        if (member === null) {
            throw new Error("This user does not exist!");
        }
        interaction.reply("Standing for user **" + knownAs + "** was updated to **" + member.standing + "**!");
    } catch (error) {
        interaction.reply(`${error}`);
    }
}