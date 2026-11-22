import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { FestiveAmbient } from "@/components/common/festive-ambient";
import { BirthdayForm } from "@/components/booking/birthday-form";
import { BirthdayFeedback, BirthdayMedia } from "@/components/common/birthday-media";
import { PhotoMosaic } from "@/components/common/photo-mosaic";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import {
  Gift,
  Users,
  Camera,
  Music,
  Cake,
  Star,
  Heart,
  CheckCircle,
  Sparkles,
} from "lucide-react";

export default function Birthday() {
  const [showBirthdayForm, setShowBirthdayForm] = useState(false);

  const { data: birthdayPackages = [], isLoading: packagesLoading } = useQuery<any[]>({
    queryKey: ["/api/birthday-packages"],
  });

  const partyInclusions = [
    "Private party area, just for your guests",
    "Full play-zone access for every child",
    "A dedicated party coordinator",
    "Complete setup and clean-up handled by us",
    "Custom digital invitations",
    "Birthday throne for the guest of honour",
    "Trained supervision throughout the event",
    "On-site first-aid support",
  ];

  return (
    <div className="min-h-screen bg-toodles-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-toodles-hero">
        <FestiveAmbient confetti={12} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.25),_transparent_60%)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 z-10">
          <div className="space-y-10">
            <div className="text-white max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-white text-sm font-medium border border-white/25 mb-5">
                <Sparkles className="h-4 w-4" />
                Birthday parties
              </span>
              <h1 className="text-4xl md:text-6xl font-display mb-5 leading-tight">
                Birthdays your child will{" "}
                <span className="text-toodles-accent">never forget</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-7 leading-relaxed max-w-xl">
                Themed décor, a dedicated host, hand-picked activities and
                full-service catering — every detail is handled by our team so
                you can be fully present with your child on their big day.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" variant="accent" onClick={() => setShowBirthdayForm(true)}>
                  <Gift className="h-5 w-5" />
                  Enquire about a party
                </Button>
                <Link href="/gallery?category=birthday">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/70 text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white"
                  >
                    See past parties
                  </Button>
                </Link>
              </div>
            </div>

            <BirthdayMedia />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="mb-6 font-display text-3xl text-toodles-text md:text-4xl">Birthday celebrations</h2>
            <PhotoMosaic category="birthday" photosOnly />
          </div>
          <div>
            <h2 className="mb-6 font-display text-3xl text-toodles-text md:text-4xl">Decorations</h2>
            <PhotoMosaic category="decor" />
          </div>
        </div>
      </section>

      <BirthdayFeedback />

      {/* Birthday packages */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="eyebrow"><Gift className="h-3.5 w-3.5" />Packages</span>
            <h2 className="text-3xl md:text-4xl font-display text-toodles-text mt-4 mb-2">
              Birthday <span className="text-gradient-sunset">packages</span>
            </h2>
            <p className="text-muted-foreground">
              Choose the package that suits your child's age and your guest list — every option is fully managed.
            </p>
          </div>

          {packagesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} variant="default" className="overflow-hidden animate-pulse">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="bg-muted rounded-full w-16 h-16 mx-auto" />
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-8 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded" />
                    <div className="h-10 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {birthdayPackages.map((pkg: any) => {
                const iconMap: any = { Gift, Star, Heart, Users, Camera, Music, Cake };
                const IconComponent = iconMap[pkg.icon || "Gift"] || Gift;

                return (
                  <Card
                    key={pkg.id}
                    variant={pkg.isPopular ? "elevated" : "default"}
                    className={`relative overflow-hidden hover-lift ${
                      pkg.isPopular
                        ? "ring-2 ring-toodles-secondary/60 shadow-glow-secondary md:-translate-y-2"
                        : ""
                    }`}
                  >
                    {pkg.isPopular && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-toodles-secondary text-white text-[0.7rem] font-bold uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl shadow-soft">
                          Most popular
                        </div>
                      </div>
                    )}

                    <CardContent className="p-8 text-center">
                      <div className="rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-5 text-white bg-[image:var(--gradient-sunset)]">
                        <IconComponent className="h-8 w-8" />
                      </div>

                      <h3 className="text-2xl font-display text-toodles-text mb-2">{pkg.name}</h3>

                      <div className="mb-1">
                        <span className="text-4xl font-display text-gradient-sunset">₹{pkg.price}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-6">
                        {pkg.duration} hours · up to {pkg.maxGuests} guests
                      </div>

                      <ul className="text-left space-y-2.5 mb-8">
                        {pkg.features?.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-toodles-success mt-0.5 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button variant="festive" className="w-full" onClick={() => setShowBirthdayForm(true)}>
                        Enquire about this package
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Inclusions */}
      <section className="relative py-20 overflow-hidden bg-toodles-hero">
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center text-white mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-white text-sm font-medium border border-white/25 mb-5">
              <Heart className="h-4 w-4" />
              Always included
            </span>
            <h2 className="text-3xl md:text-4xl font-display mb-2">
              Every party comes with{" "}
              <span className="text-toodles-accent">these as standard</span>
            </h2>
            <p className="text-white/85 mt-2 max-w-xl mx-auto">
              No surprises, no hidden charges — these essentials are part of every birthday booking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {partyInclusions.map((inclusion) => (
              <Card
                key={inclusion}
                variant="default"
                className="p-6 text-center bg-white text-toodles-text shadow-elev hover-lift border-white/60"
              >
                <span className="grid place-items-center h-12 w-12 rounded-full bg-toodles-success/10 text-toodles-success mx-auto mb-3">
                  <CheckCircle className="h-6 w-6" />
                </span>
                <p className="text-sm font-semibold leading-snug">{inclusion}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="eyebrow"><Sparkles className="h-3.5 w-3.5" />Process</span>
            <h2 className="text-3xl md:text-4xl font-display text-toodles-text mt-4 mb-2">
              How it <span className="text-gradient-sunset">works</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Four simple steps to a stress-free celebration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Choose a package", description: "Pick the package that fits your child's age and guest count." },
              { step: 2, title: "Pick a theme", description: "Select from our themed worlds — or tell us your own idea." },
              { step: 3, title: "Confirm the date", description: "Lock in the date, time and any add-ons with our team." },
              { step: 4, title: "Show up & celebrate", description: "Walk in to a fully prepared venue. We handle the rest." },
            ].map((step) => (
              <div key={step.step} className="text-center">
                <div className="bg-[image:var(--gradient-sunset)] text-white rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 text-xl font-display shadow-glow-primary">
                  {step.step}
                </div>
                <h3 className="text-lg font-display text-toodles-text mb-1.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />

      {showBirthdayForm && <BirthdayForm onClose={() => setShowBirthdayForm(false)} />}
    </div>
  );
}
