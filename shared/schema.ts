import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  date,
  time,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking status enum
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

// Package type enum
export const packageTypeEnum = pgEnum("package_type", [
  "walk_in",
  "weekend",
  "monthly",
  "birthday",
]);

// Packages table
export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  type: packageTypeEnum("type").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // in hours
  description: text("description"),
  features: jsonb("features").$type<string[]>(),
  maxChildren: integer("max_children").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Time slots table
export const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  maxCapacity: integer("max_capacity").default(15),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  packageId: integer("package_id").references(() => packages.id),
  timeSlotId: integer("time_slot_id").references(() => timeSlots.id),
  bookingDate: date("booking_date").notNull(),
  numberOfChildren: integer("number_of_children").default(1),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: bookingStatusEnum("status").default("pending"),
  paymentId: varchar("payment_id"),
  paymentStatus: varchar("payment_status"),
  specialRequests: text("special_requests"),
  parentName: varchar("parent_name").notNull(),
  parentPhone: varchar("parent_phone").notNull(),
  parentEmail: varchar("parent_email").notNull(),
  childrenAges: jsonb("children_ages").$type<number[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Birthday parties table
export const birthdayParties = pgTable("birthday_parties", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  childName: varchar("child_name").notNull(),
  childAge: integer("child_age").notNull(),
  partyDate: date("party_date").notNull(),
  timeSlotId: integer("time_slot_id").references(() => timeSlots.id),
  numberOfGuests: integer("number_of_guests").notNull(),
  theme: varchar("theme"),
  cakePreference: varchar("cake_preference"),
  decorationPreference: varchar("decoration_preference"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: bookingStatusEnum("status").default("pending"),
  paymentId: varchar("payment_id"),
  paymentStatus: varchar("payment_status"),
  specialRequests: text("special_requests"),
  parentName: varchar("parent_name").notNull(),
  parentPhone: varchar("parent_phone").notNull(),
  parentEmail: varchar("parent_email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Holiday calendar table
export const holidayCalendar = pgTable("holiday_calendar", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // holiday, private, maintenance
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Discount vouchers table
export const discountVouchers = pgTable("discount_vouchers", {
  id: serial("id").primaryKey(),
  code: varchar("code").notNull().unique(),
  discountType: varchar("discount_type").notNull(), // percentage, fixed
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  validFrom: date("valid_from").notNull(),
  validTill: date("valid_till").notNull(),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  applicablePackages: jsonb("applicable_packages").$type<string[]>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  bookingId: integer("booking_id").references(() => bookings.id),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  content: text("content"),
  excerpt: text("excerpt"),
  featuredImage: varchar("featured_image"),
  authorId: varchar("author_id").references(() => users.id),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enquiries table
export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull(), // general, birthday, booking, complaint
  status: varchar("status").default("pending"), // pending, responded, closed
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  birthdayParties: many(birthdayParties),
  reviews: many(reviews),
  blogPosts: many(blogPosts),
}));

export const packagesRelations = relations(packages, ({ many }) => ({
  bookings: many(bookings),
}));

export const timeSlotsRelations = relations(timeSlots, ({ many }) => ({
  bookings: many(bookings),
  birthdayParties: many(birthdayParties),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  package: one(packages, {
    fields: [bookings.packageId],
    references: [packages.id],
  }),
  timeSlot: one(timeSlots, {
    fields: [bookings.timeSlotId],
    references: [timeSlots.id],
  }),
  reviews: many(reviews),
}));

export const birthdayPartiesRelations = relations(birthdayParties, ({ one }) => ({
  user: one(users, {
    fields: [birthdayParties.userId],
    references: [users.id],
  }),
  timeSlot: one(timeSlots, {
    fields: [birthdayParties.timeSlotId],
    references: [timeSlots.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertPackageSchema = createInsertSchema(packages);
export const insertTimeSlotSchema = createInsertSchema(timeSlots);
export const insertBookingSchema = createInsertSchema(bookings);
export const insertBirthdayPartySchema = createInsertSchema(birthdayParties);
export const insertHolidayCalendarSchema = createInsertSchema(holidayCalendar);
export const insertDiscountVoucherSchema = createInsertSchema(discountVouchers);
export const insertReviewSchema = createInsertSchema(reviews);
export const insertBlogPostSchema = createInsertSchema(blogPosts);
export const insertEnquirySchema = createInsertSchema(enquiries);

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Package = typeof packages.$inferSelect;
export type TimeSlot = typeof timeSlots.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type BirthdayParty = typeof birthdayParties.$inferSelect;
export type HolidayCalendar = typeof holidayCalendar.$inferSelect;
export type DiscountVoucher = typeof discountVouchers.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertBirthdayParty = z.infer<typeof insertBirthdayPartySchema>;
export type InsertHolidayCalendar = z.infer<typeof insertHolidayCalendarSchema>;
export type InsertDiscountVoucher = z.infer<typeof insertDiscountVoucherSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type InsertEnquiry = z.infer<typeof insertEnquirySchema>;
