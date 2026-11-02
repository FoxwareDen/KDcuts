import { Calendar, Clock, X, Info, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday as isTodayDate,
  addMonths,
  addDays,
  isBefore,
  isAfter,
  getDay,
} from "date-fns";

interface AvailableSlot {
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
}

interface TimeSlotSelectorProps {
  slots: AvailableSlot[];
  minAdvanceDays?: number;
  maxAdvanceMonths?: number;
  onSlotSelect?: (slot: AvailableSlot) => void;
}

export default function TimeSlotSelector({
  slots,
  minAdvanceDays = 2,
  maxAdvanceMonths = 2,
  onSlotSelect,
}: TimeSlotSelectorProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [_selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [confirmedSlot, setConfirmedSlot] = useState<AvailableSlot | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [progressWidth, setProgressWidth] = useState(100);

  // Auto-dismiss confirmation after 5s with a progress bar
useEffect(() => {
  if (!showConfirmation) return;

  // setProgressWidth(100);  ← remove this line

  const progressInterval = setInterval(() => {
    setProgressWidth((prev) => {
      if (prev <= 0) return 0;
      return prev - 2;
    });
  }, 100);

  const dismissTimer = setTimeout(() => {
    setShowConfirmation(false);
  }, 5000);

  return () => {
    clearInterval(progressInterval);
    clearTimeout(dismissTimer);
  };
}, [showConfirmation]);

  const today = new Date();
  const minBookingDate = addDays(today, minAdvanceDays);
  const maxBookingDate = addMonths(today, maxAdvanceMonths);

  const formatDateKey = (date: Date) => format(date, "yyyy-MM-dd");

  const slotsByDate = slots.reduce((acc: Record<string, AvailableSlot[]>, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  const getMonthDays = () => {
    const monthDays = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });
    
    // Get the day of week the month starts on (0 = Sunday, 6 = Saturday)
    const firstDay = startOfMonth(currentMonth);
    const startingDayOfWeek = getDay(firstDay);
    
    // Add empty placeholders for days before the month starts
    const emptyDays = Array(startingDayOfWeek).fill(null);
    return [...emptyDays, ...monthDays];
  };

  const hasSlots = (date: Date) => {
    const key = formatDateKey(date);
    return slotsByDate[key] && slotsByDate[key].length > 0;
  };

  const isWithinBookingWindow = (date: Date) =>
    isAfter(date, minBookingDate) && isBefore(date, maxBookingDate);

  const isDateSelectable = (date: Date) =>
    hasSlots(date) && isWithinBookingWindow(date);

  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date)) return;
    setSelectedDate(date);
    setShowModal(true);
  };

const handleSlotSelect = (slot: AvailableSlot) => {
  setSelectedSlot(slot);
  setConfirmedSlot(slot);
  setShowModal(false);
  setProgressWidth(100);      // ← moved here
  setShowConfirmation(true);
  if (onSlotSelect) onSlotSelect(slot);
};

  const previousMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const selectedDateSlots = selectedDate
    ? slotsByDate[formatDateKey(selectedDate)] || []
    : [];

  const sortedSelectedDateSlots = [...selectedDateSlots].sort((a, b) =>
    a.start_time.localeCompare(b.start_time)
  );

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDayClass = (date: Date) => {
    const isSelectable = isDateSelectable(date);
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isToday = isTodayDate(date);

    if (!isCurrentMonth) return "text-gray-300 cursor-default";
    if (!isSelectable) return "bg-gray-100 text-gray-400 cursor-not-allowed";
    if (isToday)
      return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-2 border-blue-500 cursor-pointer";
    return "bg-green-500 text-white hover:bg-green-600 cursor-pointer shadow-sm";
  };

  const getDayTitle = (date: Date) => {
    if (!isSameMonth(date, currentMonth)) return "Not in current month";
    if (!isWithinBookingWindow(date)) {
      if (isBefore(date, minBookingDate))
        return `Bookings start from ${format(minBookingDate, "MMM d")}`;
      return `Bookings only up to ${format(maxBookingDate, "MMM d")}`;
    }
    if (!hasSlots(date)) return "No available slots";
    return "Click to view available times";
  };

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* ── CONFIRMATION TOAST ── */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
          showConfirmation
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        style={{ width: "min(420px, calc(100vw - 2rem))" }}
      >
        <div className="bg-white rounded-xl shadow-2xl border border-green-100 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-green-500 transition-all duration-100 ease-linear"
              style={{ width: `${progressWidth}%` }}
            />
          </div>

          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">
                  Time slot added!
                </p>
                {confirmedSlot && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {confirmedSlot.date} &middot; {confirmedSlot.start_time} – {confirmedSlot.end_time}
                  </p>
                )}
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    document
                      .getElementById("booking-details")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  Scroll down to continue
                  <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
                </button>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-shrink-0 p-1 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-7 h-7 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-gray-800">Select Appointment Date</h2>
          <p className="text-sm text-gray-600 mt-1">
            Bookings available from {format(minBookingDate, "MMM d")} to{" "}
            {format(maxBookingDate, "MMM d")}
          </p>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="bg-white p-6 mb-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={previousMonth}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 transition-all hover:shadow-sm"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <button
            onClick={nextMonth}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 transition-all hover:shadow-sm"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-gray-500 text-xs uppercase tracking-wider py-3"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {getMonthDays().map((date, index) => {
            // Empty cells for days before month starts
            if (!date) {
              return <div key={`empty-${index}`} />;
            }

            const dayNumber = date.getDate();
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isToday = isTodayDate(date);
            const isSelectable = isDateSelectable(date);

            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                disabled={!isSelectable}
                title={getDayTitle(date)}
                className={`
                  aspect-square rounded-xl font-medium transition-all duration-200
                  flex flex-col items-center justify-center relative
                  hover:scale-105 active:scale-95
                  ${getDayClass(date)}
                  ${!isCurrentMonth ? "opacity-30" : ""}
                `}
              >
                <span className={`text-base ${isToday ? "font-bold" : ""}`}>
                  {dayNumber}
                </span>
                {hasSlots(date) && isWithinBookingWindow(date) && (
                  <div className="flex gap-0.5 mt-1.5">
                    {[1, 2, 3].map((dot) => (
                      <div key={dot} className="w-1 h-1 bg-current rounded-full opacity-60" />
                    ))}
                  </div>
                )}
                {isToday && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-sm" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 bg-green-500 rounded-md shadow-sm"></div>
              <span className="text-gray-700 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-sm"></div>
              <span className="text-gray-700 font-medium">Today</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 bg-gray-50 rounded-md border border-gray-300 shadow-sm"></div>
              <span className="text-gray-700 font-medium">Unavailable</span>
            </div>
            <div className="flex items-center gap-2.5 text-amber-600">
              <Info className="w-4 h-4" />
              <span className="font-medium">Hover for details</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Slot Modal */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Select Time
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {sortedSelectedDateSlots.length > 0 ? (
                <div className="space-y-3">
                  {sortedSelectedDateSlots.map((slot, index) => (
                    <button
                      key={`${slot.date}-${slot.start_time}-${index}`}
                      onClick={() => handleSlotSelect(slot)}
                      className="w-full text-left p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                            <Clock className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {slot.start_time} - {slot.end_time}
                            </div>
                            <div className="text-sm text-gray-600">
                              {slot.duration} minute appointment
                            </div>
                          </div>
                        </div>
                        <div className="text-blue-600 font-medium group-hover:text-blue-700">
                          Select →
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No time slots available</p>
                  <p className="text-sm text-gray-500 mt-1">Please select another date</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Info className="w-4 h-4" />
                <span>All times are in your local timezone</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}