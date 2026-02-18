import { Star, Clock, Award } from "lucide-react";
import logo from "@/assets/KD Cuts Logo.png";
import { Button } from "./ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-20 md:py-32">
      {/* Logo Background */}
      <div className="absolute inset-0 z-0">
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/80 to-background/95 z-10" />
        
        {/* Logo with reduced opacity */}
        <div className="relative h-full w-full">
          <img
            src={logo}
            alt="KD Cuts Logo"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-2 rounded-full border border-border bg-secondary/80 backdrop-blur-sm px-4 py-2">
            <Star className="size-4 fill-primary text-primary" />
            <span className="text-sm text-muted-foreground">
              4.9 Rating on Google
            </span>
          </div>

          <h2
            className="max-w-3xl text-pretty text-4xl font-bold tracking-tight md:text-6xl pb-5 bg-gradient-to-r from-primary from-70% to-muted-foreground bg-clip-text text-transparent"
            style={{ WebkitTextStroke: "1px primary" }}
          >
          Premium grooming for the modern gentleman
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Experience the art of traditional barbering combined with
            contemporary style. Book your appointment with Kayden today.
          </p>
          <Button className="relative cursor-pointer mt-4 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground overflow-hidden group transition-transform duration-200 hover:scale-105 active:scale-95 sm:block">
            {/* Animated border corners */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-black transition-all duration-300 group-hover:w-full group-hover:h-full" />
            <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-black transition-all duration-300 group-hover:w-full group-hover:h-full" />
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-black transition-all duration-300 group-hover:w-full group-hover:h-full" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-black transition-all duration-300 group-hover:w-full group-hover:h-full" />
              <a href="/#booking" className="relative z-10">Book Appointment</a>
          </Button>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary/80 backdrop-blur-sm">
                <Clock className="size-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  Quick Booking
                </p>
                <p className="text-xs text-muted-foreground">
                  Book in 60 seconds
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary/80 backdrop-blur-sm">
                <Award className="size-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  7+ Years Experience
                </p>
                <p className="text-xs text-muted-foreground">
                  Master barber since 2018
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary/80 backdrop-blur-sm">
                <Star className="size-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">
                  500+ Happy Clients
                </p>
                <p className="text-xs text-muted-foreground">Monthly regulars</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}