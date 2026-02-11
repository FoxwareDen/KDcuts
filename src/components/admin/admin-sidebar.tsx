import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChartArea,
  // Calendar,
  // Clock,
  LayoutDashboard,
  LogOut,
  Menu,
  Scissors,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  // {
  //   label: "Availability",
  //   href: "/dashboard/availability",
  //   icon: Clock,
  // },
  // {
  //   label: "Appointments",
  //   href: "/dashboard/appointments",
  //   icon: Calendar,
  // },
  {
    label: "Analytics",
    href: "/dashboard/metrics",
    icon: ChartArea,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <Scissors className="size-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Admin Panel</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 border-r border-border bg-card transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-border px-6">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <Scissors className="size-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">KD Cuts</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="size-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="size-5" />
              Back to Site
            </Link>
          </div>
        </div>
      </aside>

      {/* Spacer for mobile header */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
