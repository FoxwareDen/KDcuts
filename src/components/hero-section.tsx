import { Star, Clock, Award } from "lucide-react";
import { useEffect, useState } from "react";
import img1 from "@/assets/KD Cuts results/IMG_0053.jpeg"
import img2 from "@/assets/KD Cuts results/IMG_0374.jpeg"
import img3 from "@/assets/KD Cuts results/IMG_3632.jpeg"
import img4 from "@/assets/KD Cuts results/IMG_4815.jpeg"
import img5 from "@/assets/KD Cuts results/IMG_5062.jpeg"
import img6 from "@/assets/KD Cuts results/IMG_5706.jpeg"
import img7 from "@/assets/KD Cuts results/IMG_5971.jpeg"
import img8 from "@/assets/KD Cuts results/IMG_6061.jpeg"

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Placeholder images - replace these with actual work images later
  const images = [
    img1,
    img2,
    img3,
    img4,
    img5,
    img6,
    img7,
    img8
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative overflow-hidden border-b border-border bg-background py-20 md:py-32">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-background/60 z-10" />
        
        {/* Carousel Images */}
        <div className="relative h-full w-full">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={image}
                alt={`Barbershop work ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/50 hover:bg-muted-foreground"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
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

          <h2 className="max-w-3xl text-pretty text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Premium grooming for the modern gentleman
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Experience the art of traditional barbering combined with
            contemporary style. Book your appointment with Marcus today.
          </p>

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