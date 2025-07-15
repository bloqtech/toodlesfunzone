import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BookingModal } from "@/components/booking/booking-modal";
import { BirthdayForm } from "@/components/booking/birthday-form";
import { Testimonials } from "@/components/common/testimonials";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { 
  Calendar, 
  Clock, 
  Users, 
  Shield, 
  Star,
  Gift,
  Heart,
  PlayCircle
} from "lucide-react";

export default function Landing() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showBirthdayForm, setShowBirthdayForm] = useState(false);

  const { data: packages } = useQuery({
    queryKey: ["/api/packages"],
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/reviews"],
  });

  const activities = [
    {
      title: "Soft Play Zone",
      description: "Safe foam blocks, tunnels, and climbing structures for toddlers",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
      gradient: "from-toodles-primary to-pink-400"
    },
    {
      title: "Adventure Zone",
      description: "Slides, climbing walls, and obstacle courses for active kids",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
      gradient: "from-toodles-secondary to-blue-400"
    },
    {
      title: "Ball Pit Paradise",
      description: "Thousands of colorful balls for endless diving fun",
      image: "https://images.unsplash.com/photo-1570554886111-e80fcca6a029?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
      gradient: "from-toodles-accent to-orange-400"
    },
    {
      title: "Bouncy Castle",
      description: "Safe trampolines and bounce houses for jumping joy",
      image: "https://pixabay.com/get/gb1920997e34194c0a6df14b76cedbb086800e74192608c7fd1daceead1ae4d0f878e01b8e77d5c945f2d265b58138617bdc5a2b48ba2c3fd0f50dbafe43661d1_1280.jpg",
      gradient: "from-toodles-success to-green-400"
    },
    {
      title: "Sensory Play",
      description: "Textures, sounds, and interactive elements for development",
      image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      title: "Creative Corner",
      description: "Arts, crafts, and imaginative play activities",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
      gradient: "from-indigo-400 to-purple-500"
    },
    {
      title: "Mini Rides",
      description: "Safe ride-on toys and mini train adventures",
      image: "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
      gradient: "from-teal-400 to-cyan-500"
    },
    {
      title: "Toddler Zone",
      description: "Special area designed for our youngest visitors (2-4 years)",
      image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200",
      gradient: "from-red-400 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-toodles-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-toodles-primary via-toodles-secondary to-toodles-accent">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-display text-white leading-tight mb-6">
                Welcome to <span className="text-toodles-accent">Toodles Funzone!</span>
              </h1>
              <p className="text-xl md:text-2xl text-white mb-8 font-accent">
                Big fun for little feet ✨
              </p>
              <p className="text-lg text-white mb-8 leading-relaxed">
                Embark on a magical adventure at Toodles Funzone, where every corner is filled with wonder and joy. Our indoor playground is designed to spark imagination in children aged 2-8 years, combining safety with endless fun!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-toodles-accent hover:bg-yellow-400 text-toodles-text font-accent font-bold text-lg"
                  onClick={() => setShowBookingModal(true)}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Your Slot
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-toodles-text font-accent font-bold text-lg"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Call Now
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="Toodles Funzone Indoor Playground" 
                  className="rounded-2xl shadow-lg w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section id="activities" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              Discover The Magic Of <span className="text-toodles-primary">Toodles Funzone</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">India's Premier Indoor Playground Experience</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {activities.map((activity, index) => (
              <Card key={index} className={`bg-gradient-to-br ${activity.gradient} text-white transform hover:scale-105 transition-all shadow-lg hover:shadow-xl rounded-3xl overflow-hidden`}>
                <CardContent className="p-6">
                  <img 
                    src={activity.image} 
                    alt={activity.title} 
                    className="rounded-2xl mb-4 w-full h-48 object-cover"
                  />
                  <h3 className="text-xl font-display mb-2">{activity.title}</h3>
                  <p className="text-sm opacity-90">{activity.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-toodles-primary hover:bg-red-600 text-white font-accent font-bold text-lg"
              onClick={() => setShowBookingModal(true)}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book Your Adventure
            </Button>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-20 bg-gradient-to-br from-toodles-background to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              Our <span className="text-toodles-secondary">Play Packages</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Choose the perfect package for your little ones</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages?.map((pkg, index) => (
              <Card key={pkg.id} className={`transform hover:scale-105 transition-all shadow-xl rounded-3xl overflow-hidden ${index === 1 ? 'border-4 border-toodles-secondary relative' : 'border-4 border-toodles-primary'}`}>
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-toodles-secondary text-white font-accent font-bold text-sm">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8 text-center">
                  <div className={`${index === 1 ? 'bg-toodles-secondary' : 'bg-toodles-primary'} text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                    {index === 0 && <Users className="h-8 w-8" />}
                    {index === 1 && <Star className="h-8 w-8" />}
                    {index === 2 && <Gift className="h-8 w-8" />}
                  </div>
                  <h3 className="text-2xl font-display text-toodles-text mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-6">{pkg.description}</p>
                  <div className="text-4xl font-display text-toodles-primary mb-6">₹{pkg.price}</div>
                  <div className="text-sm text-gray-500 mb-8">per child ({pkg.duration} hours)</div>
                  
                  <ul className="text-left space-y-3 mb-8">
                    {pkg.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <Shield className="h-4 w-4 text-toodles-success mr-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${index === 1 ? 'bg-toodles-secondary hover:bg-teal-600' : 'bg-toodles-primary hover:bg-red-600'} text-white font-accent font-bold`}
                    onClick={() => setShowBookingModal(true)}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Birthday Section */}
      <section id="birthday" className="py-20 bg-gradient-to-br from-toodles-primary to-toodles-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl font-display mb-6">
                <span className="text-toodles-accent">Birthday</span> Parties
              </h2>
              <p className="text-xl font-accent mb-8">
                Make your child's special day truly magical with our amazing birthday party packages!
              </p>
              <p className="text-lg mb-8 leading-relaxed">
                Our birthday celebration team creates unforgettable memories with themed decorations, games, activities, and delicious treats. Every party is customized to your child's interests and age group.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <Gift className="text-toodles-accent mr-4 h-6 w-6" />
                  <span className="text-lg">Themed decorations & setup</span>
                </div>
                <div className="flex items-center">
                  <PlayCircle className="text-toodles-accent mr-4 h-6 w-6" />
                  <span className="text-lg">Interactive games & activities</span>
                </div>
                <div className="flex items-center">
                  <Users className="text-toodles-accent mr-4 h-6 w-6" />
                  <span className="text-lg">Delicious food & beverages</span>
                </div>
                <div className="flex items-center">
                  <Heart className="text-toodles-accent mr-4 h-6 w-6" />
                  <span className="text-lg">Photography & memories</span>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="bg-toodles-accent hover:bg-yellow-400 text-toodles-text font-accent font-bold text-lg"
                onClick={() => setShowBirthdayForm(true)}
              >
                <Gift className="mr-2 h-5 w-5" />
                Plan My Party
              </Button>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="Birthday Party Celebration" 
                  className="rounded-2xl shadow-lg w-full h-auto"
                />
              </div>
              
              <div className="absolute -top-4 -right-4 bg-toodles-accent text-toodles-text rounded-full p-4 shadow-xl">
                <div className="text-center">
                  <div className="font-display text-lg">Starting</div>
                  <div className="font-display text-2xl">₹2,999</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials reviews={reviews} />

      {/* Our Story Section */}
      <section className="py-20 bg-gradient-to-br from-toodles-secondary to-toodles-success">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="Toodles Funzone Interior" 
                  className="rounded-2xl shadow-lg w-full h-auto"
                />
              </div>
            </div>
            
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl font-display mb-6">
                Our <span className="text-toodles-accent">Story</span>
              </h2>
              <p className="text-xl font-accent mb-8">
                Where imagination meets endless fun and every child's smile matters
              </p>
              <p className="text-lg mb-6 leading-relaxed">
                Toodles Funzone is a one-of-a-kind concept, elevating indoor play to unparalleled heights. We invite you into a realm where traditional play meets boundless imagination.
              </p>
              <p className="text-lg mb-8 leading-relaxed">
                Our funzone seamlessly blends safety, creativity, and joy to create an interactive and unforgettable experience for children of all ages. Here, play takes on new dimensions, nurturing development and learning skills while captivating young minds with wonder and discovery.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-display text-toodles-accent">500+</div>
                  <div className="text-sm">Happy Families</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-display text-toodles-accent">2-8</div>
                  <div className="text-sm">Age Groups</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-display text-toodles-accent">10+</div>
                  <div className="text-sm">Play Zones</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-display text-toodles-accent">100%</div>
                  <div className="text-sm">Safety First</div>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="bg-toodles-accent hover:bg-yellow-400 text-toodles-text font-accent font-bold text-lg"
              >
                <Heart className="mr-2 h-5 w-5" />
                Meet Our Team
              </Button>
            </div>
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
      
      {showBirthdayForm && (
        <BirthdayForm onClose={() => setShowBirthdayForm(false)} />
      )}
    </div>
  );
}
