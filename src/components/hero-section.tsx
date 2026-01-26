"use client";

import { Star, Clock, Award } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2">
            <Star className="size-4 fill-primary text-primary" />
            <span className="text-sm text-muted-foreground">
              4.9 Rating on Google
            </span>
          </div>

          <h2 className="max-w-3xl text-pretty text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Premium grooming for the modern gentleman
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Experience the art of traditional barbering combined with
            contemporary style. Book your appointment with Marcus today.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
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
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
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
              <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
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
