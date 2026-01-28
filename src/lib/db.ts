import { createClient } from "@neondatabase/neon-js";
import { getTimeToPgTime, isoToPgDate } from "./utils";

export const client = createClient({
  auth: {
    url: import.meta.env.VITE_DATABASE_AUTH_URL
  },
  dataApi: {
    url: import.meta.env.VITE_DATABASE_API_URL
  }
})

export async function getUserSession(): Promise<any | null> {
  try {
    const { error, data: userSession } = await client.auth.getSession();

    if (error) throw error;

  } catch (error) {
    console.error(error as Error);
    return null;
  }
}

export async function signInWithAuth() {
  try {
    const { data, error } = await client.auth.signIn.social({
      provider: "google",
      callbackURL: window.location.origin,
    })

    if (error) throw error;

  } catch (error) {
    console.error(error as Error);
    return null;
  }
}


export async function signOut() {
  try {
    await client.auth.signOut();
  } catch (error) {
    console.log(error);
    return null;
  }
}

export interface MetaData {
  id: number,
  created_at: string,
}

/**
 * Booking object structure
 *
 * @property user_id - The unique identifier for the user (can be null)
 * @property email - The email address associated with the booking
 * @property updated_at - ISO 8601 timestamp of when the booking was last updated
 * @property status - Current status of the booking
 * @property date - Booking date in YYYYMMDD format (e.g., 20260126 for January 26, 2026)
 * @property time - Booking time in HHMM format (e.g., 1430 for 2:30 PM, 0900 for 9:00 AM)
 * @property phone - The phone number associated with the booking
 *
 * @example
 * const booking = {
 *   user_id: 123,
 *   email: "user@example.com",
 *   updated_at: "2026-01-26T14:30:00Z",
 *   status: "pending",
 *   date: 20260126,
 *   time: 1430
 * };
 */
export interface Booking {
  user_id: number | null,
  email: string,
  updated_at: string,
  status: "pending" | "completed" | "rescheduled" | "cancelled",
  date: string,
  time: string,
  phone: string
}

export async function addBooking(booking: { user_id: string | null, email: string, date: string, time: string, phone: string, service: string }): Promise<MetaData | null> {
  try {
    const cleanBooking = {
      user_id: booking.user_id || null,
      email: booking.email,
      date: isoToPgDate(booking.date),
      time: getTimeToPgTime(Number(booking.time)),
      phone: booking.phone,
      service: booking.service
    };

    const { error } = await client.from("bookings").insert(cleanBooking);

    if (error) throw error;

    return null;
  } catch (error) {
    console.error(error as Error);
    return null;
  }
}

export async function getBookings(): Promise<Booking & MetaData[] | null> {
  return null
}

export async function updateBooking(booking_id: number, data: Partial<Booking>): Promise<MetaData | null> {
  return null
}
