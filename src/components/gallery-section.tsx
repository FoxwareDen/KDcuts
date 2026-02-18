import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import img1 from "@/assets/KD Cuts results/IMG_0053.jpeg";
import img2 from "@/assets/KD Cuts results/IMG_0374.jpeg";
import img3 from "@/assets/KD Cuts results/IMG_3632.jpeg";
import img4 from "@/assets/KD Cuts results/IMG_4815.jpeg";
import img5 from "@/assets/KD Cuts results/IMG_5062.jpeg";
import img6 from "@/assets/KD Cuts results/IMG_5706.jpeg";
import img7 from "@/assets/KD Cuts results/IMG_5971.jpeg";
import img8 from "@/assets/KD Cuts results/IMG_6061.jpeg";

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const images = [
    { src: img1, alt: "Precision fade haircut" },
    { src: img2, alt: "Classic gentleman's cut" },
    { src: img3, alt: "Modern textured style" },
    { src: img4, alt: "Sharp line-up and fade" },
    { src: img5, alt: "Stylish beard trim" },
    { src: img6, alt: "Contemporary cut" },
    { src: img7, alt: "Clean fade design" },
    { src: img8, alt: "Professional grooming" },
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCarouselIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [images.length]);

  const goTo = (index: number, dir: number) => {
    setDirection(dir);
    setCarouselIndex((index + images.length) % images.length);
  };

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut"  // Put the easing string inside a transition object
    },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut"  // Put the easing string inside a transition object
    },
  }),
};

  // Visible dot indices — always show 3 centered around current
  const visibleDots = images.map((_, i) => i);

  return (
    <section className="bg-background py-20 md:py-32 relative overflow-hidden border-b border">
      {/* Animated Background Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          initial={{ x: "-100%", rotate: 45 }}
          animate={{ x: "100%" }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center" }}
        />
        <motion.div
          className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/15 to-transparent"
          initial={{ x: "100%", rotate: -45 }}
          animate={{ x: "-100%" }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
          style={{ transformOrigin: "center" }}
        />
        <motion.div
          className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          initial={{ x: "-100%", rotate: 45 }}
          animate={{ x: "100%" }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 4 }}
          style={{ transformOrigin: "center" }}
        />
        <motion.div
          className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/15 to-transparent"
          initial={{ x: "100%", rotate: -45 }}
          animate={{ x: "-100%" }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear", delay: 6 }}
          style={{ transformOrigin: "center" }}
        />
        <motion.div
          className="absolute left-1/4 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent"
          initial={{ y: "-100%" }}
          animate={{ y: "100%" }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute right-1/4 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent"
          initial={{ y: "100%" }}
          animate={{ y: "-100%" }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 3 }}
        />
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 border-t-2 border-l-2 border-primary/20"
          initial={{ opacity: 1, scale: 0.8 }}
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-20 h-20 border-b-2 border-r-2 border-primary/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Section Header */}
      <div className="mx-auto max-w-7xl px-4 mb-12 relative z-10">
        <div className="text-center">
          <h2 className="text-5xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-primary from-30% to-muted-foreground bg-clip-text text-transparent">
            Our Work Speaks for Itself
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Browse through some of our latest cuts and styles
          </p>
        </div>
      </div>

      {/* ── MOBILE CAROUSEL (sm and below) ── */}
      <div className="sm:hidden relative z-10 px-4">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={carouselIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 cursor-pointer"
              onClick={() => setSelectedImage(carouselIndex)}
            >
              <img
                src={images[carouselIndex].src}
                alt={images[carouselIndex].alt}
                className="h-full w-full object-cover"
              />
              {/* Gradient caption bar */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent py-4 px-4">
                <p className="text-white text-sm font-medium">
                  {images[carouselIndex].alt}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next arrows */}
          <button
            onClick={() => goTo(carouselIndex - 1, -1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            aria-label="Previous"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => goTo(carouselIndex + 1, 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex size-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            aria-label="Next"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {visibleDots.map((i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > carouselIndex ? 1 : -1)}
              aria-label={`Go to image ${i + 1}`}
              className="transition-all duration-300"
            >
              <span
                className={`block rounded-full bg-primary transition-all duration-300 ${
                  i === carouselIndex ? "w-5 h-2 opacity-100" : "w-2 h-2 opacity-30"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Counter */}
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {carouselIndex + 1} / {images.length}
        </p>
      </div>

      {/* ── DESKTOP GRID (sm and above) ── */}
      <div className="hidden sm:block w-full relative z-10">
        <div className="grid grid-cols-2 gap-0 lg:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden bg-muted cursor-pointer"
              onClick={() => setSelectedImage(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                <p className="text-white text-sm font-medium px-4 text-center">
                  Click to view full image
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <X className="size-6" />
          </button>

          <div
            className="relative max-h-[90vh] max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              className="h-auto w-full rounded-lg object-contain max-h-[80vh]"
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((prev) =>
                  prev === 0 ? images.length - 1 : prev! - 1
                );
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((prev) =>
                  prev === images.length - 1 ? 0 : prev! + 1
                );
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              aria-label="Next image"
            >
              <ChevronRight className="size-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-sm">
              {selectedImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}