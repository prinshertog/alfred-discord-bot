import { handleError, isNumber, isString } from '../lib/helper.js';
import { logMessage } from '../lib/log.js';
import { db } from './clients.js'

const membersCollectionName = "members";
const loungeTimesCollectionName = "loungeTimes";
const membersCollection = db.collection(membersCollectionName);
const loungeTimesCollection = db.collection(loungeTimesCollectionName);
const componentName = "dynamicUpdater";
const loungeTimeMigrationField = "LoungeTimeMigratedGuildIds";

export async function updateDatabase() {
  try {
    await migrateLoungeTime();
    await deleteMembersCollection();
  } catch (error) {
    handleError(error, componentName);
  }
}

async function deleteMembersCollection() {
  const collections = await db.listCollections({ name: membersCollectionName }).toArray();
  if (collections.length <= 0) {
    logMessage("Members collection does not exist.", componentName);
    return;
  }

  await membersCollection.drop();
  logMessage("Deleted old members collection.", componentName);
}

async function migrateLoungeTime() {
  const guildId = process.env.GUILD_ID;
  if (!isString(guildId) || guildId.length <= 0) {
    throw Error("GUILD_ID is missing, could not migrate lounge time data.");
  }

  const members = await membersCollection.find({
    LoungeTime: { $gt: 0 },
    [loungeTimeMigrationField]: { $ne: guildId }
  }).toArray();

  if (members.length <= 0) {
    logMessage("No old lounge time data found to migrate.", componentName);
    return;
  }

  let migratedMembers = 0;
  for (const member of members) {
    if (!isString(member.Id) || !isNumber(member.LoungeTime)) {
      continue;
    }

    await loungeTimesCollection.updateOne(
      { Id: member.Id, GuildId: guildId },
      {
        $setOnInsert: {
          Id: member.Id,
          GuildId: guildId
        },
        $inc: {
          Time: member.LoungeTime
        }
      },
      { upsert: true }
    );

    await membersCollection.updateOne(
      { _id: member._id },
      { $addToSet: { [loungeTimeMigrationField]: guildId } }
    );

    migratedMembers++;
  }

  logMessage(`Migrated lounge time data for ${migratedMembers} members.`, componentName);
}
