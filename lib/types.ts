'use strict'
export type DiscordId = string;
export type Member = {
    Id: DiscordId,
    StreetCred: number,
    AccessLevel: number,
    LoungeTime: number
}
export type UserGames = Map<DiscordId, boolean>;
export type GameStates = Map<DiscordId, {currentHangmanSize: number; word: string; guessedLetters: string[], wrongLetters: string[]}>;
export type BotMuteEndDateTime = {
    Id: DiscordId,
    MuteEndDateTime: Date
}