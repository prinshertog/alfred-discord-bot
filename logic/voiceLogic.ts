'use strict'

import { AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection, VoiceConnection } from "@discordjs/voice"
import { Events, VoiceState } from "discord.js";
import fs from 'fs';

const musicFolder = "./music/";

export async function playMusic(connection: VoiceConnection) {
    let currentSong = 0;
    const files = fs.readdirSync(musicFolder);
    const player = createAudioPlayer();
    let resource = createAudioResource(musicFolder + files[0]);
    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
        if (currentSong <= files.length) {
            currentSong += 1;
            let resource = createAudioResource(musicFolder + files[currentSong]);
            player.play(resource);
            return;
        }
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