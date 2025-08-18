import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const { CONN_STR, DB_NAME } = process.env;

const client = new MongoClient(CONN_STR);
await client.connect();

const collectionName = "wanted";
const db = client.db(DB_NAME);
const collection = db.collection(collectionName);

export async function getAllWantedDB() {
    try {
        const data = await collection.find().toArray();
        return data;
    } catch (error) {
        return error;
    }
}

export async function createWantedDB(
    knownAs, 
    discordId, 
    robloxId, 
    bounty
) {
    try {
        await collection.insertOne(
            {
                "knownAs": knownAs,
                "discordId": discordId,
                "robloxId": robloxId,
                "bounty": bounty
            }
        );
    } catch (error) {
        return error;
    }
}

export async function deleteWantedDB(knownAs) {
    try {
        await collection.deleteOne({"knownAs": knownAs})
    } catch (error) {
        return error;
    }
}