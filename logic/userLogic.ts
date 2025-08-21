import { DiscordId, Member } from '../lib/types';
import { formatLoungeTime, toMember } from '../lib/format.js';
import { getMemberInformation, createMember, getTopStreetCredMembers, getTopLoungeTimeMembers } from '../database/members.js';
import { Client } from 'discord.js';
export async function getAboutMeForUser(id: DiscordId) {
    try {
        const result = await getMemberInformation(id);
        if (result instanceof Error) {
            return result;
        }
        const member: Member = result;
        return `
            > Member: **<@${member.Id}>**
            > Street Cred: ${member.StreetCred}
            > Access Level: ${member.AccessLevel}
            > Lounge Time: ${await formatLoungeTime(member)}
        `;
    } catch (error) {
        throw new Error(`${error}`);
    }
}

export async function registerIfNotRegistered(id: DiscordId) {
    try {
        const result = await getMemberInformation(id);
        if (result instanceof Error) {
            await createMember(id);
            console.log(`User ${id} registered!`);
        }
    } catch (error) {
        throw new Error(`${error}`);
    }
}

export async function getLeaderBoard(amount: number, leaderBoardType: string, client: Client) {
    try {
        switch (leaderBoardType) {
            case "loungetime": {
                let message = "**Lounge Time Leader Board**";
                let memberData = await getTopLoungeTimeMembers(amount);
                for (let i = 0; i < memberData.length; i++) {
                    const member = toMember(memberData[i]);
                    const user = client.users.fetch(member.Id);
                    message += `
                        > **${i + 1}.** *${(await user).displayName}*
                        > ${await formatLoungeTime(member)}
                    `;
                }
                return message;
            }
            case "streetcred": {
                let message = "**StreetCred Leader Board**";
                let memberData = await getTopStreetCredMembers(amount);
                for (let i = 0; i < memberData.length; i++) {
                    const member = toMember(memberData[i]); 
                    const user = client.users.fetch(member.Id);
                    message += `
                        > **${i + 1}.** *${(await user).displayName}*
                        > Cred: ${member.StreetCred}**
                    `;
                }
                return message;
            }
        }
    } catch (error) {
        throw new Error(`${error}`);
    }
}