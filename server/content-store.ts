import { asc, desc, eq } from "drizzle-orm";
import { db } from "./db";
import {
  albums,
  faqs,
  promotions,
  siteEvents,
  type Album,
  type Faq,
  type InsertAlbum,
  type InsertFaq,
  type InsertPromotion,
  type InsertSiteEvent,
  type Promotion,
  type SiteEvent,
} from "@shared/schema";

const today = () => new Date().toISOString().slice(0, 10);

export const contentStore = {
  async albums(activeOnly = false): Promise<Album[]> {
    const rows = await db.select().from(albums).orderBy(asc(albums.displayOrder), desc(albums.createdAt));
    return activeOnly ? rows.filter((row) => row.isActive) : rows;
  },
  async album(id: number) {
    const [row] = await db.select().from(albums).where(eq(albums.id, id));
    return row;
  },
  async createAlbum(data: InsertAlbum) {
    const [row] = await db.insert(albums).values(data).returning();
    return row;
  },
  async updateAlbum(id: number, data: Partial<InsertAlbum>) {
    const [row] = await db.update(albums).set({ ...data, updatedAt: new Date() }).where(eq(albums.id, id)).returning();
    return row;
  },
  async deleteAlbum(id: number) {
    await db.delete(albums).where(eq(albums.id, id));
  },

  async promotions(activeOnly = false): Promise<Promotion[]> {
    const rows = await db.select().from(promotions).orderBy(asc(promotions.displayOrder), desc(promotions.createdAt));
    if (!activeOnly) return rows;
    const day = today();
    return rows.filter((row) => row.isActive && (!row.startsOn || row.startsOn <= day) && (!row.endsOn || row.endsOn >= day));
  },
  async createPromotion(data: InsertPromotion) {
    const [row] = await db.insert(promotions).values(data).returning();
    return row;
  },
  async updatePromotion(id: number, data: Partial<InsertPromotion>) {
    const [row] = await db.update(promotions).set({ ...data, updatedAt: new Date() }).where(eq(promotions.id, id)).returning();
    return row;
  },
  async deletePromotion(id: number) {
    await db.delete(promotions).where(eq(promotions.id, id));
  },

  async events(scope: "all" | "upcoming" | "past" = "all"): Promise<SiteEvent[]> {
    const rows = await db.select().from(siteEvents).orderBy(asc(siteEvents.eventDate), asc(siteEvents.displayOrder));
    const day = today();
    if (scope === "upcoming") return rows.filter((row) => row.isActive && row.eventDate >= day);
    if (scope === "past") return rows.filter((row) => row.isActive && row.eventDate < day);
    return rows;
  },
  async createEvent(data: InsertSiteEvent) {
    const [row] = await db.insert(siteEvents).values(data).returning();
    return row;
  },
  async updateEvent(id: number, data: Partial<InsertSiteEvent>) {
    const [row] = await db.update(siteEvents).set({ ...data, updatedAt: new Date() }).where(eq(siteEvents.id, id)).returning();
    return row;
  },
  async deleteEvent(id: number) {
    await db.delete(siteEvents).where(eq(siteEvents.id, id));
  },

  async faqs(activeOnly = false): Promise<Faq[]> {
    const rows = await db.select().from(faqs).orderBy(asc(faqs.displayOrder), asc(faqs.id));
    return activeOnly ? rows.filter((row) => row.isActive) : rows;
  },
  async createFaq(data: InsertFaq) {
    const [row] = await db.insert(faqs).values(data).returning();
    return row;
  },
  async updateFaq(id: number, data: Partial<InsertFaq>) {
    const [row] = await db.update(faqs).set({ ...data, updatedAt: new Date() }).where(eq(faqs.id, id)).returning();
    return row;
  },
  async deleteFaq(id: number) {
    await db.delete(faqs).where(eq(faqs.id, id));
  },
};
