import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { checkAuthtozition } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const Route = createFileRoute("/_auth/dashboard")({
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
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
