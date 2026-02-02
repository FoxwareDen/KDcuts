import { client, type MetaData } from "./db.ts";
import { isoToPgDate } from "./utils";

export interface Booking {
  id: number;
  status: "pending" | "completed" | "rescheduled" | "cancelled";
  date: string;
  start_time: string;
  end_time: string;
  updated_at: string | null;
  duration: number;
}

export async function addBooking(
  booking: {
    date: string,
    start_time: string,
    end_time: string,
    duration: number
    user_id: string | null
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
      start_time: booking.start_time,
      end_time: booking.end_time,
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

    // @ts-ignore
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

export async function getBookingsByUserId(user_id: string): Promise<Booking & { id: number }[] | null> {
  try {
    const { data, error } = await client.from("bookings").select("*").eq("user_id", user_id);

    if (error) throw error;

    // @ts-ignore
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

export async function updateBooking(booking_id: number, data: Partial<Booking>): Promise<any | null> {
  try {
    // 1. First, manually check what endpoint exists
    console.log('Testing with RLS enabled...');

    // 2. Try with very basic update first
    const { data: resData, error } = await client
      .from("bookings")
      .update(data) // Just one field to test
      .eq("id", booking_id)
      .select("*")
      .single();

    if (error) {
      console.error('Update error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    return resData as Booking;
  } catch (error) {
    console.error('Full error:', error);
    return null;
  }
}

export interface BookingClientData {
  name: string
  email: string
  phone: string
  service?: string
  booking_id: number
}

export async function getBookingDetailsByID(booking_id: number): Promise<BookingClientData & MetaData | null> {
  try {
    const { data, error } = await client.from("booking_data").select("*").eq("booking_id", booking_id).single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteBookingDetailByID(id: number): Promise<any | null> {
  try {
    const { data, error } = await client.from("booking_data").delete().eq("id", id).select("*").single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
