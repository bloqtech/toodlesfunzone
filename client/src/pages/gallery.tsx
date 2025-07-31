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

  const { data: galleryImages = [], isLoading: galleryLoading } = useQuery({
    queryKey: ["/api/gallery"],
  });

  const categories = [
    { id: 'all', name: 'All Photos', icon: Camera },
    { id: 'play', name: 'Play Activities', icon: Play },
    { id: 'birthday', name: 'Birthday Parties', icon: Calendar },
    { id: 'kids', name: 'Happy Kids', icon: Smile },
    { id: 'facilities', name: 'Facilities', icon: Camera }
  ];

  const filteredImages = selectedCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

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
          {galleryLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image: any) => (
                <Card 
                  key={image.id} 
                  className="overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedImage(image.imageUrl || image.src)}
                >
                  <div className="relative">
                    <img 
                      src={image.imageUrl || image.src || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"} 
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
          )}
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
