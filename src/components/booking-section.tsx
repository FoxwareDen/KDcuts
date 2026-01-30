import { useState, useEffect } from "react";
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
import { Clock, ArrowRight, Calendar as Cal, X } from "lucide-react";
import { generateAvailableSlots, getCalenderEntries, getSlotGenerationConfig, validateBookingTime, type AvailableSlot, type SlotGenerationConfig } from "@/lib/calender";
import { addDays, addMonths, format, parseISO } from "date-fns";
import { addBooking, getBookings, type Booking } from "@/lib/booking";
import TimeSlotSelector from "./TimeSlotSelector";
import { useAuthSession } from "@/lib/auth";
import useFetch from "@/hooks/useFetch";

const services = [
  { id: "classic-cut", name: "Classic Haircut", price: 100, duration: 40 },
  { id: "beard-trim", name: "Beard Trim & Shape", price: 100, duration: 40 },
  { id: "full-service", name: "The Full Experience", price: 100, duration: 40 },
];


const fetchAndGenerateAvalibleSlots = async () => {
  const calendars = await getCalenderEntries();

  if (!calendars) throw new Error("Failed to fetch calender entries");

  const bookings = await getBookings() as Booking[] | null;
  //
  if (!bookings) throw new Error("Failed to fetch bookings");

  const slotGenerationConfig = await getSlotGenerationConfig();

  if (!slotGenerationConfig) throw new Error("Failed to fetch slot generation config");


  const today = new Date();
  const startDate = format(addDays(today, Number(slotGenerationConfig.minAdvanceDays || 2)), 'yyyy-MM-dd');
  const endDate = format(addMonths(today, Number(slotGenerationConfig.maxAdvanceMonths || 1)), 'yyyy-MM-dd');

  // Generate available slots with constraints
  const config: SlotGenerationConfig = {
    slotDuration: slotGenerationConfig.slotDuration || 40,
    bufferMinutes: slotGenerationConfig.bufferMinutes || 15, // 15-minute buffer
    minAdvanceDays: slotGenerationConfig.minAdvanceDays || 2, // Book at least 2 days in advance
    maxAdvanceMonths: slotGenerationConfig.maxAdvanceMonths || 2, // Book up to 2 months in advance
    businessStartHour: slotGenerationConfig.businessStartHour || 8,
    businessEndHour: slotGenerationConfig.businessEndHour || 18
  };

  const availableSlots = generateAvailableSlots(
    calendars,
    bookings,
    startDate,
    endDate,
    config
  );

  // Validate a specific booking
  const validation = validateBookingTime(
    "2026-01-15",
    "11:15",
    40,
    calendars,
    bookings,
    config
  );

  console.log(availableSlots);

  return availableSlots
};

// Simulated barber availability (in real app, this would come from a database/API)

export function BookingSection() {
  const { user } = useAuthSession();
  // page state
  // TODO: tied page state to loading of slots and handle submition  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const { data: availableSlots, loading: isLoadingSlots, error: slotsError } = useFetch<AvailableSlot[]>(fetchAndGenerateAvalibleSlots);

  const [selectedService, setSelectedService] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const selectedServiceData = services.find((s) => s.id === selectedService);

  // TODO: check of time slot selected
  const canSubmit = selectedSlot && selectedServiceData;

  const handleSubmit = async () => {
    if (canSubmit && selectedSlot) {
      setIsLoading(true);
      try {
        // TODO: add feed back if failed bool red
        const res = await addBooking({
          date: selectedSlot.date,
          start_time: selectedSlot.start_time + ':00', // Add seconds
          end_time: selectedSlot.end_time + ':00',     // Add seconds  
          duration: Number(selectedSlot.duration),
          user_id: user?.user.id || null
        }, {
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          service: selectedServiceData?.name
        })


      } catch (error) {
        console.error(error);
        setError(`Something went wrong: ${error}`);
      } finally {
        setIsLoading(false);
      }
    }

  };


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


        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Calendar */}
            <div className="rounded-xl border border-border bg-background p-6">
              <TimeSlotSelector slots={availableSlots || []} onSlotSelect={(slot) => setSelectedSlot(slot)} />
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

                {selectedSlot && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-blue-900 flex items-center gap-2">
                          <Cal className="w-4 h-4" />
                          Appointment Selected
                        </h4>
                        <p className="text-sm text-blue-800 mt-1">
                          {format(parseISO(selectedSlot.date), 'EEEE, MMMM d, yyyy')}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                            {selectedSlot.duration} min
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedSlot(null)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Clear selection"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}


              </div>

              {/* Continue Button */}
              <Button
                className="w-full"
                size="lg"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                Confirm Booking
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
