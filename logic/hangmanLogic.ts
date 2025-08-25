'use strict'
import { DiscordId, GameStates, UserGames } from "../lib/types.js";
import { ChatInputCommandInteraction, Client, EmbedBuilder, MessageFlags } from "discord.js";
import { updateStreetCred } from "../database/members.js";
import { createEmbed } from '../lib/embed.js';
import words from '../data/words.json' with { type: 'json' };
import { Color } from "../data/global.js";
import { errorMessage } from "../lib/log.js";

const componentName = "hangmanLogic";

export async function game(
    id: DiscordId, 
    letter: string, 
    interaction: ChatInputCommandInteraction, 
    userGames: UserGames, 
    gameStates: GameStates,
    client: Client
) {
    try {
        let gameStarted = userGames.get(id);
        if (!gameStarted) {
            let generatedWord = await getWord();
            gameStates.set(id, 
                {
                    currentHangmanSize: 1, 
                    word: generatedWord, 
                    guessedLetters: [],
                    wrongLetters: []
                }
            ); // Save the word.
            userGames.set(id, true); // Set the game to started for user.
            await startCleanupTimer(id, userGames, gameStates);
            await interaction.reply({
                embeds: [await createEmbed(
                    Color.Blue,
                    "Game started\n",
                    "To guess a letter use **/hangman (letter)**\n" +
                    "The language of the words is: **Nederlands**",
                    client
                )],
                flags: MessageFlags.Ephemeral
            });
        }

        if (letter.length <= 1) {
            const method = interaction.replied ? 'editReply' : 'reply';
            await (interaction as any)[method]({
                embeds: [await runGame(
                    id, 
                    client, 
                    letter, 
                    gameStates.get(id).word, 
                    gameStates.get(id).guessedLetters, 
                    gameStates.get(id).wrongLetters, 
                    userGames, 
                    gameStates
                )],
                flags: MessageFlags.Ephemeral
            })
        } else {
            let message = "**Not a letter**\n" + 
                "Make sure you type a letter not a word."
            const method = interaction.replied ? 'editReply' : 'reply';

            await (interaction as any)[method]({
                embeds: [await createEmbed(
                    Color.Red,
                    "ERROR",
                    message,
                    client
                )],
                flags: MessageFlags.Ephemeral
            })
        }

    } catch (error) {
        errorMessage(error, componentName);
    }
}

async function runGame(
    id: DiscordId,
    client: Client, 
    letter: string, 
    word: string, 
    guessedLetters: string[], 
    wrongLetters: string[], 
    userGames: UserGames, 
    gameStates: GameStates
) : Promise<EmbedBuilder> {
    if (guessedLetters.includes(letter) || wrongLetters.includes(letter)) {
        let message = returnWithLetters(
            "**You already guessed that letter!**\n", 
            guessedLetters,
            wrongLetters
        );
        return await createEmbed(
                Color.Red,
                "Hangman",
                message,
                client
            );
    } else {
        await addLetterToGuessedLetters(word, guessedLetters, letter);
        if (!wrongLetters.includes(letter) && !guessedLetters.includes(letter)) {
            wrongLetters.push(letter);
        }
    }
    
    if (isValidLetter(letter, word)) {
        let message = returnWithLetters(
            "That was a valid letter! **+20 street cred.**\n", 
            guessedLetters,
            wrongLetters
        );
        updateStreetCred(id, 20);
        if (wordEqualsGuessedLetters(word, guessedLetters)) {
            userGames.delete(id);
            gameStates.delete(id);
            message += 
                "You guessed the word! **+50 street cred**\n" +
                "**Game Ended**";
            updateStreetCred(id, 50);
        }
        return await createEmbed(
                Color.Green,
                "Hangman",
                message,
                client
            );
    } else {
        let message = returnWithLetters(
            "That letter is not correct! **Womp Womp** -10 street cred\n", 
            guessedLetters,
            wrongLetters
        );
        message += await draw(gameStates.get(id).currentHangmanSize);
        updateStreetCred(id, -10)
        if (gameStates.get(id).currentHangmanSize >= 7) {
            message += "\n**Game Ended**\n"
            message += `The word was: *${word}*`;
            userGames.delete(id);
            gameStates.delete(id);
        } else {
            gameStates.get(id).currentHangmanSize += 1;
        }
        return await createEmbed(
                Color.Red,
                "Hangman",
                message,
                client
            );
    }
}

async function addLetterToGuessedLetters(
    word: string,
    guessedLetters: string[],  
    letter: string
) {
    for (let i = 0; i < word.length; i++) {
        if (word[i] == letter) {
            guessedLetters[i] = letter;
        } else {
            if (!guessedLetters[i]) {
                guessedLetters[i] = "_";
            }
        }
    }
}

function wordEqualsGuessedLetters(
    word: string,
    guessedLetters: string[]
 ) : boolean {
    for (let i = 0; i < word.length; i++) {
        if (word[i] != guessedLetters[i]) {
            return false;
        }
    }
    return true;
}

function returnWithLetters(
    message: string, 
    guessedLetters: string[],
    wrongLetters: string[]
) {
    message += "```"
    message += getGuessedLetters(guessedLetters);
    message += "\n"
    message += getWrongLetters(wrongLetters);
    message += "```"
    return message;
}

function isValidLetter(
    letter: string, 
    word: string
) {
    let isValid = word.includes(letter);
    return isValid;
}

async function getWord() {
    let randomNumber = await getRandomInt(299);
    return words.woorden[randomNumber];
}

async function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

function getGuessedLetters(
    guessedLetters: string[]
) {
    let message = "\nGuessed letters:\n";
    for (let letter of guessedLetters) {
        message += letter + " ";
    }
    return message;
}

function getWrongLetters(
    wrongLetters: string[]
) {
    let message: string = "\nWrong Letters:\n";
    for (let letter of wrongLetters) {
        message += letter + " ";
    }
    return message;
}

async function startCleanupTimer(
    id: DiscordId,
    userGames: Map<DiscordId, boolean>,
    gameStates: Map<DiscordId, {currentHangmanSize: number; word: string; guessedLetters: string[], wrongLetters: string[]}>
) {
    setTimeout(() => {
        userGames.delete(id);
        gameStates.delete(id);
    }, 3600000);
}

async function draw(
    size: number, 
) : Promise<string> {
    switch (size) {
        case 1:
            return `
                \`\`\`
                +---+
                |   |
                    |
                    |
                    |
                    |
                =========
                \`\`\`
                `;
        case 2:
            return `
                \`\`\`
                +---+
                |   |
                O   |
                    |
                    |
                    |
                =========
                \`\`\`
                `;
        case 3:
            return `
                \`\`\`
                +---+
                |   |
                O   |
                |   |
                    |
                    |
                =========
                \`\`\`
                `;
        case 4:
            return `
                \`\`\`
                +---+
                |   |
                O   |
               /|   |
                    |
                    |
                =========
                \`\`\`
                `;
        case 5:
            return `
                \`\`\`
                +---+
                |   |
                O   |
               /|\\  |
                    |
                    |
                =========
                \`\`\`
                `;
        case 6:
            return `
                \`\`\`
                +---+
                |   |
                O   |
               /|\\  |
               /    |
                    |
                =========
                \`\`\`
                `;
        case 7:
            return `
                \`\`\`
                +---+
                |   |
                O   |
               /|\\  |
               / \\  |
                    |
                =========
                \`\`\`
                `;
        }
}