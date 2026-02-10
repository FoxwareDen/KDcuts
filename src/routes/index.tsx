import { BookingSection } from "@/components/booking-section";
import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { createFileRoute } from "@tanstack/react-router";

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
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <BookingSection />
    </>
  );
}
