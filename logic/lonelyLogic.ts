'use strict'

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, Interaction, User, VoiceBasedChannel, VoiceState } from "discord.js";
import { DiscordId } from "../lib/types.js";
import { joinVoiceChannel } from "@discordjs/voice";
import { playMusic } from "./voiceLogic.js";
import dotenv from 'dotenv';
import { errorMessage, logMessage } from "../lib/log.js";
dotenv.config();

const { LONELY_TIME } = process.env // Time that the bot waits before asking to join.
const lonelyTime = parseInt(LONELY_TIME, 10);
const deleteMessageTime = 10000; // Time that the bot waits before deleting DMs.
const timeoutBeforeJoining = 3000; // Time that it takes to join lounge after user replied yes.
const componentName = "lonelyLogic"

export async function startLonelyTimer(
    state: VoiceState, 
    lonelyTimers: Map<DiscordId, NodeJS.Timeout>,
    id: DiscordId
) {
    try {
        if (state.channel.members.size === 1 
        && !lonelyTimers.get(id)
        && lonelyTimers.size === 0
    ) {
        logMessage(`Started lonely timer for user ${id}`, componentName);
        lonelyTimers.set(id, setTimeout(async () => {
            const jaButton = new ButtonBuilder()
                .setCustomId('ja_button')
                .setLabel('Ja')
                .setStyle(ButtonStyle.Primary);
            const neeButton = new ButtonBuilder()
                .setCustomId('nee_button')
                .setLabel('Nee')
                .setStyle(ButtonStyle.Primary);

            const buttons = new ActionRowBuilder()
                                .addComponents(jaButton, neeButton);

            logMessage(`Sending message to lonely user. ${id}`, componentName);
            await state.member.send({ 
                content: `Hey ${state.member.displayName} ben je lonely in de lounge?`
            });
            await state.member.send({ 
                content: `Zou je willen dat ik erbij kom zitten en wat muziek afspeel? Dan ben je niet zo alleen :)`,
                components: [buttons.toJSON()]
            });
        }, lonelyTime));
        }
    } catch (error) {
        errorMessage(error, componentName);
    }
}

export function stopLonelyTimer(
    lonelyTimers: Map<DiscordId, NodeJS.Timeout>,
    id: DiscordId
) {
    try {
        const timeout: NodeJS.Timeout = lonelyTimers.get(id);
        if (timeout) timeout.close();
        lonelyTimers.delete(id);
        logMessage(`Deleted lonely timer for user ${id}`, componentName);
    } catch (error) {
        errorMessage(error, componentName);
    }
}

async function deleteDmMessages(client: Client, user: User) {
    try {
        const messages = await user.dmChannel.messages.fetch({ limit: 100});
        const botMessages = messages.filter(msg => msg.author.id === client.user.id);
        for (let message of botMessages.values()) {
            message.delete();
        }
        logMessage(`Deleted DM messages with user: ${user.displayName}`, componentName);
    } catch (error) {
        errorMessage(error, componentName);
    }
}

export async function handleLonelyInteraction(
    interaction: Interaction, 
    client: Client, 
    voiceChannelStates: Map<DiscordId, VoiceBasedChannel>
) {
    try {
        if (!interaction.isButton()) return;
        if (interaction.user.bot) return;
        if (!voiceChannelStates.get(interaction.user.id)) return;
        let message = "";
        if (interaction.customId === 'ja_button') {
            message = "TOP! Ik kom er zo aan! :-)";
            const channel = voiceChannelStates.get(interaction.user.id);
            setTimeout(async () => {
                if (channel.members.has(interaction.user.id)) {
                    const connection = joinVoiceChannel({
                        channelId: channel.id,
                        guildId: channel.guild.id,
                        adapterCreator: channel.guild.voiceAdapterCreator,
                        selfDeaf: false,
                        selfMute: false
                    });
                    await playMusic(connection);
                }
            }, timeoutBeforeJoining);
            logMessage("Joined lonely user in lounge.", componentName);
        } else if (interaction.customId === 'nee_button') {
            message = "Ok dan niet :-(";
        }
        interaction.update({
            components: []
        });
        interaction.user.dmChannel.send(message);
        setTimeout(async () => {
            deleteDmMessages(client, interaction.user);
        }, deleteMessageTime);  
    } catch (error) {
        errorMessage(error, componentName);
    }
}