import useFetch from "@/hooks/useFetch";
import { getSlotGenerationConfig } from "@/lib/calender";
import { getServices, type Service } from "@/lib/settings";
import { Scissors, SprayCan, BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";

const icons = [
  Scissors,
  SprayCan,
  BadgeCheck,
];

const getIconInOrder = (index: number) =>
  icons[index % icons.length]!;

export function ServicesSection() {
  const { data: config } = useFetch(getSlotGenerationConfig);
  const [services, setServiecs] = useState<Service[]>([]);

  useEffect(() => {
    (async () => {
      const servcesResult = await getServices();

      if (servcesResult) {
        setServiecs(servcesResult);
      }
    })()
  }, [])


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
          {services.map((service, index) => {
            const Icon = getIconInOrder(index);

            return (
              <div
                key={service.service}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {config?.slotduration}
                  </span>
                </div>

                <h4 className="mb-2 text-lg font-semibold text-foreground">
                  {service.service}
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
