
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
  date: number,
  time: number,
}

export async function addBooking(booking: Booking): Promise<MetaData | null> {
  return null
}

export async function getBookings(): Promise<Booking & MetaData[] | null> {
  return null
}

export async function updateBooking(booking_id: number, data: Partial<Booking>): Promise<MetaData | null> {
  return null
}
