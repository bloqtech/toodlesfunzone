import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BookingModal } from "@/components/booking/booking-modal";
import { BirthdayForm } from "@/components/booking/birthday-form";

import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { FallbackVideoPlayer } from "@/components/common/fallback-video-player";
import { FestiveAmbient } from "@/components/common/festive-ambient";
import {
  Calendar,
  Users,
  Shield,
  Star,
  Gift,
  Heart,
  PlayCircle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function Landing() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showBirthdayForm, setShowBirthdayForm] = useState(false);

  const { data: packages } = useQuery<any[]>({
    queryKey: ["/api/packages"],
  });

  const { data: activities = [] } = useQuery<any[]>({
    queryKey: ["/api/activities"],
  });

  const trustStats = [
    { value: "5,000+", label: "Happy little explorers" },
    { value: "300+", label: "Birthday parties hosted" },
    { value: "4.9", label: "Average parent rating" },
    { value: "100%", label: "Trained & vetted staff" },
  ];

  return (
    <div className="min-h-screen bg-toodles-background">
      <Header />

      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden bg-toodles-hero">
        <FestiveAmbient confetti={10} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.25),_transparent_60%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-white/95 text-sm font-medium border border-white/25 mb-6">
                <Sparkles className="h-4 w-4" />
                Bengaluru's most-loved indoor play zone
              </span>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display text-white leading-[1.05] mb-6 animate-bounce-gentle">
                Where childhood{" "}
                <span className="block text-toodles-accent drop-shadow-[0_3px_0_rgba(0,0,0,0.08)]">
                  comes to play
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white/95 mb-4 font-accent">
                Big fun for little feet.
              </p>
              <p className="text-base md:text-lg text-white/85 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                A safe, supervised indoor playground for children aged 2 to 8.
                Reserve a play session online or let our team plan a birthday
                celebration your family will remember for years.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  variant="accent"
                  onClick={() => setShowBookingModal(true)}
                >
                  <Calendar className="h-5 w-5" />
                  Reserve a play session
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/70 text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white"
                  onClick={() => {
                    const phoneNumber = "+919901218980";
                    const message =
                      "Hi Toodles Funzone team — I'd like to know more about your play sessions and birthday packages.";
                    const encodedMessage = encodeURIComponent(message);
                    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodedMessage}`;
                    window.open(whatsappUrl, "_blank");
                  }}
                >
                  <PlayCircle className="h-5 w-5" />
                  Talk to us on WhatsApp
                </Button>
              </div>
            </div>

            <div className="relative lg:pl-6">
              <div className="absolute -inset-4 bg-white/15 rounded-[2rem] blur-2xl pointer-events-none" />
              <Card variant="glass" className="relative p-3 md:p-4 rounded-[2rem] border-white/40">
                <FallbackVideoPlayer
                  className="rounded-[1.5rem] shadow-elev w-full h-72 md:h-96"
                  autoAdvance={true}
                  advanceInterval={8}
                />
              </Card>

              <div className="absolute -top-5 -right-3 md:-right-5 rotate-6 bg-white rounded-2xl shadow-elev px-4 py-2 flex items-center gap-2">
                <Star className="h-5 w-5 text-toodles-accent fill-toodles-accent" />
                <span className="font-semibold text-sm text-toodles-text">
                  Trusted by 5,000+ families
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* soft fade to page background */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-transparent to-[var(--toodles-background)] pointer-events-none" />
      </section>

      {/* ───────── Trust strip ───────── */}
      <section className="relative -mt-10 z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Card variant="glass" className="px-6 py-6 md:py-7">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {trustStats.map((s) => (
                <div key={s.label} className="flex flex-col items-center">
                  <div className="text-2xl md:text-3xl font-display text-gradient-sunset leading-none mb-1">
                    {s.value}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground font-medium">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* ───────── Activities ───────── */}
      <section id="activities" className="relative py-20 md:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <span className="eyebrow mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              What's inside
            </span>
            <h2 className="text-3xl md:text-5xl font-display text-toodles-text mt-4 mb-3 leading-tight">
              Play zones designed for{" "}
              <span className="text-gradient-sunset">growing minds</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Each area is purpose-built to encourage active play, sensory
              exploration and social development — all in a supervised,
              safety-first environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities?.map((activity: any, index: number) => (
              <Card
                key={activity.id || index}
                variant="elevated"
                interactive
                className={`text-white overflow-hidden border-transparent bg-gradient-to-br ${activity.gradient || "from-[hsl(335,88%,62%)] to-[hsl(268,88%,68%)]"}`}
              >
                <CardContent className="p-5">
                  <img
                    src={activity.image}
                    alt={activity.title}
                    loading="lazy"
                    className="rounded-2xl mb-4 w-full h-44 object-cover"
                  />
                  <h3 className="text-lg font-display mb-1.5">{activity.title}</h3>
                  <p className="text-sm text-white/85 leading-relaxed">
                    {activity.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
                <Button
                  size="lg"
                  variant="festive"
                  onClick={() => setShowBookingModal(true)}
                >
                  <Calendar className="h-5 w-5" />
                  Reserve a play session
                </Button>
          </div>
        </div>
      </section>

      {/* ───────── Packages ───────── */}
      <section
        id="packages"
        className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-transparent via-[hsl(320,55%,97%)] to-transparent"
      >
        <FestiveAmbient confetti={6} blobs={false} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="eyebrow mb-4">
              <Gift className="h-3.5 w-3.5" />
              Plans & pricing
            </span>
            <h2 className="text-3xl md:text-5xl font-display text-toodles-text mt-4 mb-3 leading-tight">
              Choose the right{" "}
              <span className="text-gradient-sky">play package</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Clear, all-inclusive pricing — no hidden fees. Reserve your slot
              online, pay securely, and walk in ready to play.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {packages?.map((pkg: any, index: number) => {
              const isFeatured = index === 1;
              return (
                <Card
                  key={pkg.id}
                  variant={isFeatured ? "elevated" : "default"}
                  className={`relative overflow-hidden hover-lift ${
                    isFeatured
                      ? "ring-2 ring-toodles-secondary/60 shadow-glow-secondary md:-translate-y-2"
                      : ""
                  }`}
                >
                  {isFeatured && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-toodles-secondary text-white text-[0.7rem] font-bold uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl shadow-soft">
                        Most popular
                      </div>
                    </div>
                  )}
                  <CardContent className="p-8 text-center">
                    <div
                      className={`rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-5 text-white ${
                        isFeatured
                          ? "bg-[image:var(--gradient-sky)]"
                          : "bg-[image:var(--gradient-sunset)]"
                      }`}
                    >
                      {index === 0 && <Users className="h-8 w-8" />}
                      {index === 1 && <Star className="h-8 w-8" />}
                      {index === 2 && <Gift className="h-8 w-8" />}
                    </div>
                    <h3 className="text-2xl font-display text-toodles-text mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 px-2">
                      {pkg.description}
                    </p>
                    <div className="mb-1">
                      <span className="text-4xl font-display text-gradient-sunset">
                        ₹{pkg.price}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-6">
                      per child · {pkg.duration} hours
                    </div>

                    <ul className="text-left space-y-2.5 mb-8">
                      {pkg.features?.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-toodles-success mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={isFeatured ? "sky" : "festive"}
                      className="w-full"
                      onClick={() => setShowBookingModal(true)}
                    >
                      Book {pkg.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── Birthday band ───────── */}
      <section
        id="birthday"
        className="relative py-20 md:py-28 overflow-hidden bg-toodles-hero"
      >
        <FestiveAmbient confetti={8} />
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-white text-sm font-medium border border-white/25 mb-5">
                <Heart className="h-4 w-4" />
                Birthday parties
              </span>
              <h2 className="text-3xl md:text-5xl font-display mb-5 leading-tight">
                Birthdays they'll{" "}
                <span className="text-toodles-accent">always remember</span>
              </h2>
              <p className="text-lg text-white/90 mb-8 leading-relaxed max-w-xl">
                Themed décor, a dedicated host, hand-picked activities and
                catering — every detail is taken care of, so you can be present
                with your child on their big day.
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  { icon: Gift, text: "Themed décor & full setup" },
                  { icon: PlayCircle, text: "Curated games and entertainment" },
                  { icon: Users, text: "Catering with kid-friendly menus" },
                  { icon: Heart, text: "Professional photography on request" },
                ].map((item) => (
                  <li
                    key={item.text}
                    className="flex items-center gap-3 text-white/95"
                  >
                    <span className="rounded-full bg-white/20 p-2">
                      <item.icon className="h-4 w-4 text-toodles-accent" />
                    </span>
                    <span className="text-base md:text-lg">{item.text}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                variant="accent"
                onClick={() => setShowBirthdayForm(true)}
              >
                <Gift className="h-5 w-5" />
                Enquire about a party
              </Button>
            </div>

            <div className="relative lg:pl-6">
              <div className="absolute -inset-4 bg-white/15 rounded-[2rem] blur-2xl pointer-events-none" />
              <Card variant="glass" className="relative p-3 md:p-4 rounded-[2rem] border-white/40 -rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                  alt="Birthday Party Celebration"
                  loading="lazy"
                  className="rounded-[1.5rem] shadow-elev w-full h-auto"
                />
              </Card>

              <div className="absolute -top-5 -right-3 md:-right-5 rotate-6 bg-white rounded-2xl shadow-elev px-5 py-3 text-center">
                <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-semibold">
                  Starting at
                </div>
                <div className="font-display text-2xl text-toodles-primary leading-none">
                  ₹13,000
                </div>
              </div>
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
