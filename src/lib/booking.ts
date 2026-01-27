import { type MetaData, client } from "./db.ts";
import { getTimeToPgTime, isoToPgDate } from "./utils";

export interface BookingClientData {
  booking_id: number | null,
  email: string,
  phone: string
}

export interface Booking {
  id: number;
  status: "pending" | "completed" | "rescheduled" | "cancelled",
  date: string;
  start_time: string;
  updated_at: string | null,
  end_time: string;
  duration: number;
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
  try {
    const { data } = await client.from("bookings").select("*");

    return null
  } catch (error) {
    return null
  }
}

export async function updateBooking(booking_id: number, data: Partial<Booking>): Promise<MetaData | null> {
  return null
}
