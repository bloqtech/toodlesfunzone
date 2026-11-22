import type { Express } from "express";
import { contentStore } from "./content-store";

const verifiedFaqs = [
  { question: "Do I need to book in advance?", answer: "Walk-ins are welcome, but we strongly recommend reserving online to guarantee your preferred time slot — especially on weekends and during school breaks.", category: "general" },
  { question: "Can parents accompany their children?", answer: "Yes. There is seating for parents, refreshments and complimentary Wi-Fi so you can stay close while your child plays.", category: "play" },
  { question: "What should children wear?", answer: "Comfortable clothing and non-slip socks are required. Socks are available at the front desk if you forget yours.", category: "play" },
  { question: "Are outside food and drinks allowed?", answer: "Outside food is not permitted. The on-site café offers snacks, juices and drinks for parents.", category: "general" },
  { question: "Can I reschedule or cancel a booking?", answer: "Yes. Contact us at least 24 hours in advance and we will help you move the slot.", category: "packages" },
  { question: "Where is Toodles Funzone?", answer: "Sarjapur Main Road, opposite Vishnu Leela Veg, Kodathi, Bengaluru 560035. Open all seven days, 11:00 AM to 8:30 PM.", category: "general" },
  { question: "How do I enquire about a birthday or group visit?", answer: "Use the enquiry form on the website, call or WhatsApp +91 99012 18980.", category: "birthdays" },
];

const bool = (value: unknown, fallback = false) => value === undefined ? fallback : value === true || value === "true";
const num = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;

export function registerContentRoutes(app: Express, isAuthenticated: any, adminAuth: any) {
  app.get("/api/albums", async (_req, res) => {
    try {
      res.json(await contentStore.albums(true));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to load albums" });
    }
  });

  app.get("/api/admin/albums", isAuthenticated, adminAuth, async (_req, res) => {
    res.json(await contentStore.albums());
  });

  app.post("/api/admin/albums", isAuthenticated, adminAuth, async (req, res) => {
    if (!req.body?.name?.trim()) return res.status(400).json({ message: "Album name is required" });
    const album = await contentStore.createAlbum({
      name: req.body.name.trim(),
      description: String(req.body.description || ""),
      coverImageUrl: req.body.coverImageUrl || null,
      category: req.body.category || "play",
      eventDate: req.body.eventDate || null,
      isActive: bool(req.body.isActive, false),
      featured: bool(req.body.featured),
      displayOrder: num(req.body.displayOrder),
    });
    res.status(201).json(album);
  });

  app.put("/api/admin/albums/:id", isAuthenticated, adminAuth, async (req, res) => {
    const album = await contentStore.updateAlbum(Number(req.params.id), {
      name: req.body.name,
      description: req.body.description,
      coverImageUrl: req.body.coverImageUrl || null,
      category: req.body.category,
      eventDate: req.body.eventDate || null,
      isActive: bool(req.body.isActive),
      featured: bool(req.body.featured),
      displayOrder: num(req.body.displayOrder),
    });
    res.json(album);
  });

  app.delete("/api/admin/albums/:id", isAuthenticated, adminAuth, async (req, res) => {
    await contentStore.deleteAlbum(Number(req.params.id));
    res.json({ message: "Album deleted" });
  });

  app.get("/api/promotions", async (_req, res) => {
    res.json(await contentStore.promotions(true));
  });
  app.get("/api/admin/promotions", isAuthenticated, adminAuth, async (_req, res) => {
    res.json(await contentStore.promotions());
  });
  app.post("/api/admin/promotions", isAuthenticated, adminAuth, async (req, res) => {
    if (!req.body?.title?.trim()) return res.status(400).json({ message: "Title is required" });
    res.status(201).json(await contentStore.createPromotion({
      name: req.body.name || req.body.title,
      title: req.body.title.trim(),
      description: String(req.body.description || ""),
      imageUrl: req.body.imageUrl || null,
      category: req.body.category || "general",
      startsOn: req.body.startsOn || null,
      endsOn: req.body.endsOn || null,
      terms: req.body.terms || null,
      promoCode: req.body.promoCode || null,
      ctaLabel: req.body.ctaLabel || "Enquire",
      ctaHref: req.body.ctaHref || "/contact",
      isActive: bool(req.body.isActive),
      featured: bool(req.body.featured),
      displayOrder: num(req.body.displayOrder),
    }));
  });
  app.put("/api/admin/promotions/:id", isAuthenticated, adminAuth, async (req, res) => {
    res.json(await contentStore.updatePromotion(Number(req.params.id), {
      ...req.body,
      isActive: bool(req.body.isActive),
      featured: bool(req.body.featured),
      displayOrder: num(req.body.displayOrder),
    }));
  });
  app.delete("/api/admin/promotions/:id", isAuthenticated, adminAuth, async (req, res) => {
    await contentStore.deletePromotion(Number(req.params.id));
    res.json({ message: "Promotion deleted" });
  });

  app.get("/api/events", async (req, res) => {
    const scope = req.query.scope === "past" ? "past" : "upcoming";
    res.json(await contentStore.events(scope));
  });
  app.get("/api/admin/events", isAuthenticated, adminAuth, async (_req, res) => {
    res.json(await contentStore.events());
  });
  app.post("/api/admin/events", isAuthenticated, adminAuth, async (req, res) => {
    if (!req.body?.title?.trim() || !req.body?.eventDate) return res.status(400).json({ message: "Title and date are required" });
    res.status(201).json(await contentStore.createEvent({
      title: req.body.title.trim(),
      description: String(req.body.description || ""),
      imageUrl: req.body.imageUrl || null,
      eventDate: req.body.eventDate,
      startTime: req.body.startTime || null,
      endTime: req.body.endTime || null,
      category: req.body.category || "events",
      price: req.body.price || null,
      ctaLabel: req.body.ctaLabel || "Enquire",
      ctaHref: req.body.ctaHref || "/contact",
      albumId: req.body.albumId ? Number(req.body.albumId) : null,
      isActive: bool(req.body.isActive),
      featured: bool(req.body.featured),
      displayOrder: num(req.body.displayOrder),
    }));
  });
  app.put("/api/admin/events/:id", isAuthenticated, adminAuth, async (req, res) => {
    res.json(await contentStore.updateEvent(Number(req.params.id), {
      ...req.body,
      albumId: req.body.albumId ? Number(req.body.albumId) : null,
      isActive: bool(req.body.isActive),
      featured: bool(req.body.featured),
    }));
  });
  app.delete("/api/admin/events/:id", isAuthenticated, adminAuth, async (req, res) => {
    await contentStore.deleteEvent(Number(req.params.id));
    res.json({ message: "Event deleted" });
  });

  app.get("/api/faqs", async (_req, res) => {
    let rows = await contentStore.faqs(true);
    if (rows.length === 0) {
      const existing = await contentStore.faqs();
      if (existing.length === 0) {
        for (const [index, faq] of verifiedFaqs.entries()) {
          await contentStore.createFaq({ ...faq, isActive: true, displayOrder: index });
        }
      }
      rows = await contentStore.faqs(true);
    }
    res.json(rows);
  });
  app.get("/api/admin/faqs", isAuthenticated, adminAuth, async (_req, res) => {
    res.json(await contentStore.faqs());
  });
  app.post("/api/admin/faqs", isAuthenticated, adminAuth, async (req, res) => {
    if (!req.body?.question?.trim() || !req.body?.answer?.trim()) return res.status(400).json({ message: "Question and answer are required" });
    res.status(201).json(await contentStore.createFaq({
      question: req.body.question.trim(),
      answer: req.body.answer.trim(),
      category: req.body.category || "general",
      isActive: bool(req.body.isActive, true),
      displayOrder: num(req.body.displayOrder),
    }));
  });
  app.put("/api/admin/faqs/:id", isAuthenticated, adminAuth, async (req, res) => {
    res.json(await contentStore.updateFaq(Number(req.params.id), {
      question: req.body.question,
      answer: req.body.answer,
      category: req.body.category,
      isActive: bool(req.body.isActive, true),
      displayOrder: num(req.body.displayOrder),
    }));
  });
  app.delete("/api/admin/faqs/:id", isAuthenticated, adminAuth, async (req, res) => {
    await contentStore.deleteFaq(Number(req.params.id));
    res.json({ message: "FAQ deleted" });
  });
}
