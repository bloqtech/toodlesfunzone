import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { BookingModal } from "@/components/booking/booking-modal";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Camera, 
  Play, 
  Users, 
  Star,
  Heart,
  Smile,
  Calendar,
  ZoomIn
} from "lucide-react";

export default function Gallery() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: packages } = useQuery({
    queryKey: ["/api/packages"],
  });

  const categories = [
    { id: 'all', name: 'All Photos', icon: Camera },
    { id: 'play', name: 'Play Activities', icon: Play },
    { id: 'birthday', name: 'Birthday Parties', icon: Heart },
    { id: 'kids', name: 'Happy Kids', icon: Smile },
    { id: 'facilities', name: 'Facilities', icon: Star }
  ];

  const galleryImages = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      title: "Colorful Indoor Playground",
      category: "play",
      description: "Our vibrant play area with slides and climbing structures"
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      title: "Soft Play Zone",
      category: "play",
      description: "Safe foam blocks and tunnels for toddlers"
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      title: "Birthday Party Celebration",
      category: "birthday",
      description: "Magical birthday party with cake and decorations"
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      title: "Adventure Playground",
      category: "play",
      description: "Climbing walls and obstacle courses for active kids"
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      title: "Ball Pit Fun",
      category: "play",
      description: "Thousands of colorful balls for endless diving fun"
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      title: "Happy Children Playing",
      category: "kids",
      description: "Joyful moments of children enjoying our play zones"
    },
    {
      id: 7,
      src: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      title: "Sensory Play Area",
      category: "play",
      description: "Interactive sensory elements for development"
    },
    {
      id: 8,
      src: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      title: "Creative Arts Corner",
      category: "play",
      description: "Arts and crafts activities for creative expression"
    },
    {
      id: 9,
      src: "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      title: "Mini Rides Zone",
      category: "play",
      description: "Safe ride-on toys and mini train adventures"
    },
    {
      id: 10,
      src: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      title: "Toddler Safe Zone",
      category: "play",
      description: "Specially designed area for youngest visitors"
    },
    {
      id: 11,
      src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      title: "Parent Seating Area",
      category: "facilities",
      description: "Comfortable seating for parents to relax"
    },
    {
      id: 12,
      src: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      title: "Safety Equipment",
      category: "facilities",
      description: "Safety mats and protective barriers throughout"
    }
  ];

  const filteredImages = selectedCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  const testimonials = [
    {
      name: "Priya Sharma",
      image: "https://images.unsplash.com/photo-1494790108755-2616b2cb6d96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      rating: 5,
      comment: "Amazing place for kids! The facilities are clean and safe.",
      date: "2 days ago"
    },
    {
      name: "Rajesh Kumar",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      rating: 5,
      comment: "Perfect birthday party venue. Staff was very helpful!",
      date: "1 week ago"
    },
    {
      name: "Anjali Patel",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
      rating: 5,
      comment: "My son loves the ball pit! Great value for money.",
      date: "2 weeks ago"
    }
  ];

  return (
    <div className="min-h-screen bg-toodles-background festive-background">
      {/* Festive Background Elements */}
      <div className="balloon balloon-1"></div>
      <div className="balloon balloon-2"></div>
      <div className="balloon balloon-3"></div>
      
      <div className="doodle doodle-star">⭐</div>
      <div className="doodle doodle-heart">💖</div>
      <div className="doodle doodle-smiley">😄</div>
      
      <div className="spray-paint spray-1"></div>
      <div className="spray-paint spray-2"></div>

      {/* Confetti */}
      {Array.from({length: 8}, (_, i) => (
        <div key={i} className="confetti" style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 2}s`
        }}></div>
      ))}
      
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-toodles-primary via-toodles-secondary to-toodles-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-6xl font-display mb-6">
              Our <span className="text-toodles-accent">Gallery</span>
            </h1>
            <p className="text-xl md:text-2xl font-accent mb-8">
              See the magic and joy at Toodles Funzone
            </p>
            <p className="text-lg mb-8 max-w-3xl mx-auto">
              Take a visual journey through our colorful play zones, happy celebrations, and memorable moments. Every photo tells a story of joy, laughter, and endless fun!
            </p>
            <Button 
              size="lg" 
              className="bg-toodles-accent hover:bg-yellow-400 text-toodles-text font-accent font-bold text-lg"
              onClick={() => setShowBookingModal(true)}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book Your Visit
            </Button>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`${
                    selectedCategory === category.id
                      ? "bg-toodles-primary text-white"
                      : "border-toodles-primary text-toodles-primary hover:bg-toodles-primary hover:text-white"
                  } font-accent`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image, index) => (
              <Card 
                key={image.id} 
                className="overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedImage(image.src)}
              >
                <div className="relative">
                  <img 
                    src={image.src} 
                    alt={image.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <Badge className="absolute top-2 right-2 bg-toodles-primary text-white">
                    {categories.find(c => c.id === image.category)?.name || 'All'}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-display text-toodles-text mb-2">{image.title}</h3>
                  <p className="text-sm text-gray-600">{image.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Happy Moments Section */}
      <section className="py-20 bg-gradient-to-br from-toodles-background to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              Happy <span className="text-toodles-primary">Moments</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Creating memories that last a lifetime</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 text-center bg-gradient-to-br from-toodles-primary to-pink-400 text-white">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-display mb-2">500+</h3>
              <p className="font-accent">Happy Families</p>
            </Card>
            
            <Card className="p-8 text-center bg-gradient-to-br from-toodles-secondary to-teal-400 text-white">
              <Heart className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-display mb-2">1000+</h3>
              <p className="font-accent">Smiles Created</p>
            </Card>
            
            <Card className="p-8 text-center bg-gradient-to-br from-toodles-accent to-orange-400 text-white">
              <Star className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-display mb-2">50+</h3>
              <p className="font-accent">Birthday Parties</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials with Photos */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              What <span className="text-toodles-secondary">Parents Say</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Real experiences from happy families</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 transform hover:scale-105 transition-all">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h3 className="font-display text-toodles-text">{testimonial.name}</h3>
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-toodles-accent text-toodles-accent" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                <p className="text-sm text-gray-500">{testimonial.date}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-toodles-secondary to-toodles-success">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-white">
            <h2 className="text-4xl md:text-5xl font-display mb-6">
              Ready to Create <span className="text-toodles-accent">Your Own</span> Memories?
            </h2>
            <p className="text-xl font-accent mb-8">
              Join our community of happy families and create unforgettable moments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-toodles-accent hover:bg-yellow-400 text-toodles-text font-accent font-bold text-lg"
                onClick={() => setShowBookingModal(true)}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Your Visit
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-toodles-text font-accent font-bold text-lg"
              >
                <Camera className="mr-2 h-5 w-5" />
                Share Your Photos
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
      
      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={selectedImage} 
              alt="Gallery Image"
              className="max-w-full max-h-full object-contain"
            />
            <Button
              className="absolute top-4 right-4 bg-white text-black hover:bg-gray-100"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </Button>
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
