import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { FestiveAmbient } from "@/components/common/festive-ambient";
import { BookingModal } from "@/components/booking/booking-modal";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Calendar,
  Star,
  Users,
  Gift,
  Crown,
  Check,
  Zap,
  Sparkles,
} from "lucide-react";

export default function Packages() {
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: packages } = useQuery<any[]>({
    queryKey: ["/api/packages"],
  });

  const packageIcons = {
    walk_in: Users,
    weekend: Star,
    monthly: Crown,
    birthday: Gift,
  };

  const addOns = [
    { name: "Photo memories", description: "Curated photos from your child's session, delivered the next day.", price: 299, icon: "📸" },
    { name: "Snack combo", description: "Wholesome snacks paired with fresh juice, served during play.", price: 149, icon: "🍎" },
    { name: "Non-slip socks", description: "Mandatory for safe play. Available at the counter if you forget yours.", price: 49, icon: "🧦" },
    { name: "Extended play", description: "Add an extra hour to any session — perfect when they're not ready to leave.", price: 149, icon: "⏰" },
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
    "Exclusive member events",
  ];

  return (
    <div className="min-h-screen bg-toodles-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-toodles-hero">
        <FestiveAmbient confetti={8} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.25),_transparent_60%)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 text-center text-white z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-white/95 text-sm font-medium border border-white/25 mb-6">
            <Sparkles className="h-4 w-4" />
            Transparent, all-inclusive pricing
          </span>
          <h1 className="text-4xl md:text-6xl font-display mb-5 leading-tight">
            A plan for every{" "}
            <span className="text-toodles-accent">family</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
            From single visits to monthly unlimited passes — flexible packages
            that fit your schedule and your child's energy. Cancel-friendly,
            transparently priced, and easy to book online.
          </p>
          <Button
            size="lg"
            variant="accent"
            onClick={() => setShowBookingModal(true)}
          >
            <Calendar className="h-5 w-5" />
            Reserve a play session
          </Button>
        </div>
      </section>

      {/* Packages grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="eyebrow"><Gift className="h-3.5 w-3.5" />Plans & pricing</span>
            <h2 className="text-3xl md:text-4xl font-display text-toodles-text mt-4 mb-2">
              Our <span className="text-gradient-sunset">play packages</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Pick what fits today, upgrade anytime — every plan includes full play access and trained supervision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {packages?.map((pkg: any, index: number) => {
              const IconComponent = packageIcons[pkg.type as keyof typeof packageIcons] || Users;
              const isPopular = index === 1;

              return (
                <Card
                  key={pkg.id}
                  variant={isPopular ? "elevated" : "default"}
                  className={`relative overflow-hidden hover-lift ${
                    isPopular
                      ? "ring-2 ring-toodles-secondary/60 shadow-glow-secondary md:-translate-y-2"
                      : ""
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-toodles-secondary text-white text-[0.7rem] font-bold uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl shadow-soft">
                        Most popular
                      </div>
                    </div>
                  )}

                  <CardContent className="p-8 text-center">
                    <div
                      className={`rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-5 text-white ${
                        isPopular
                          ? "bg-[image:var(--gradient-sky)]"
                          : "bg-[image:var(--gradient-sunset)]"
                      }`}
                    >
                      <IconComponent className="h-8 w-8" />
                    </div>

                    <h3 className="text-2xl font-display text-toodles-text mb-2">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground mb-6 px-2">{pkg.description}</p>

                    <div className="mb-1">
                      <span className="text-4xl font-display text-gradient-sunset">₹{pkg.price}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-6">
                      per child · {pkg.duration} hours
                      {pkg.type === "monthly" && " · unlimited visits"}
                    </div>

                    <ul className="text-left space-y-2.5 mb-8">
                      {pkg.features?.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-toodles-success mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={isPopular ? "sky" : "festive"}
                      className="w-full"
                      onClick={() => setShowBookingModal(true)}
                    >
                      {pkg.type === "monthly" ? "Get the monthly pass" : "Reserve this package"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 bg-gradient-to-b from-transparent via-[hsl(320,55%,97%)] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="eyebrow"><Sparkles className="h-3.5 w-3.5" />Add-ons</span>
            <h2 className="text-3xl md:text-4xl font-display text-toodles-text mt-4 mb-2">
              Make the visit{" "}
              <span className="text-gradient-sky">extra special</span>
            </h2>
            <p className="text-muted-foreground">
              Thoughtful additions you can tack on at booking or at the counter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon) => (
              <Card key={addon.name} variant="elevated" className="text-center p-6">
                <div className="text-4xl mb-3">{addon.icon}</div>
                <h3 className="text-lg font-display text-toodles-text mb-1.5">{addon.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{addon.description}</p>
                <div className="text-2xl font-display text-gradient-sunset mb-4">₹{addon.price}</div>
                <Button variant="outline" className="w-full">
                  Add to package
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="eyebrow"><Check className="h-3.5 w-3.5" />Compare</span>
            <h2 className="text-3xl md:text-4xl font-display text-toodles-text mt-4 mb-2">
              Compare <span className="text-toodles-primary">what's included</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              See at a glance which package fits your family best.
            </p>
          </div>

          <Card variant="elevated" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[image:var(--gradient-sunset)] text-white">
                    <th className="px-6 py-4 text-left font-display">Features</th>
                    <th className="px-6 py-4 text-center font-display">Walk-in</th>
                    <th className="px-6 py-4 text-center font-display">Weekend</th>
                    <th className="px-6 py-4 text-center font-display">Monthly</th>
                  </tr>
                </thead>
                <tbody>
                  {compareFeatures.map((feature, index) => (
                    <tr
                      key={feature}
                      className={index % 2 === 0 ? "bg-muted/40" : "bg-card"}
                    >
                      <td className="px-6 py-3.5 font-medium text-toodles-text text-sm">{feature}</td>
                      <td className="px-6 py-3.5 text-center">
                        {index < 4 ? <Check className="h-5 w-5 text-toodles-success mx-auto" /> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        {index < 7 ? <Check className="h-5 w-5 text-toodles-success mx-auto" /> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <Check className="h-5 w-5 text-toodles-success mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Special offers */}
      <section className="relative py-20 overflow-hidden bg-toodles-hero">
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center text-white mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-white text-sm font-medium border border-white/25 mb-5">
              <Zap className="h-4 w-4" />
              Member offers
            </span>
            <h2 className="text-3xl md:text-4xl font-display mb-2">
              Save with our{" "}
              <span className="text-toodles-accent">family perks</span>
            </h2>
            <p className="text-white/90">
              Built-in savings — automatically applied at checkout when you qualify.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "First-visit offer", value: "20% off", note: "Applied automatically on your family's first booking." },
              { icon: Users, title: "Sibling discount", value: "15% off", note: "Bring siblings together and save on every additional child." },
              { icon: Gift, title: "Birthday month", value: "Free play", note: "Each child enjoys one complimentary 2-hour session in their birthday month." },
            ].map((offer) => (
              <Card key={offer.title} variant="glass" className="p-8 text-center text-white">
                <offer.icon className="h-10 w-10 mx-auto mb-3 text-toodles-accent" />
                <h3 className="text-xl font-display mb-1">{offer.title}</h3>
                <p className="text-2xl font-display text-toodles-accent mb-2">{offer.value}</p>
                <p className="text-sm text-white/85">{offer.note}</p>
              </Card>
            ))}
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
