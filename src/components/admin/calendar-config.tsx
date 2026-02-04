"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
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
  AlertCircle,
} from "lucide-react";
import type { CalendarEntry, SlotGenerationConfig } from "@/lib/types";

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

// Mock initial data
const initialCalendarEntries: CalendarEntry[] = [
  {
    id: "1",
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    start_time: "09:00:00",
    end_time: "17:00:00",
    days_of_week: [1, 2, 3, 4, 5],
    frequency: "weekly",
    buffer_minutes: 15,
    user_id: "barber-1",
    title: "Weekday Hours",
  },
  {
    id: "2",
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    start_time: "10:00:00",
    end_time: "14:00:00",
    days_of_week: [6],
    frequency: "weekly",
    buffer_minutes: 15,
    user_id: "barber-1",
    title: "Saturday Hours",
  },
  {
    id: "3",
    start_date: "2026-02-14",
    end_date: "2026-02-14",
    start_time: "00:00:00",
    end_time: "23:59:00",
    days_of_week: [],
    frequency: "once",
    buffer_minutes: 0,
    user_id: "barber-1",
    is_blocked: true,
    title: "Valentine's Day - Closed",
  },
];

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
  entry: CalendarEntry;
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
    if (entry.start_date === entry.end_date) {
      return new Date(entry.start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return `${new Date(entry.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(entry.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  return (
    <Card
      className={`border-border ${entry.is_blocked ? "border-l-4 border-l-red-400" : "border-l-4 border-l-primary"}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate font-medium text-foreground">
                {entry.title || "Availability Slot"}
              </h4>
              {entry.is_blocked && (
                <Badge variant="destructive" className="shrink-0 text-xs">
                  Blocked
                </Badge>
              )}
            </div>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-3.5" />
                <span>{formatDateRange()}</span>
              </div>

              {!entry.is_blocked && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>
                    {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                  </span>
                </div>
              )}

              {entry.days_of_week.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Repeat className="size-3.5" />
                  <span>
                    {entry.days_of_week.map((d) => dayNames[d]).join(", ")}
                  </span>
                </div>
              )}

              {entry.frequency !== "once" && (
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
            onClick={() => onDelete(entry.id)}
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
  onAdd: (entry: Omit<CalendarEntry, "id" | "user_id">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("09:00:00");
  const [endTime, setEndTime] = useState("17:00:00");
  const [frequency, setFrequency] = useState<CalendarEntry["frequency"]>("weekly");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [bufferMinutes, setBufferMinutes] = useState(15);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = () => {
    if (!startDate || !endDate) return;

    onAdd({
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      start_time: startTime,
      end_time: endTime,
      days_of_week: frequency === "once" ? [] : selectedDays,
      frequency,
      buffer_minutes: bufferMinutes,
      is_blocked: isBlocked,
      title: title || undefined,
    });

    setOpen(false);
    setTitle("");
    setIsBlocked(false);
    setStartDate(new Date());
    setEndDate(new Date());
    setStartTime("09:00:00");
    setEndTime("17:00:00");
    setFrequency("weekly");
    setSelectedDays([1, 2, 3, 4, 5]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Calendar Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Entry Type */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <AlertCircle
                className={`size-5 ${isBlocked ? "text-red-500" : "text-muted-foreground"}`}
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Block Time Off
                </p>
                <p className="text-xs text-muted-foreground">
                  Mark as unavailable (holiday, vacation, etc.)
                </p>
              </div>
            </div>
            <Switch checked={isBlocked} onCheckedChange={setIsBlocked} />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>Title (Optional)</Label>
            <Input
              placeholder={isBlocked ? "e.g., Holiday" : "e.g., Morning Shift"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Date Range */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                className="rounded-lg border border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                className="rounded-lg border border-border"
              />
            </div>
          </div>

          {/* Time Range (only for availability, not blocked time) */}
          {!isBlocked && (
            <div className="grid gap-4 sm:grid-cols-2">
              <TimeSelect
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
              />
              <TimeSelect
                label="End Time"
                value={endTime}
                onChange={setEndTime}
              />
            </div>
          )}

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(v) => setFrequency(v as CalendarEntry["frequency"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">One-time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Days of Week (for recurring entries) */}
          {frequency !== "once" && (
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
                    onClick={() => toggleDay(index)}
                  >
                    {dayNames[index]}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Buffer (only for availability) */}
          {!isBlocked && (
            <div className="space-y-2">
              <Label>Buffer Between Slots (minutes)</Label>
              <Input
                type="number"
                min={0}
                max={60}
                value={bufferMinutes}
                onChange={(e) => setBufferMinutes(parseInt(e.target.value) || 0)}
              />
            </div>
          )}

          <Button className="w-full" onClick={handleSubmit}>
            {isBlocked ? "Block Time" : "Add Availability"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CalendarConfig() {
  const [entries, setEntries] = useState<CalendarEntry[]>(initialCalendarEntries);
  const [config, setConfig] = useState<SlotGenerationConfig>(initialConfig);

  const handleAddEntry = (entry: Omit<CalendarEntry, "id" | "user_id">) => {
    const newEntry: CalendarEntry = {
      ...entry,
      id: Date.now().toString(),
      user_id: "barber-1",
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const availabilityEntries = entries.filter((e) => !e.is_blocked);
  const blockedEntries = entries.filter((e) => e.is_blocked);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Slot Configuration */}
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

          <Button className="w-full">Save Configuration</Button>
        </CardContent>
      </Card>

      {/* Calendar Entries */}
      <div className="space-y-6 lg:col-span-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Calendar Entries
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your availability and blocked times
            </p>
          </div>
          <AddEntryDialog onAdd={handleAddEntry} />
        </div>

        {/* Availability Entries */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <div className="size-2 rounded-full bg-primary" />
            Available Times
            <Badge variant="secondary" className="ml-1">
              {availabilityEntries.length}
            </Badge>
          </h3>
          {availabilityEntries.length === 0 ? (
            <Card className="border-border border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No availability entries yet. Add your working hours above.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {availabilityEntries.map((entry) => (
                <CalendarEntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={handleDeleteEntry}
                />
              ))}
            </div>
          )}
        </div>

        {/* Blocked Times */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <div className="size-2 rounded-full bg-red-400" />
            Blocked Times
            <Badge variant="secondary" className="ml-1">
              {blockedEntries.length}
            </Badge>
          </h3>
          {blockedEntries.length === 0 ? (
            <Card className="border-border border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No blocked times. Use this for holidays or vacation days.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {blockedEntries.map((entry) => (
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
