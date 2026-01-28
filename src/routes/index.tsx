import { BookingConfirmation } from "@/components/booking-confirmation";
import { BookingSection } from "@/components/booking-section";
import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: App,
});

export interface BookingDetails {
  date: Date;
  time: string;
  service: string;
  name: string;
  email: string;
  phone: string;
}

function App() {
  const [confirmedBooking, setConfirmedBooking] =
    useState<BookingDetails | null>(null);

  if (confirmedBooking) {
    return (

      <BookingConfirmation
        booking={confirmedBooking}
        onClose={() => setConfirmedBooking(null)}
      />

    );
  }

  return (
    <>
      <HeroSection />
      <ServicesSection />
      <BookingSection onBookingConfirmed={setConfirmedBooking} />
    </>
  );
}
