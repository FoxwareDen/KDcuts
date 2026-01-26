import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Booking } from "./db";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const statusValueMap: Record<"pending" | "completed" | "rescheduled" | "cancelled", number> = {
  "pending": 0,
  "rescheduled": 1,
  "completed": 2,
  "cancelled": 3
};


function groupByuserId(data: Booking[]): Booking[] {
  let buffer: Booking[][] = [];
  const map: Record<number, number> = {};
  let counter = 0;

  for (const item of data) {
    if (!item.user_id) {
      continue
    }
    if (!map[item.user_id]) {
      map[item.user_id] = counter++;
      buffer[counter - 1] = [item];
    } else {
      buffer[map[item.user_id]].push(item);
    }
  }

  return buffer.flat();
}

function groupByEmail(data: Booking[]): Booking[] {
  let buffer: Booking[][] = [];
  const map: Record<string, number> = {};
  let counter = 0;

  for (const item of data) {
    if (!item.email) {
      continue
    }
    if (!map[item.email]) {
      map[item.email] = counter++;
      buffer[counter - 1] = [item];
    } else {
      buffer[map[item.email]].push(item);
    }
  }

  return buffer.flat();
}


function sortByLastUpdated(order: "asc" | "desc", data: Booking[]): Booking[] {
  return data.sort((a, b) => {
    const dateA = new Date(a.updated_at);
    const dateB = new Date(b.updated_at);

    if (order === "asc") {
      return dateA.getTime() - dateB.getTime();
    } else {
      return dateB.getTime() - dateA.getTime();
    }
  });
}

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
    // first compare dates
    if (a.date !== b.date) {
      return order === "asc" ? a.date - b.date : b.date - a.date;
    }

    // if dates are equal, compare times
    return order === "asc" ? a.time - b.time : b.time - a.time;
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
export function sortBookingBy(field: "user_id" | "email" | "updated_at" | "status" | "date", order: "asc" | "desc", data: Booking[]) {
  switch (field) {
    case "user_id":
      console.log("user_id");
      return groupByuserId(data)
    case "email":
      return groupByEmail(data)
    case "updated_at":
      return sortByLastUpdated(order, data)
    case "status":
      return sortByStatus(order, data);
    case "date":
      return sortByDate(order, data);
    default:
      return data
  }
}
