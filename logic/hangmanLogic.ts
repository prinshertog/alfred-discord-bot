import { DiscordId } from "../lib/types";
import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import words from '../data/words.json' with { type: 'json' };

export async function game(
    id: DiscordId, 
    letter: string, 
    interaction: ChatInputCommandInteraction, 
    userGames: Map<DiscordId, boolean>, 
    gameStates: Map<DiscordId, {currentHangmanSize: number; word: string; guessedLetters: string[]}>
) {
    try {
        let gameStarted = userGames.get(id)
        if (!gameStarted) {
            let word = await getWord();
            console.log(word);
            gameStates.set(id, {currentHangmanSize: 1, word, guessedLetters: []}); // Save the word.
            userGames.set(id, true); // Set the game to started for user.
            await interaction.reply({
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

        if (gameStates.get(id).currentHangmanSize > 7) {
            interaction.reply({
                content: "**Game ended**",
                flags: MessageFlags.Ephemeral
            });
            userGames.delete(id);
            gameStates.delete(id);
            return;
        }


        let guessedLetters = gameStates.get(id).guessedLetters;
        if (!guessedLetters.includes(letter)) {
            guessedLetters.push(letter);
        }
        if (isValidLetter(letter, id, gameStates)) {
            let message = returnWithGuessedLetters("That was a valid letter! **+20 street cred.**\n", id, gameStates);
            await interaction.reply({
                content: message,
                flags: MessageFlags.Ephemeral
            });
        } else {
            let message = returnWithGuessedLetters("That letter is not correct! **Womp Womp**\n", id, gameStates);
            message += await draw(gameStates.get(id).currentHangmanSize);
            await interaction.reply({
                content: message,   
                flags: MessageFlags.Ephemeral
            });
            gameStates.get(id).currentHangmanSize += 1;
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

function returnWithGuessedLetters(
    message: string, 
    id: DiscordId, 
    gameStates: Map<DiscordId, {word: string; guessedLetters: string[]}>
) {
    message += getGuessedLetters(id, gameStates);
    return message;
}

function isValidLetter(
    letter: string, 
    id: DiscordId, 
    gameStates: Map<DiscordId, {word: string; guessedLetters: string[]}>
) {
    let isValid = gameStates.get(id).word.includes(letter);
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
    id: DiscordId, 
    gameStates: Map<DiscordId, {word: string; guessedLetters: string[]}>
) {
    let message = "\n**Guessed letters:**\n";
    for (let letter of gameStates.get(id).guessedLetters) {
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