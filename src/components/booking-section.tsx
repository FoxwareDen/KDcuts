import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addDays } from "date-fns";
import { CalendarDays, Clock, User, ArrowRight } from "lucide-react";
import type { BookingDetails } from "@/routes";

const services = [
  { id: "classic-cut", name: "Classic Haircut", price: 100, duration: 30 },
  { id: "beard-trim", name: "Beard Trim & Shape", price: 100, duration: 20 },
  { id: "full-service", name: "The Full Experience", price: 100, duration: 45 },
];

// Simulated barber availability (in real app, this would come from a database/API)
const generateAvailableSlots = (date: Date): string[] => {
  // Closed on Sundays
  if (date.getDay() === 0) return [];

  // Different hours on Saturday
  if (date.getDay() === 6) {
    return ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM"];
  }

  // Regular weekday hours
  const baseSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
  ];

  // Simulate some slots being taken (random for demo)
  const seed = date.getDate() + date.getMonth();
  return baseSlots.filter((_, index) => (index + seed) % 3 !== 0);
};

interface BookingSectionProps {
  onBookingConfirmed: (booking: BookingDetails) => void;
}

export function BookingSection({ onBookingConfirmed }: BookingSectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return generateAvailableSlots(selectedDate);
  }, [selectedDate]);

  const selectedServiceData = services.find((s) => s.id === selectedService);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(""); // Reset time when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const canProceedToStep2 =
    selectedDate && selectedTime && selectedService;
  const canSubmit =
    canProceedToStep2 &&
    formData.name &&
    formData.email &&
    formData.phone;

  const handleSubmit = () => {
    if (canSubmit && selectedDate) {
      onBookingConfirmed({
        date: selectedDate,
        time: selectedTime,
        service: selectedServiceData?.name || "",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
    }
  };

  // Disable past dates and Sundays
  const disabledDays = [
    { before: new Date() },
    { dayOfWeek: [0] }, // Sundays
  ];

  return (
    <section
      id="booking"
      className="scroll-mt-20 bg-secondary py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
            Book Your Appointment
          </p>
          <h3 className="text-3xl font-bold text-foreground md:text-4xl">
            Select your preferred slot
          </h3>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Choose a date and time that works for you. All appointments include
            a complimentary beverage.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10 flex items-center justify-center gap-4">
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 ${step === 1
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
              }`}
          >
            <CalendarDays className="size-4" />
            <span className="text-sm font-medium">Select Slot</span>
          </div>
          <ArrowRight className="size-4 text-muted-foreground" />
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 ${step === 2
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
              }`}
          >
            <User className="size-4" />
            <span className="text-sm font-medium">Your Details</span>
          </div>
        </div>

        <div className="mx-auto max-w-4xl">
          {step === 1 && (
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Calendar */}
              <div className="rounded-xl border border-border bg-background p-6">
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays className="size-5 text-primary" />
                  <h4 className="font-semibold text-foreground">
                    Choose a Date
                  </h4>
                </div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={disabledDays}
                  fromDate={new Date()}
                  toDate={addDays(new Date(), 30)}
                  className="mx-auto w-full"
                />
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Closed on Sundays
                </p>
              </div>

              {/* Time Slots & Service Selection */}
              <div className="flex flex-col gap-6">
                {/* Service Selection */}
                <div className="rounded-xl border border-border bg-background p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Clock className="size-5 text-primary" />
                    <h4 className="font-semibold text-foreground">
                      Select Service
                    </h4>
                  </div>
                  <Select
                    value={selectedService}
                    onValueChange={setSelectedService}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <span className="flex items-center justify-between gap-4">
                            <span>{service.name}</span>
                            <span className="text-muted-foreground">
                              ${service.price} • {service.duration}min
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Slots */}
                <div className="flex-1 rounded-xl border border-border bg-background p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Clock className="size-5 text-primary" />
                    <h4 className="font-semibold text-foreground">
                      Available Times
                    </h4>
                    {selectedDate && (
                      <span className="ml-auto text-sm text-muted-foreground">
                        {format(selectedDate, "EEEE, MMM d")}
                      </span>
                    )}
                  </div>

                  {!selectedDate ? (
                    <p className="py-8 text-center text-muted-foreground">
                      Please select a date first
                    </p>
                  ) : availableSlots.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      No available slots on this day
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {availableSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className={`h-10 ${selectedTime === time
                            ? "bg-primary text-primary-foreground"
                            : "hover:border-primary hover:text-primary"
                            }`}
                          onClick={() => handleTimeSelect(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Continue Button */}
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!canProceedToStep2}
                  onClick={() => setStep(2)}
                >
                  Continue to Details
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Booking Summary */}
              <div className="rounded-xl border border-border bg-background p-6">
                <h4 className="mb-6 font-semibold text-foreground">
                  Booking Summary
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium text-foreground">
                      {selectedServiceData?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-foreground">
                      {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium text-foreground">
                      {selectedTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium text-foreground">
                      {selectedServiceData?.duration} minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-semibold text-foreground">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      ${selectedServiceData?.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Details Form */}
              <div className="rounded-xl border border-border bg-background p-6">
                <h4 className="mb-6 font-semibold text-foreground">
                  Your Details
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                  >
                    Confirm Booking
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
