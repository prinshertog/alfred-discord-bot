import { MongoClient } from 'mongodb'
import dotenv from 'dotenv';
dotenv.config();
const { CONN_STR, DB_NAME } = process.env;

const client = new MongoClient(CONN_STR);
await client.connect();

const collectionName = "members";
const db = client.db(DB_NAME);
const collection = db.collection(collectionName);
export async function getAllMembersDB() {
    try {
        const data = await collection.find().toArray();
        return data;
    } catch (error) {
        return error;
    }
}

export async function createMemberDB(
    knownAs, 
    discordId, 
    robloxId, 
    standing, 
    rank
) {
    try {
        await collection.insertOne(
            {
                "knownAs": knownAs,
                "discordId": discordId,
                "robloxId": robloxId,
                "standing": standing,
                "rank": rank
            }
        );
    } catch (error) {
        return error;
    }
}

export async function deleteMemberDB(knownAs) {
    try {
        await collection.deleteOne({"knownAs": knownAs})
    } catch (error) {
        return error;
    }
}

export async function getMemberByDiscordIdDB(discordId) {
    try {
        return await collection.findOne({discordId: discordId});
    } catch (error) {
        return error;
    }
}

export async function getMemberByKnownAsDB(knownAs) {
    try {
        return await collection.findOne({knownAs: knownAs});
    } catch (error) {
        return error;
    }
}

export async function updateStandingDB(
    knownAs, 
    standing
) {
    try {
        return await collection.updateOne({ knownAs: knownAs }, { $inc: { standing: standing } });
    } catch (error) {
        return error;
    }
}