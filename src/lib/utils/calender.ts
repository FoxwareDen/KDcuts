import type { Calendar, SlotGenerationConfig, AvailableSlot } from "../../lib/calender";
import type { Booking } from "../../lib/booking";
import { addDays, addMonths, differenceInDays, format, isAfter, isBefore, parse, parseISO, startOfDay } from "date-fns";

/**
 * Main function to generate available time slots based on calendars and existing bookings
 * 
 * Think of this like a hotel room booking system:
 * 1. Calendars = Which rooms are available and when
 * 2. Bookings = Already booked reservations
 * 3. Config = Rules for how bookings work (min stay, buffer time, etc.)
 * 
 * @param calendars - List of calendar entries (when you're available)
 * @param bookings - List of existing bookings (when you're already booked)
 * @param startDate - Start date to look for slots (when user wants to start looking)
 * @param endDate - End date to look for slots (when user wants to stop looking)
 * @param config - Rules for slot generation (duration, buffer time, etc.)
 * @returns Array of available time slots
 */
export function generateAvailableSlots(
  calendars: Calendar[],
  bookings: Booking[],
  startDate: string,
  endDate: string,
  config: SlotGenerationConfig = {
    slotDuration: 40,
    bufferMinutes: 15,
    minAdvanceDays: 2,
    maxAdvanceMonths: 2
  }
): AvailableSlot[] {
  const availableSlots: AvailableSlot[] = [];

  // --------------------------------------------------------------------
  // STEP 1: SETUP & VALIDATION
  // Figure out when we can actually look for slots
  // --------------------------------------------------------------------

  // Today's date at midnight (so we're working with whole days)
  const today = startOfDay(new Date());

  // Earliest date someone can book (e.g., can't book within next 2 days)
  const minBookingDate = addDays(today, config.minAdvanceDays);

  // Latest date someone can book (e.g., can't book more than 2 months out)
  const maxBookingDate = addMonths(today, config.maxAdvanceMonths);

  // Convert the requested dates from strings to Date objects
  const requestedStart = parseISO(startDate);
  const requestedEnd = parseISO(endDate);

  // Apply the booking rules to get the actual search range
  // If user wants to start too early, use the minimum allowed date
  const actualStart = isAfter(requestedStart, minBookingDate) ? requestedStart : minBookingDate;

  // If user wants to look too far ahead, cap at maximum allowed date
  const actualEnd = isBefore(requestedEnd, maxBookingDate) ? requestedEnd : maxBookingDate;

  // Quick sanity check: stop if the start date is after end date or beyond max booking date
  if (actualStart > actualEnd || actualStart > maxBookingDate) {
    return availableSlots; // Return empty array
  }

  // --------------------------------------------------------------------
  // STEP 2: LOOP THROUGH EACH DAY IN THE RANGE
  // Check each day between actualStart and actualEnd
  // --------------------------------------------------------------------

  // For each day in our search range...
  for (let currentDate = actualStart; currentDate <= actualEnd; currentDate = addDays(currentDate, 1)) {

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = currentDate.getDay();

    // Format date as 'YYYY-MM-DD' string for easy comparison
    const dateString = format(currentDate, 'yyyy-MM-dd');

    // Double-check this day isn't too soon (even if we already filtered with minBookingDate)
    if (differenceInDays(currentDate, today) < config.minAdvanceDays) {
      continue; // Skip to next day
    }

    // --------------------------------------------------------------------
    // STEP 3: FIND WHICH CALENDARS APPLY TO THIS DAY
    // Like: "Which doctors are working on this specific Tuesday?"
    // --------------------------------------------------------------------

    const dayCalendars = calendars.filter(cal => {
      // Convert calendar start/end dates from strings to Date objects
      const calendarStart = parseISO(cal.start_date);
      const calendarEnd = cal.end_date ? parseISO(cal.end_date) : null;

      // Check 1: Is current date before the calendar starts?
      if (currentDate < calendarStart) return false;

      // Check 2: Is current date after the calendar ends?
      if (calendarEnd && currentDate > calendarEnd) return false;

      // Check 3: Does the calendar include this day of week?
      // Example: calendar might only work Mondays and Wednesdays
      return cal.days_of_week.includes(dayOfWeek);
    });

    // --------------------------------------------------------------------
    // STEP 4: FIND EXISTING BOOKINGS FOR THIS DAY
    // Like: "What appointments are already booked for this Tuesday?"
    // --------------------------------------------------------------------

    const dayBookings = bookings.filter(booking =>
      booking.date === dateString &&
      booking.status === "pending" // Only care about pending bookings
    );

    // --------------------------------------------------------------------
    // STEP 5: GENERATE SLOTS FOR EACH APPLICABLE CALENDAR
    // For each doctor/room available today, find open time slots
    // --------------------------------------------------------------------

    dayCalendars.forEach(calendar => {
      // Use calendar-specific buffer or default buffer
      const bufferMinutes = calendar.buffer_minutes || config.bufferMinutes;

      // --------------------------------------------------------------------
      // STEP 5A: CALCULATE WORKING HOURS FOR THIS DAY
      // When does this calendar start and end work today?
      // --------------------------------------------------------------------

      // Start with midnight on current date
      const dayStart = startOfDay(currentDate);

      // Set the actual start time (e.g., 9:00 AM)
      const effectiveStart = new Date(dayStart);
      const [startHour, startMinute] = calendar.start_time.split(':').map(Number);
      effectiveStart.setHours(startHour, startMinute, 0, 0);

      // Set the actual end time (e.g., 5:00 PM)
      const effectiveEnd = new Date(dayStart);
      const [endHour, endMinute] = calendar.end_time.split(':').map(Number);
      effectiveEnd.setHours(endHour, endMinute, 0, 0);

      // Safety check: start time should be before end time
      if (effectiveStart >= effectiveEnd) {
        console.warn(`Calendar ${calendar.start_date} has invalid time range: ${calendar.start_time} to ${calendar.end_time}`);
        return; // Skip this calendar entry
      }

      // --------------------------------------------------------------------
      // STEP 5B: GENERATE TIME SLOTS
      // Start at 9:00 AM, create 40-minute slots until 5:00 PM
      // --------------------------------------------------------------------

      let currentSlotStart = effectiveStart; // Start at opening time

      // Keep creating slots until we hit closing time
      while (currentSlotStart < effectiveEnd) {
        // Slot ends slotDuration minutes after it starts (e.g., 40 minutes)
        const currentSlotEnd = new Date(currentSlotStart.getTime() + config.slotDuration * 60000);

        // Don't create a slot that would go past closing time
        if (currentSlotEnd > effectiveEnd) break;

        // --------------------------------------------------------------------
        // STEP 5C: CHECK IF THERE'S ROOM FOR BUFFER AFTER THE SLOT
        // We need X minutes of buffer after each slot (cleanup/prep time)
        // --------------------------------------------------------------------

        const slotEndWithBuffer = new Date(currentSlotEnd.getTime() + bufferMinutes * 60000);
        if (slotEndWithBuffer > effectiveEnd) {
          // Not enough time for buffer after this slot
          currentSlotStart = new Date(currentSlotStart.getTime() + config.slotDuration * 60000);
          continue; // Skip to next potential slot start time
        }

        // Format start and end times as strings for output
        const slotStartStr = format(currentSlotStart, 'HH:mm');
        const slotEndStr = format(currentSlotEnd, 'HH:mm');

        // --------------------------------------------------------------------
        // STEP 5D: CHECK IF SLOT CONFLICTS WITH EXISTING BOOKINGS
        // Does this time slot overlap with any existing appointment?
        // --------------------------------------------------------------------

        const isSlotBooked = dayBookings.some(booking => {
          // Convert booking start time string to Date object
          const bookingStart = new Date(dayStart);
          const [bookingStartHour, bookingStartMinute] = booking.start_time.split(':').map(Number);
          bookingStart.setHours(bookingStartHour, bookingStartMinute, 0, 0);

          // Calculate when the booking ends
          const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);

          // Add buffer around the booking (cleanup before and after)
          const bookingStartWithBuffer = new Date(bookingStart.getTime() - bufferMinutes * 60000);
          const bookingEndWithBuffer = new Date(bookingEnd.getTime() + bufferMinutes * 60000);

          // Check if our potential slot overlaps with this buffered booking
          return (
            // Does slot start during a buffered booking?
            (currentSlotStart >= bookingStartWithBuffer && currentSlotStart < bookingEndWithBuffer) ||

            // Does slot end during a buffered booking?
            (currentSlotEnd > bookingStartWithBuffer && currentSlotEnd <= bookingEndWithBuffer) ||

            // Does slot completely contain a buffered booking?
            (currentSlotStart <= bookingStartWithBuffer && currentSlotEnd >= bookingEndWithBuffer)
          );
        });

        // --------------------------------------------------------------------
        // STEP 5E: IF SLOT IS AVAILABLE, ADD IT TO THE LIST
        // --------------------------------------------------------------------

        if (!isSlotBooked) {
          availableSlots.push({
            date: dateString,
            start_time: slotStartStr,
            end_time: slotEndStr,
            duration: config.slotDuration
          });
        }

        // --------------------------------------------------------------------
        // STEP 5F: MOVE TO NEXT POTENTIAL SLOT START TIME
        // Skip ahead by (slot duration + buffer) so we don't double-book
        // --------------------------------------------------------------------

        // Move to time after this slot ends, including buffer time
        currentSlotStart = new Date(currentSlotEnd.getTime() + bufferMinutes * 60000);
      }
    });
  }

  return availableSlots;
}

// --------------------------------------------------------------------
// VISUAL EXAMPLE OF HOW THIS WORKS:
// --------------------------------------------------------------------
/*
CALENDAR: Mon-Fri, 9:00 AM - 5:00 PM
BOOKINGS: 10:00 AM - 11:00 AM appointment
CONFIG: 40-min slots, 15-min buffer

DAY: Tuesday, 2024-01-16

Step-by-step:
1. Start at 9:00 AM
2. Create slot 9:00-9:40 ✓ (No conflict with 10:00 booking)
3. Add to availableSlots ✓
4. Jump to 9:55 AM (9:40 + 15 min buffer) 
5. Create slot 9:55-10:35 ✗ (Overlaps with 10:00 booking + buffer)
6. Skip this slot
7. Jump to 10:50 AM (10:35 + 15 min buffer)
8. Create slot 10:50-11:30 ✗ (Overlaps with 10:00 booking + buffer)
9. Skip this slot
10. Jump to 11:45 AM (11:30 + 15 min buffer)
11. Create slot 11:45-12:25 ✓ (No conflict)
12. Add to availableSlots ✓
13. Continue until 4:20 PM (last possible 40-min slot)
*/
