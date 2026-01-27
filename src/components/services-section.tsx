"use client";

import { Scissors, SprayCan, BadgeCheck } from "lucide-react";

const services = [
  {
    id: "classic-cut",
    name: "Classic Haircut",
    description:
      "Traditional cut with clippers and scissors. Includes hot towel and neck shave.",
    price: 100,
    duration: "30 min",
    icon: Scissors,
  },
  {
    id: "beard-trim",
    name: "Beard Trim & Shape",
    description:
      "Precision beard grooming with straight razor edge-up and conditioning.",
    price: 100,
    duration: "20 min",
    icon: BadgeCheck,
  },
  {
    id: "full-service",
    name: "The Full Experience",
    description:
      "Haircut, beard trim, hot towel treatment, and signature styling.",
    price: 100,
    duration: "45 min",
    icon: SprayCan,
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="border-b border-border py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
            Our Services
          </p>
          <h3 className="text-3xl font-bold text-foreground md:text-4xl">
            What we offer
          </h3>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
                  <service.icon className="size-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {service.duration}
                </span>
              </div>

              <h4 className="mb-2 text-lg font-semibold text-foreground">
                {service.name}
              </h4>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">
                  R{service.price}
                </span>
                <a
                  href="#booking"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Book now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
