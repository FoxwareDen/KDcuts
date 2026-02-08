import { getUserSession } from "@/lib/db";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async () => {
    const user = await getUserSession();

    if (!user || !user.user) {
      redirect({
        to: "/login",
      });
    }

    return user;
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
