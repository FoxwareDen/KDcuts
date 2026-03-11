import {
  collection, doc, addDoc, getDocs, getDoc,
  updateDoc, deleteDoc, query, where,
  serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "./db";

// ⚠️  id is now string (Firestore auto-ID). Update callers that pass numeric IDs.
export type BookingStatus = "pending" | "completed" | "rescheduled" | "cancelled";

export interface Booking {
  id: string;           // was number
  status: BookingStatus;
  date: string;
  start_time: string;
  end_time: string;
  updated_at: string | null;
  duration: number;
}

export interface BookingClientData {
  name: string;
  email: string;
  phone: string;
  service?: string;
  booking_id: string;   // was number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const bookingsCol    = () => collection(db, "bookings");
const bookingDataCol = () => collection(db, "booking_data");

function docToBooking(id: string, d: Record<string, any>): Booking {
  return {
    id,
    status:     d.status,
    date:       d.date,
    start_time: d.start_time,
    end_time:   d.end_time,
    updated_at: d.updated_at ?? null,
    duration:   d.duration,
  };
}

// ─── Functions ────────────────────────────────────────────────────────────────

export async function addBooking(
  booking: {
    date: string;
    start_time: string;
    end_time: string;
    duration: number;
    user_id: string | null;
  },
  bookingDetails: {
    email: string;
    phone: string;
    service?: string;
    name: string;
  }
): Promise<boolean> {
  try {
    const bookingRef = await addDoc(bookingsCol(), {
      date:       booking.date,
      start_time: booking.start_time,
      end_time:   booking.end_time,
      duration:   booking.duration,
      user_id:    booking.user_id,
      status:     "pending",
      created_at: serverTimestamp(),
      updated_at: null,
    });

    await addDoc(bookingDataCol(), {
      booking_id: bookingRef.id,
      email:      bookingDetails.email,
      phone:      bookingDetails.phone,
      name:       bookingDetails.name,
      service:    bookingDetails.service ?? null,
      created_at: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getBookings(): Promise<Booking[] | null> {
  try {
    const snap = await getDocs(bookingsCol());
    return snap.docs.map((d) => docToBooking(d.id, d.data()));
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<boolean> {
  try {
    await updateDoc(doc(db, "bookings", id), { status, updated_at: new Date().toISOString() });

    if (status === "completed" || status === "cancelled") {
      // Scrub PII on terminal statuses
      const q     = query(bookingDataCol(), where("booking_id", "==", id));
      const snap  = await getDocs(q);
      await Promise.all(
        snap.docs.map((d) => updateDoc(d.ref, { email: "", phone: "" }))
      );
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getBookingsByUserId(user_id: string): Promise<Booking[] | null> {
  try {
    const q    = query(bookingsCol(), where("user_id", "==", user_id));
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToBooking(d.id, d.data()));
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getBulkBookings(): Promise<(Booking & BookingClientData)[] | null> {
  try {
    const bookings = await getBookings();
    if (!bookings) throw new Error("No bookings found");

    const results = await Promise.all(
      bookings.map(async (b) => {
        const details = await getBookingDetailsByID(b.id);
        return details ? { ...b, ...details } : null;
      })
    );

    return results.filter(Boolean) as (Booking & BookingClientData)[];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateBooking(
  booking_id: string,
  data: Partial<Omit<Booking, "id">>
): Promise<Booking | null> {
  try {
    const ref = doc(db, "bookings", booking_id);
    await updateDoc(ref, data);
    const updated = await getDoc(ref);
    return updated.exists() ? docToBooking(updated.id, updated.data()) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getBookingDetailsByID(
  booking_id: string
): Promise<BookingClientData | null> {
  try {
    const q    = query(bookingDataCol(), where("booking_id", "==", booking_id));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as BookingClientData;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteBookingDetailByID(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "booking_data", id));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}