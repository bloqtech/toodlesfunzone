import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";

interface TestimonialsProps {
  reviews?: Array<{
    name?: string;
    rating?: number;
    comment?: string;
    role?: string;
  }>;
}

export function Testimonials({ reviews = [] }: TestimonialsProps) {
  const displayReviews = reviews.filter((review) => review.comment?.trim()).slice(0, 3);
  if (displayReviews.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <span className="eyebrow mb-4">
            <Star className="h-3.5 w-3.5" />
            Family feedback
          </span>
          <h2 className="text-3xl md:text-5xl font-display text-toodles-text mt-4 mb-3">
            Loved by <span className="text-gradient-sunset">happy families</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Honest experiences from parents who have made special memories at Toodles.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayReviews.slice(0, 3).map((testimonial, index) => (
            <Card key={index} variant="elevated" className="relative h-full">
              <CardContent className="p-7">
                <Quote className="absolute top-6 right-6 h-8 w-8 text-toodles-primary/15" />
                <div className="flex items-center gap-1 mb-5 text-toodles-accent">
                  {Array.from({ length: testimonial.rating || 5 }, (_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-toodles-text/80 leading-relaxed min-h-24">
                  “{testimonial.comment}”
                </p>
                <div className="mt-6 pt-5 border-t border-border/60">
                  <div className="font-semibold text-toodles-text">{testimonial.name || "Toodles family"}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role || "Toodles Funzone customer"}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {reviews.length > 3 && (
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              And {reviews.length - 3} more happy families...
            </p>
            <div className="flex justify-center space-x-2">
              {Array.from({ length: Math.min(5, reviews.length - 3) }, (_, i) => (
                <Star key={i} className="h-6 w-6 text-toodles-accent fill-current" />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
