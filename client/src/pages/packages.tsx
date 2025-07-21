import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { BookingModal } from "@/components/booking/booking-modal";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Calendar, 
  Star, 
  Users, 
  Shield, 
  Clock,
  Gift,
  Crown,
  Check,
  Zap
} from "lucide-react";

export default function Packages() {
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: packages } = useQuery({
    queryKey: ["/api/packages"],
  });

  const packageIcons = {
    walk_in: Users,
    weekend: Star,
    monthly: Crown,
    birthday: Gift
  };

  const packageColors = {
    walk_in: "from-toodles-primary to-pink-400",
    weekend: "from-toodles-secondary to-teal-400",
    monthly: "from-toodles-accent to-orange-400",
    birthday: "from-toodles-success to-green-400"
  };

  const addOns = [
    {
      name: "Photography Package",
      description: "Professional photos of your child's play session",
      price: 299,
      icon: "📸"
    },
    {
      name: "Snack Combo",
      description: "Healthy snacks and juice for your little one",
      price: 149,
      icon: "🍎"
    },
    {
      name: "Socks (Required)",
      description: "Non-slip socks for safe play (if forgotten)",
      price: 49,
      icon: "🧦"
    },
    {
      name: "Extended Play Time",
      description: "Add 1 extra hour to your session",
      price: 149,
      icon: "⏰"
    }
  ];

  const compareFeatures = [
    "Access to all play zones",
    "Safety supervision",
    "Free Wi-Fi for parents",
    "Complimentary water",
    "Extended play time",
    "Complimentary snacks",
    "Priority booking",
    "Bring a friend discount",
    "Birthday party discount",
    "Exclusive member events"
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
              Choose Your <span className="text-toodles-accent">Perfect Package</span>
            </h1>
            <p className="text-xl md:text-2xl font-accent mb-8">
              Flexible options for every family's needs
            </p>
            <p className="text-lg mb-8 max-w-3xl mx-auto">
              From walk-in sessions to monthly unlimited passes, we have packages designed to fit your schedule and budget while ensuring maximum fun for your little ones.
            </p>
            <Button 
              size="lg" 
              className="bg-toodles-accent hover:bg-yellow-400 text-toodles-text font-accent font-bold text-lg"
              onClick={() => setShowBookingModal(true)}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book Now
            </Button>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              Our <span className="text-toodles-primary">Play Packages</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Choose the perfect package for your little ones</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages?.map((pkg, index) => {
              const IconComponent = packageIcons[pkg.type as keyof typeof packageIcons] || Users;
              const isPopular = index === 1;
              
              return (
                <Card 
                  key={pkg.id} 
                  className={`transform hover:scale-105 transition-all shadow-xl rounded-3xl overflow-hidden relative ${
                    isPopular ? 'border-4 border-toodles-secondary' : 'border-4 border-toodles-primary'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-toodles-secondary text-white font-accent font-bold text-sm px-4 py-2">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <div className={`h-2 bg-gradient-to-r ${packageColors[pkg.type as keyof typeof packageColors] || 'from-toodles-primary to-pink-400'}`}></div>
                  
                  <CardContent className="p-8 text-center">
                    <div className={`${isPopular ? 'bg-toodles-secondary' : 'bg-toodles-primary'} text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    
                    <h3 className="text-2xl font-display text-toodles-text mb-2">{pkg.name}</h3>
                    <p className="text-gray-600 mb-6">{pkg.description}</p>
                    
                    <div className="mb-6">
                      <div className="text-4xl font-display text-toodles-primary mb-2">₹{pkg.price}</div>
                      <div className="text-sm text-gray-500">
                        per child ({pkg.duration} hours)
                        {pkg.type === 'monthly' && ' - unlimited visits'}
                      </div>
                    </div>
                    
                    <ul className="text-left space-y-3 mb-8">
                      {pkg.features?.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <Check className="h-4 w-4 text-toodles-success mr-3 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${
                        isPopular 
                          ? 'bg-toodles-secondary hover:bg-teal-600' 
                          : 'bg-toodles-primary hover:bg-red-600'
                      } text-white font-accent font-bold`}
                      onClick={() => setShowBookingModal(true)}
                    >
                      {pkg.type === 'monthly' ? 'Get Monthly Pass' : 'Book Now'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-20 bg-toodles-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              Enhance Your <span className="text-toodles-secondary">Experience</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Optional add-ons to make your visit even more special</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon, index) => (
              <Card key={index} className="text-center p-6 transform hover:scale-105 transition-all">
                <div className="text-4xl mb-4">{addon.icon}</div>
                <h3 className="text-xl font-display text-toodles-text mb-2">{addon.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{addon.description}</p>
                <div className="text-2xl font-display text-toodles-primary mb-4">₹{addon.price}</div>
                <Button 
                  variant="outline" 
                  className="w-full border-toodles-primary text-toodles-primary hover:bg-toodles-primary hover:text-white"
                >
                  Add to Package
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Package Comparison */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              Package <span className="text-toodles-primary">Comparison</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Compare features across all packages</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-xl">
              <thead>
                <tr className="bg-toodles-primary text-white">
                  <th className="px-6 py-4 text-left font-display">Features</th>
                  <th className="px-6 py-4 text-center font-display">Walk-in</th>
                  <th className="px-6 py-4 text-center font-display">Weekend</th>
                  <th className="px-6 py-4 text-center font-display">Monthly</th>
                </tr>
              </thead>
              <tbody>
                {compareFeatures.map((feature, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 font-medium text-toodles-text">{feature}</td>
                    <td className="px-6 py-4 text-center">
                      {index < 4 ? (
                        <Check className="h-5 w-5 text-toodles-success mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {index < 7 ? (
                        <Check className="h-5 w-5 text-toodles-success mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="h-5 w-5 text-toodles-success mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-20 bg-gradient-to-br from-toodles-secondary to-toodles-success">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-16">
            <h2 className="text-4xl md:text-5xl font-display mb-4">
              Special <span className="text-toodles-accent">Offers</span>
            </h2>
            <p className="text-xl font-accent">Limited time deals and discounts</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 text-center bg-white bg-opacity-10 backdrop-blur-sm text-white">
              <Zap className="h-12 w-12 mx-auto mb-4 text-toodles-accent" />
              <h3 className="text-2xl font-display mb-2">First Visit Special</h3>
              <p className="text-lg font-accent mb-4">20% OFF</p>
              <p className="text-sm opacity-90">Valid for first-time visitors only</p>
            </Card>
            
            <Card className="p-8 text-center bg-white bg-opacity-10 backdrop-blur-sm text-white">
              <Users className="h-12 w-12 mx-auto mb-4 text-toodles-accent" />
              <h3 className="text-2xl font-display mb-2">Sibling Discount</h3>
              <p className="text-lg font-accent mb-4">15% OFF</p>
              <p className="text-sm opacity-90">When booking for 2+ siblings</p>
            </Card>
            
            <Card className="p-8 text-center bg-white bg-opacity-10 backdrop-blur-sm text-white">
              <Gift className="h-12 w-12 mx-auto mb-4 text-toodles-accent" />
              <h3 className="text-2xl font-display mb-2">Birthday Month</h3>
              <p className="text-lg font-accent mb-4">FREE Play</p>
              <p className="text-sm opacity-90">Free 2-hour session on your child's birthday</p>
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
