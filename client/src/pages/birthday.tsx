import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { BirthdayForm } from "@/components/booking/birthday-form";
import { useState } from "react";
import { 
  Gift, 
  Users, 
  Camera, 
  Music, 
  Cake,
  LifeBuoy,
  Star,
  Heart,
  CheckCircle
} from "lucide-react";

export default function Birthday() {
  const [showBirthdayForm, setShowBirthdayForm] = useState(false);

  const birthdayPackages = [
    {
      name: "Magic Starter",
      price: 2999,
      duration: 2,
      guests: 10,
      features: [
        "2-hour party slot",
        "Themed decorations",
        "Birthday cake (1kg)",
        "Party games & activities",
        "Basic photography",
        "Party favors for guests",
        "Dedicated party host"
      ],
      color: "from-toodles-primary to-pink-400",
      icon: Gift
    },
    {
      name: "Deluxe Celebration",
      price: 4999,
      duration: 3,
      guests: 15,
      features: [
        "3-hour party slot",
        "Premium themed decorations",
        "Birthday cake (2kg)",
        "Magic show or entertainment",
        "Professional photography",
        "Party favors & goodie bags",
        "Dedicated party coordinator",
        "Light refreshments"
      ],
      color: "from-toodles-secondary to-teal-400",
      icon: Star,
      popular: true
    },
    {
      name: "Ultimate Extravaganza",
      price: 7999,
      duration: 4,
      guests: 20,
      features: [
        "4-hour party slot",
        "Luxury themed decorations",
        "Custom birthday cake (3kg)",
        "Live entertainment show",
        "Professional photographer",
        "Premium party favors",
        "Personal party manager",
        "Full meal service",
        "LifeBuoy decorations"
      ],
      color: "from-toodles-accent to-orange-400",
      icon: Heart
    }
  ];

  const themes = [
    {
      name: "Princess Palace",
      description: "Fairy tale magic with crowns, castles, and pink decorations",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      color: "bg-pink-100 text-pink-800"
    },
    {
      name: "Superhero Adventure",
      description: "Action-packed fun with cape-wearing heroes and villains",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      color: "bg-blue-100 text-blue-800"
    },
    {
      name: "Jungle Safari",
      description: "Wild adventure with animals, greenery, and explorer themes",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      color: "bg-green-100 text-green-800"
    },
    {
      name: "Space Explorer",
      description: "Blast off to the stars with rockets, planets, and astronauts",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      color: "bg-purple-100 text-purple-800"
    },
    {
      name: "Underwater Kingdom",
      description: "Dive deep with mermaids, sea creatures, and ocean themes",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      color: "bg-teal-100 text-teal-800"
    },
    {
      name: "Rainbow Unicorn",
      description: "Magical unicorns with rainbow colors and sparkly decorations",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      color: "bg-yellow-100 text-yellow-800"
    }
  ];

  const addOnServices = [
    {
      name: "Professional Photography",
      description: "Dedicated photographer for the entire party",
      price: 1499,
      icon: Camera
    },
    {
      name: "DJ & Sound System",
      description: "Music and microphone for party games",
      price: 999,
      icon: Music
    },
    {
      name: "Custom Cake Design",
      description: "Personalized cake with your child's favorite theme",
      price: 799,
      icon: Cake
    },
    {
      name: "LifeBuoy Decorations",
      description: "Premium balloon arch and table decorations",
      price: 1299,
      icon: LifeBuoy
    }
  ];

  const partyInclusions = [
    "Exclusive use of party area",
    "All play zone access for guests",
    "Dedicated party coordinator",
    "Setup and cleanup service",
    "Party invitations (digital)",
    "Birthday throne for special child",
    "Safety supervision throughout",
    "Emergency first aid support"
  ];

  return (
    <div className="min-h-screen bg-toodles-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-toodles-primary via-toodles-secondary to-toodles-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl md:text-6xl font-display mb-6">
                <span className="text-toodles-accent">Magical</span> Birthday Parties
              </h1>
              <p className="text-xl md:text-2xl font-accent mb-8">
                Make your child's special day unforgettable! 🎉
              </p>
              <p className="text-lg mb-8 leading-relaxed">
                Create lasting memories with our themed birthday party packages. From princesses to superheroes, we bring your child's favorite characters to life in our magical play environment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-toodles-accent hover:bg-yellow-400 text-toodles-text font-accent font-bold text-lg"
                  onClick={() => setShowBirthdayForm(true)}
                >
                  <Gift className="mr-2 h-5 w-5" />
                  Plan My Party
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-toodles-text font-accent font-bold text-lg"
                >
                  View Gallery
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="Birthday Party Celebration" 
                  className="rounded-2xl shadow-lg w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Birthday Packages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              Birthday <span className="text-toodles-primary">Packages</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Choose the perfect celebration for your little one</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {birthdayPackages.map((pkg, index) => {
              const IconComponent = pkg.icon;
              return (
                <Card 
                  key={index} 
                  className={`transform hover:scale-105 transition-all shadow-xl rounded-3xl overflow-hidden relative ${
                    pkg.popular ? 'border-4 border-toodles-secondary' : ''
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-toodles-secondary text-white font-accent font-bold text-sm px-4 py-2">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <div className={`h-2 bg-gradient-to-r ${pkg.color}`}></div>
                  
                  <CardContent className="p-8 text-center">
                    <div className={`bg-gradient-to-r ${pkg.color} text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    
                    <h3 className="text-2xl font-display text-toodles-text mb-4">{pkg.name}</h3>
                    
                    <div className="mb-6">
                      <div className="text-4xl font-display text-toodles-primary mb-2">₹{pkg.price}</div>
                      <div className="text-sm text-gray-500">
                        {pkg.duration} hours • Up to {pkg.guests} guests
                      </div>
                    </div>
                    
                    <ul className="text-left space-y-3 mb-8">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-toodles-success mr-3 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full bg-toodles-primary hover:bg-red-600 text-white font-accent font-bold"
                      onClick={() => setShowBirthdayForm(true)}
                    >
                      Book This Package
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Themes Section */}
      <section className="py-20 bg-toodles-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              Popular <span className="text-toodles-secondary">Themes</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Choose from our exciting themed decorations</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {themes.map((theme, index) => (
              <Card key={index} className="overflow-hidden transform hover:scale-105 transition-all shadow-lg">
                <div className="relative h-48">
                  <img 
                    src={theme.image} 
                    alt={theme.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className={`${theme.color} font-accent font-bold`}>
                      {theme.name}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600">{theme.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Add-on Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              Add-on <span className="text-toodles-primary">Services</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Make your party even more special</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOnServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card key={index} className="text-center p-6 transform hover:scale-105 transition-all">
                  <div className="bg-toodles-primary text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-display text-toodles-text mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <div className="text-2xl font-display text-toodles-primary mb-4">₹{service.price}</div>
                  <Button 
                    variant="outline" 
                    className="w-full border-toodles-primary text-toodles-primary hover:bg-toodles-primary hover:text-white"
                  >
                    Add to Package
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Party Inclusions */}
      <section className="py-20 bg-gradient-to-br from-toodles-secondary to-toodles-success">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-16">
            <h2 className="text-4xl md:text-5xl font-display mb-4">
              Every Party <span className="text-toodles-accent">Includes</span>
            </h2>
            <p className="text-xl font-accent">Standard features in all our birthday packages</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partyInclusions.map((inclusion, index) => (
              <Card key={index} className="p-6 text-center bg-white bg-opacity-10 backdrop-blur-sm text-white">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-toodles-accent" />
                <p className="font-accent">{inclusion}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              How It <span className="text-toodles-primary">Works</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Simple steps to plan your perfect party</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Choose Package",
                description: "Select the perfect birthday package for your child"
              },
              {
                step: 2,
                title: "Pick Theme",
                description: "Choose from our exciting themed decorations"
              },
              {
                step: 3,
                title: "Book Date",
                description: "Schedule your party date and time slot"
              },
              {
                step: 4,
                title: "Enjoy Party",
                description: "Relax while we handle everything for you"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-toodles-primary text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-display">
                  {step.step}
                </div>
                <h3 className="text-xl font-display text-toodles-text mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
      
      {showBirthdayForm && (
        <BirthdayForm onClose={() => setShowBirthdayForm(false)} />
      )}
    </div>
  );
}
