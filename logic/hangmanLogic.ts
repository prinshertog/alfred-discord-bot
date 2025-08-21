import { DiscordId } from "../lib/types";
import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { updateStreetCred } from "../database/members.js";
import words from '../data/words.json' with { type: 'json' };

export async function game(
    id: DiscordId, 
    letter: string, 
    interaction: ChatInputCommandInteraction, 
    userGames: Map<DiscordId, boolean>, 
    gameStates: Map<DiscordId, {currentHangmanSize: number; word: string; guessedLetters: string[]}>
) {
    try {
        let gameStarted = userGames.get(id);
        if (!gameStarted) {
            let generatedWord = await getWord();
            gameStates.set(id, 
                {
                    currentHangmanSize: 1, 
                    word: generatedWord, 
                    guessedLetters: []
                }
            ); // Save the word.
            userGames.set(id, true); // Set the game to started for user.
            interaction.reply({
                content:`
                    > **Game started.**
                    > Please type your first letter with "/hangman (letter)".
                `,
                flags: MessageFlags.Ephemeral
            });
            return;
        } else if (letter && letter.length > 1) {
            throw new Error(`
                    > **Not a letter**
                    > Make sure you type a letter.
                `);
        }
        let word = gameStates.get(id).word;
        let guessedLetters = gameStates.get(id).guessedLetters;

        if (!guessedLetters.includes(letter)) {
            await addLetterToGuessedLetters(word, guessedLetters, letter);
        }
        if (isValidLetter(letter, word)) {
            let message = returnWithGuessedLetters(
                "That was a valid letter! **+20 street cred.**\n", 
                guessedLetters
            );
            updateStreetCred(id, 20);
            if (wordEqualsGuessedLetters(word, guessedLetters)) {
                userGames.delete(id);
                gameStates.delete(id);
                message += `
                    > You guessed the word! **+50 street cred**
                    > **Game Ended**
                `
                updateStreetCred(id, 50);
            }
            interaction.reply({
                content: message,
                flags: MessageFlags.Ephemeral
            });
        } else {
            let message = returnWithGuessedLetters(
                "That letter is not correct! **Womp Womp** -10 street cred\n", 
                guessedLetters
            );
            message += await draw(gameStates.get(id).currentHangmanSize);
            updateStreetCred(id, -10)
            if (gameStates.get(id).currentHangmanSize >= 7) {
                message += "**Game ended**";
                userGames.delete(id);
                gameStates.delete(id);
            } else {
                gameStates.get(id).currentHangmanSize += 1;
            }
            interaction.reply({
                content: message,   
                flags: MessageFlags.Ephemeral
            });
        }
    } catch (error) {
        interaction.reply({
            content: `
                ${error}
            `,
            flags: MessageFlags.Ephemeral
        });
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

function returnWithGuessedLetters(
    message: string, 
    guessedLetters: string[]
) {
    message += "```"
    message += getGuessedLetters(guessedLetters);
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