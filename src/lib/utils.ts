import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Booking } from "./booking";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const statusValueMap: Record<"pending" | "completed" | "rescheduled" | "cancelled", number> = {
  "pending": 0,
  "rescheduled": 1,
  "completed": 2,
  "cancelled": 3
};

function sortByStatus(order: "asc" | "desc", data: Booking[]): Booking[] {
  return data.sort((a, b) => {
    const statusA = statusValueMap[a.status];
    const statusB = statusValueMap[b.status];

    if (order === "asc") {
      return statusA - statusB;
    } else {
      return statusB - statusA;
    }
  });
}

function sortByDate(order: "asc" | "desc", data: Booking[]): Booking[] {
  return data.sort((a, b) => {
    // First compare dates (assuming date is numeric or Date type)
    if (a.date !== b.date) {
      return order === "asc" ? Number(a.date) - Number(b.date) : Number(b.date) - Number(a.date);
    }

    // If dates are equal, compare times
    // Convert time strings to comparable numbers (e.g., "14:30" -> 1430)
    const timeToNumber = (time: string) => parseFloat(time.replace(":", ""));

    const timeA = timeToNumber(a.start_time);
    const timeB = timeToNumber(b.start_time);

    return order === "asc" ? timeA - timeB : timeB - timeA;
  });
}

/**
 * Sorts or groups an array of bookings based on the specified field and order.
 * 
 * @param {"user_id" | "email" | "updated_at" | "status" | "date"} field - The field to sort or group by:
 *   - "user_id": Groups bookings by user ID (order parameter ignored)
 *   - "email": Groups bookings by email address (order parameter ignored)
 *   - "updated_at": Sorts by last update timestamp
 *   - "status": Sorts by status priority (pending=0, rescheduled=1, completed=2, cancelled=3)
 *   - "date": Sorts by booking date, then time if dates are equal
 * 
 * @param {"asc" | "desc"} order - Sort direction:
 *   - "asc": Ascending order (earliest/lowest first)
 *   - "desc": Descending order (latest/highest first)
 *   Note: Ignored when field is "user_id" or "email"
 * 
 * @param {Booking[]} data - Array of booking objects to sort or group
 * 
 * @returns {Booking[]} Sorted or grouped array of bookings
 * 
 * @example
 * // Sort by date ascending (earliest first)
 * sortBookingBy("date", "asc", bookings);
 * 
 * @example
 * // Sort by status descending (cancelled → completed → rescheduled → pending)
 * sortBookingBy("status", "desc", bookings);
 * 
 * @example
 * // Group by user ID (order parameter is ignored)
 * sortBookingBy("user_id", "asc", bookings);
 * 
 * @example
 * // Sort by last updated, most recent first
 * sortBookingBy("updated_at", "desc", bookings);
 */
export function sortBookingBy(field: "status" | "date", order: "asc" | "desc", data: Booking[]) {
  switch (field) {
    // case "user_id":
    //   console.log("user_id");
    //   return groupByuserId(data)
    // case "email":
    //   return groupByEmail(data)
    // case "updated_at":
    //   return sortByLastUpdated(order, data)
    case "status":
      return sortByStatus(order, data);
    case "date":
      return sortByDate(order, data);
    default:
      return data
  }
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

