import { checkAuthtozition, useAuthSession } from "@/lib/auth";
import { Link } from "@tanstack/react-router";
import { Scissors, Phone, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { signInWithAuth, signOut } from "@/lib/db";

export function Header() {
  const { user } = useAuthSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await checkAuthtozition("admin");
      setIsAdmin(res);
    })();
  }, [user]);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };



  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary">
            <Scissors className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              KD Cuts
            </h1>
            <p className="text-xs text-muted-foreground">Est. 2018</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 sm:flex">
          {isAdmin && (
            <Link
              to="/dashboard"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/#services"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Services
          </Link>
          <Link to="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Login
          </Link>

        </nav>

        <div className="flex items-center gap-4">
          <a
            href="tel:+15551234567"
            className="hidden items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <Phone className="size-4" />
            (555) 123-4567
          </a>
          <Button className="hidden rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:block">
            <a href="/#booking">Book Appointment</a>
          </Button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden text-foreground"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-background">
          <nav className="flex flex-col px-4 py-4 space-y-4">
            {isAdmin && (
              <Link
                to="/dashboard"
                onClick={handleLinkClick}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/#services"
              onClick={handleLinkClick}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Services
            </Link>
            <Link
              to="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Login
            </Link>
            <a
              href="tel:+15551234567"
              onClick={handleLinkClick}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Phone className="size-4" />
              (555) 123-4567
            </a>
            <Button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <a href="/#booking" onClick={handleLinkClick}>
                Book Appointment
              </a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

