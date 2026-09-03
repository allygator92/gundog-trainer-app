import { randomBytes } from "node:crypto";
import { differenceInMinutes } from "date-fns";

export const MANAGE_NOTICE_HOURS = 24;

export function createManageToken() {
  return randomBytes(24).toString("hex");
}

export function manageBookingUrl(appUrl: string, token: string) {
  return `${appUrl}/booking/${token}`;
}

export function hoursUntilStart(startsAt: Date, now = new Date()) {
  return differenceInMinutes(startsAt, now) / 60;
}

export function canReschedule(startsAt: Date, now = new Date()) {
  return hoursUntilStart(startsAt, now) >= MANAGE_NOTICE_HOURS;
}

export function getVirtualMeetingUrl() {
  return process.env.VIRTUAL_MEETING_URL?.trim() ?? "";
}
