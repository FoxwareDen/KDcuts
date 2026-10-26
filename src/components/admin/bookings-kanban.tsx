import { useEffect, useState } from "react";
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
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { deleteBooking, getBulkBookings, updateBookingStatus, type BookingClientData } from "@/lib/booking.fb";
import type { Booking, BookingStatus } from "@/lib/booking";

interface FullBooking extends Omit<Booking, "id">, BookingClientData {
  id: string;
}

const columns: { id: BookingStatus; title: string; color: string }[] = [
  { id: "pending", title: "Pending", color: "bg-amber-500" },
  { id: "completed", title: "Completed", color: "bg-emerald-500" },
  { id: "cancelled", title: "Cancelled", color: "bg-red-400" },
];

function BookingCard({
  booking,
  onStatusChange,
  onDelete,
}: {
  booking: FullBooking;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateValue: unknown) => {
    const date = dateValue && typeof dateValue === "object" && "toDate" in dateValue
      ? (dateValue as { toDate: () => Date }).toDate()
      : new Date(String(dateValue));
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
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
                  {booking.name}
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {booking.service}
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
                  <span>{booking.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <Mail className="size-3 text-primary" />
                  <span className="truncate">{booking.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <Phone className="size-3 text-primary" />
                  <span>{booking.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-2">
                <span className="text-xs text-muted-foreground">Time</span>
                <span className="text-sm font-semibold text-foreground">
                  {booking.start_time}
                </span>
              </div>

              {/* Notes */}
              {/* {booking.notes && ( */}
              {/*   <div className="rounded-lg bg-secondary/50 p-2"> */}
              {/*     <p className="text-xs text-muted-foreground"> */}
              {/*       Note: {booking.} */}
              {/*     </p> */}
              {/*   </div> */}
              {/* )} */}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                {booking.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      className="h-7 flex-1 gap-1 text-xs"
                      onClick={() => onStatusChange(booking.id, "completed")}
                    >
                      <Check className="size-3" />
                      Completed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 flex-1 gap-1 bg-transparent text-xs"
                      onClick={() => onStatusChange(booking.id, "cancelled")}
                    >
                      <X className="size-3" />
                      Cancelled
                    </Button>
                  </>
                )}
                {(booking.status === "completed" ||
                  booking.status === "cancelled") && (
                    <p className="w-full text-center text-xs text-muted-foreground">
                      No status actions available
                    </p>
                  )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Delete booking for ${booking.name}`}
                    >
                      <Trash2 className="size-3" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this booking?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently removes {booking.name}&apos;s booking and client details.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep booking</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => onDelete(booking.id)}
                      >
                        Delete booking
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}

export function BookingsKanban() {
  const [bookings, setBookings] = useState<FullBooking[]>([]);

  useEffect(() => {
    getBulkBookings().then((bookings) => {
    if (bookings) {
      setBookings([...bookings].map((booking) => ({ ...booking, id: String(booking.id) })).sort((a, b) => {
        const first = new Date(String(a.date)).getTime();
        const second = new Date(String(b.date)).getTime();
        return (Number.isNaN(first) ? Number.MAX_SAFE_INTEGER : first) -
          (Number.isNaN(second) ? Number.MAX_SAFE_INTEGER : second);
      }));
    }
    }).catch((error) => {
      console.error(error);
    })
  }, [])


  const handleDelete = async (id: string) => {
    const deleted = await deleteBooking(id);
    if (deleted) {
      setBookings((prev) => prev.filter((booking) => booking.id !== id));
    }
  };

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    const res = await updateBookingStatus(id, newStatus);

    if (!res) return;

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
              onDelete={handleDelete}
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
