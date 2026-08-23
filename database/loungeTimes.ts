import { handleError } from '../lib/helper.js';
import type { DiscordId, GuildId, LoungeTime } from '../lib/types.js';
import { db } from './clients.js'

const collectionName = "loungeTimes";
const collection = db.collection(collectionName);
const componentName = "loungeTimesDatabase";

export async function getLoungeTime(id: DiscordId, guildId: GuildId) {
    try {
        const loungeTime = await collection.findOne({Id: id, GuildId: guildId});
        if (!loungeTime) {
            return null;
        }
        const mappedLoungeTime: LoungeTime = {
            Id: id,
            GuildId: guildId,
            Time: loungeTime.Time
        }
        return mappedLoungeTime;
    } catch (error) {
        handleError(error, componentName);
    }
}

export async function addLoungeTime(id: DiscordId, guildId: GuildId, time: number) {
    try {
        await collection.updateOne(
            { Id: id, GuildId: guildId },
            {
                $setOnInsert: { Id: id, GuildId: guildId },
                $inc: { Time: time }
            },
            { upsert: true }
        );
    } catch (error) {
        handleError(error, componentName);
    }
}

export async function createLoungeTime(id: DiscordId, guildId: GuildId) {
    try {
        if (!await getLoungeTime(id, guildId)) return;
        await collection.insertOne({
            Id: id,
            GuildId: guildId,
            Time: 0
        });
    } catch (error) {
        handleError(error, componentName);
    }
}

export async function getTopLoungeTimeMembers(amount: number, guildId: GuildId) {
    try {
        return await collection.find({GuildId: guildId})
            .sort({Time: -1})
            .limit(amount)
            .toArray();
    } catch (error) {
        handleError(error, componentName);
    }
}