import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const tabs = ["Albums", "Offers", "Events", "FAQs"] as const;

export default function AdminContent() {
  const { toast } = useToast();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Albums");
  const [form, setForm] = useState<Record<string, string>>({ isActive: "false" });
  const key = tab === "Albums" ? "/api/admin/albums" : tab === "Offers" ? "/api/admin/promotions" : tab === "Events" ? "/api/admin/events" : "/api/admin/faqs";
  const { data: rows = [] } = useQuery<any[]>({ queryKey: [key] });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        isActive: form.isActive === "true",
        featured: form.featured === "true",
        name: form.name || form.title || form.question,
        title: form.title || form.name,
      };
      const response = await apiRequest("POST", key, payload);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Saved" });
      setForm({ isActive: "false" });
      queryClient.invalidateQueries({ queryKey: [key] });
      queryClient.invalidateQueries({ queryKey: ["/api/albums"] });
      queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
    },
    onError: () => toast({ title: "Could not save", variant: "destructive" }),
  });

  const remove = async (id: number) => {
    if (!window.confirm("Delete this item?")) return;
    await apiRequest("DELETE", `${key}/${id}`);
    queryClient.invalidateQueries({ queryKey: [key] });
  };

  const toggle = async (row: any) => {
    await apiRequest("PUT", `${key}/${row.id}`, { ...row, isActive: !row.isActive });
    queryClient.invalidateQueries({ queryKey: [key] });
    queryClient.invalidateQueries({ queryKey: ["/api/albums"] });
    queryClient.invalidateQueries({ queryKey: ["/api/promotions"] });
    queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
  };

  const fields = tab === "Albums"
    ? [["name", "Album name"], ["description", "Description"], ["category", "Category"], ["eventDate", "Event date"], ["coverImageUrl", "Cover image URL"]]
    : tab === "Offers"
    ? [["title", "Offer title"], ["description", "Details"], ["startsOn", "Starts"], ["endsOn", "Ends"], ["promoCode", "Code"], ["terms", "Terms"], ["ctaLabel", "Button label"], ["ctaHref", "Button link"]]
    : tab === "Events"
    ? [["title", "Event title"], ["description", "Description"], ["eventDate", "Date"], ["startTime", "Start time"], ["endTime", "End time"], ["price", "Price, if any"], ["ctaLabel", "Button label"], ["ctaHref", "Button link"], ["imageUrl", "Image URL"]]
    : [["question", "Question"], ["answer", "Answer"], ["category", "Category"]];

  return (
    <div className="min-h-screen bg-toodles-background">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display text-toodles-text mb-2">Website content</h1>
        <p className="text-muted-foreground mb-6">Albums start as drafts. Publish them when they should appear on the website. Offers hide automatically after the end date. Past events move out of Upcoming.</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((item) => <Button key={item} variant={tab === item ? "festive" : "outline"} onClick={() => { setTab(item); setForm({ isActive: "false" }); }}>{item}</Button>)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardContent className="p-5 space-y-3">
              <h2 className="font-display text-xl">Add {tab.slice(0, -1)}</h2>
              {fields.map(([name, label]) => name === "description" || name === "answer" || name === "terms" ? (
                <Textarea key={name} placeholder={label} value={form[name] || ""} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
              ) : (
                <Input key={name} type={name.toLowerCase().includes("date") || name.endsWith("On") ? "date" : "text"} placeholder={label} value={form[name] || ""} onChange={(e) => setForm({ ...form, [name]: e.target.value })} />
              ))}
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive === "true"} onChange={(e) => setForm({ ...form, isActive: String(e.target.checked) })} /> Publish now</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured === "true"} onChange={(e) => setForm({ ...form, featured: String(e.target.checked) })} /> Feature on homepage</label>
              <Button variant="festive" onClick={() => save.mutate()} disabled={save.isPending}>Save</Button>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {rows.map((row) => (
              <Card key={row.id}>
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{row.name || row.title || row.question}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">{row.description || row.answer}</div>
                    <div className="text-xs mt-1">{row.isActive ? "Published" : "Draft"}{row.endsOn ? ` · until ${row.endsOn}` : ""}{row.eventDate ? ` · ${row.eventDate}` : ""}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggle(row)}>{row.isActive ? "Unpublish" : "Publish"}</Button>
                    <Button size="sm" variant="outline" onClick={() => remove(row.id)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {rows.length === 0 && <p className="text-muted-foreground">Nothing here yet.</p>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
