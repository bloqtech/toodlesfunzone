import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { HelpCircle, Sparkles, Users } from "lucide-react";

export function HomeDynamic({ showGroup = true }: { showGroup?: boolean }) {
  const { data: promotions = [] } = useQuery<any[]>({ queryKey: ["/api/promotions"] });
  const { data: events = [] } = useQuery<any[]>({ queryKey: ["/api/events"] });
  const { data: faqs = [] } = useQuery<any[]>({ queryKey: ["/api/faqs"] });
  const { toast } = useToast();
  const [group, setGroup] = useState({ name: "", phone: "", email: "", message: "We would like to plan a school or group visit." });
  const [sending, setSending] = useState(false);

  const sendGroup = async () => {
    if (!group.name || !group.phone || !group.email || !group.message) {
      toast({ title: "Please fill in name, phone, email and message", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await apiRequest("POST", "/api/enquiry", { ...group, type: "group" });
      toast({ title: "Enquiry sent", description: "We will get back to you about the group visit." });
      setGroup({ name: "", phone: "", email: "", message: "We would like to plan a school or group visit." });
    } catch {
      toast({ title: "Could not send enquiry", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {promotions.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="eyebrow"><Sparkles className="h-3.5 w-3.5" /> Offers</span>
              <h2 className="text-3xl md:text-4xl font-display text-toodles-text mt-3">Current promotions</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {promotions.map((item) => (
                <Card key={item.id} variant="elevated">
                  <CardContent className="p-6">
                    <h3 className="font-display text-2xl text-toodles-text">{item.title}</h3>
                    <p className="text-muted-foreground mt-2">{item.description}</p>
                    {item.promoCode && <p className="mt-3 text-sm font-semibold">Code: {item.promoCode}</p>}
                    {item.terms && <p className="mt-2 text-xs text-muted-foreground">{item.terms}</p>}
                    <Link href={item.ctaHref || "/contact"}><Button className="mt-4" variant="festive">{item.ctaLabel || "Enquire"}</Button></Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section id="events" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="eyebrow"><Sparkles className="h-3.5 w-3.5" /> Coming up</span>
              <h2 className="text-3xl md:text-4xl font-display text-toodles-text mt-3">Camps and events</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {events.map((item) => (
                <Card key={item.id} variant="elevated">
                  <CardContent className="p-5">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="mb-3 h-36 w-full rounded-xl object-cover" />}
                    <h3 className="font-display text-xl">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.eventDate}{item.startTime ? ` · ${item.startTime}` : ""}</p>
                    <p className="text-sm mt-2">{item.description}</p>
                    {item.price && <p className="mt-2 font-semibold">{item.price}</p>}
                    <Link href={item.ctaHref || "/contact"}><Button className="mt-4" variant="outline">{item.ctaLabel || "Enquire"}</Button></Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {showGroup && (<section id="groups" className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <span className="eyebrow"><Users className="h-3.5 w-3.5" /> Groups</span>
            <h2 className="text-3xl font-display text-toodles-text mt-3 mb-3">School visits and seasonal events</h2>
            <p className="text-muted-foreground">Bring a school, daycare, playgroup or friends’ group, or ask about Halloween, Christmas, and summer camp. Tell us the date and approximate group size, and we will confirm what is possible.</p>
            <Link href="/school-trips" className="mt-4 inline-block font-accent font-semibold text-toodles-primary">School trips and events</Link>
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
      </section>)}

      {faqs.length > 0 && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="eyebrow"><HelpCircle className="h-3.5 w-3.5" /> For parents</span>
              <h2 className="text-3xl font-display mt-3">Questions families ask</h2>
            </div>
            <div className="space-y-3">
              {faqs.slice(0, 6).map((faq) => (
                <Card key={faq.id} variant="elevated">
                  <CardContent className="p-5">
                    <h3 className="font-display text-lg">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
