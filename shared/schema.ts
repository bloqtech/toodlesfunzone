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

// Define user roles enum
export const userRoles = pgEnum("user_role", ["customer", "staff", "manager", "admin"]);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone"),
  address: text("address"),
  dateOfBirth: date("date_of_birth"),
  role: userRoles("role").default("customer").notNull(),
  isAdmin: boolean("is_admin").default(false), // Keep for backward compatibility
  permissions: jsonb("permissions").$type<string[]>().default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  passwordHash: varchar("password_hash"), // For local admin and customer accounts
  isGuest: boolean("is_guest").default(false), // Track guest accounts
  registrationSource: varchar("registration_source").default("booking"), // Track how user registered
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

// Operating hours table
export const operatingHours = pgTable("operating_hours", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  openTime: time("open_time").notNull(),
  closeTime: time("close_time").notNull(),
  isOpen: boolean("is_open").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // Optional for guest bookings
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
  isGuestBooking: boolean("is_guest_booking").default(false),
  guestPassword: varchar("guest_password"), // Temporary password for account creation
  createAccount: boolean("create_account").default(false), // User choice to create account
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Birthday parties table
export const birthdayParties = pgTable("birthday_parties", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // Optional for guest bookings
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
  isGuestBooking: boolean("is_guest_booking").default(false),
  guestPassword: varchar("guest_password"), // Temporary password for account creation
  createAccount: boolean("create_account").default(false), // User choice to create account
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

// Add-ons table
export const addOns = pgTable("add_ons", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  icon: varchar("icon"), // emoji or icon name
  image: varchar("image"),
  category: varchar("category"), // general, birthday, photography, food, etc.
  isRequired: boolean("is_required").default(false), // for socks, etc.
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  applicablePackages: jsonb("applicable_packages").$type<string[]>(), // which packages can use this addon
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  image: varchar("image"),
  gradient: varchar("gradient").default("from-toodles-primary to-pink-400"),
  icon: varchar("icon").default("🎪"),
  ageGroup: varchar("age_group"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Birthday Packages table
export const birthdayPackages = pgTable("birthday_packages", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // in hours
  maxGuests: integer("max_guests").notNull(),
  features: jsonb("features").$type<string[]>().default([]).notNull(),
  decorationTheme: varchar("decoration_theme").notNull(),
  ageGroup: varchar("age_group").notNull(),
  image: varchar("image"),
  isActive: boolean("is_active").default(true),
  isPopular: boolean("is_popular").default(false),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
export const insertOperatingHoursSchema = createInsertSchema(operatingHours);
export const insertAddOnSchema = createInsertSchema(addOns);
export const insertActivitySchema = createInsertSchema(activities);
export const insertBirthdayPackageSchema = createInsertSchema(birthdayPackages);

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
export type OperatingHours = typeof operatingHours.$inferSelect;
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertBirthdayParty = z.infer<typeof insertBirthdayPartySchema>;
export type InsertHolidayCalendar = z.infer<typeof insertHolidayCalendarSchema>;
export type InsertDiscountVoucher = z.infer<typeof insertDiscountVoucherSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type InsertEnquiry = z.infer<typeof insertEnquirySchema>;
export type InsertOperatingHours = z.infer<typeof insertOperatingHoursSchema>;
export type AddOn = typeof addOns.$inferSelect;
export type InsertAddOn = z.infer<typeof insertAddOnSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type BirthdayPackage = typeof birthdayPackages.$inferSelect;
export type InsertBirthdayPackage = z.infer<typeof insertBirthdayPackageSchema>;

// Define permission constants
export const PERMISSIONS = {
  // Package management
  MANAGE_PACKAGES: 'manage_packages',
  VIEW_PACKAGES: 'view_packages',
  
  // Event management  
  MANAGE_EVENTS: 'manage_events',
  VIEW_EVENTS: 'view_events',
  
  // Booking management
  MANAGE_BOOKINGS: 'manage_bookings',
  VIEW_BOOKINGS: 'view_bookings',
  
  // User management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  
  // Analytics and reports
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
  
  // System administration
  MANAGE_ROLES: 'manage_roles',
  MANAGE_SETTINGS: 'manage_settings',
  
  // Content management
  MANAGE_CONTENT: 'manage_content',
  MODERATE_REVIEWS: 'moderate_reviews',
} as const;

// Define default permissions for each role
export const ROLE_PERMISSIONS = {
  customer: [
    PERMISSIONS.VIEW_PACKAGES,
    PERMISSIONS.VIEW_EVENTS,
  ],
  staff: [
    PERMISSIONS.VIEW_PACKAGES,
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.VIEW_BOOKINGS,
    PERMISSIONS.MANAGE_BOOKINGS,
  ],
  manager: [
    PERMISSIONS.VIEW_PACKAGES,
    PERMISSIONS.MANAGE_PACKAGES,
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.VIEW_BOOKINGS,
    PERMISSIONS.MANAGE_BOOKINGS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.MODERATE_REVIEWS,
  ],
  admin: Object.values(PERMISSIONS),
} as const;
