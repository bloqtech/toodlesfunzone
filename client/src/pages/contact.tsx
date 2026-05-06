import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { FestiveAmbient } from "@/components/common/festive-ambient";
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  Navigation,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function Contact() {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit us",
      details: [
        "Sarjapur Main Road, Bengaluru",
        "Opposite Vishnu Leela Veg, Kodathi",
        "Karnataka 560035",
      ],
      gradient: "var(--gradient-sunset)",
    },
    {
      icon: Phone,
      title: "Call or message",
      details: [
        "+91 99012 18980",
        "Calls and WhatsApp on the same number",
        "We respond fastest during operating hours",
      ],
      gradient: "var(--gradient-sky)",
    },
    {
      icon: Clock,
      title: "Operating hours",
      details: [
        "Open all seven days of the week",
        "11:00 AM – 8:30 PM daily",
        "Including weekends and public holidays",
      ],
      gradient: "var(--gradient-candy)",
    },
  ];

  const faqs = [
    {
      question: "Do I need to book in advance?",
      answer:
        "Walk-ins are welcome, but we strongly recommend reserving online to guarantee your preferred time slot — especially on weekends and during school breaks.",
    },
    {
      question: "What safety measures are in place?",
      answer:
        "Every play zone is supervised by trained staff, monitored by CCTV, and sanitised multiple times daily. All equipment meets the safety standards expected of a children's play environment.",
    },
    {
      question: "Can parents accompany their children?",
      answer:
        "Absolutely. We have comfortable seating areas, refreshments and complimentary Wi-Fi so parents can stay close while their children play.",
    },
    {
      question: "What should children wear?",
      answer:
        "Comfortable clothing and non-slip socks are required to enter the play area. If you forget yours, socks are available at our front desk for a small fee.",
    },
    {
      question: "Are outside food and drinks allowed?",
      answer:
        "Outside food is not permitted for hygiene and safety reasons. Our on-site café offers healthy snacks, fresh juices and parent-friendly beverages.",
    },
    {
      question: "Can I reschedule or cancel a booking?",
      answer:
        "Yes — please contact us at least 24 hours in advance and we'll happily reschedule your slot to a date that suits you.",
    },
  ];

  return (
    <div className="min-h-screen bg-toodles-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-toodles-hero">
        <FestiveAmbient confetti={6} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.25),_transparent_60%)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 text-center text-white z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-white/95 text-sm font-medium border border-white/25 mb-6">
            <Sparkles className="h-4 w-4" />
            We're happy to help
          </span>
          <h1 className="text-4xl md:text-6xl font-display mb-5 leading-tight">
            Get in <span className="text-toodles-accent">touch</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Have a question about play sessions, packages or birthday parties?
            Our team is here to assist — drop us a message or visit us in
            Bengaluru.
          </p>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="eyebrow"><Sparkles className="h-3.5 w-3.5" />Reach us</span>
            <h2 className="text-3xl md:text-4xl font-display text-toodles-text mt-4 mb-2">
              Multiple ways to <span className="text-toodles-primary">connect</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Pick whichever channel works best — we usually reply within minutes during open hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.map((info) => {
              const IconComponent = info.icon;
              return (
                <Card key={info.title} variant="elevated" className="text-center p-7">
                  <div
                    className="text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-glow-primary"
                    style={{ background: info.gradient }}
                  >
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-display text-toodles-text mb-3">{info.title}</h3>
                  <div className="space-y-1">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-sm text-muted-foreground">
                        {detail}
                      </p>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-20 bg-gradient-to-b from-transparent via-[hsl(320,55%,97%)] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="eyebrow"><MapPin className="h-3.5 w-3.5" />Location</span>
            <h2 className="text-3xl md:text-4xl font-display text-toodles-text mt-4 mb-2">
              Visit us at <span className="text-gradient-sunset">our home</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Easy parking and great accessibility along Sarjapur Main Road.
            </p>
          </div>

          <Card variant="elevated" className="overflow-hidden p-0">
            <div className="relative h-96 lg:h-[500px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.8267888888895!2d77.70366!3d12.91407!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae13b7a5555555%3A0x1234567890abcdef!2sSarjapur%20Main%20Rd%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Toodles Funzone — Sarjapur Main Rd, Bengaluru"
              />
            </div>

            <div className="p-6 bg-card grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="festive"
                onClick={() => window.open("https://maps.app.goo.gl/xGe8dzTs8CdUdwej6", "_blank")}
              >
                <Navigation className="h-4 w-4" />
                Get directions
              </Button>
              <Button
                variant="sky"
                onClick={() => window.open("https://wa.me/919901218980", "_blank")}
              >
                <MessageCircle className="h-4 w-4" />
                Message on WhatsApp
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="eyebrow"><HelpCircle className="h-3.5 w-3.5" />FAQ</span>
            <h2 className="text-3xl md:text-4xl font-display text-toodles-text mt-4 mb-2">
              Questions, <span className="text-toodles-primary">answered</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Everything parents commonly ask before their first visit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {faqs.map((faq) => (
              <Card key={faq.question} variant="elevated" className="p-6">
                <div className="flex items-start gap-3">
                  <span className="grid place-items-center h-9 w-9 rounded-full bg-toodles-primary/10 text-toodles-primary shrink-0">
                    <HelpCircle className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-display text-toodles-text mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
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
