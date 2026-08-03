import { db } from './clients.js'

const collectionName = "members";
const collection = db.collection(collectionName);

export async function updateDatabase() {
  await deleteStreetCredFieldFromAll();
}


async function deleteStreetCredFieldFromAll() {
  const members = await collection.find().toArray();
  if (!members) return;
  collection.updateMany(
    {},
    { $unset: {StreetCred: ""}}
  )
}

async function migrateLoungeTime() {
  throw Error("Not implemented yet");
}