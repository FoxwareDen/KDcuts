"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  Phone,
  User,
  Check,
  X,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Booking, BookingStatus } from "@/lib/types";

// Mock data
const initialBookings: Booking[] = [
  {
    id: "1",
    client_name: "John Smith",
    client_email: "john@email.com",
    client_phone: "+1 234 567 8900",
    service_id: "classic-cut",
    service_name: "Classic Haircut",
    price: 100,
    date: "2026-02-04",
    start_time: "10:00",
    end_time: "10:30",
    status: "pending",
    created_at: "2026-02-02T10:00:00Z",
  },
  {
    id: "2",
    client_name: "Mike Johnson",
    client_email: "mike@email.com",
    client_phone: "+1 234 567 8901",
    service_id: "beard-trim",
    service_name: "Beard Trim & Shape",
    price: 100,
    date: "2026-02-04",
    start_time: "11:00",
    end_time: "11:20",
    status: "confirmed",
    created_at: "2026-02-01T14:00:00Z",
  },
  {
    id: "3",
    client_name: "David Wilson",
    client_email: "david@email.com",
    client_phone: "+1 234 567 8902",
    service_id: "full-service",
    service_name: "The Full Experience",
    price: 100,
    date: "2026-02-04",
    start_time: "14:00",
    end_time: "14:45",
    status: "in-progress",
    notes: "Prefers shorter on the sides",
    created_at: "2026-01-30T09:00:00Z",
  },
  {
    id: "4",
    client_name: "Chris Brown",
    client_email: "chris@email.com",
    client_phone: "+1 234 567 8903",
    service_id: "classic-cut",
    service_name: "Classic Haircut",
    price: 100,
    date: "2026-02-03",
    start_time: "09:00",
    end_time: "09:30",
    status: "completed",
    created_at: "2026-01-28T11:00:00Z",
  },
  {
    id: "5",
    client_name: "Alex Turner",
    client_email: "alex@email.com",
    client_phone: "+1 234 567 8904",
    service_id: "full-service",
    service_name: "The Full Experience",
    price: 100,
    date: "2026-02-05",
    start_time: "15:00",
    end_time: "15:45",
    status: "pending",
    created_at: "2026-02-03T16:00:00Z",
  },
  {
    id: "6",
    client_name: "Sam Lee",
    client_email: "sam@email.com",
    client_phone: "+1 234 567 8905",
    service_id: "beard-trim",
    service_name: "Beard Trim & Shape",
    price: 100,
    date: "2026-02-02",
    start_time: "10:00",
    end_time: "10:20",
    status: "cancelled",
    notes: "Client requested cancellation",
    created_at: "2026-01-25T08:00:00Z",
  },
];

const columns: { id: BookingStatus; title: string; color: string }[] = [
  { id: "pending", title: "Pending", color: "bg-amber-500" },
  { id: "completed", title: "Completed", color: "bg-emerald-500" },
  { id: "cancelled", title: "Cancelled", color: "bg-red-400" },
];

function BookingCard({
  booking,
  onStatusChange,
}: {
  booking: Booking;
  onStatusChange: (id: string, status: BookingStatus) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border bg-background transition-shadow hover:shadow-md">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer p-4 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-sm font-medium text-foreground">
                  {booking.client_name}
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {booking.service_name}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {isOpen ? (
                  <ChevronUp className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CardContent className="px-4 pb-3 pt-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3" />
            <span>
              {formatDate(booking.date)} at {booking.start_time}
            </span>
          </div>

          <CollapsibleContent>
            <div className="mt-4 space-y-3 border-t border-border pt-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <User className="size-3 text-primary" />
                  <span>{booking.client_name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <Mail className="size-3 text-primary" />
                  <span className="truncate">{booking.client_email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <Phone className="size-3 text-primary" />
                  <span>{booking.client_phone}</span>
                </div>
              </div>

              {/* Price & Time */}
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-2">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-sm font-semibold text-foreground">
                  ${booking.price}
                </span>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="rounded-lg bg-secondary/50 p-2">
                  <p className="text-xs text-muted-foreground">
                    Note: {booking.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                {booking.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      className="h-7 flex-1 gap-1 text-xs"
                      onClick={() => onStatusChange(booking.id, "confirmed")}
                    >
                      <Check className="size-3" />
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 flex-1 gap-1 bg-transparent text-xs"
                      onClick={() => onStatusChange(booking.id, "cancelled")}
                    >
                      <X className="size-3" />
                      Cancel
                    </Button>
                  </>
                )}
                {booking.status === "confirmed" && (
                  <Button
                    size="sm"
                    className="h-7 flex-1 text-xs"
                    onClick={() => onStatusChange(booking.id, "in-progress")}
                  >
                    Start Session
                  </Button>
                )}
                {booking.status === "in-progress" && (
                  <Button
                    size="sm"
                    className="h-7 flex-1 text-xs"
                    onClick={() => onStatusChange(booking.id, "completed")}
                  >
                    Mark Complete
                  </Button>
                )}
                {(booking.status === "completed" ||
                  booking.status === "cancelled") && (
                  <p className="w-full text-center text-xs text-muted-foreground">
                    No actions available
                  </p>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 shrink-0 p-0"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onStatusChange(booking.id, "pending")}
                    >
                      Move to Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(booking.id, "confirmed")}
                    >
                      Move to Confirmed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(booking.id, "in-progress")}
                    >
                      Move to In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(booking.id, "completed")}
                    >
                      Move to Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(booking.id, "cancelled")}
                      className="text-destructive"
                    >
                      Cancel Booking
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}

export function BookingsKanban() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const handleStatusChange = (id: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, status: newStatus } : booking
      )
    );
  };

  const getBookingsByStatus = (status: BookingStatus) =>
    bookings.filter((b) => b.status === status);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnBookings = getBookingsByStatus(column.id);
        return (
          <div
            key={column.id}
            className="flex w-72 shrink-0 flex-col rounded-lg border border-border bg-secondary/30"
          >
            {/* Column Header */}
            <div className="flex items-center gap-2 border-b border-border p-4">
              <div className={`size-2 rounded-full ${column.color}`} />
              <h3 className="text-sm font-medium text-foreground">
                {column.title}
              </h3>
              <Badge
                variant="secondary"
                className="ml-auto h-5 px-1.5 text-xs"
              >
                {columnBookings.length}
              </Badge>
            </div>

            {/* Column Content */}
            <div className="flex-1 space-y-3 p-3">
              {columnBookings.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-muted-foreground">
                    No bookings here
                  </p>
                </div>
              ) : (
                columnBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
