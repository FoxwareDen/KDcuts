import { auth, db } from "./firebase";
import { 
  collection, doc, 
  addDoc, setDoc, 
  getDoc, getDocs, 
  deleteDoc, 
  Timestamp
} from "firebase/firestore";
import { convertCalendarToEntry, type CalendarEntry } from "./utils";

export interface Calendar {
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  days_of_week: number[];
  frequency?: "weekly";
  buffer_minutes?: number;
  user_id?: string | null;  // optional – set to null if not logged in
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

// Helper to get current user ID (returns null if not logged in, no error)
function getCurrentUserId(): string | null {
  const user = auth?.currentUser ?? null; // if you have auth imported, else just null
  return user ? user.uid : null;
}

// Public reads – no authentication required
export async function getCalenderEntries(): Promise<CalendarEntry[] | null> {
  try {
    const snap = await getDocs(collection(db, "calendar"));
    return snap.docs.map((d) => {
      const data = d.data();
      // Convert Firestore Timestamps to YYYY-MM-DD strings
      if (data.start_date instanceof Timestamp) {
        data.start_date = data.start_date.toDate().toISOString().split("T")[0];
      }
      if (data.end_date instanceof Timestamp) {
        data.end_date = data.end_date.toDate().toISOString().split("T")[0];
      }
      return { id: d.id, ...data } as unknown as CalendarEntry;
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getSlotGenerationConfig(): Promise<SlotGenerationConfig | null> {
  try {
    const snap = await getDoc(doc(db, "config", "1"));
    return snap.exists() ? (snap.data() as SlotGenerationConfig) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Writes – attach user_id if logged in, otherwise store null
export async function addCalenderEntries(calendars: Calendar[]): Promise<boolean> {
  try {
    const userId = getCurrentUserId(); // may be null
    const entries = calendars.map(cal => ({
      ...convertCalendarToEntry(cal),
      user_id: userId, // store null if not logged in
    }));
    await Promise.all(
      entries.map((entry) => addDoc(collection(db, "calendar"), entry))
    );
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function addCalendarEntry(calendar: Calendar): Promise<CalendarEntry | null> {
  try {
    const userId = getCurrentUserId();
    const data = { ...calendar, user_id: userId };
    const docRef = await addDoc(collection(db, "calendar"), data);
    const snap = await getDoc(docRef);
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as unknown as CalendarEntry) : null;
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