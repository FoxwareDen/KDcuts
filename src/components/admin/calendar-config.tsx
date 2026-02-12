import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as C } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Clock,
  CalendarDays,
  Repeat,
  Loader2,
} from "lucide-react";
import { addCalendarEntry, deleteCalenderEntry, getCalenderEntries, getSlotGenerationConfig, upsertSlotConfig, type Calendar, type SlotGenerationConfig } from "@/lib/calender";
import { getUserSession, type MetaData } from "@/lib/db";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fullDayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Client-side wrapper to add id
interface CalendarWithId extends Calendar, MetaData {
}

const initialConfig: SlotGenerationConfig = {
  slotDuration: 30,
  bufferMinutes: 15,
  minAdvanceDays: 2,
  maxAdvanceMonths: 2,
  businessStartHour: 9,
  businessEndHour: 18,
};

function TimeSelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {hours.map((hour) => (
            <SelectItem key={hour} value={`${hour.toString().padStart(2, "0")}:00:00`}>
              {hour.toString().padStart(2, "0")}:00
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function CalendarEntryCard({
  entry,
  onDelete,
}: {
  entry: CalendarWithId;
  onDelete: (id: string) => void;
}) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDateRange = () => {
    if (!entry.end_date || entry.start_date === entry.end_date) {
      return new Date(entry.start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return `${new Date(entry.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(entry.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  return (
    <Card className="border-border border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate font-medium text-foreground">
                Availability Slot
              </h4>
            </div>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-3.5" />
                <span>{formatDateRange()}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-3.5" />
                <span>
                  {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                </span>
              </div>

              {entry.days_of_week.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Repeat className="size-3.5" />
                  <span>
                    {entry.days_of_week.map((d) => dayNames[d]).join(", ")}
                  </span>
                </div>
              )}

              {entry.frequency && (
                <Badge variant="secondary" className="mt-2 text-xs capitalize">
                  {entry.frequency}
                </Badge>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="size-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(entry.id.toString())}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddEntryDialog({
  onAdd,
}: {
  onAdd: (entry: Omit<Calendar, "user_id">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("09:00:00");
  const [endTime, setEndTime] = useState("17:00:00");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [bufferMinutes, setBufferMinutes] = useState(15);

  // Add state for validation and feedback
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (endDate && startDate && endDate < startDate) {
      newErrors.endDate = "End date cannot be before start date";
    }

    // Validate times
    if (startTime && endTime) {
      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);
      if (start >= end) {
        newErrors.time = "End time must be after start time";
      }
    }

    if (selectedDays.length === 0) {
      newErrors.days = "At least one day must be selected";
    }

    if (bufferMinutes < 0 || bufferMinutes > 240) {
      newErrors.buffer = "Buffer must be between 0 and 240 minutes";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Reset states
    setErrors({});
    setSubmitSuccess(false);

    // Validate form
    if (!validateForm()) {
      return; // Don't proceed if validation fails
    }

    if (!startDate) {
      setErrors({ startDate: "Start date is required" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the onAdd function
      await Promise.resolve(onAdd({
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate?.toISOString().split("T")[0],
        start_time: startTime,
        end_time: endTime,
        days_of_week: selectedDays,
        frequency: "weekly",
        buffer_minutes: bufferMinutes,
      }));

      // Show success feedback
      setSubmitSuccess(true);

      // Reset form after successful submission
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 1500);

    } catch (error) {
      // Handle API/network errors
      setErrors({
        submit: error instanceof Error
          ? error.message
          : "Failed to add calendar entry. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStartDate(new Date());
    setEndDate(new Date());
    setStartTime("09:00:00");
    setEndTime("17:00:00");
    setSelectedDays([1, 2, 3, 4, 5]);
    setBufferMinutes(15);
    setErrors({});
    setSubmitSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add Calendar Entry</DialogTitle>
          <DialogDescription>
            Configure your availability schedule
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Success Message */}
          {submitSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 text-sm font-medium">
                ✓ Calendar entry added successfully!
              </p>
            </div>
          )}

          {/* General Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm font-medium">
                {errors.submit}
              </p>
            </div>
          )}

          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="start-date" className="text-base font-medium">Start Date</Label>
              <div className="flex justify-center">
                <C
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  className="rounded-lg border border-border"
                  disabled={isSubmitting}
                />
              </div>
              {errors.startDate && (
                <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
              )}
            </div>
            <div className="space-y-3">
              <Label htmlFor="end-date" className="text-base font-medium">End Date</Label>
              <div className="flex justify-center">
                <C
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  className="rounded-lg border border-border"
                  disabled={isSubmitting}
                />
              </div>
              {errors.endDate && (
                <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <TimeSelect
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
              />
            </div>
            <div className="space-y-2">
              <TimeSelect
                label="End Time"
                value={endTime}
                onChange={setEndTime}
              />
            </div>
          </div>
          {errors.time && (
            <p className="text-sm text-red-500">{errors.time}</p>
          )}

          <div className="space-y-2">
            <Label>Days of Week</Label>
            <div className="flex flex-wrap gap-2">
              {fullDayNames.map((day, index) => (
                <Button
                  key={day}
                  type="button"
                  variant={selectedDays.includes(index) ? "default" : "outline"}
                  size="sm"
                  className={
                    selectedDays.includes(index) ? "" : "bg-transparent"
                  }
                  onClick={() => !isSubmitting && toggleDay(index)}
                  disabled={isSubmitting}
                >
                  {dayNames[index]}
                </Button>
              ))}
            </div>
            {errors.days && (
              <p className="text-sm text-red-500 mt-1">{errors.days}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="buffer-minutes">Buffer Between Slots (minutes)</Label>
            <Input
              id="buffer-minutes"
              type="number"
              min={0}
              max={240}
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(parseInt(e.target.value) || 0)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Maximum 240 minutes (4 hours)
            </p>
            {errors.buffer && (
              <p className="text-sm text-red-500 mt-1">{errors.buffer}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Availability'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CalendarConfig() {
  const [_entriesIsLoading, setEntriesIsLoading] = useState(false);
  const [entries, setEntries] = useState<CalendarWithId[]>([]);

  const [configIsLoading, setConfigIsLoading] = useState(false);
  const [config, setConfig] = useState<SlotGenerationConfig>(initialConfig);

  // Gets calender entries
  useEffect(() => {
    (async () => {
      try {
        setEntriesIsLoading(true);

        const entires = await getCalenderEntries();

        if (entires) {
          setEntries(entires);
        }
      } catch (error) {
        console.error(error);

      } finally {
        setEntriesIsLoading(false);
      }
    })()
  }, [])
  // Gets config 
  useEffect(() => {
    (async () => {
      try {
        setConfigIsLoading(true);

        const result = await getSlotGenerationConfig();

        if (result) {
          setConfig(prev => ({
            ...prev,
            bufferMinutes: result.bufferminutes,
            businessEndHour: result.businessendhour,
            businessStartHour: result.businessstarthour,
            maxAdvanceMonths: result.maxadvancemonths,
            minAdvanceDays: result.minadvancedays,
            slotDuration: result.slotduration
          }));
        }

      } catch (error) {
        console.error(error);
      } finally {
        setConfigIsLoading(false);
      }
    })()

  }, [])

  const handleConfigSubmit = async () => {
    if (configIsLoading) return;
    try {
      setConfigIsLoading(true);

      const res = await upsertSlotConfig(config);

      if (res) {
        console.log("Success");
      } else {
        setConfig(initialConfig);
        throw new Error("Failed to update config");
      }

    } catch (error) {
      console.error(error);
      // TODO: add better error handling
    } finally {
      setConfigIsLoading(false);
    }
  }

  const handleAddEntry = async (entry: Omit<Calendar, "user_id">) => {
    const data = await getUserSession();

    if (!data) return;

    const res = await addCalendarEntry({
      ...entry,
      user_id: data.user.id
    })

    console.log(res);
    // setEntries((prev) => [...prev, newEntry]);
  };

  const handleDeleteEntry = async (id: string) => {
    const res = await deleteCalenderEntry(Number(id));
    if (!res) return;
    setEntries((prev) => prev.filter((e) => e.id !== Number(id)));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="border-border lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Slot Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Slot Duration (minutes)</Label>
            <Select
              value={config.slotDuration.toString()}
              onValueChange={(v) =>
                setConfig((prev) => ({ ...prev, slotDuration: parseInt(v) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="20">20 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="40">40 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Buffer Between Slots (minutes)</Label>
            <Input
              type="number"
              min={0}
              max={60}
              value={config.bufferMinutes}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  bufferMinutes: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Minimum Advance Booking (days)</Label>
            <Input
              type="number"
              min={0}
              max={30}
              value={config.minAdvanceDays}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  minAdvanceDays: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Maximum Advance Booking (months)</Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={config.maxAdvanceMonths}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  maxAdvanceMonths: parseInt(e.target.value) || 1,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business Start Hour</Label>
              <Select
                value={(config.businessStartHour ?? 9).toString()}
                onValueChange={(v) =>
                  setConfig((prev) => ({
                    ...prev,
                    businessStartHour: parseInt(v),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Business End Hour</Label>
              <Select
                value={(config.businessEndHour ?? 18).toString()}
                onValueChange={(v) =>
                  setConfig((prev) => ({
                    ...prev,
                    businessEndHour: parseInt(v),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleConfigSubmit} disabled={configIsLoading} className="w-full">Save Configuration</Button>
        </CardContent>
      </Card>

      <div className="space-y-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Calendar Entries
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your availability
            </p>
          </div>
          <AddEntryDialog onAdd={handleAddEntry} />
        </div>

        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <div className="size-2 rounded-full bg-primary" />
            Available Times
            <Badge variant="secondary" className="ml-1">
              {entries.length}
            </Badge>
          </h3>
          {entries.length === 0 ? (
            <Card className="border-border border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No availability entries yet. Add your working hours above.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {entries.map((entry) => (
                <CalendarEntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={handleDeleteEntry}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}