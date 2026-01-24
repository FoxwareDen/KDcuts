import { checkAuthtozition } from "../../../lib/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard/")({
  beforeLoad: async () => {
    await checkAuthtozition("admin");
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/dashboard/"!</div>;
}
