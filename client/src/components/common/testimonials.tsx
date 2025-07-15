import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TestimonialsProps {
  reviews?: any[];
}

export function Testimonials({ reviews = [] }: TestimonialsProps) {
  // Default testimonials if no reviews provided
  const defaultTestimonials = [
    {
      name: "Priya Sharma",
      image: "https://images.unsplash.com/photo-1494790108755-2616b2cb6d96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      rating: 5,
      comment: "Amazing place for kids! The facilities are clean and safe. My daughter had the best time ever!",
      role: "Mother of 2"
    },
    {
      name: "Rajesh Kumar",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      rating: 5,
      comment: "We celebrated my son's 6th birthday here and it was magical! The team arranged everything perfectly.",
      role: "Father of 3"
    },
    {
      name: "Anjali Patel",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      rating: 5,
      comment: "Clean, safe, and so much fun! My 4-year-old loves the ball pit. Great value for money.",
      role: "Mother of 1"
    }
  ];

  const displayReviews = reviews.length > 0 ? reviews : defaultTestimonials;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
            What <span className="text-toodles-primary">Parents Say</span>
          </h2>
          <p className="text-xl text-gray-600 font-accent">Real experiences from happy families</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayReviews.slice(0, 3).map((testimonial, index) => (
            <Card key={index} className="bg-gradient-to-br from-toodles-background to-white rounded-3xl p-8 shadow-lg transform hover:scale-105 transition-all">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <div className="font-accent font-bold text-toodles-text">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <div className="text-toodles-accent mb-4">
                  {Array.from({ length: testimonial.rating || 5 }, (_, i) => (
                    <Star key={i} className="inline h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic">
                  "{testimonial.comment}"
                </p>
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
