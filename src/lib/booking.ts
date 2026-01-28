import { type MetaData, client } from "./db.ts";
import { getTimeToPgTime, isoToPgDate } from "./utils";

export interface BookingClientData {
  name: string
  email: string
  phone: string
  service?: string
  booking_id: number
}

export interface Booking {
  id: number;
  status: "pending" | "completed" | "rescheduled" | "cancelled",
  date: string;
  start_time: string;
  end_time: string;
  updated_at: string | null;
  duration: number;
}

export async function addBooking(
  booking: {
    date: string,
    start_time: number,
    end_time: number,
    duration: number
    user_id: number | null
  },
  bookingDetails: {
    email: string,
    phone: string,
    service?: string
    name: string
  }): Promise<boolean> {
  try {
    const cleanBookingData = {
      date: isoToPgDate(booking.date),
      start_time: getTimeToPgTime(Number(booking.start_time)),
      end_time: getTimeToPgTime(Number(booking.end_time)),
      duration: booking.duration,
      user_id: booking.user_id
    }

    const { data, error } = await client.from("bookings").insert(cleanBookingData).select("*").single();

    if (error) throw error;

    const cleanClientData: BookingClientData = {
      service: bookingDetails.service,
      email: bookingDetails.email,
      phone: bookingDetails.phone,
      name: bookingDetails.name,
      booking_id: data.id
    }

    const { error: clientError } = await client.from("booking_data").insert(cleanClientData);

    if (clientError) throw clientError;

    return true
  } catch (error) {
    console.error(error as Error);
    return false;
  }
}

export async function getBookings(): Promise<Booking & { id: number }[] | null> {
  try {
    const { data } = await client.from("bookings").select("*");

    const bookings: Booking & { id: number }[] = data.map((row) => ({
      id: row.id,
      status: row.status,
      date: row.date,
      start_time: row.start_time,
      end_time: row.end_time,
      updated_at: row.updated_at,
      duration: row.duration
    }));

    return bookings;
  } catch (error) {
    return null
  }
}

export async function updateBooking(booking_id: number, data: Partial<Booking>): Promise<MetaData | null> {
  return null
}
