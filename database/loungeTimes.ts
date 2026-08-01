import { MongoClient } from 'mongodb'
import type { DiscordId, GuildId, LoungeTime } from '../lib/types.js';
import dotenv from 'dotenv';
import { Guild } from 'discord.js';

dotenv.config();

const { CONN_STR, DB_NAME } = process.env;

if (CONN_STR == null) {
    throw new Error("No connection string found!");
}

const client = new MongoClient(CONN_STR);
await client.connect();

const collectionName = "loungeTimes";
const db = client.db(DB_NAME);
const collection = db.collection(collectionName);

export async function getLoungeTime(id: DiscordId, guildId: GuildId) {
    try {
        const loungeTime = await collection.findOne({Id: id, GuildId: guildId});
        if (!loungeTime) {
            throw new Error(`No lounge time found for user with id <@${id}>!`);
        }
        const mappedLoungeTime: LoungeTime = {
            Id: id,
            GuildId: guildId,
            Time: loungeTime.Time
        }
        return loungeTime.Time;
    } catch (error) {
        console.error(error);
    }
}

export async function addLoungeTime(id: DiscordId, guildId: GuildId, time: number) {
    try {
        const loungeTime = await getLoungeTime(id, guildId);
        if (!loungeTime) {
            createLoungeTime(id, guildId)
        }
        await collection.updateOne({Id: id, GuildId: guildId}, {$inc: {Time: time}})
    } catch (error) {
        console.error(error);
    }
}

export async function createLoungeTime(id: DiscordId, guildId: GuildId) {
    try {
        await collection.insertOne({
            Id: id,
            GuildId: guildId,
            Time: 0
        });
    } catch (error) {
        console.error(error);
    }
}

export async function getTopLoungeTimeMembers(amount: number) {
    try {
        return await collection.find({})
            .sort({Time: -1})
            .limit(amount)
            .toArray();
    } catch (error) {
        console.error(error);
    }
}