import { Link } from "@tanstack/react-router";
import { Phone, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { getUserSession, signOut } from "@/lib/db";
import { useLocation } from "@tanstack/react-router";
import kdCutsLogo from "@/assets/KD Cuts Logo.png";

export function Header() {
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await getUserSession();

      if (data) {
        setIsAuth(true);

        if (data.user.role == "admin") {
          setIsAdmin(true)
        }
      }

    })();
  }, []);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogOut = async () => {
    await signOut();
    setIsAuth(false);
    setIsAdmin(false);
    window.location.href = window.location.origin
  };

  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

    const navLinkClass =
    "relative text-sm text-muted-foreground transition-all duration-200 ease-out hover:text-primary hover:scale-110 inline-block after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-200 after:ease-out hover:after:w-full";
    const mobileLinkClass =
    "text-sm text-muted-foreground transition-all duration-200 ease-out hover:text-primary hover:translate-x-1.5 hover:scale-[1.02] inline-block";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className={`mx-auto flex h-16 items-center justify-between px-4 ${isDashboard ? "max-w-full" : "max-w-6xl"
        }`}>
        <a href="/">
          <div className="flex items-center gap-2">
            <img 
              src={kdCutsLogo} 
              alt="KD Cuts Logo" 
              className="size-12 mr-6 object-cover rounded-full"
            />     
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              KD Cuts
            </h1>
            <p className="text-xs text-muted-foreground">Est. 2018</p>
          </div>
        </div>
        </a>

        <nav className="hidden items-center gap-6 sm:flex">
          {isAdmin && (
            <Link
              to="/dashboard"
              className={navLinkClass}
            >
              Dashboard
            </Link>
          )}
          <a
            href="/#services"
            className={navLinkClass}
          >
            Services
          </a>
          {
            isAuth ? (
              <button
                onClick={handleLogOut}
                className={navLinkClass}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className={navLinkClass}
              >
                Login
              </Link>
            )
          }

        </nav>

        <div className="flex items-center gap-4">
          {/* <a
            href="tel:+15551234567"
            className="hidden items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <Phone className="size-4" />
            (555) 123-4567
          </a> */}
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
              <>

                <Link
                  to="/dashboard"
                  onClick={handleLinkClick}
                  className={mobileLinkClass}
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/settings"
                  onClick={handleLinkClick}
                  className={mobileLinkClass}
                >
                  Settings
                </Link>
                <Link
                  to="/dashboard/metrics"
                  onClick={handleLinkClick}
                  className={mobileLinkClass}
                >
                  Analytics
                </Link>
              </>
            )}
            <a
              href="/#services"
              onClick={handleLinkClick}
              className={mobileLinkClass}
            >
              Services
            </a>
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

