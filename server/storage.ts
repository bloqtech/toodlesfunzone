import {
  users,
  packages,
  timeSlots,
  bookings,
  birthdayParties,
  holidayCalendar,
  discountVouchers,
  reviews,
  blogPosts,
  enquiries,
  type User,
  type UpsertUser,
  type Package,
  type TimeSlot,
  type Booking,
  type BirthdayParty,
  type HolidayCalendar,
  type DiscountVoucher,
  type Review,
  type BlogPost,
  type Enquiry,
  type InsertPackage,
  type InsertTimeSlot,
  type InsertBooking,
  type InsertBirthdayParty,
  type InsertHolidayCalendar,
  type InsertDiscountVoucher,
  type InsertReview,
  type InsertBlogPost,
  type InsertEnquiry,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, sql, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserAdminStatus(id: string, isAdmin: boolean): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
  updateUserPermissions(id: string, permissions: string[]): Promise<User>;
  updateUserProfile(id: string, profile: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  getUsersByRole(role: string): Promise<User[]>;
  hasPermission(userId: string, permission: string): Promise<boolean>;

  // Package management operations
  createPackage(packageData: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package>;
  updatePackage(id: number, packageData: Partial<Package>): Promise<Package>;
  deletePackage(id: number): Promise<void>;
  
  // Package operations
  getPackages(): Promise<Package[]>;
  getPackageById(id: number): Promise<Package | undefined>;
  createPackage(packageData: InsertPackage): Promise<Package>;
  updatePackage(id: number, packageData: Partial<InsertPackage>): Promise<Package>;
  
  // Time slot operations
  getTimeSlots(): Promise<TimeSlot[]>;
  getActiveTimeSlots(): Promise<TimeSlot[]>;
  createTimeSlot(timeSlotData: InsertTimeSlot): Promise<TimeSlot>;
  updateTimeSlot(id: number, timeSlotData: Partial<InsertTimeSlot>): Promise<TimeSlot>;
  bulkUpdateTimeSlotCapacity(maxCapacity: number): Promise<TimeSlot[]>;
  getTimeSlotAvailability(timeSlotId: number, bookingDate: string): Promise<any>;
  
  // Booking operations
  createBooking(bookingData: InsertBooking): Promise<Booking>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getBookingsByDate(date: string): Promise<Booking[]>;
  getBookingsByDateRange(startDate: string, endDate: string): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  updateBookingPayment(id: number, paymentId: string, paymentStatus: string): Promise<Booking>;
  
  // Birthday party operations
  createBirthdayParty(partyData: InsertBirthdayParty): Promise<BirthdayParty>;
  getBirthdayPartyById(id: number): Promise<BirthdayParty | undefined>;
  getBirthdayPartiesByUser(userId: string): Promise<BirthdayParty[]>;
  getBirthdayPartiesByDate(date: string): Promise<BirthdayParty[]>;
  updateBirthdayPartyStatus(id: number, status: string): Promise<BirthdayParty>;
  
  // Holiday calendar operations
  getHolidayCalendar(): Promise<HolidayCalendar[]>;
  getHolidayByDate(date: string): Promise<HolidayCalendar | undefined>;
  createHoliday(holidayData: InsertHolidayCalendar): Promise<HolidayCalendar>;
  updateHoliday(id: number, holidayData: Partial<InsertHolidayCalendar>): Promise<HolidayCalendar>;
  deleteHoliday(id: number): Promise<void>;
  
  // Discount voucher operations
  getDiscountVouchers(): Promise<DiscountVoucher[]>;
  getDiscountVoucherByCode(code: string): Promise<DiscountVoucher | undefined>;
  createDiscountVoucher(voucherData: InsertDiscountVoucher): Promise<DiscountVoucher>;
  updateDiscountVoucher(id: number, voucherData: Partial<InsertDiscountVoucher>): Promise<DiscountVoucher>;
  deleteDiscountVoucher(id: number): Promise<void>;
  incrementVoucherUsage(id: number): Promise<void>;
  
  // Review operations
  getReviews(): Promise<Review[]>;
  getApprovedReviews(): Promise<Review[]>;
  createReview(reviewData: InsertReview): Promise<Review>;
  updateReview(id: number, reviewData: Partial<InsertReview>): Promise<Review>;
  approveReview(id: number): Promise<Review>;
  
  // Blog operations
  getBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(blogData: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, blogData: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
  
  // Enquiry operations
  getEnquiries(): Promise<Enquiry[]>;
  getEnquiryById(id: number): Promise<Enquiry | undefined>;
  createEnquiry(enquiryData: InsertEnquiry): Promise<Enquiry>;
  updateEnquiryStatus(id: number, status: string): Promise<Enquiry>;
  
  // Analytics operations
  getBookingAnalytics(): Promise<any>;
  getRevenueAnalytics(): Promise<any>;
  getPopularPackages(): Promise<any>;
  getTopCustomers(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserAdminStatus(id: string, isAdmin: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isAdmin, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPermissions(id: string, permissions: string[]): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ permissions, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfile(id: string, profile: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, role as any))
      .orderBy(desc(users.createdAt));
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    // Admin users have all permissions
    if (user.isAdmin || user.role === 'admin') return true;
    
    // Check if user has specific permission
    return user.permissions?.includes(permission) || false;
  }

  // Package management operations
  async createPackage(packageData: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package> {
    const [newPackage] = await db
      .insert(packages)
      .values(packageData)
      .returning();
    return newPackage;
  }

  async updatePackage(id: number, packageData: Partial<Package>): Promise<Package> {
    const [updatedPackage] = await db
      .update(packages)
      .set(packageData)
      .where(eq(packages.id, id))
      .returning();
    return updatedPackage;
  }

  async deletePackage(id: number): Promise<void> {
    await db.delete(packages).where(eq(packages.id, id));
  }

  // Package operations
  async getPackages(): Promise<Package[]> {
    return await db.select().from(packages).orderBy(asc(packages.type));
  }

  async getPackageById(id: number): Promise<Package | undefined> {
    const [packageData] = await db.select().from(packages).where(eq(packages.id, id));
    return packageData;
  }

  // Time slot operations
  async getTimeSlots(): Promise<TimeSlot[]> {
    return await db.select().from(timeSlots).orderBy(asc(timeSlots.startTime));
  }

  async getActiveTimeSlots(): Promise<TimeSlot[]> {
    return await db
      .select()
      .from(timeSlots)
      .where(eq(timeSlots.isActive, true))
      .orderBy(asc(timeSlots.startTime));
  }

  async createTimeSlot(timeSlotData: InsertTimeSlot): Promise<TimeSlot> {
    const [newTimeSlot] = await db.insert(timeSlots).values(timeSlotData).returning();
    return newTimeSlot;
  }

  async updateTimeSlot(id: number, timeSlotData: Partial<InsertTimeSlot>): Promise<TimeSlot> {
    const [updatedTimeSlot] = await db
      .update(timeSlots)
      .set(timeSlotData)
      .where(eq(timeSlots.id, id))
      .returning();
    return updatedTimeSlot;
  }

  async bulkUpdateTimeSlotCapacity(maxCapacity: number): Promise<TimeSlot[]> {
    const updatedSlots = await db
      .update(timeSlots)
      .set({ maxCapacity })
      .returning();
    return updatedSlots;
  }

  async getTimeSlotAvailability(timeSlotId: number, bookingDate: string): Promise<any> {
    const slot = await db.select().from(timeSlots).where(eq(timeSlots.id, timeSlotId));
    if (!slot.length || !slot[0].isActive) return { available: false, capacity: 0, booked: 0 };

    const bookingsOnDate = await db.select({
      numberOfChildren: bookings.numberOfChildren
    }).from(bookings)
      .where(
        and(
          eq(bookings.timeSlotId, timeSlotId),
          eq(bookings.bookingDate, bookingDate),
          sql`${bookings.status} != 'cancelled'`
        )
      );

    const totalBooked = bookingsOnDate.reduce((sum, booking) => sum + (booking.numberOfChildren || 0), 0);
    const maxCapacity = slot[0].maxCapacity || 20;
    
    return {
      available: totalBooked < maxCapacity,
      capacity: maxCapacity,
      booked: totalBooked,
      remaining: maxCapacity - totalBooked
    };
  }

  // Booking operations
  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(bookingData as any).returning();
    return newBooking;
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByDate(date: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.bookingDate, date))
      .orderBy(asc(bookings.timeSlotId));
  }

  async getBookingsByDateRange(startDate: string, endDate: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(and(gte(bookings.bookingDate, startDate), lte(bookings.bookingDate, endDate)))
      .orderBy(desc(bookings.bookingDate));
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async updateBookingPayment(id: number, paymentId: string, paymentStatus: string): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ paymentId, paymentStatus, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Birthday party operations
  async createBirthdayParty(partyData: InsertBirthdayParty): Promise<BirthdayParty> {
    const [newParty] = await db.insert(birthdayParties).values(partyData).returning();
    return newParty;
  }

  async getBirthdayPartyById(id: number): Promise<BirthdayParty | undefined> {
    const [party] = await db.select().from(birthdayParties).where(eq(birthdayParties.id, id));
    return party;
  }

  async getBirthdayPartiesByUser(userId: string): Promise<BirthdayParty[]> {
    return await db
      .select()
      .from(birthdayParties)
      .where(eq(birthdayParties.userId, userId))
      .orderBy(desc(birthdayParties.createdAt));
  }

  async getBirthdayPartiesByDate(date: string): Promise<BirthdayParty[]> {
    return await db
      .select()
      .from(birthdayParties)
      .where(eq(birthdayParties.partyDate, date))
      .orderBy(asc(birthdayParties.timeSlotId));
  }

  async updateBirthdayPartyStatus(id: number, status: string): Promise<BirthdayParty> {
    const [updatedParty] = await db
      .update(birthdayParties)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(birthdayParties.id, id))
      .returning();
    return updatedParty;
  }

  // Holiday calendar operations
  async getHolidayCalendar(): Promise<HolidayCalendar[]> {
    return await db
      .select()
      .from(holidayCalendar)
      .where(eq(holidayCalendar.isActive, true))
      .orderBy(asc(holidayCalendar.date));
  }

  async getHolidayByDate(date: string): Promise<HolidayCalendar | undefined> {
    const [holiday] = await db
      .select()
      .from(holidayCalendar)
      .where(and(eq(holidayCalendar.date, date), eq(holidayCalendar.isActive, true)));
    return holiday;
  }

  async createHoliday(holidayData: InsertHolidayCalendar): Promise<HolidayCalendar> {
    const [newHoliday] = await db.insert(holidayCalendar).values(holidayData).returning();
    return newHoliday;
  }

  async updateHoliday(id: number, holidayData: Partial<InsertHolidayCalendar>): Promise<HolidayCalendar> {
    const [updatedHoliday] = await db
      .update(holidayCalendar)
      .set(holidayData)
      .where(eq(holidayCalendar.id, id))
      .returning();
    return updatedHoliday;
  }

  async deleteHoliday(id: number): Promise<void> {
    await db.delete(holidayCalendar).where(eq(holidayCalendar.id, id));
  }

  // Discount voucher operations
  async getDiscountVouchers(): Promise<DiscountVoucher[]> {
    return await db
      .select()
      .from(discountVouchers)
      .where(eq(discountVouchers.isActive, true))
      .orderBy(desc(discountVouchers.createdAt));
  }

  async getDiscountVoucherByCode(code: string): Promise<DiscountVoucher | undefined> {
    const [voucher] = await db
      .select()
      .from(discountVouchers)
      .where(and(eq(discountVouchers.code, code), eq(discountVouchers.isActive, true)));
    return voucher;
  }

  async createDiscountVoucher(voucherData: InsertDiscountVoucher): Promise<DiscountVoucher> {
    const [newVoucher] = await db.insert(discountVouchers).values(voucherData as any).returning();
    return newVoucher;
  }

  async updateDiscountVoucher(id: number, voucherData: Partial<InsertDiscountVoucher>): Promise<DiscountVoucher> {
    const [updatedVoucher] = await db
      .update(discountVouchers)
      .set(voucherData as any)
      .where(eq(discountVouchers.id, id))
      .returning();
    return updatedVoucher;
  }

  async deleteDiscountVoucher(id: number): Promise<void> {
    await db.update(discountVouchers).set({ isActive: false }).where(eq(discountVouchers.id, id));
  }

  async incrementVoucherUsage(id: number): Promise<void> {
    await db
      .update(discountVouchers)
      .set({ usedCount: sql`${discountVouchers.usedCount} + 1` })
      .where(eq(discountVouchers.id, id));
  }

  // Review operations
  async getReviews(): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async getApprovedReviews(): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.isApproved, true))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(reviewData).returning();
    return newReview;
  }

  async updateReview(id: number, reviewData: Partial<InsertReview>): Promise<Review> {
    const [updatedReview] = await db
      .update(reviews)
      .set(reviewData)
      .where(eq(reviews.id, id))
      .returning();
    return updatedReview;
  }

  async approveReview(id: number): Promise<Review> {
    const [approvedReview] = await db
      .update(reviews)
      .set({ isApproved: true })
      .where(eq(reviews.id, id))
      .returning();
    return approvedReview;
  }

  // Blog operations
  async getBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(blogData: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(blogData).returning();
    return newPost;
  }

  async updateBlogPost(id: number, blogData: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set({ ...blogData, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // Enquiry operations
  async getEnquiries(): Promise<Enquiry[]> {
    return await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  }

  async getEnquiryById(id: number): Promise<Enquiry | undefined> {
    const [enquiry] = await db.select().from(enquiries).where(eq(enquiries.id, id));
    return enquiry;
  }

  async createEnquiry(enquiryData: InsertEnquiry): Promise<Enquiry> {
    const [newEnquiry] = await db.insert(enquiries).values(enquiryData).returning();
    return newEnquiry;
  }

  async updateEnquiryStatus(id: number, status: string): Promise<Enquiry> {
    const [updatedEnquiry] = await db
      .update(enquiries)
      .set({ status })
      .where(eq(enquiries.id, id))
      .returning();
    return updatedEnquiry;
  }

  // Analytics operations
  async getBookingAnalytics(): Promise<any> {
    const totalBookings = await db.select({ count: count() }).from(bookings);
    const confirmedBookings = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.status, "confirmed"));
    const pendingBookings = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.status, "pending"));
    const cancelledBookings = await db
      .select({ count: count() })
      .from(bookings)
      .where(eq(bookings.status, "cancelled"));

    return {
      totalBookings: totalBookings[0].count,
      confirmedBookings: confirmedBookings[0].count,
      pendingBookings: pendingBookings[0].count,
      cancelledBookings: cancelledBookings[0].count,
    };
  }

  async getRevenueAnalytics(): Promise<any> {
    const totalRevenue = await db
      .select({ sum: sql<string>`SUM(${bookings.totalAmount})` })
      .from(bookings)
      .where(eq(bookings.status, "confirmed"));

    const monthlyRevenue = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${bookings.createdAt})`,
        revenue: sql<string>`SUM(${bookings.totalAmount})`,
      })
      .from(bookings)
      .where(eq(bookings.status, "confirmed"))
      .groupBy(sql`DATE_TRUNC('month', ${bookings.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${bookings.createdAt})`);

    return {
      totalRevenue: totalRevenue[0].sum || "0",
      monthlyRevenue,
    };
  }

  async getPopularPackages(): Promise<any> {
    return await db
      .select({
        packageId: bookings.packageId,
        count: count(),
      })
      .from(bookings)
      .where(eq(bookings.status, "confirmed"))
      .groupBy(bookings.packageId)
      .orderBy(desc(count()));
  }

  async getTopCustomers(): Promise<any> {
    return await db
      .select({
        userId: bookings.userId,
        parentName: bookings.parentName,
        parentEmail: bookings.parentEmail,
        bookingCount: count(),
        totalSpent: sql<string>`SUM(${bookings.totalAmount})`,
      })
      .from(bookings)
      .where(eq(bookings.status, "confirmed"))
      .groupBy(bookings.userId, bookings.parentName, bookings.parentEmail)
      .orderBy(desc(count()))
      .limit(10);
  }
}

export const storage = new DatabaseStorage();
