import { checkAuthtozition } from "../../../lib/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard/")({
  beforeLoad: async () => {
    const privilegeValid = await checkAuthtozition("admin");

    if (!privilegeValid) {
      return redirect({
        to: "/",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {

  return <div>Hello "/dashboard/"!</div>;
}
