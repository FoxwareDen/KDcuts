import { Scissors, Phone } from "lucide-react";

export function Header() {
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

        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#services"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Services
          </a>
          <a
            href="#booking"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Book Now
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="tel:+15551234567"
            className="hidden items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:flex"
          >
            <Phone className="size-4" />
            (555) 123-4567
          </a>
          <a
            href="#booking"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Book Appointment
          </a>
        </div>
      </div>
    </header>
  );
}
