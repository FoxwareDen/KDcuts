import { getUserSession, checkAuthtozition } from "@/lib/db.fb";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async () => {
    const session = await getUserSession();

    if (!session || !session.user) {
      throw redirect({ to: "/login" });
    }

    const isAdmin = await checkAuthtozition("admin");

    if (!isAdmin) {
      throw redirect({ to: "/" });
    }

    return session;
  },
  component: () => <Outlet />,
});