import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Check, Plus, Trash2, X } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

type DaySchedule = {
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
};

type WeeklySchedule = {
  [key: string]: DaySchedule;
};

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timeSlots = [
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
];

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

const defaultSchedule: WeeklySchedule = {
  Monday: { enabled: true, startTime: "09:00", endTime: "18:00" },
  Tuesday: { enabled: true, startTime: "09:00", endTime: "18:00" },
  Wednesday: { enabled: true, startTime: "09:00", endTime: "18:00" },
  Thursday: { enabled: true, startTime: "09:00", endTime: "18:00" },
  Friday: { enabled: true, startTime: "09:00", endTime: "18:00" },
  Saturday: { enabled: true, startTime: "10:00", endTime: "16:00" },
  Sunday: { enabled: false, startTime: "10:00", endTime: "14:00" },
};

export const Route = createFileRoute("/_auth/dashboard/availability")({
  component: function () {
    const [schedule, setSchedule] = useState<WeeklySchedule>(defaultSchedule);
    const [blockedDates, setBlockedDates] = useState<Date[]>([
      new Date(2026, 1, 14), // Feb 14 blocked
      new Date(2026, 1, 28), // Feb 28 blocked
    ]);
    const [selectedBlockDates, setSelectedBlockDates] = useState<Date[]>([]);
    const [saved, setSaved] = useState(false);

    const updateDaySchedule = (
      day: string,
      field: keyof DaySchedule,
      value: string | boolean
    ) => {
      setSchedule((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [field]: value,
        },
      }));
      setSaved(false);
    };

    const handleSave = () => {
      // Here you would save to your backend
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    };

    const addBlockedDates = () => {
      if (selectedBlockDates.length > 0) {
        setBlockedDates((prev) => [...prev, ...selectedBlockDates]);
        setSelectedBlockDates([]);
      }
    };

    const removeBlockedDate = (dateToRemove: Date) => {
      setBlockedDates((prev) =>
        prev.filter((date) => date.getTime() !== dateToRemove.getTime())
      );
    };

    return (
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Availability
            </h1>
            <p className="mt-1 text-muted-foreground">
              Set your working hours and blocked dates
            </p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            {saved ? (
              <>
                <Check className="size-4" />
                Saved
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {/* Weekly Schedule */}
          <Card className="border-border xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="flex flex-col gap-4 rounded-lg border border-border bg-secondary/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <Switch
                        id={`${day}-toggle`}
                        checked={schedule[day].enabled}
                        onCheckedChange={(checked) =>
                          updateDaySchedule(day, "enabled", checked)
                        }
                      />
                      <Label
                        htmlFor={`${day}-toggle`}
                        className={`w-24 font-medium ${schedule[day].enabled
                          ? "text-foreground"
                          : "text-muted-foreground"
                          }`}
                      >
                        {day}
                      </Label>
                    </div>

                    {schedule[day].enabled ? (
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <Select
                            value={schedule[day].startTime}
                            onValueChange={(value) =>
                              updateDaySchedule(day, "startTime", value)
                            }
                          >
                            <SelectTrigger className="w-28 border-border bg-card">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {formatTime(time)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-muted-foreground">to</span>
                          <Select
                            value={schedule[day].endTime}
                            onValueChange={(value) =>
                              updateDaySchedule(day, "endTime", value)
                            }
                          >
                            <SelectTrigger className="w-28 border-border bg-card">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {formatTime(time)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Closed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Blocked Dates */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Blocked Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Select specific dates when you&apos;re unavailable (holidays,
                vacation, etc.)
              </p>

              <div className="mb-4 flex justify-center">
                <Calendar
                  mode="multiple"
                  selected={selectedBlockDates}
                  onSelect={(dates) => setSelectedBlockDates(dates || [])}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return (
                      date < today ||
                      blockedDates.some(
                        (blocked) => blocked.toDateString() === date.toDateString()
                      )
                    );
                  }}
                  className="rounded-lg border border-border"
                />
              </div>

              {selectedBlockDates.length > 0 && (
                <Button
                  onClick={addBlockedDates}
                  className="mb-4 w-full gap-2 bg-transparent"
                  variant="outline"
                >
                  <Plus className="size-4" />
                  Block {selectedBlockDates.length} Selected Date
                  {selectedBlockDates.length > 1 ? "s" : ""}
                </Button>
              )}

              {/* Blocked dates list */}
              {blockedDates.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Currently Blocked:
                  </p>
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {blockedDates
                      .sort((a, b) => a.getTime() - b.getTime())
                      .map((date) => (
                        <div
                          key={date.toISOString()}
                          className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-3 py-2"
                        >
                          <span className="text-sm text-foreground">
                            {date.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeBlockedDate(date)}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {blockedDates.length === 0 && selectedBlockDates.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  No dates blocked. Select dates above to block them.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Slot Duration */}
        <Card className="mt-6 border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Appointment Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Slot Duration
                </Label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Time between each available booking slot
                </p>
                <Select defaultValue="30">
                  <SelectTrigger className="border-border bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">
                  Buffer Time
                </Label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Break between appointments
                </p>
                <Select defaultValue="0">
                  <SelectTrigger className="border-border bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No buffer</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-foreground">
                  Advance Booking
                </Label>
                <p className="mb-2 text-xs text-muted-foreground">
                  How far ahead clients can book
                </p>
                <Select defaultValue="30">
                  <SelectTrigger className="border-border bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">1 week</SelectItem>
                    <SelectItem value="14">2 weeks</SelectItem>
                    <SelectItem value="30">1 month</SelectItem>
                    <SelectItem value="60">2 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
})
