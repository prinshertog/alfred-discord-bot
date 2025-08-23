'use strict'
import { Temporal } from '@js-temporal/polyfill';
import { Member } from '../lib/types';
export async function formatLoungeTime(member: Member) {
    const duration = Temporal.Duration.from({ seconds: member.LoungeTime });
    const formattedTime = duration.round({ largestUnit: "days" });
    const timeParts = [];
    if (formattedTime.days) timeParts.push(`\`Days: ${formattedTime.days}\``);
    if (formattedTime.hours) timeParts.push(`\`Hours: ${formattedTime.hours}\``);
    if (formattedTime.minutes) timeParts.push(`\`Minutes: ${formattedTime.minutes}\``);
    timeParts.push(`\`Seconds: ${formattedTime.seconds}\``); // always show seconds
    return timeParts.join(" ").toString();
}

export function toMember(raw: any): Member {
  return {
    Id: raw.Id,
    StreetCred: raw.StreetCred,
    AccessLevel: raw.AccessLevel,
    LoungeTime: raw.LoungeTime
  };
}
