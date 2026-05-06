import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { FestiveAmbient } from "@/components/common/festive-ambient";
import { BirthdayForm } from "@/components/booking/birthday-form";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import {
  Gift,
  Users,
  Camera,
  Music,
  Cake,
  LifeBuoy,
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

  const themes = [
    {
      name: "Princess Palace",
      description: "Crowns, castles and fairy-tale decor for an enchanting celebration.",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80",
      emoji: "👑",
      gradient: "from-pink-400 via-rose-400 to-fuchsia-500",
      color: "bg-pink-100 text-pink-800",
    },
    {
      name: "Superhero Adventure",
      description: "Capes, missions and heroic moments designed to bring out the brave.",
      image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80",
      emoji: "🦸",
      gradient: "from-red-500 via-orange-500 to-blue-600",
      color: "bg-blue-100 text-blue-800",
    },
    {
      name: "Jungle Safari",
      description: "An explorer's celebration with lush greenery, animals and adventure.",
      image: "https://images.unsplash.com/photo-1444930694458-01babe71870e?auto=format&fit=crop&w=800&q=80",
      emoji: "🦁",
      gradient: "from-green-500 via-emerald-500 to-lime-500",
      color: "bg-green-100 text-green-800",
    },
    {
      name: "Space Explorer",
      description: "A galactic celebration with rockets, planets and astronaut-themed games.",
      image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=800&q=80",
      emoji: "🚀",
      gradient: "from-indigo-700 via-purple-700 to-blue-900",
      color: "bg-purple-100 text-purple-800",
    },
    {
      name: "Underwater Kingdom",
      description: "A shimmering ocean party with mermaids, sea creatures and coral-reef colours.",
      image: "https://images.unsplash.com/photo-1518399681705-1fa54c9b8d4d?auto=format&fit=crop&w=800&q=80",
      emoji: "🧜‍♀️",
      gradient: "from-cyan-500 via-teal-500 to-blue-600",
      color: "bg-teal-100 text-teal-800",
    },
    {
      name: "Rainbow Unicorn",
      description: "A whimsical celebration with rainbow palettes, glitter and unicorn charm.",
      image: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=800&q=80",
      emoji: "🦄",
      gradient: "from-pink-400 via-yellow-400 to-purple-500",
      color: "bg-yellow-100 text-yellow-800",
    },
  ];

  const addOnServices = [
    { name: "Professional Photography", description: "A dedicated photographer to capture every moment of the celebration.", price: 6000, from: true, icon: Camera },
    { name: "DJ & Sound System", description: "Live music, microphones and party-game audio managed by our team.", price: 5000, from: true, icon: Music },
    { name: "Custom Cake Design", description: "A personalised cake matched to your child's chosen theme.", price: 3000, from: true, icon: Cake },
    { name: "Premium Decor", description: "Balloon arches, table styling and themed accents that elevate the venue.", price: 4000, from: true, icon: LifeBuoy },
  ];

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
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
                <Link href="/gallery">
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

            <div className="relative lg:pl-6">
              <div className="absolute -inset-4 bg-white/15 rounded-[2rem] blur-2xl pointer-events-none" />
              <Card variant="glass" className="relative p-3 md:p-4 rounded-[2rem] border-white/40 -rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  alt="Birthday Party Celebration"
                  loading="lazy"
                  className="rounded-[1.5rem] shadow-elev w-full h-auto"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

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

      {/* Themes */}
      <section className="py-20 bg-gradient-to-b from-transparent via-[hsl(320,55%,97%)] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="eyebrow"><Sparkles className="h-3.5 w-3.5" />Themes</span>
            <h2 className="text-3xl md:text-4xl font-display text-toodles-text mt-4 mb-2">
              Popular <span className="text-gradient-sky">themes</span>
            </h2>
            <p className="text-muted-foreground">
              Choose a world for your child to step into — fully decorated and brought to life by our team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {themes.map((theme) => (
              <Card key={theme.name} variant="elevated" interactive className="overflow-hidden p-0">
                <div className={`relative h-56 bg-gradient-to-br ${theme.gradient}`}>
                  <img
                    src={theme.image}
                    alt={theme.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradient} opacity-60 mix-blend-multiply`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                  <span className="absolute top-4 right-4 text-4xl drop-shadow-lg">{theme.emoji}</span>
                  <div className="absolute bottom-3 left-3 right-3">
                    <Badge className={`${theme.color} font-accent font-bold border-0 shadow-soft`}>
                      {theme.name}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Add-on services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="eyebrow"><Camera className="h-3.5 w-3.5" />Add-ons</span>
            <h2 className="text-3xl md:text-4xl font-display text-toodles-text mt-4 mb-2">
              Optional <span className="text-toodles-primary">add-on services</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Bolt these on to any package to customise the celebration further.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOnServices.map((service) => {
              const IconComponent = service.icon;
              const formattedPrice = service.price.toLocaleString("en-IN");
              return (
                <Card key={service.name} variant="elevated" className="text-center p-6">
                  <div className="bg-[image:var(--gradient-sunset)] text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-display text-toodles-text mb-1.5">{service.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <div className="mb-4">
                    {service.from && (
                      <div className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-semibold">
                        Starts from
                      </div>
                    )}
                    <div className="text-2xl font-display text-gradient-sunset">₹{formattedPrice}</div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Add to package
                  </Button>
                </Card>
              );
            })}
          </div>
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
