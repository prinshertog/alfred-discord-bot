import { Guild } from "discord.js";
import { DiscordId } from "../lib/types";

const amountOfVotesToPass = 3;
export async function voteDisconnect(userId: DiscordId, voteDisconnectUserList: Map<DiscordId, DiscordId[]>, guild: Guild, votedUserId: DiscordId): Promise<string> {
    if (voteDisconnectUserList.has(userId)) {
        return await voteOnVoteDisconnect(userId, voteDisconnectUserList, guild, votedUserId)
    } else {
        return await startVoteDisconnect(userId, voteDisconnectUserList, votedUserId);
    }
}

async function startVoteDisconnect(userId: DiscordId, voteDisconnectUserList: Map<DiscordId, DiscordId[]>, votedUserId: DiscordId) {
    voteDisconnectUserList.set(userId, [votedUserId]);
    setTimeout(() => {
        const savedUserId: DiscordId = userId;
        voteDisconnectUserList.delete(savedUserId);
    }, 60000)
    const amountOfVotes: number = voteDisconnectUserList.get(userId).length;
    return `Started disconnect vote. \nVote count: **${amountOfVotes}** / ${amountOfVotesToPass}\nUser: <@${userId}>`;
}

async function voteOnVoteDisconnect(userId: DiscordId, voteDisconnectUserList: Map<DiscordId, DiscordId[]>, guild: Guild, votedUserId: DiscordId) {
    const hashMapEntry = voteDisconnectUserList.get(userId);
    console.log(hashMapEntry)
    if (hashMapEntry.includes(votedUserId)) {
        return "You already voted!";
    }
    hashMapEntry.push(userId);
    const amountOfVotes = hashMapEntry.length
    const voteCount: number = voteDisconnectUserList.get(userId).length;
    if (voteCount >= amountOfVotesToPass) {
        voteDisconnectUserList.delete(userId);
        const member = await guild.members.fetch(userId).catch(() => null); 
        if (!member) { 
            return "User not found in this guild."; 
        } 
        if (!member.voice.channel) { 
            return "User is not in a voice channel."; 
        }
        member.voice.setChannel(null).then(() => console.log("User disconnected.")).catch(console.error);
        return `Vote updated **${amountOfVotes}** / ${amountOfVotesToPass}\nVote succeeded and user <@${userId}> has been disconnected.`
    }
    return `Vote updated **${amountOfVotes}** / ${amountOfVotesToPass}.\nUser: <@${userId}>`;
}