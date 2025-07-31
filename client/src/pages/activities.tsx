import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MetaTags, pageMetaConfigs } from "@/components/seo/meta-tags";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { BookingModal } from "@/components/booking/booking-modal";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, Star, Users, Shield, Clock } from "lucide-react";

// Helper function to parse features from description
const parseFeatures = (description: string): string[] => {
  const lines = description.split('\n');
  const features: string[] = [];
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.match(/^[•·▪▫-]\s+/)) {
      // Remove bullet point and add to features
      features.push(trimmed.replace(/^[•·▪▫-]\s+/, ''));
    } else if (trimmed.match(/^[^\w\s][^\n]*$/)) {
      // Lines starting with emoji or special chars
      features.push(trimmed.substring(1).trim());
    }
  });
  
  // If no bullet points found, create generic features
  if (features.length === 0) {
    return ['Fun activities', 'Safe environment', 'Age appropriate', 'Supervised play'];
  }
  
  return features.slice(0, 4); // Limit to 4 features for display
};

export default function Activities() {
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: packages } = useQuery({
    queryKey: ["/api/packages"],
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
  });

  const safetyFeatures = [
    {
      title: "Trained Staff",
      description: "All our staff are trained in child safety and first aid",
      icon: "👨‍⚕️"
    },
    {
      title: "Regular Sanitization",
      description: "All equipment is sanitized multiple times daily",
      icon: "🧽"
    },
    {
      title: "Safety Equipment",
      description: "All play areas have safety mats and protective barriers",
      icon: "🛡️"
    },
    {
      title: "CCTV Monitoring",
      description: "Complete area coverage with 24/7 monitoring",
      icon: "📹"
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
              Discover Our <span className="text-toodles-accent">Amazing Activities</span>
            </h1>
            <p className="text-xl md:text-2xl font-accent mb-8">
              8 Exciting Play Zones Designed for Ages 2-8 Years
            </p>
            <p className="text-lg mb-8 max-w-3xl mx-auto">
              Each activity zone at Toodles Funzone is carefully designed to provide age-appropriate fun while ensuring maximum safety and developmental benefits for your little ones.
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

      {/* Activities Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activitiesLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden shadow-xl animate-pulse">
                  <div className="h-64 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {activities.map((activity: any, index: number) => {
                const features = parseFeatures(activity.description);
                const cleanDescription = activity.description.split('\n')[0] || activity.description;
                
                return (
                  <Card key={activity.id} className="overflow-hidden shadow-xl transform hover:scale-105 transition-all duration-300">
                    <div className="relative h-64">
                      {activity.image ? (
                        <img 
                          src={activity.image} 
                          alt={activity.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-6xl">{activity.icon || '🎪'}</span>
                        </div>
                      )}
                      <div className={`absolute inset-0 bg-gradient-to-t ${activity.gradient || 'from-toodles-primary to-pink-400'} opacity-80`}></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-2xl font-display">{activity.title}</h3>
                          {activity.ageGroup && (
                            <div className="bg-white bg-opacity-20 px-2 py-1 rounded-full">
                              <span className="text-sm font-accent">{activity.ageGroup}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {cleanDescription}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {features.map((feature: string, idx: number) => (
                          <div key={idx} className="flex items-center text-sm text-gray-500">
                            <Shield className="h-3 w-3 text-toodles-success mr-1" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full bg-toodles-primary hover:bg-red-600 text-white font-accent"
                        onClick={() => setShowBookingModal(true)}
                      >
                        Book This Activity
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Safety Features */}
      <section className="py-20 bg-toodles-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              Safety <span className="text-toodles-primary">First</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Your child's safety is our top priority</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyFeatures.map((feature, index) => (
              <Card key={index} className="text-center p-6 transform hover:scale-105 transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-display text-toodles-text mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Operating Hours */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              Operating <span className="text-toodles-secondary">Hours</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">We're open 7 days a week for your convenience</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 text-center bg-gradient-to-br from-toodles-primary to-pink-400 text-white">
              <Clock className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-display mb-2">Weekdays</h3>
              <p className="text-lg font-accent">10:00 AM - 8:00 PM</p>
              <p className="text-sm opacity-90 mt-2">Monday - Friday</p>
            </Card>
            
            <Card className="p-8 text-center bg-gradient-to-br from-toodles-secondary to-teal-400 text-white">
              <Star className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-display mb-2">Weekends</h3>
              <p className="text-lg font-accent">10:00 AM - 8:00 PM</p>
              <p className="text-sm opacity-90 mt-2">Saturday - Sunday</p>
            </Card>
            
            <Card className="p-8 text-center bg-gradient-to-br from-toodles-accent to-orange-400 text-white">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-display mb-2">Capacity</h3>
              <p className="text-lg font-accent">15 Kids per Slot</p>
              <p className="text-sm opacity-90 mt-2">2-hour sessions</p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
      
      {showBookingModal && (
        <BookingModal 
          onClose={() => setShowBookingModal(false)} 
          packages={packages || []}
        />
      )}
    </div>
  );
}
