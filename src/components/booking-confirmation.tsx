"use client";

import { format } from "date-fns";
import { CheckCircle, Calendar, Clock, User, Mail, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BookingDetails } from "@/app/page";

interface BookingConfirmationProps {
  booking: BookingDetails;
  onClose: () => void;
}

export function BookingConfirmation({
  booking,
  onClose,
}: BookingConfirmationProps) {
  return (
    <section className="flex min-h-[80vh] items-center justify-center py-16">
      <div className="mx-auto max-w-lg px-4">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-secondary">
            <CheckCircle className="size-10 text-primary" />
          </div>

          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Booking Confirmed!
          </h2>
          <p className="mb-8 text-muted-foreground">
            We've sent a confirmation email to {booking.email}
          </p>

          <div className="mb-8 space-y-4 rounded-lg bg-background p-6 text-left">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
                <Calendar className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium text-foreground">
                  {format(booking.date, "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
                <Clock className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-medium text-foreground">{booking.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
                <User className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Service</p>
                <p className="font-medium text-foreground">{booking.service}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {booking.email}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <Phone className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {booking.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={onClose}>
              <ArrowLeft className="mr-2 size-4" />
              Book Another Appointment
            </Button>
            <p className="text-xs text-muted-foreground">
              Need to reschedule? Call us at (555) 123-4567
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
