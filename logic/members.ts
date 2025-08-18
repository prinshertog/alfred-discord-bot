import {DiscordId, Member} from '../lib/types';
import { getMemberInformation, createMember } from '../database/members.js';
import { Temporal } from '@js-temporal/polyfill';
export async function getAboutMeForUser(id: DiscordId) {
    try {
        const result = await getMemberInformation(id);
        if (result instanceof Error) {
            return result;
        }
        const member: Member = result;
        const duration = Temporal.Duration.from({ seconds: member.LoungeTime });
        const formattedTime = duration.round({ largestUnit: "days" });
        return `
            > Member: **<@${member.Id}>**
            > Street Cred: ${member.StreetCred}
            > Access Level: ${member.AccessLevel}
            > Lounge Time: Days: ${formattedTime.days}, Minutes: ${formattedTime.minutes}, Seconds: ${formattedTime.seconds}
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