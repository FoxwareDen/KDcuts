import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Mail, Phone, User } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";

type Appointment = {
  id: string;
  client: string;
  email: string;
  phone: string;
  service: string;
  date: Date;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  price: number;
};

const sampleAppointments: Appointment[] = [
  {
    id: "1",
    client: "John Smith",
    email: "john@email.com",
    phone: "+1 555-0123",
    service: "Classic Haircut",
    date: new Date(2026, 1, 3),
    time: "10:00 AM",
    status: "confirmed",
    price: 100,
  },
  {
    id: "2",
    client: "Mike Johnson",
    email: "mike@email.com",
    phone: "+1 555-0124",
    service: "Beard Trim & Shape",
    date: new Date(2026, 1, 3),
    time: "11:00 AM",
    status: "confirmed",
    price: 100,
  },
  {
    id: "3",
    client: "David Wilson",
    email: "david@email.com",
    phone: "+1 555-0125",
    service: "The Full Experience",
    date: new Date(2026, 1, 3),
    time: "2:00 PM",
    status: "pending",
    price: 100,
  },
  {
    id: "4",
    client: "Chris Brown",
    email: "chris@email.com",
    phone: "+1 555-0126",
    service: "Classic Haircut",
    date: new Date(2026, 1, 4),
    time: "9:00 AM",
    status: "confirmed",
    price: 100,
  },
  {
    id: "5",
    client: "Alex Turner",
    email: "alex@email.com",
    phone: "+1 555-0127",
    service: "Classic Haircut",
    date: new Date(2026, 1, 4),
    time: "10:30 AM",
    status: "confirmed",
    price: 100,
  },
  {
    id: "6",
    client: "Ryan Garcia",
    email: "ryan@email.com",
    phone: "+1 555-0128",
    service: "The Full Experience",
    date: new Date(2026, 1, 5),
    time: "11:00 AM",
    status: "pending",
    price: 100,
  },
];

const statusColors = {
  confirmed: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-muted text-muted-foreground border-border",
  completed: "bg-secondary text-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export const Route = createFileRoute("/_auth/dashboard/appointments")({
  component: function () {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
      new Date(2026, 1, 3)
    );
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filteredAppointments = sampleAppointments.filter((apt) => {
      const dateMatch =
        !selectedDate ||
        apt.date.toDateString() === selectedDate.toDateString();
      const statusMatch = statusFilter === "all" || apt.status === statusFilter;
      return dateMatch && statusMatch;
    });

    const appointmentDates = sampleAppointments.map((apt) =>
      apt.date.toDateString()
    );

    return (
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Appointments</h1>
          <p className="mt-1 text-muted-foreground">
            View and manage your upcoming appointments
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {/* Calendar & Filters */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    hasAppointment: (date) =>
                      appointmentDates.includes(date.toDateString()),
                  }}
                  modifiersStyles={{
                    hasAppointment: {
                      fontWeight: "bold",
                      textDecoration: "underline",
                      textDecorationColor: "oklch(0.72 0.15 85)",
                    },
                  }}
                  className="rounded-lg border border-border"
                />
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Filter by Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-border bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-border bg-transparent"
                  onClick={() => {
                    setSelectedDate(undefined);
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card className="border-border xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                    : "All Appointments"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {filteredAppointments.length} appointment
                  {filteredAppointments.length !== 1 ? "s" : ""}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAppointments.length === 0 ? (
                <div className="py-12 text-center">
                  <CalendarIcon className="mx-auto mb-4 size-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    No appointments found for the selected filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="rounded-lg border border-border bg-secondary/30 p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                              <User className="size-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {apt.client}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {apt.service}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <CalendarIcon className="size-4" />
                              {apt.date.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="size-4" />
                              {apt.time}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Mail className="size-4" />
                              {apt.email}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Phone className="size-4" />
                              {apt.phone}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                          <Badge
                            variant="outline"
                            className={statusColors[apt.status]}
                          >
                            {apt.status.charAt(0).toUpperCase() +
                              apt.status.slice(1)}
                          </Badge>
                          <p className="font-semibold text-foreground">
                            ${apt.price}
                          </p>
                        </div>
                      </div>

                      {apt.status === "pending" && (
                        <div className="mt-4 flex gap-2 border-t border-border pt-4">
                          <Button size="sm" className="gap-1">
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border bg-transparent"
                          >
                            Reschedule
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
})
