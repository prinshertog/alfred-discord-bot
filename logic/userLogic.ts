'use strict'
import { DiscordId, Member } from '../lib/types';
import { formatLoungeTime, toMember } from '../lib/format.js';
import { getMemberInformation, createMember, getTopStreetCredMembers, getTopLoungeTimeMembers } from '../database/members.js';
import { Client } from 'discord.js';
import { logMessage } from '../lib/log.js';

const componentName = "userLogic";

export async function getAboutMeForUser(id: DiscordId) {
    try {
        const result = await getMemberInformation(id);
        if (result instanceof Error) {
            return result;
        }
        const member: Member = result;
        return `Member: **<@${member.Id}>**\n` +
            `Street Cred: **${member.StreetCred}**\n` +
            `Access Level: **${member.AccessLevel}**\n` +
            `Lounge Time: ${await formatLoungeTime(member)}\n`;
    } catch (error) {
        throw new Error(error);
    }
}

export async function registerIfNotRegistered(id: DiscordId) {
    try {
        const result = await getMemberInformation(id);
        if (result instanceof Error) {
            await createMember(id);
            logMessage(`User ${id} registered!`, componentName);
        }
    } catch (error) {
        throw new Error(error);
    }
}

export async function getLeaderBoard(amount: number, leaderBoardType: string, client: Client) {
    try {
        switch (leaderBoardType) {
            case "loungetime": {
                let message = "";
                let memberData = await getTopLoungeTimeMembers(amount);
                for (let i = 0; i < memberData.length; i++) {
                    const member = toMember(memberData[i]);
                    const user = client.users.fetch(member.Id);
                    message += 
                        `\n**${i + 1}.** *${(await user).displayName}*\n` +
                        `${await formatLoungeTime(member)}\n`;
                }
                return message;
            }
            case "streetcred": {
                let message = "";
                let memberData = await getTopStreetCredMembers(amount);
                for (let i = 0; i < memberData.length; i++) {
                    const member = toMember(memberData[i]); 
                    const user = client.users.fetch(member.Id);
                    message += 
                        `\n**${i + 1}.** *${(await user).displayName}*\n` + 
                        `Cred: **${member.StreetCred}**\n`;
                }
                return message;
            }
        }
    } catch (error) {
        throw new Error(error);
    }
}