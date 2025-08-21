import { MongoClient } from 'mongodb'
import { Member } from '../lib/types';
import { DiscordId } from '../lib/types';
import dotenv from 'dotenv';
dotenv.config();
const { CONN_STR, DB_NAME } = process.env;

if (CONN_STR == null) {
    throw new Error("No connection string found!");
}

const client = new MongoClient(CONN_STR);
await client.connect();

const collectionName = "members";
const db = client.db(DB_NAME);
const collection = db.collection(collectionName);

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

export async function getAllMembers() {
    try {
        return collection.find({});
    } catch (error) {
        console.error(error);
    }
}

export async function addLoungeTime(id: DiscordId, time: number) {
    try {
        await collection.updateOne({Id: id}, {$inc: {LoungeTime: time}});
    } catch (error) {
        console.error(error);
    }
}

export async function updateStreetCred(id: DiscordId, amount: number) {
    try {
        await collection.updateOne({Id: id}, {$inc: {StreetCred: amount}});
    } catch (error) {
        console.error(error);
    }
}

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