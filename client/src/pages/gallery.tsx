import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { BookingModal } from "@/components/booking/booking-modal";
import { PhotoLightbox } from "@/components/common/photo-lightbox";
import { mediaFilters, mosaicSpan, useLocalMedia } from "@/lib/local-media";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Calendar, Camera, Play } from "lucide-react";

export default function Gallery() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const requested = new URLSearchParams(search).get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState(requested);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: packages } = useQuery<any[]>({ queryKey: ["/api/packages"] });
  const { data: media = [], isLoading } = useLocalMedia();
  const hasVideos = media.some((item) => item.mediaType === "video");
  const filters = mediaFilters.filter((filter) => filter.id !== "video" || hasVideos);

  useEffect(() => {
    const next = new URLSearchParams(search).get("category") || "all";
    const known = mediaFilters.some((filter) => filter.id === next) && (next !== "video" || hasVideos);
    setSelectedCategory(known ? next : "all");
    setOpenIndex(null);
  }, [search, hasVideos]);

  const filtered = media.filter((item) => {
    if (selectedCategory === "all") return item.mediaType !== "video";
    if (selectedCategory === "video") return item.mediaType === "video";
    return item.category === selectedCategory;
  });

  const choose = (id: string) => {
    setSelectedCategory(id);
    setOpenIndex(null);
    const url = id === "all" ? "/gallery" : `/gallery?category=${id}`;
    navigate(url, { replace: true });
  };

  return (
    <div className="min-h-screen bg-toodles-background">
      <Header />

      <section className="relative overflow-hidden bg-toodles-hero">
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 text-center text-white sm:px-6 md:py-20 lg:px-8">
          <h1 className="mb-4 font-display text-4xl leading-tight md:text-6xl">
            Our <span className="text-toodles-accent">gallery</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
            Play, birthdays, decorations, and school visits at Toodles Funzone.
          </p>
          <Button size="lg" variant="accent" onClick={() => setShowBookingModal(true)}>
            <Calendar className="h-5 w-5" />
            Reserve a play session
          </Button>
        </div>
      </section>

      <section className="sticky top-[68px] z-30 border-b border-border bg-card/90 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-2 px-4 sm:px-6 lg:px-8">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedCategory === filter.id ? "festive" : "outline"}
              size="sm"
              onClick={() => choose(filter.id)}
            >
              {filter.name}
            </Button>
          ))}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="min-h-[180px] animate-pulse rounded-[1.5rem] bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[1.5rem] bg-card px-6 py-16 text-center shadow-sm">
              <Camera className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No photos in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 items-start gap-3 md:grid-cols-4">
              {filtered.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`group relative overflow-hidden rounded-[1.5rem] bg-muted text-left shadow-md ${mosaicSpan(index, filtered.length)}`}
                  aria-label={`Open ${item.title || item.categoryLabel}`}
                  onClick={() => setOpenIndex(index)}
                >
                  {item.mediaType === "video" && !item.poster ? (
                    <video src={`${item.src}#t=1`} muted playsInline preload="auto" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <img
                      src={item.mediaType === "video" ? item.poster || item.src : item.src}
                      alt={item.title || item.categoryLabel}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-toodles-text">
                    {item.categoryLabel}
                  </span>
                  {item.mediaType === "video" && (
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-toodles-primary shadow-elev">
                        <Play className="h-5 w-5 fill-current" />
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />

      {openIndex !== null && (
        <PhotoLightbox
          items={filtered}
          index={openIndex}
          onIndex={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}

      {showBookingModal && (
        <BookingModal onClose={() => setShowBookingModal(false)} packages={packages || []} />
      )}
    </div>
  );
}
