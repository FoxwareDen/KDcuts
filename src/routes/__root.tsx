import {createRootRoute } from "@tanstack/react-router";

import "../index.css"; // import normally, no ?url
import { Header } from "@/components/Header";
import { Footer } from "@/components/footer";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Marcus & Co. Barbershop | Book Your Appointment" },
    ],
    links: [], // CSS is handled via import
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <>
    <main className="min-h-screen bg-background">
      <Header />
        {children}
      <Footer/>
    </main>
    </>
  );
}
