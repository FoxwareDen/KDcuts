import { getAuthSession, intializeAuthSession } from "../lib/auth";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ location }) => {
    const { initialized } = getAuthSession();

    if (!initialized) await intializeAuthSession();

    const { isAuthenticated } = getAuthSession();

    if (!isAuthenticated) {
      throw redirect({
        href: "/",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
