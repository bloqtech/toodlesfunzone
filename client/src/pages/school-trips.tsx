import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FloatingWhatsApp } from "@/components/common/floating-whatsapp";
import { FestiveAmbient } from "@/components/common/festive-ambient";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Sparkles, Users } from "lucide-react";
import { PhotoMosaic } from "@/components/common/photo-mosaic";
import { VideoCards } from "@/components/common/birthday-media";
import { mediaCollection, useLocalMedia } from "@/lib/local-media";

export default function SchoolTrips() {
  const { toast } = useToast();
  const { data: media = [] } = useLocalMedia();
  const schoolVideos = media.filter((item) => item.category === "school" && item.mediaType === "video" && mediaCollection(item) === "schoolvisit");
  const eventVideos = media.filter((item) => item.category === "school" && item.mediaType === "video" && mediaCollection(item) === "events");
  const campVideos = media.filter((item) => item.category === "school" && item.mediaType === "video" && mediaCollection(item) === "summercamp");
  const [sending, setSending] = useState(false);
  const [group, setGroup] = useState({
    name: "",
    phone: "",
    email: "",
    message: "We would like to plan a school visit or a seasonal event.",
  });

  const sendGroup = async () => {
    if (!group.name || !group.phone || !group.email || !group.message) {
      toast({ title: "Please fill in name, phone, email and message", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await apiRequest("POST", "/api/enquiry", { ...group, type: "group" });
      toast({ title: "Enquiry sent", description: "We will get back to you about the visit." });
      setGroup({ name: "", phone: "", email: "", message: "We would like to plan a school visit or a seasonal event." });
    } catch {
      toast({ title: "Could not send enquiry", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-toodles-background">
      <Header />
      <section className="relative overflow-hidden bg-toodles-hero">
        <FestiveAmbient confetti={6} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 text-center text-white z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-4 py-1.5 text-sm font-medium border border-white/25 mb-6">
            <Sparkles className="h-4 w-4" />
            Groups
          </span>
          <h1 className="text-4xl md:text-6xl font-display mb-5 leading-tight">
            School trips <span className="text-toodles-accent">& events</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            School outings and group play, plus seasonal celebrations such as Halloween, Christmas, and summer camp.
          </p>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-6 font-display text-3xl text-toodles-text md:text-4xl">School visits</h2>
          {schoolVideos.length > 0 && (
            <div className="mb-8">
              <VideoCards videos={schoolVideos} label="Play school video" />
            </div>
          )}
          <PhotoMosaic category="school" photosOnly />
        </div>
      </section>
      <section className="pb-16">
        <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
          {eventVideos.length > 0 && (
            <div>
              <h2 className="mb-6 font-display text-3xl text-toodles-text md:text-4xl">Events</h2>
              <VideoCards videos={eventVideos} label="Play event video" />
            </div>
          )}
          {campVideos.length > 0 && (
            <div>
              <h2 className="mb-6 font-display text-3xl text-toodles-text md:text-4xl">Summer camp</h2>
              <VideoCards videos={campVideos} label="Play summer camp video" />
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Halloween", message: "We would like to plan a Halloween celebration." },
              { title: "Christmas", message: "We would like to plan a Christmas celebration." },
              { title: "Summer camp", message: "We would like to plan a summer camp." },
            ].map((event) => (
              <Card key={event.title} variant="elevated">
                <CardContent className="p-5">
                  <h3 className="font-display text-2xl text-toodles-text">{event.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    A Toodles celebration for families and groups. Share your date and group size and we will get back to you.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setGroup((current) => ({ ...current, message: event.message }));
                      document.getElementById("plan-visit")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Enquire about {event.title}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section id="plan-visit" className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <span className="eyebrow"><Users className="h-3.5 w-3.5" /> Plan a visit</span>
            <h2 className="text-3xl font-display text-toodles-text mt-3 mb-3">Tell us about your group</h2>
            <p className="text-muted-foreground">Share the date, age group and approximate group size. We will confirm what is possible and get back to you.</p>
          </div>
          <Card variant="elevated">
            <CardContent className="p-5 space-y-3">
              <Input placeholder="Your name" value={group.name} onChange={(e) => setGroup({ ...group, name: e.target.value })} />
              <Input placeholder="Phone" value={group.phone} onChange={(e) => setGroup({ ...group, phone: e.target.value })} />
              <Input placeholder="Email" value={group.email} onChange={(e) => setGroup({ ...group, email: e.target.value })} />
              <Textarea value={group.message} onChange={(e) => setGroup({ ...group, message: e.target.value })} />
              <Button variant="festive" onClick={sendGroup} disabled={sending}>{sending ? "Sending..." : "Plan a group visit"}</Button>
            </CardContent>
          </Card>
        </div>
      </section>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
