'use strict'
import { addLoungeTime } from '../database/members.js';
import { DiscordId } from './types.js';
export async function startTimer(userTimers, user, id: DiscordId) {
    const usedTimer = userTimers.get(id);
    if (!usedTimer) {
      const timer = setInterval(() => {
        addLoungeTime(id, 5);
      }, 5000);
      userTimers.set(id, timer);
      console.log(`Started timer for user ${user}.`);
    }
}

export async function stopTimer(userTimers, user, id: DiscordId) {
    const timer = userTimers.get(id);
    clearInterval(timer);
    userTimers.delete(id);
    console.log(`Stopped timer for user ${user}.`);
}