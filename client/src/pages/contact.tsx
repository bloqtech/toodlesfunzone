import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { 
  MapPin, 
  Phone, 
  Clock, 
  MessageCircle,
  Car,
  Bus,
  Train,
  Navigation,
  Instagram,
  Facebook,
  Youtube
} from "lucide-react";

export default function Contact() {

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["Opposite Vishnu Leela Veg", "Kodathi, Off Sarjapur Road", "Bangalore"],
      color: "from-toodles-primary to-pink-400"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+91 99012 18980", "WhatsApp: +91 99012 18980", "Same number for calls & WhatsApp"],
      color: "from-toodles-secondary to-teal-400"
    },

    {
      icon: Clock,
      title: "Operating Hours",
      details: ["Monday - Sunday", "10:00 AM - 8:00 PM", "Last entry at 7:00 PM"],
      color: "from-toodles-success to-green-400"
    }
  ];

  const transportOptions = [
    {
      icon: Car,
      title: "By Car",
      description: "Free parking available for 50+ vehicles",
      directions: "Take Main Road exit, turn left at Central Mall"
    },
    {
      icon: Bus,
      title: "By Bus",
      description: "Multiple bus routes available",
      directions: "Routes 15, 23, 45 stop directly outside"
    },
    {
      icon: Train,
      title: "By Metro",
      description: "5-minute walk from Central Metro Station",
      directions: "Exit 3 from Central Metro, walk towards Mall"
    }
  ];

  const faqs = [
    {
      question: "Do I need to make a reservation?",
      answer: "While walk-ins are welcome, we recommend booking in advance to guarantee your preferred time slot, especially on weekends."
    },
    {
      question: "What safety measures do you have?",
      answer: "We have trained staff supervision, CCTV monitoring, regular sanitization, and all equipment meets safety standards."
    },
    {
      question: "Can parents accompany children?",
      answer: "Yes! Parents are welcome to accompany their children. We have comfortable seating areas and free Wi-Fi."
    },
    {
      question: "What should children wear?",
      answer: "Comfortable clothing and non-slip socks are required. We sell socks on-site if needed."
    },
    {
      question: "Are outside food and drinks allowed?",
      answer: "Outside food is not permitted for hygiene reasons. We have a café with healthy snacks and beverages."
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
              Get In <span className="text-toodles-accent">Touch</span>
            </h1>
            <p className="text-xl md:text-2xl font-accent mb-8">
              We're here to help make your visit amazing!
            </p>
            <p className="text-lg mb-8 max-w-3xl mx-auto">
              Have questions about our play zones, birthday parties, or booking? Our friendly team is ready to assist you with all your enquiries.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              Contact <span className="text-toodles-primary">Information</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Multiple ways to reach us</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <Card key={index} className="text-center transform hover:scale-105 transition-all">
                  <CardContent className="p-6">
                    <div className={`bg-gradient-to-r ${info.color} text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-display text-toodles-text mb-4">{info.title}</h3>
                    <div className="space-y-2">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600 text-sm">{detail}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Location Map */}
      <section className="py-20 bg-toodles-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              Find <span className="text-toodles-primary">Us</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Visit us at our exciting location</p>
          </div>
          
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Google Maps Embed */}
              <div className="relative h-96 lg:h-[500px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.8267888888895!2d77.7037!3d12.9141!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae13b7a5555555%3A0x1234567890abcdef!2sKodathi%2C%20Sarjapur%20Road%2C%20Bangalore%2C%20Karnataka%2C%20India!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Toodles Funzone Location"
                  className="rounded-lg"
                />
              </div>
              
              {/* Location Details Overlay */}
              <div className="p-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-toodles-primary text-white rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-toodles-text mb-2">Address</h3>
                    <p className="text-gray-600 text-sm">Opposite Vishnu Leela Veg, Kodathi, Off Sarjapur Road, Bangalore</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-toodles-secondary text-white rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <Phone className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-toodles-text mb-2">Call Us</h3>
                    <p className="text-gray-600 text-sm">+91 99012 18980</p>
                    <p className="text-gray-500 text-xs">WhatsApp Available</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-toodles-success text-white rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-toodles-text mb-2">Hours</h3>
                    <p className="text-gray-600 text-sm">10:00 AM - 8:00 PM</p>
                    <p className="text-gray-500 text-xs">Monday - Sunday</p>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <Button 
                    className="bg-toodles-primary hover:bg-red-600 text-white font-accent font-bold"
                    onClick={() => window.open('https://maps.google.com/maps?q=Kodathi,+Sarjapur+Road,+Bangalore', '_blank')}
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Get Directions
                  </Button>
                  <Button 
                    className="bg-toodles-secondary hover:bg-teal-600 text-white font-accent font-bold"
                    onClick={() => window.open('https://wa.me/919901218980', '_blank')}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp Us
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How to Reach Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              How to <span className="text-toodles-secondary">Reach Us</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Choose your preferred mode of transport</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {transportOptions.map((option, index) => {
              const IconComponent = option.icon;
              return (
                <Card key={index} className="text-center transform hover:scale-105 transition-all">
                  <CardContent className="p-6">
                    <div className="bg-toodles-primary text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-display text-toodles-text mb-2">{option.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                    <p className="text-gray-500 text-xs">{option.directions}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-toodles-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-toodles-text mb-4">
              Frequently Asked <span className="text-toodles-primary">Questions</span>
            </h2>
            <p className="text-xl text-gray-600 font-accent">Common questions answered</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-display text-toodles-text mb-3">{faq.question}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
