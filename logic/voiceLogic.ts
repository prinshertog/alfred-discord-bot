'use strict'

import { AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection, VoiceConnection } from "@discordjs/voice"
import { Events, VoiceState } from "discord.js";

export async function playMusic(connection: VoiceConnection) {
    const player = createAudioPlayer();
    const resource = createAudioResource("./music/jazz.mp3");
    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    player.on(Events.Error, (error) => {
      console.error(error);
    });
}

export async function botLeaveWhenEmpty(voiceState: VoiceState) {
    const connection = getVoiceConnection(voiceState.guild.id);
    if (!connection) return;
    if (voiceState.channel.members.size > 1) return;
    connection.destroy();
}