import { db } from "./firebase";
import { 
  collection, doc, 
  addDoc, setDoc, 
  getDoc, getDocs, 
  deleteDoc 
} from 'firebase/firestore';

import { convertCalendarToEntry, type CalendarEntry } from "./utils";

export interface Calendar {
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  days_of_week: number[];
  frequency?: "weekly";
  buffer_minutes?: number;
  user_id?: string
}

export interface AvailableSlot {
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
}

export interface SlotGenerationConfig {
  slotDuration: number;
  bufferMinutes: number;
  minAdvanceDays: number;
  maxAdvanceMonths: number;
  businessStartHour?: number;
  businessEndHour?: number;
}

export async function addCalenderEntries(calendars: Calendar[]): Promise<boolean> {
  try {
    const calendarEntries: CalendarEntry[] = calendars.map(convertCalendarToEntry);
    await Promise.all(
      calendarEntries.map((entry) => addDoc(collection(db, "calendar"), entry))
    );
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function addCalendarEntry(calendar: Calendar): Promise<CalendarEntry | null> {
  try {
    const docRef = await addDoc(collection(db, "calendar"), calendar);
    const snap = await getDoc(docRef);
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as unknown as CalendarEntry) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getCalenderEntries(): Promise<CalendarEntry[] | null> {
  try {
    const snap = await getDocs(collection(db, "calendar"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as CalendarEntry));
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteCalenderEntry(id: number): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "calendar", id.toString()));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function upsertSlotConfig(config: SlotGenerationConfig): Promise<boolean> {
  try {
    await setDoc(doc(db, "config", "1"), config);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getSlotGenerationConfig(): Promise<SlotGenerationConfig | null> {
  try {
    const snap = await getDoc(doc(db, "config", "1"));
    return snap.exists() ? (snap.data() as unknown as SlotGenerationConfig) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}