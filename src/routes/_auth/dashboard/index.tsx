import { useEffect } from "react";
import { checkAuthtozition } from "../../../lib/auth";
import { createFileRoute } from "@tanstack/react-router";
import { getBookings } from "@/lib/booking";

export const Route = createFileRoute("/_auth/dashboard/")({
  beforeLoad: async () => {
    await checkAuthtozition("admin");
  },
  component: RouteComponent,
});

function RouteComponent() {

  useEffect(() => {
    (async () => {
      const bookings = await getBookings();

      console.log(bookings);


    })()
  }, [])

  return <div>Hello "/dashboard/"!</div>;
}
