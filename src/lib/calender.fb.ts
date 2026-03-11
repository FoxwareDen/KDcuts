import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./db.fb";

export interface Calendar {
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  days_of_week: number[];
  frequency?: "weekly";
  buffer_minutes?: number;
  user_id?: string;
}

export interface CalendarEntry extends Calendar {
  id: string; // was number — Firestore uses string IDs
  created_at: string;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calendarCol = () => collection(db, "calendar");
const configCol   = () => collection(db, "config");

function docToCalendarEntry(id: string, d: Record<string, any>): CalendarEntry {
  return {
    id,
    start_date:     d.start_date,
    end_date:       d.end_date ?? undefined,
    start_time:     d.start_time,
    end_time:       d.end_time,
    days_of_week:   d.days_of_week,
    frequency:      d.frequency ?? undefined,
    buffer_minutes: d.buffer_minutes ?? undefined,
    user_id:        d.user_id ?? undefined,
    created_at:     d.created_at ?? "",
  };
}

// ─── Functions ────────────────────────────────────────────────────────────────

export async function addCalenderEntries(calendars: Calendar[]): Promise<Calendar[] | null> {
  try {
    await Promise.all(
      calendars.map((calendar) =>
        addDoc(calendarCol(), {
          start_date:     calendar.start_date,
          end_date:       calendar.end_date ?? null,
          start_time:     calendar.start_time,
          end_time:       calendar.end_time,
          days_of_week:   calendar.days_of_week,
          frequency:      calendar.frequency ?? null,
          buffer_minutes: calendar.buffer_minutes ?? null,
          user_id:        calendar.user_id ?? null,
          created_at:     serverTimestamp(),
        })
      )
    );

    return calendars;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function addCalendarEntry(calendar: Calendar): Promise<CalendarEntry | null> {
  try {
    const ref = await addDoc(calendarCol(), {
      start_date:     calendar.start_date,
      end_date:       calendar.end_date ?? null,
      start_time:     calendar.start_time,
      end_time:       calendar.end_time,
      days_of_week:   calendar.days_of_week,
      frequency:      calendar.frequency ?? null,
      buffer_minutes: calendar.buffer_minutes ?? null,
      user_id:        calendar.user_id ?? null,
      created_at:     serverTimestamp(),
    });

    return {
      id:             ref.id,
      start_date:     calendar.start_date,
      end_date:       calendar.end_date,
      start_time:     calendar.start_time,
      end_time:       calendar.end_time,
      days_of_week:   calendar.days_of_week,
      frequency:      calendar.frequency,
      buffer_minutes: calendar.buffer_minutes,
      user_id:        calendar.user_id,
      created_at:     new Date().toISOString(),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getCalenderEntries(): Promise<CalendarEntry[] | null> {
  try {
    const snap = await getDocs(calendarCol());
    return snap.docs.map((d) => docToCalendarEntry(d.id, d.data()));
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function deleteCalenderEntry(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "calendar", id));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function upsertSlotConfig(config: SlotGenerationConfig): Promise<boolean> {
  try {
    const snap = await getDocs(configCol());

    const payload = {
      slotduration:      config.slotDuration,
      bufferminutes:     config.bufferMinutes,
      minadvancedays:    config.minAdvanceDays,
      maxadvancemonths:  config.maxAdvanceMonths,
      businessstarthour: config.businessStartHour ?? null,
      businessendhour:   config.businessEndHour ?? null,
    };

    if (snap.empty) {
      // No config document yet — create one
      await addDoc(configCol(), { ...payload, created_at: serverTimestamp() });
    } else {
      // Update the first (and only) config document
      const { updateDoc } = await import("firebase/firestore");
      await updateDoc(snap.docs[0].ref, payload);
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getSlotGenerationConfig(): Promise<{
  slotduration: number;
  bufferminutes: number;
  minadvancedays: number;
  maxadvancemonths: number;
  businessstarthour?: number;
  businessendhour?: number;
} | null> {
  try {
    const snap = await getDocs(configCol());

    if (snap.empty) return null;

    const d = snap.docs[0].data();

    return {
      slotduration:      d.slotduration,
      bufferminutes:     d.bufferminutes,
      minadvancedays:    d.minadvancedays,
      maxadvancemonths:  d.maxadvancemonths,
      businessstarthour: d.businessstarthour ?? undefined,
      businessendhour:   d.businessendhour ?? undefined,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}