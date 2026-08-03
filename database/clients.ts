import { MongoClient } from 'mongodb'
import dotenv from 'dotenv';

dotenv.config();

const { CONN_STR, DB_NAME } = process.env;

if (CONN_STR == null) {
    throw new Error("No connection string found!");
}

const client = new MongoClient(CONN_STR);
await client.connect();

export const db = client.db(DB_NAME);