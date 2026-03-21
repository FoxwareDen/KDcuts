import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useLocation } from "@tanstack/react-router";
import kdCutsLogo from "@/assets/KD Cuts Logo.png";
import { auth, db } from "@/lib/firebase";

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role ?? null);
        } else {
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogOut = async () => {
    await signOut(auth);
    navigate({ to: "/" });
  };

  const navLinkClass =
    "relative text-sm text-muted-foreground transition-all duration-200 ease-out hover:text-primary hover:scale-110 inline-block after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-200 after:ease-out hover:after:w-full";
  const mobileLinkClass =
    "text-sm text-muted-foreground transition-all duration-200 ease-out hover:text-primary hover:translate-x-1.5 hover:scale-[1.02] inline-block";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className={`mx-auto flex h-16 items-center justify-between px-4 ${isDashboard ? "max-w-full" : "max-w-6xl"}`}>
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
          {role === "admin" && (
            <Link to="/dashboard" className={navLinkClass} onClick={handleLinkClick}>
              Dashboard
            </Link>
          )}
          <a href="/#services" className={navLinkClass} onClick={handleLinkClick}>
            Services
          </a>
          {user ? (
            <button onClick={handleLogOut} className={navLinkClass}>
              Logout
            </button>
          ) : (
            <Link to="/login" className={navLinkClass} onClick={handleLinkClick}>
              Login
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
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
            {role === "admin" && (
              <Link to="/dashboard" onClick={handleLinkClick} className={mobileLinkClass}>
                Dashboard
              </Link>
            )}
            <a href="/#services" onClick={handleLinkClick} className={mobileLinkClass}>
              Services
            </a>
            {user ? (
              <button onClick={handleLogOut} className={mobileLinkClass}>
                Logout
              </button>
            ) : (
              <Link to="/login" onClick={handleLinkClick} className={mobileLinkClass}>
                Login
              </Link>
            )}
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