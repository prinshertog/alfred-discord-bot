'use strict'
import { addLoungeTime } from '../database/members.js';
import { errorMessage, logMessage } from './log.js';
import { DiscordId } from './types.js';
const componentName = "loungeTimer";

export async function startTimer(userTimers, user, id: DiscordId) {
  try {
    const usedTimer = userTimers.get(id);
    if (!usedTimer) {
      const timer = setInterval(() => {
        addLoungeTime(id, 5);
      }, 5000);
      userTimers.set(id, timer);
      logMessage(`Started timer for user ${user}.`, componentName);
    }
  } catch (error) {
    errorMessage(error, componentName);
  }
}

export async function stopTimer(userTimers, user, id: DiscordId) {
  try {
    const timer = userTimers.get(id);
    clearInterval(timer);
    userTimers.delete(id);
    logMessage(`Stopped timer for user ${user}.`, componentName);
  } catch (error) {
    errorMessage(error, componentName);
  }
}