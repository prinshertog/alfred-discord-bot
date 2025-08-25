'use strict'

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, Interaction, User, VoiceBasedChannel, VoiceState } from "discord.js";
import { DiscordId } from "../lib/types.js";
import { joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { playMusic } from "./voiceLogic.js";

const lonelyTime = 5000; // Time that the bot waits before asking to join.
const deleteMessageTime = 10000; // Time that the bot waits before deleting DMs.
const timeoutBeforeJoining = 5000; // Time that it takes to join lounge after user replied yes.

export async function startLonelyTimer(
    state: VoiceState, 
    lonelyTimers: Map<DiscordId, NodeJS.Timeout>,
    id: DiscordId
) {
    if (state.channel.members.size === 1 
        && !lonelyTimers.get(id)
        && lonelyTimers.size === 0
    ) {
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

            console.log("Sending message to lonely user.")
            await state.member.send({ 
                content: `Hey ${state.member.displayName} ben je lonely in de lounge?`
            });
            await state.member.send({ 
                content: `Zou je willen dat ik erbij kom zitten en wat muziek afspeel? Dan ben je niet zo alleen :)`,
                components: [buttons.toJSON()]
            });
        }, lonelyTime));
    }
}

export async function stopLonelyTimer(
    lonelyTimers: Map<DiscordId, NodeJS.Timeout>,
    id: DiscordId
) {
    lonelyTimers.delete(id);
}

async function deleteDmMessages(client: Client, user: User) {
    const messages = await user.dmChannel.messages.fetch({ limit: 100});
    const botMessages = messages.filter(msg => msg.author.id === client.user.id);
    for (let message of botMessages.values()) {
        message.delete();
    }
}

export async function handleLonelyInteraction(interaction: Interaction, client: Client, voiceChannelStates: Map<DiscordId, VoiceBasedChannel>) {
    let message = "";
    if (!interaction.isButton()) return;
    if (interaction.user.bot) return;
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
    } else if (interaction.customId === 'nee_button') {
        message = "Ok dan niet :-(";
    }
    interaction.update({
        components: []
    });
    interaction.user.dmChannel.send(message);
    setTimeout(async () => {
        deleteDmMessages(client, interaction.user);
    }, deleteMessageTime)
}