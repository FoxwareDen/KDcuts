import { db } from "@/lib/firebase";
import type { Booking, BookingStatus } from "./booking";
import { isoToPgDate } from "./utils";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

export interface BookingDetails {
  email: string;
  phone: string;
  service?: string;
  name: string;
}

export interface BookingClientData {
  name: string;
  email: string;
  phone: string;
  service?: string;
  booking_id: string; // Firestore document ID of the booking
}

export async function addBooking(
  booking: {
    date: string;
    start_time: string;
    end_time: string;
    duration: number;
    user_id: string;
  },
  bookingDetails: BookingDetails
): Promise<boolean> {
  try {
    // 1. Create the booking document
    const cleanBookingData = {
      date: isoToPgDate(booking.date),
      start_time: booking.start_time,
      end_time: booking.end_time,
      duration: booking.duration,
      user_id: booking.user_id,
      status: "pending" as BookingStatus, // default status
      updated_at: serverTimestamp(),
    };

    const bookingRef = await addDoc(collection(db, "bookings"), cleanBookingData);

    // 2. Create the client details document
    const cleanClientData: BookingClientData = {
      service: bookingDetails.service,
      email: bookingDetails.email,
      phone: bookingDetails.phone,
      name: bookingDetails.name,
      booking_id: bookingRef.id,
    };

    await addDoc(collection(db, "bookings_clients"), cleanClientData);

    return true;
  } catch (error) {
    console.error(error as Error);
    return false;
  }
}

export async function getBookings(): Promise<Booking[] | null> {
  try {
    const querySnapshot = await getDocs(collection(db, "bookings"));
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bookings.push({
        id: doc.id, // Firestore document ID as string
        status: data.status,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        updated_at: data.updated_at?.toDate?.()?.toISOString() ?? null,
        duration: data.duration,
      });
    });

    return bookings;
  } catch (error) {
    console.error(error as Error);
    return null;
  }
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<boolean> {
  try {
    const bookingRef = doc(db, "bookings", id);
    await updateDoc(bookingRef, {
      status,
      updated_at: serverTimestamp(),
    });

    // If status is completed or cancelled, clear email/phone from client details
    if (status === "completed" || status === "cancelled") {
      const clientsQuery = query(
        collection(db, "bookings_clients"),
        where("booking_id", "==", id)
      );
      const querySnapshot = await getDocs(clientsQuery);

      if (!querySnapshot.empty) {
        const clientDoc = querySnapshot.docs[0];
        await updateDoc(clientDoc.ref, {
          email: "",
          phone: "",
        });
      } else {
        console.warn(`No client details found for booking ${id}`);
      }
    }

    return true;
  } catch (error) {
    console.error(error as Error);
    return false;
  }
}

export async function getBookingsByUserId(
  user_id: string
): Promise<Booking[] | null> {
  try {
    const q = query(collection(db, "bookings"), where("user_id", "==", user_id));
    const querySnapshot = await getDocs(q);
    const bookings: Booking[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      bookings.push({
        id: doc.id,
        status: data.status,
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
        updated_at: data.updated_at?.toDate?.()?.toISOString() ?? null,
        duration: data.duration,
      });
    });

    return bookings;
  } catch (error) {
    console.error(error as Error);
    return null;
  }
}

interface FullBooking extends Booking, BookingClientData {}

export async function getBulkBookings(): Promise<FullBooking[] | null> {
  try {
    const bookings = await getBookings();
    if (!bookings) return null;

    const fullBookings: FullBooking[] = [];

    for (const booking of bookings) {
      const clientData = await getBookingDetailsByID(booking.id);
      if (clientData) {
        fullBookings.push({
          ...booking,
          ...clientData,
        });
      }
    }

    return fullBookings;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateBooking(
  booking_id: string,
  data: Partial<Omit<Booking, "id" | "updated_at">>
): Promise<Booking | null> {
  try {
    const bookingRef = doc(db, "bookings", booking_id);
    const updateData = {
      ...data,
      updated_at: serverTimestamp(),
    };
    await updateDoc(bookingRef, updateData);

    const updatedDoc = await getDoc(bookingRef);
    if (!updatedDoc.exists()) throw new Error("Booking not found after update");

    const updatedData = updatedDoc.data();
    return {
      id: updatedDoc.id,
      status: updatedData.status,
      date: updatedData.date,
      start_time: updatedData.start_time,
      end_time: updatedData.end_time,
      updated_at: updatedData.updated_at?.toDate?.()?.toISOString() ?? null,
      duration: updatedData.duration,
    } as Booking;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getBookingDetailsByID(
  booking_id: string
): Promise<BookingClientData | null> {
  try {
    const q = query(
      collection(db, "bookings_clients"),
      where("booking_id", "==", booking_id)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();

    return {
      name: data.name,
      email: data.email,
      phone: data.phone,
      service: data.service,
      booking_id: data.booking_id,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteBookingDetailByID(
  id: string // document ID in bookings_clients
): Promise<BookingClientData | null> {
  try {
    const docRef = doc(db, "bookings_clients", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data() as BookingClientData;
    await deleteDoc(docRef);

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}