import { getBotMuteEndDateTimeForMember } from "../database/muteDurations";
import { errorMessage } from "../lib/log";
import { BotMuteEndDateTime, DiscordId } from "../lib/types";

let moduleName = "muteBotLogic"

export async function muteBot(discordId: DiscordId) {
    try {
        let data = await getBotMuteEndDateTimeForMember(discordId);
        if (!data) {
            throw new Error("No entry found for this id.");
        }
        let botMuteEndDateTime: BotMuteEndDateTime = {
            Id: data.id,
            MuteEndDateTime: data.MuteEndDateTime
        }
        return botMuteEndDateTime;
    } catch (error) {
        errorMessage(error, moduleName);
    }
}