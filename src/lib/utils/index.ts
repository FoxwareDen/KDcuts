export { sortBookingBy } from "./bookings";

import { addSeconds, isAfter, parseISO } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert ISO string to PostgreSQL DATE format (YYYY-MM-DD)
 */
export function isoToPgDate(isoString: string) {
  if (!isoString) return null;
  return isoString.split('T')[0];
}

/**
 * Convert ISO string to PostgreSQL TIMESTAMP format (YYYY-MM-DD HH:MM:SS)
 */
export function isoToPgTimestamp(isoString: string) {
  if (!isoString) return null;
  return new Date(isoString).toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Convert ISO string to PostgreSQL TIMESTAMPTZ format
 */
export function isoToPgTimestamptz(isoString: string) {
  if (!isoString) return null;
  return isoString.replace('T', ' ').replace('Z', '');
}

/*
 * Convert milliseconds to HH:MM:SS
 */
export function getTimeToPgTime(milliseconds: number) {
  const date = new Date(milliseconds);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Writes the current timestamp (ISO string) to localStorage for a given action key.
 *
 * @param action - Unique identifier for the action being tracked.
 */
export function writeTimeStamp(action: string) {
  localStorage.setItem(action, new Date().toISOString());
}

/**
 * Reads a timestamp from localStorage and parses it into a Date object.
 *
 * @param action - Unique identifier for the action being tracked.
 * @returns A Date if the timestamp exists and is valid, otherwise null.
 */
export function readTimeStamp(action: string): Date | null {
  const value = localStorage.getItem(action);
  return value ? parseISO(value) : null;
}

/**
 * Executes an async function only if the cooldown period has elapsed
 * since the last execution of the given action.
 *
 * If the action is still within the cooldown window, the function
 * will not be executed and `null` is returned.
 *
 * @typeParam T - The resolved return type of the async function.
 * @param func - The async function to execute.
 * @param action - Unique identifier used to track cooldown state.
 * @param cooldownSeconds - Cooldown duration in seconds.
 * @returns The result of the async function, or null if still cooling down.
 */
export async function validateSubmissionCooldown<T>(
  func: () => Promise<T>,
  action: string,
  cooldownSeconds: number
): Promise<T | null> {
  const lastActionDate = readTimeStamp(action);

  if (!lastActionDate) {
    const result = await func();
    writeTimeStamp(action);
    return result;
  }

  const nextAllowedTime = addSeconds(lastActionDate, cooldownSeconds);

  if (isAfter(new Date(), nextAllowedTime)) {
    const result = await func();
    writeTimeStamp(action);
    return result;
  }

  return null;
}
