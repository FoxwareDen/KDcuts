import { useEffect } from "react";
import { checkAuthtozition } from "../../../lib/auth";
import { createFileRoute } from "@tanstack/react-router";
import { getBookings, updateBooking } from "@/lib/booking";

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

      if (!bookings || bookings.length == 0) return;

      const res = await updateBooking(bookings[0].id, {
        status: "completed",
      });

      console.log(res);
    })()
  }, [])

  return <div>Hello "/dashboard/"!</div>;
}
