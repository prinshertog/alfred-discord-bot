'use strict'
import { MongoClient } from 'mongodb'
import { DiscordId } from '../lib/types';
import dotenv from 'dotenv';
dotenv.config();
const { CONN_STR, DB_NAME } = process.env;

if (CONN_STR == null) {
    throw new Error("No connection string found!");
}

const client = new MongoClient(CONN_STR);
await client.connect();

const collectionName = "muteDurations";
const db = client.db(DB_NAME);
const collection = db.collection(collectionName);

export async function getBotMuteEndDateTimeForMember(discordId: DiscordId) {
    try {
        return collection.findOne({Id: discordId});
    } catch (error) {
        console.error(error);
    }
}

export async function setBotMuteEndDateTimeForMember(discordId: DiscordId, endDateTime: Date) {
    try {
        collection.insertOne(
            {
                Id: discordId,
                MuteEndDateTime: endDateTime
            },
        );
    } catch (error) {
        console.error(error);
    }
}