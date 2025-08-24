'use strict'

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, Interaction, User, VoiceBasedChannel, VoiceState } from "discord.js";
import { DiscordId } from "../lib/types.js";
import { getVoiceConnection, getVoiceConnections, joinVoiceChannel } from "@discordjs/voice";

export async function startLonelyTimer(
    state: VoiceState, 
    lonelyTimers: Map<DiscordId, NodeJS.Timeout>,
    id: DiscordId,
) {
    if (state.channel.members.size === 1) {
        lonelyTimers.set(id, setTimeout(async () => {
            const jaButton = new ButtonBuilder()
            .setCustomId('ja_button')
            .setLabel('Ja')
            .setStyle(ButtonStyle.Primary);
            const neeButton = new ButtonBuilder()
            .setCustomId('nee_button')
            .setLabel('Nee')
            .setStyle(ButtonStyle.Primary);

            const buttons = new ActionRowBuilder().addComponents(jaButton, neeButton);

            console.log("Sending message to lonely user.")
            await state.member.send({ 
                content: `Hey ${state.member.displayName} ben je lonely in de lounge?`
            });
            await state.member.send({ 
                content: `Zou je willen dat ik erbij kom zitten en wat muziek afspeel? Dan ben je niet zo alleen :)`,
                components: [buttons.toJSON()]
            });
        }, 5000));  
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
        setTimeout(() => {
            if (channel.members.has(interaction.user.id)) {
                joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                    selfDeaf: false,
                    selfMute: false
                });
            }
        }, 5000);
    } else if (interaction.customId === 'nee_button') {
        message = "Ok dan niet :-(";
    }
    interaction.update({
        components: []
    });
    interaction.user.dmChannel.send(message);
    setTimeout(async () => {
        deleteDmMessages(client, interaction.user);
    }, 10000)
}

export async function handleLonelyBot(channel: VoiceBasedChannel) {
    if (!channel.members) return;
    const amountOfPeopleInLounge = channel.members.size;
    const guildId = channel.guild.id;
    const connection = getVoiceConnection(guildId);
    if (!connection) return;
    if (amountOfPeopleInLounge <= 1) {
        connection.destroy();
    } 
    if (amountOfPeopleInLounge >= 3) {
        connection.destroy();
    }
}