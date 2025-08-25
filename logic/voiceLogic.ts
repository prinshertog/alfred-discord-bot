'use strict'

import { AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection, VoiceConnection } from "@discordjs/voice"
import { Events, VoiceState } from "discord.js";
import fs from 'fs';
import dotenv from 'dotenv';
import { errorMessage, logMessage } from "../lib/log.js";
dotenv.config();
const { MUSIC_FOLDER } = process.env;

const componentName = "voiceLogic";

export async function playMusic(connection: VoiceConnection) {
    let currentSong = 0;
    const files = fs.readdirSync(MUSIC_FOLDER);
    if (!files) {
        fs.mkdirSync(MUSIC_FOLDER);
    }
    const player = createAudioPlayer();
    let resource = createAudioResource(MUSIC_FOLDER + "/" + files[0]);
    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
        if (currentSong <= files.length) {
            currentSong += 1;
            let resource = createAudioResource(MUSIC_FOLDER + "/" + files[currentSong]);
            player.play(resource);
            logMessage(`Playing next song: ${files[currentSong]}`, componentName);
            return;
        }
        connection.destroy();
    });

    player.on(Events.Error, (error) => {
        errorMessage(error.message, componentName);
    });
}

export async function botLeaveWhenEmpty(voiceState: VoiceState) {
    const connection = getVoiceConnection(voiceState.guild.id);
    if (!connection) return;
    if (voiceState.channel.members.size > 1) return;
    connection.destroy();
}