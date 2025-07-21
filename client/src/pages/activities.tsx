import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { BookingModal } from "@/components/booking/booking-modal";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, Star, Users, Shield, Clock } from "lucide-react";

export default function Activities() {
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: packages } = useQuery({
    queryKey: ["/api/packages"],
  });

  const activities = [
    {
      title: "Soft Play Zone",
      description: "Safe foam blocks, tunnels, and climbing structures designed specifically for toddlers aged 2-4 years. Our soft play area features colorful, washable foam pieces that encourage climbing, crawling, and imaginative play.",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      gradient: "from-toodles-primary to-pink-400",
      features: ["Age-appropriate design", "Soft foam materials", "Easy to clean", "Supervised play area"],
      ageGroup: "2-4 years"
    },
    {
      title: "Adventure Zone",
      description: "Exciting slides, climbing walls, and obstacle courses perfect for active children. This zone challenges kids physically while building confidence and coordination skills in a safe environment.",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      gradient: "from-toodles-secondary to-blue-400",
      features: ["Multiple slides", "Climbing walls", "Obstacle courses", "Safety mats"],
      ageGroup: "4-8 years"
    },
    {
      title: "Ball Pit Paradise",
      description: "Dive into thousands of colorful, sanitized balls in our spacious ball pit. This classic playground favorite provides sensory stimulation and endless fun for children of all ages.",
      image: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      gradient: "from-toodles-accent to-orange-400",
      features: ["10,000+ balls", "Regular sanitization", "Deep pit design", "Colorful environment"],
      ageGroup: "2-8 years"
    },
    {
      title: "Bouncy Castle",
      description: "Safe trampolines and bounce houses that provide hours of jumping joy. Our bouncy equipment is regularly inspected and maintained to ensure maximum safety and fun.",
      image: "https://images.unsplash.com/photo-1578768958451-1c3e0a0b3b70?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      gradient: "from-toodles-success to-green-400",
      features: ["Safety nets", "Padded surfaces", "Weight limits enforced", "Supervised sessions"],
      ageGroup: "3-8 years"
    },
    {
      title: "Sensory Play Area",
      description: "Interactive elements with various textures, sounds, and lights designed to stimulate children's senses and support their developmental growth through engaging play experiences.",
      image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      gradient: "from-purple-400 to-pink-500",
      features: ["Tactile elements", "Sound interactions", "Light displays", "Developmental focus"],
      ageGroup: "2-6 years"
    },
    {
      title: "Creative Corner",
      description: "Arts, crafts, and imaginative play activities that encourage creativity and self-expression. Our creative corner is stocked with safe, non-toxic materials for endless artistic fun.",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      gradient: "from-indigo-400 to-purple-500",
      features: ["Art supplies", "Craft materials", "Guided activities", "Take-home projects"],
      ageGroup: "3-8 years"
    },
    {
      title: "Mini Rides",
      description: "Safe ride-on toys and mini train adventures perfect for younger children. Our mini rides provide gentle movement and excitement without overwhelming smaller kids.",
      image: "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      gradient: "from-teal-400 to-cyan-500",
      features: ["Electric rides", "Manual push toys", "Mini train circuit", "Speed controls"],
      ageGroup: "2-5 years"
    },
    {
      title: "Toddler Zone",
      description: "A specially designed area exclusively for our youngest visitors aged 2-4 years. This secure zone features age-appropriate toys and activities in a contained, safe environment.",
      image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      gradient: "from-red-400 to-pink-500",
      features: ["Secure area", "Age-appropriate toys", "Soft surfaces", "Parent seating"],
      ageGroup: "2-4 years"
    }
  ];

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {activities.map((activity, index) => (
              <Card key={index} className="overflow-hidden shadow-xl transform hover:scale-105 transition-all duration-300">
                <div className="relative h-64">
                  <img 
                    src={activity.image} 
                    alt={activity.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${activity.gradient} opacity-80`}></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-display">{activity.title}</h3>
                      <div className="bg-white bg-opacity-20 px-2 py-1 rounded-full">
                        <span className="text-sm font-accent">{activity.ageGroup}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {activity.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {activity.features.map((feature, idx) => (
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
            ))}
          </div>
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
