import { addLoungeTime } from '../database/members.js';
import { handleError } from './helper.js';
import { logMessage } from './log.js';
import { DiscordId } from './types.js';

const componentName = "loungeTimer";

export async function startTimer(userTimers: Map<DiscordId, NodeJS.Timeout>, user: string, id: DiscordId) {
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
    handleError(error, componentName);
  }
}

export async function stopTimer(userTimers: Map<DiscordId, NodeJS.Timeout>, user: string, id: DiscordId) {
  try {
    const timer = userTimers.get(id);
    clearInterval(timer);
    userTimers.delete(id);
    logMessage(`Stopped timer for user ${user}.`, componentName);
  } catch (error) {
    handleError(error, componentName);
  }
}