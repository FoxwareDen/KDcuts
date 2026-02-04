import { Calendar, Clock, X, Info, AlertCircle } from "lucide-react";
import { useState } from "react";
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
} from "date-fns";

// Types matching your backend structure
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
  onSlotSelect
}: TimeSlotSelectorProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [_selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  // Calculate booking window
  const today = new Date();
  const minBookingDate = addDays(today, minAdvanceDays);
  const maxBookingDate = addMonths(today, maxAdvanceMonths);

  // Format date to YYYY-MM-DD
  const formatDateKey = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  // Group slots by date
  const slotsByDate = slots.reduce((acc: Record<string, AvailableSlot[]>, slot) => {
    const dateKey = slot.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {});

  // Get all days for current month view
  const getMonthDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  };

  // Check if date has available slots
  const hasSlots = (date: Date) => {
    const dateKey = formatDateKey(date);
    return slotsByDate[dateKey] && slotsByDate[dateKey].length > 0;
  };

  // Check if date is within booking window
  const isWithinBookingWindow = (date: Date) => {
    return isAfter(date, minBookingDate) && isBefore(date, maxBookingDate);
  };

  // Check if date is selectable
  const isDateSelectable = (date: Date) => {
    return hasSlots(date) && isWithinBookingWindow(date);
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date)) return;
    setSelectedDate(date);
    setShowModal(true);
  };

  // Handle slot selection
  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setShowModal(false);
    if (onSlotSelect) {
      onSlotSelect(slot);
    }
  };

  // Navigation
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Get slots for selected date
  const selectedDateSlots = selectedDate ? slotsByDate[formatDateKey(selectedDate)] || [] : [];

  // Sort slots by time
  const sortedSelectedDateSlots = [...selectedDateSlots].sort((a, b) =>
    a.start_time.localeCompare(b.start_time)
  );

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Format time display
  // const _formatTimeDisplay = (slot: AvailableSlot) => {
  //   return `${slot.start_time} - ${slot.end_time}`;
  // };

  // Get day class based on availability
  const getDayClass = (date: Date) => {
    // const _dateKey = formatDateKey(date);
    const isSelectable = isDateSelectable(date);
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isToday = isTodayDate(date);

    if (!isCurrentMonth) {
      return "text-gray-300 cursor-default";
    }

    if (!isSelectable) {
      return "bg-gray-100 text-gray-400 cursor-not-allowed";
    }

    if (isToday) {
      return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-2 border-blue-500 cursor-pointer";
    }

    return "bg-green-500 text-white hover:bg-green-600 hover:scale-102 cursor-pointer shadow-sm";
  };

  // Get day title based on status
  const getDayTitle = (date: Date) => {
    if (!isSameMonth(date, currentMonth)) return "Not in current month";

    if (!isWithinBookingWindow(date)) {
      if (isBefore(date, minBookingDate)) {
        return `Bookings start from ${format(minBookingDate, 'MMM d')}`;
      } else {
        return `Bookings only up to ${format(maxBookingDate, 'MMM d')}`;
      }
    }

    if (!hasSlots(date)) {
      return "No available slots";
    }

    return "Click to view available times";
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-7 h-7 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Select Appointment Date</h2>
          <p className="text-sm text-gray-600 mt-1">
            Bookings available from {format(minBookingDate, 'MMM d')} to {format(maxBookingDate, 'MMM d')}
          </p>
        </div>
      </div>

{/* Calendar Container */}
<div className="bg-white p-6 mb-6">
        {/* Calendar Navigation */}
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
            {format(currentMonth, 'MMMM yyyy')}
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

        {/* Day Names */}
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

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {getMonthDays().map((date, index) => {
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
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                `}
              >
                <span className={`text-base ${isToday ? 'font-bold' : ''}`}>
                  {dayNumber}
                </span>
                {hasSlots(date) && isWithinBookingWindow(date) && (
                  <div className="flex gap-0.5 mt-1.5">
                    {[1, 2, 3].map((dot) => (
                      <div
                        key={dot}
                        className="w-1 h-1 bg-current rounded-full opacity-60"
                      />
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

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 bg-green-500 rounded-md shadow-sm"></div>
              <span className="text-gray-700 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full  shadow-sm"></div>
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
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Select Time
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
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

            {/* Modal Body */}
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
                  <p className="text-sm text-gray-500 mt-1">
                    Please select another date
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
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
