import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Play } from "lucide-react";

export function HomeGallery() {
  const { data: media = [] } = useQuery<any[]>({ queryKey: ["/api/gallery"] });
  const preview = [...media]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 8);

  if (preview.length === 0) return null;

  return (
    <section id="gallery" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="eyebrow mb-4">
            <Camera className="h-3.5 w-3.5" />
            Gallery
          </span>
          <h2 className="text-3xl md:text-5xl font-display text-toodles-text mt-4 mb-3">
            Moments from <span className="text-gradient-sunset">Toodles</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Play sessions, parties and the little details families come back for.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {preview.map((item) => (
            <Card key={item.id} variant="elevated" className="overflow-hidden p-0">
              <div className="relative h-44 sm:h-52">
                {item.mediaType === "video" ? (
                  <video src={item.imageUrl || item.src} className="h-full w-full object-cover" muted playsInline />
                ) : (
                  <img src={item.imageUrl || item.src} alt={item.altText || item.title} loading="lazy" className="h-full w-full object-cover" />
                )}
                {item.mediaType === "video" && (
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium">
                    <Play className="h-3 w-3" /> Video
                  </span>
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium text-toodles-text line-clamp-1">{item.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/gallery">
            <Button variant="festive">View the full gallery</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
