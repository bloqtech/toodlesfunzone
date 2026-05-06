import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MetaTags, pageMetaConfigs } from "@/components/seo/meta-tags";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { FestiveAmbient } from "@/components/common/festive-ambient";
import { BookingModal } from "@/components/booking/booking-modal";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, Star, Users, Shield, Clock, Sparkles } from "lucide-react";

const parseFeatures = (description: string): string[] => {
  const lines = description.split("\n");
  const features: string[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.match(/^[•·▪▫-]\s+/)) {
      features.push(trimmed.replace(/^[•·▪▫-]\s+/, ""));
    } else if (trimmed.match(/^[^\w\s][^\n]*$/)) {
      features.push(trimmed.substring(1).trim());
    }
  });

  if (features.length === 0) {
    return ["Fun activities", "Safe environment", "Age appropriate", "Supervised play"];
  }

  return features.slice(0, 4);
};

export default function Activities() {
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: packages } = useQuery<any[]>({
    queryKey: ["/api/packages"],
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery<any[]>({
    queryKey: ["/api/activities"],
  });

  const safetyFeatures = [
    { title: "Trained staff", description: "Every team member is trained in child supervision and certified in first aid.", icon: "👨‍⚕️" },
    { title: "Sanitised daily", description: "All play equipment is cleaned and sanitised multiple times throughout the day.", icon: "🧽" },
    { title: "Soft & secure", description: "Padded flooring, safety mats and protective barriers across every zone.", icon: "🛡️" },
    { title: "Continuous monitoring", description: "Full-area CCTV coverage with active staff supervision at all times.", icon: "📹" },
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
            Eight themed play zones
          </span>
          <h1 className="text-4xl md:text-6xl font-display mb-5 leading-tight">
            Play, explore,{" "}
            <span className="text-toodles-accent">grow</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Every zone is purpose-built for children aged 2 to 8 — balancing
            active play with quieter, sensory experiences in a fully supervised
            environment.
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

      {/* Activities grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="eyebrow"><Sparkles className="h-3.5 w-3.5" />Play zones</span>
            <h2 className="text-3xl md:text-4xl font-display text-toodles-text mt-4 mb-2">
              Thoughtfully designed for{" "}
              <span className="text-gradient-sunset">every age</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              From toddlers taking their first steps to confident eight-year-olds, there's a zone made for them.
            </p>
          </div>

          {activitiesLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} variant="default" className="overflow-hidden animate-pulse">
                  <div className="h-64 bg-muted" />
                  <CardContent className="p-6 space-y-3">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {activities.map((activity: any) => {
                const features = parseFeatures(activity.description);
                const cleanDescription = activity.description.split("\n")[0] || activity.description;

                return (
                  <Card
                    key={activity.id}
                    variant="elevated"
                    interactive
                    className="overflow-hidden"
                  >
                    <div className="relative h-60">
                      {activity.image ? (
                        <img
                          src={activity.image}
                          alt={activity.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-6xl">
                          {activity.icon || "🎪"}
                        </div>
                      )}
                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${
                          activity.gradient || "from-toodles-primary to-pink-400"
                        } opacity-70`}
                      />
                      <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between gap-3">
                        <h3 className="text-2xl font-display drop-shadow">{activity.title}</h3>
                        {activity.ageGroup && (
                          <Badge variant="soft" className="bg-white/85 text-toodles-primary border-white/40 backdrop-blur">
                            {activity.ageGroup}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground mb-4 leading-relaxed">{cleanDescription}</p>
                      <div className="grid grid-cols-2 gap-2 mb-5">
                        {features.map((feature: string, idx: number) => (
                          <div key={idx} className="flex items-center text-sm text-muted-foreground">
                            <Shield className="h-3.5 w-3.5 text-toodles-success mr-1.5" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <Button variant="festive" className="w-full" onClick={() => setShowBookingModal(true)}>
                        Reserve a session
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Safety features */}
      <section className="py-20 bg-gradient-to-b from-transparent via-[hsl(320,55%,97%)] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="eyebrow"><Shield className="h-3.5 w-3.5" />Safety</span>
            <h2 className="text-3xl md:text-4xl font-display text-toodles-text mt-4 mb-2">
              Your child's safety is{" "}
              <span className="text-toodles-primary">our first priority</span>
            </h2>
            <p className="text-muted-foreground">
              Every detail of our space — from the flooring up — is engineered around the wellbeing of your child.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {safetyFeatures.map((feature) => (
              <Card key={feature.title} variant="elevated" className="text-center p-6">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-display text-toodles-text mb-1.5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Operating hours */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="eyebrow"><Clock className="h-3.5 w-3.5" />Visit us</span>
            <h2 className="text-3xl md:text-4xl font-display text-toodles-text mt-4 mb-2">
              Open <span className="text-gradient-sky">seven days a week</span>
            </h2>
            <p className="text-muted-foreground">Plan a visit on the day that works best for your family.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="gradient" className="p-8 text-center bg-[image:var(--gradient-sunset)]">
              <Clock className="h-10 w-10 mx-auto mb-3" />
              <h3 className="text-2xl font-display mb-1">Weekdays</h3>
              <p className="text-lg font-accent">11:00 AM – 8:30 PM</p>
              <p className="text-sm opacity-90 mt-1">Monday to Friday</p>
            </Card>
            <Card variant="gradient" className="p-8 text-center bg-[image:var(--gradient-sky)]">
              <Star className="h-10 w-10 mx-auto mb-3" />
              <h3 className="text-2xl font-display mb-1">Weekends</h3>
              <p className="text-lg font-accent">11:00 AM – 8:30 PM</p>
              <p className="text-sm opacity-90 mt-1">Saturday & Sunday</p>
            </Card>
            <Card variant="gradient" className="p-8 text-center bg-[image:var(--gradient-candy)] text-toodles-text">
              <Users className="h-10 w-10 mx-auto mb-3" />
              <h3 className="text-2xl font-display mb-1">Per session</h3>
              <p className="text-lg font-accent">Up to 15 children</p>
              <p className="text-sm opacity-90 mt-1">2-hour supervised play</p>
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
