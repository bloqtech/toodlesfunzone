import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BookingModal } from "@/components/booking/booking-modal";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { 
  Calendar, 
  Clock, 
  Users, 
  Star,
  Gift,
  Heart,
  PlayCircle,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function Home() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { user } = useAuth();

  const { data: packages } = useQuery({
    queryKey: ["/api/packages"],
  });

  const { data: bookings } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const { data: birthdayParties } = useQuery({
    queryKey: ["/api/birthday-parties"],
  });

  return (
    <div className="min-h-screen bg-toodles-background festive-background">
      {/* Festive Background Elements */}
      <div className="balloon balloon-1"></div>
      <div className="balloon balloon-2"></div>
      <div className="balloon balloon-3"></div>
      <div className="balloon balloon-4"></div>
      <div className="balloon balloon-5"></div>
      
      <div className="streamer streamer-top"></div>
      <div className="streamer streamer-bottom"></div>
      
      <div className="spray-paint spray-1"></div>
      <div className="spray-paint spray-2"></div>
      <div className="spray-paint spray-3"></div>
      
      <div className="doodle doodle-star">⭐</div>
      <div className="doodle doodle-heart">💖</div>
      <div className="doodle doodle-smiley">😄</div>
      <div className="doodle doodle-rainbow">🌈</div>

      {/* Confetti */}
      {Array.from({length: 12}, (_, i) => (
        <div key={i} className="confetti" style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 2}s`
        }}></div>
      ))}
      
      <Header />
      
      {/* Welcome Section */}
      <section className="py-20 bg-gradient-to-br from-toodles-primary via-toodles-secondary to-toodles-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-display mb-6">
              Welcome back, <span className="text-toodles-accent">{user?.firstName || 'Friend'}!</span>
            </h1>
            <p className="text-xl md:text-2xl font-accent mb-8">
              Ready for more magical adventures at Toodles Funzone? ✨
            </p>
            <Button 
              size="lg" 
              className="bg-toodles-accent hover:bg-yellow-400 text-toodles-text font-accent font-bold text-lg"
              onClick={() => setShowBookingModal(true)}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book New Adventure
            </Button>
          </div>
        </div>
      </section>

      {/* My Bookings Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-4xl font-display text-toodles-text mb-4">
              My <span className="text-toodles-primary">Bookings</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Track your upcoming and past adventures</p>
          </div>
          
          {bookings && bookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <Card key={booking.id} className="transform hover:scale-105 transition-all shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-display text-toodles-text">
                        Booking #{booking.id}
                      </CardTitle>
                      <div className="flex items-center">
                        {booking.status === 'confirmed' && (
                          <CheckCircle className="h-5 w-5 text-toodles-success" />
                        )}
                        {booking.status === 'pending' && (
                          <Clock className="h-5 w-5 text-toodles-accent" />
                        )}
                        {booking.status === 'cancelled' && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-toodles-primary mr-2" />
                        <span className="text-sm">{booking.bookingDate}</span>
                        {booking.timeSlot && (
                          <span className="text-sm ml-2 text-gray-600">
                            • {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-toodles-primary mr-2" />
                        <span className="text-sm">{booking.numberOfChildren} Children</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-toodles-primary mr-2" />
                        <span className="text-sm">₹{booking.totalAmount}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' 
                          ? 'bg-toodles-success text-white' 
                          : booking.status === 'pending'
                          ? 'bg-toodles-accent text-toodles-text'
                          : 'bg-red-500 text-white'
                      }`}>
                        {booking.status?.toUpperCase()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <PlayCircle className="h-16 w-16 text-toodles-primary mx-auto mb-4" />
                <h3 className="text-xl font-display text-toodles-text mb-2">No bookings yet!</h3>
                <p className="text-gray-600 mb-6">Start your adventure by booking your first play session.</p>
                <Button 
                  onClick={() => setShowBookingModal(true)}
                  className="bg-toodles-primary hover:bg-red-600 text-white font-accent font-bold"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Now
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Birthday Parties Section */}
      <section className="py-20 bg-toodles-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-4xl font-display text-toodles-text mb-4">
              My <span className="text-toodles-secondary">Birthday Parties</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Your special celebrations with us</p>
          </div>
          
          {birthdayParties && birthdayParties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {birthdayParties.map((party) => (
                <Card key={party.id} className="transform hover:scale-105 transition-all shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-display text-toodles-text">
                        {party.childName}'s Party
                      </CardTitle>
                      <Gift className="h-5 w-5 text-toodles-accent" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-toodles-primary mr-2" />
                        <span className="text-sm">{party.partyDate}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-toodles-primary mr-2" />
                        <span className="text-sm">{party.numberOfGuests} Guests</span>
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-toodles-primary mr-2" />
                        <span className="text-sm">Age {party.childAge}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-toodles-primary mr-2" />
                        <span className="text-sm">₹{party.totalAmount}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        party.status === 'confirmed' 
                          ? 'bg-toodles-success text-white' 
                          : party.status === 'pending'
                          ? 'bg-toodles-accent text-toodles-text'
                          : 'bg-red-500 text-white'
                      }`}>
                        {party.status?.toUpperCase()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Gift className="h-16 w-16 text-toodles-secondary mx-auto mb-4" />
                <h3 className="text-xl font-display text-toodles-text mb-2">No birthday parties yet!</h3>
                <p className="text-gray-600 mb-6">Make your child's special day magical with our birthday packages.</p>
                <Button 
                  className="bg-toodles-secondary hover:bg-teal-600 text-white font-accent font-bold"
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Plan a Party
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display text-toodles-text mb-4">
              Quick <span className="text-toodles-primary">Actions</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">What would you like to do today?</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="transform hover:scale-105 transition-all shadow-lg bg-gradient-to-br from-toodles-primary to-pink-400 text-white">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-display mb-2">Book Now</h3>
                <p className="text-sm opacity-90 mb-4">Reserve your next play session</p>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-toodles-text hover:bg-gray-100"
                  onClick={() => setShowBookingModal(true)}
                >
                  Book Session
                </Button>
              </CardContent>
            </Card>
            
            <Card className="transform hover:scale-105 transition-all shadow-lg bg-gradient-to-br from-toodles-secondary to-teal-400 text-white">
              <CardContent className="p-6 text-center">
                <Gift className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-display mb-2">Birthday Party</h3>
                <p className="text-sm opacity-90 mb-4">Plan a magical celebration</p>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-toodles-text hover:bg-gray-100"
                >
                  Plan Party
                </Button>
              </CardContent>
            </Card>
            
            <Card className="transform hover:scale-105 transition-all shadow-lg bg-gradient-to-br from-toodles-accent to-orange-400 text-white">
              <CardContent className="p-6 text-center">
                <Star className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-display mb-2">Packages</h3>
                <p className="text-sm opacity-90 mb-4">Explore our play packages</p>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-toodles-text hover:bg-gray-100"
                >
                  View Packages
                </Button>
              </CardContent>
            </Card>
            
            <Card className="transform hover:scale-105 transition-all shadow-lg bg-gradient-to-br from-toodles-success to-green-400 text-white">
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-display mb-2">Contact</h3>
                <p className="text-sm opacity-90 mb-4">Get in touch with us</p>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-toodles-text hover:bg-gray-100"
                >
                  Contact Us
                </Button>
              </CardContent>
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
