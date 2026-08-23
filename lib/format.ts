import { Temporal } from '@js-temporal/polyfill';
import type { LoungeTime } from '../lib/types.js';
import { handleError } from './helper.js';

const componentName = "format";

export async function formatLoungeTime(loungeTimeData: LoungeTime) {
  try {
    const duration = Temporal.Duration.from({ seconds: loungeTimeData.Time });
    const formattedTime = duration.round({ largestUnit: "days" });
    const timeParts = [];
    if (formattedTime.days) timeParts.push(`\`Days: ${formattedTime.days}\``);
    if (formattedTime.hours) timeParts.push(`\`Hours: ${formattedTime.hours}\``);
    if (formattedTime.minutes) timeParts.push(`\`Minutes: ${formattedTime.minutes}\``);
    timeParts.push(`\`Seconds: ${formattedTime.seconds}\``); // always show seconds
    return timeParts.join(" ").toString();
  } catch (error) {
    handleError(error, componentName);
  }
}

export function toLoungeTimeData(raw: any): LoungeTime {
  return {
    Id: raw.Id,
    GuildId: raw.GuildId,
    Time: raw.Time
  }
}