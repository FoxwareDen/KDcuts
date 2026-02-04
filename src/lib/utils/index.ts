export { sortBookingBy } from "./bookings";

import { addSeconds, isAfter, parseISO } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Calendar } from "../calender.ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert ISO string to PostgreSQL DATE format (YYYY-MM-DD)
 */
export function isoToPgDate(isoString: string): string {
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

// First, let's define the proper CalendarEntry type that matches your database
export interface CalendarEntry {
  date: string; // DATE (YYYY-MM-DD format)
  start_time: string; // TIME format
  end_time: string; // TIME format
  user_id: string | null; // UUID
}

// Helper function to convert Calendar objects to database format
export function convertCalendarToEntry(calendar: Calendar): CalendarEntry {
  // Assuming Calendar has properties like:
  // start: ISO string, end: ISO string, duration in milliseconds, user_id, etc.

  // Convert date to PostgreSQL DATE format
  const date: string = isoToPgDate(calendar.start_time) || isoToPgDate(new Date().toISOString());

  // Convert start and end times to PostgreSQL TIME format
  // You might need to extract just the time part from ISO strings
  const startTime = calendar.start_time.split('T')[1]?.slice(0, 8) || '00:00:00';
  const endTime = calendar.end_time.split('T')[1]?.slice(0, 8) || '00:00:00';

  // Or if you have milliseconds for duration, convert to seconds/minutes as needed
  // Assuming duration is in minutes for your INTEGER field

  return {
    date, // Fallback to today
    start_time: startTime,
    end_time: endTime,
    user_id: calendar?.user_id || null // Make sure this is provided
  };
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
