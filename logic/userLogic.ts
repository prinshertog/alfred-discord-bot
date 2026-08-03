import { formatLoungeTime, toLoungeTimeData } from '../lib/format.js';
import { Client } from 'discord.js';
import { handleError } from '../lib/helper.js';
import { getTopLoungeTimeMembers } from '../database/loungeTimes.js';
import { GuildId } from '../lib/types.js';

const componentName = "userLogic";

export async function getLeaderBoard(amount: number, leaderBoardType: string, client: Client, guildId: GuildId) {
    try {
        switch (leaderBoardType) {
            case "loungetime": {
                let message = "";
                let loungeTimeData = await getTopLoungeTimeMembers(amount, guildId);
                if (!loungeTimeData) throw Error("No lounge time data found.");
                for (let i = 0; i < loungeTimeData.length; i++) {
                    const loungeTime = toLoungeTimeData(loungeTimeData[i]);
                    const userDisplayName = client.user?.displayName;
                    message += 
                        `\n**${i + 1}.** *${userDisplayName}*\n` +
                        `${await formatLoungeTime(loungeTime)}\n`;
                }
                return message;
            }
        }
    } catch (error) {
        handleError(error, componentName);
    }
}
