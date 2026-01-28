import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/lib/auth";
import { addBooking } from "@/lib/booking";
import { signInWithAuth } from "@/lib/db";
import { createFileRoute } from "@tanstack/react-router";
import { addDays } from "date-fns";

export const Route = createFileRoute("/test")({
  component: () => {
    const { user } = useAuthSession();

    const login = async () => {
      await signInWithAuth();
    }

    const test = async () => {
      await addBooking({
        date: addDays(new Date(), 5).toISOString(),
        start_time: new Date().getTime(),
        end_time: new Date().getTime() + 60 * 60 * 1000,
        duration: 60,
        user_id: user?.user.id || null
      }, {
        email: "HtB4w@example.com",
        name: "test",
        phone: "1234567890",
        service: "classic-cut"
      });
    }

    return (
      <div>
        <Button onClick={login}>Login</Button>
        <Button onClick={test}>Test</Button>
      </div>
    )
  }
})
