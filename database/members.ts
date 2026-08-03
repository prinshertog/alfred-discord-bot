import type { DiscordId, Member } from '../lib/types.js';
import { db } from './clients.js'

const collectionName = "members";
const collection = db.collection(collectionName);

/**
@deprecated Use the new function in the loungeTimers database implementation
*/
export async function getMemberInformation(id: DiscordId) {
    try {
        const member = await collection.findOne({Id: id});
        if (!member) {
            throw new Error(`Member with id <@${id}> not found!`);
        }
        const mappedMember: Member = {
            Id: member.Id,
            StreetCred: member.StreetCred,
            AccessLevel: member.AccessLevel,
            LoungeTime: member.LoungeTime
        }
        return mappedMember;
    } catch (error) {
        return error as Error;
    }
}

/**
@deprecated Use the new function in the loungeTimers database implementation
*/
export async function createMember(id: DiscordId) {
    try {
        await collection.insertOne({
            Id: id, 
            StreetCred: 0,
            AccessLevel: 0,
            LoungeTime: 0
        });
    } catch (error) {
        console.error(error);
    }
}

/**
@deprecated Use the new function in the loungeTimers database implementation
*/
export function getAllMembers() {
    try {
        return collection.find({});
    } catch (error) {
        console.error(error);
    }
}

/**
@deprecated Use the new function in the loungeTimers database implementation
*/
export async function addLoungeTime(id: DiscordId, time: number) {
    try {
        await collection.updateOne({Id: id}, {$inc: {LoungeTime: time}});
    } catch (error) {
        console.error(error);
    }
}

/**
@deprecated Use the new function in the loungeTimers database implementation
*/
export async function updateStreetCred(id: DiscordId, amount: number) {
    try {
        await collection.updateOne({Id: id}, {$inc: {StreetCred: amount}});
    } catch (error) {
        console.error(error);
    }
}

/**
@deprecated Use the new function in the loungeTimers database implementation
*/
export async function getTopStreetCredMembers(amount: number) {
    try {
        return await collection.find({})
            .sort({StreetCred: -1})
            .limit(amount)
            .toArray();
    } catch (error) {
        console.error(error);
    }
}

/**
@deprecated Use the new function in the loungeTimers database implementation
*/
export async function getTopLoungeTimeMembers(amount: number) {
    try {
        return await collection.find({})
            .sort({LoungeTime: -1})
            .limit(amount)
            .toArray();
    } catch (error) {
        console.error(error);
    }
}
