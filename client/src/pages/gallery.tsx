import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { FestiveAmbient } from "@/components/common/festive-ambient";
import { BookingModal } from "@/components/booking/booking-modal";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Camera,
  Play,
  Smile,
  Calendar,
  ZoomIn,
  Sparkles,
  X,
} from "lucide-react";

export default function Gallery() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: packages } = useQuery<any[]>({
    queryKey: ["/api/packages"],
  });

  const { data: galleryImages = [], isLoading: galleryLoading } = useQuery<any[]>({
    queryKey: ["/api/gallery"],
  });

  const categories = [
    { id: "all", name: "All photos", icon: Camera },
    { id: "play", name: "Play activities", icon: Play },
    { id: "birthday", name: "Birthday parties", icon: Calendar },
    { id: "kids", name: "Happy kids", icon: Smile },
    { id: "facilities", name: "Facilities", icon: Camera },
  ];

  const filteredImages =
    selectedCategory === "all"
      ? galleryImages
      : galleryImages.filter((img: any) => img.category === selectedCategory);

  return (
    <div className="min-h-screen bg-toodles-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-toodles-hero">
        <FestiveAmbient confetti={8} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.25),_transparent_60%)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 text-center text-white z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-white/95 text-sm font-medium border border-white/25 mb-6">
            <Sparkles className="h-4 w-4" />
            Moments from Toodles
          </span>
          <h1 className="text-4xl md:text-6xl font-display mb-5 leading-tight">
            Our <span className="text-toodles-accent">gallery</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
            A glimpse of the everyday joy at Toodles Funzone — captured across
            play sessions, birthday parties and our celebrated little guests.
          </p>
          <Button size="lg" variant="accent" onClick={() => setShowBookingModal(true)}>
            <Calendar className="h-5 w-5" />
            Reserve a play session
          </Button>
        </div>
      </section>

      {/* Category filter */}
      <section className="py-6 border-b border-border bg-card/40 backdrop-blur sticky top-[68px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const active = selectedCategory === category.id;
              return (
                <Button
                  key={category.id}
                  variant={active ? "festive" : "outline"}
                  size="sm"
                  className="font-medium"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {galleryLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <Card key={i} variant="default" className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <Card variant="default" className="p-12 text-center">
              <Camera className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No photos in this category yet — check back soon!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image: any) => (
                <Card
                  key={image.id}
                  variant="elevated"
                  interactive
                  className="overflow-hidden group p-0"
                  onClick={() => setSelectedImage(image.imageUrl || image.src)}
                >
                  <div className="relative">
                    <img
                      src={
                        image.imageUrl ||
                        image.src ||
                        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                      }
                      alt={image.title}
                      loading="lazy"
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <Badge className="absolute top-3 right-3 shadow-soft">
                      {categories.find((c) => c.id === image.category)?.name || "All"}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-display text-toodles-text mb-1">{image.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{image.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden bg-toodles-hero">
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="text-white">
            <h2 className="text-3xl md:text-5xl font-display mb-5 leading-tight">
              Make your own <span className="text-toodles-accent">memories with us</span>
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of families who choose Toodles Funzone for play
              sessions and birthday celebrations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" variant="accent" onClick={() => setShowBookingModal(true)}>
                <Calendar className="h-5 w-5" />
                Reserve a play session
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/70 text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white"
              >
                <Camera className="h-5 w-5" />
                Share your photos
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />

      {/* Image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Gallery"
              className="max-w-full max-h-[88vh] object-contain rounded-2xl shadow-elev-lg"
            />
            <button
              className="absolute -top-3 -right-3 grid place-items-center h-10 w-10 rounded-full bg-white text-toodles-text shadow-elev hover:bg-toodles-accent transition-colors"
              onClick={() => setSelectedImage(null)}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {showBookingModal && (
        <BookingModal
          onClose={() => setShowBookingModal(false)}
          packages={packages || []}
        />
      )}
    </div>
  );
}
