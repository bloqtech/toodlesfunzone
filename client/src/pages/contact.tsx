import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { 
  MapPin, 
  Phone, 
  Mail, 
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    type: 'general'
  });
  
  const { toast } = useToast();

  const enquiryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/enquiry', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Enquiry Submitted",
        description: "Thank you for your enquiry. We'll get back to you soon!",
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        type: 'general'
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit enquiry. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enquiryMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

      {/* Contact Form & Map */}
      <section className="py-20 bg-toodles-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-display text-toodles-text">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Enquiry Type</Label>
                    <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select enquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Enquiry</SelectItem>
                        <SelectItem value="booking">Booking Enquiry</SelectItem>
                        <SelectItem value="birthday">Birthday Party</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Your Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Tell us how we can help you..."
                      rows={5}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-toodles-primary hover:bg-red-600 text-white font-accent font-bold"
                    disabled={enquiryMutation.isPending}
                  >
                    {enquiryMutation.isPending ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Map & Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-display text-toodles-text">Find Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Map placeholder */}
                  <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Navigation className="h-12 w-12 mx-auto mb-2 text-toodles-primary" />
                      <p className="text-gray-600">Interactive Map Coming Soon</p>
                      <p className="text-sm text-gray-500">123 Fun Street, Playground City</p>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="border-toodles-primary text-toodles-primary hover:bg-toodles-primary hover:text-white"
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Get Directions
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-toodles-secondary text-toodles-secondary hover:bg-toodles-secondary hover:text-white"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp Us
                    </Button>
                  </div>
                  
                  {/* Social Media */}
                  <div className="text-center">
                    <h3 className="text-lg font-display text-toodles-text mb-4">Follow Us</h3>
                    <div className="flex justify-center space-x-4">
                      <Button variant="outline" size="icon">
                        <Facebook className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Instagram className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Youtube className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
