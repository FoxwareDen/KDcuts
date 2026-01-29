import { addDays, parseISO, format, parse, addMonths, startOfDay, isAfter, isBefore, differenceInDays } from 'date-fns';
import type { Booking } from './booking';
import { client } from './db';

export interface Calendar {
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  days_of_week: number[];
  frequency?: "weekly";
  buffer_minutes?: number; // Buffer between appointments (default: 15)
}

export async function addCalenderEntries(calendars: Calendar[]) {
  try {
    const { error } = await client.from("calendar").insert(calendars);

    if (error) throw error;

    return calendars
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getCalenderEntries() {
  try {
    const { data } = await client.from("calendar").select("*");

    return data
  } catch (error) {
    console.error(error);
    return null;
  }
}

// TODO: ADD DELETE calander

export interface AvailableSlot {
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
}

export interface SlotGenerationConfig {
  slotDuration: number; // in minutes
  bufferMinutes: number; // buffer between slots (default: 15)
  minAdvanceDays: number; // minimum days in advance (default: 2)
  maxAdvanceMonths: number; // maximum months in advance (default: 2)
  businessStartHour?: number; // business hours start (0-23)
  businessEndHour?: number; // business hours end (0-23)
}

export async function insertSlotGenerationConfig(config: SlotGenerationConfig) {
  try {
    const { error } = await client.from("config").insert({
      id: 1,
      ...config
    });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getSlotGenerationConfig(): Promise<SlotGenerationConfig | null> {
  try {
    const { data } = await client.from("config").select("*").single();

    return data as SlotGenerationConfig;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function generateAvailableSlots(
  calendars: Calendar[],
  bookings: Booking[],
  startDate: string,
  endDate: string,
  config: SlotGenerationConfig = {
    slotDuration: 30,
    bufferMinutes: 15,
    minAdvanceDays: 2,
    maxAdvanceMonths: 2
  }
): AvailableSlot[] {
  const availableSlots: AvailableSlot[] = [];
  const today = startOfDay(new Date());
  const minBookingDate = addDays(today, config.minAdvanceDays);
  const maxBookingDate = addMonths(today, config.maxAdvanceMonths);

  const requestedStart = parseISO(startDate);
  const requestedEnd = parseISO(endDate);

  // Apply booking window constraints
  const actualStart = isAfter(requestedStart, minBookingDate) ? requestedStart : minBookingDate;
  const actualEnd = isBefore(requestedEnd, maxBookingDate) ? requestedEnd : maxBookingDate;

  // Don't proceed if start is after end or exceeds max booking window
  if (actualStart > actualEnd || actualStart > maxBookingDate) {
    return availableSlots;
  }

  // Process each day in the range
  for (let currentDate = actualStart; currentDate <= actualEnd; currentDate = addDays(currentDate, 1)) {
    const dayOfWeek = currentDate.getDay();
    const dateString = format(currentDate, 'yyyy-MM-dd');

    // Skip if it's less than minimum advance days
    if (differenceInDays(currentDate, today) < config.minAdvanceDays) {
      continue;
    }

    // Get all calendar entries that apply to this day
    const dayCalendars = calendars.filter(cal => {
      const calendarStart = parseISO(cal.start_date);
      const calendarEnd = cal.end_date ? parseISO(cal.end_date) : null;

      // Check if date is within calendar date range
      if (currentDate < calendarStart) return false;
      if (calendarEnd && currentDate > calendarEnd) return false;

      // Check if day of week matches
      return cal.days_of_week.includes(dayOfWeek);
    });

    // Get bookings for this date
    const dayBookings = bookings.filter(booking =>
      booking.date === dateString &&
      booking.status === "pending"
    );

    // Generate slots for each calendar entry
    dayCalendars.forEach(calendar => {
      const bufferMinutes = calendar.buffer_minutes || config.bufferMinutes;

      // Parse start and end times for this specific date
      const dayStart = startOfDay(currentDate);
      const effectiveStart = new Date(dayStart);
      const [startHour, startMinute] = calendar.start_time.split(':').map(Number);
      effectiveStart.setHours(startHour, startMinute, 0, 0);

      const effectiveEnd = new Date(dayStart);
      const [endHour, endMinute] = calendar.end_time.split(':').map(Number);
      effectiveEnd.setHours(endHour, endMinute, 0, 0);

      // If end time is earlier than start time, it means it spans to next day
      // For now, we'll assume end time is always after start time on the same day
      if (effectiveStart >= effectiveEnd) {
        console.warn(`Calendar ${calendar.start_date} has invalid time range: ${calendar.start_time} to ${calendar.end_time}`);
        return;
      }

      let currentSlotStart = effectiveStart;

      while (currentSlotStart < effectiveEnd) {
        const currentSlotEnd = new Date(currentSlotStart.getTime() + config.slotDuration * 60000);

        // Don't exceed effective end time
        if (currentSlotEnd > effectiveEnd) break;

        // Check buffer requirement for next booking
        const slotEndWithBuffer = new Date(currentSlotEnd.getTime() + bufferMinutes * 60000);
        if (slotEndWithBuffer > effectiveEnd) {
          // Not enough time for buffer, skip this slot
          currentSlotStart = new Date(currentSlotStart.getTime() + config.slotDuration * 60000);
          continue;
        }

        const slotStartStr = format(currentSlotStart, 'HH:mm');
        const slotEndStr = format(currentSlotEnd, 'HH:mm');

        // Check if this slot conflicts with any booking (including buffer)
        const isSlotBooked = dayBookings.some(booking => {
          const bookingStart = new Date(dayStart);
          const [bookingStartHour, bookingStartMinute] = booking.start_time.split(':').map(Number);
          bookingStart.setHours(bookingStartHour, bookingStartMinute, 0, 0);

          const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);

          // Add buffer around the booking
          const bookingStartWithBuffer = new Date(bookingStart.getTime() - bufferMinutes * 60000);
          const bookingEndWithBuffer = new Date(bookingEnd.getTime() + bufferMinutes * 60000);

          // Check for overlap with buffered booking
          return (
            (currentSlotStart >= bookingStartWithBuffer && currentSlotStart < bookingEndWithBuffer) ||
            (currentSlotEnd > bookingStartWithBuffer && currentSlotEnd <= bookingEndWithBuffer) ||
            (currentSlotStart <= bookingStartWithBuffer && currentSlotEnd >= bookingEndWithBuffer)
          );
        });

        if (!isSlotBooked) {
          availableSlots.push({
            date: dateString,
            start_time: slotStartStr,
            end_time: slotEndStr,
            duration: config.slotDuration
          });
        }

        // Move to next slot (include buffer)
        currentSlotStart = new Date(currentSlotEnd.getTime() + bufferMinutes * 60000);
      }
    });
  }

  return availableSlots;
}

// Helper function to validate booking time
export function validateBookingTime(
  desiredDate: string,
  desiredTime: string,
  duration: number,
  calendars: Calendar[],
  bookings: Booking[],
  config: SlotGenerationConfig
): { isValid: boolean; message?: string } {
  const today = new Date();
  const bookingDate = parseISO(desiredDate);
  const minBookingDate = addDays(today, config.minAdvanceDays);
  const maxBookingDate = addMonths(today, config.maxAdvanceMonths);

  // Check minimum advance
  if (bookingDate < minBookingDate) {
    return {
      isValid: false,
      message: `Bookings must be made at least ${config.minAdvanceDays} days in advance`
    };
  }

  // Check maximum advance
  if (bookingDate > maxBookingDate) {
    return {
      isValid: false,
      message: `Bookings can only be made up to ${config.maxAdvanceMonths} months in advance`
    };
  }

  // Check if slot is available
  const availableSlots = generateAvailableSlots(
    calendars,
    bookings,
    desiredDate,
    desiredDate,
    { ...config, slotDuration: duration }
  );

  // const bookingDateTime = parse(desiredTime, 'HH:mm', bookingDate);
  const isAvailable = availableSlots.some(slot => {
    const slotStart = parse(slot.start_time, 'HH:mm', bookingDate);
    return format(slotStart, 'HH:mm') === desiredTime;
  });

  if (!isAvailable) {
    return {
      isValid: false,
      message: 'This time slot is no longer available'
    };
  }

  return { isValid: true };
}

