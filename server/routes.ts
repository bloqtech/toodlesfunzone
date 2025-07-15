import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertBookingSchema, 
  insertBirthdayPartySchema, 
  insertEnquirySchema,
  insertPackageSchema,
  insertTimeSlotSchema,
  insertHolidayCalendarSchema,
  insertDiscountVoucherSchema,
  insertReviewSchema
} from "@shared/schema";
import { sendBookingConfirmation, sendBirthdayPartyConfirmation, sendEnquiryNotification } from "./services/email";
import { sendWhatsAppNotification } from "./services/whatsapp";
import { createPaymentOrder, verifyPayment } from "./services/payment";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public routes
  
  // Get packages
  app.get('/api/packages', async (req, res) => {
    try {
      const packages = await storage.getPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  // Get time slots
  app.get('/api/time-slots', async (req, res) => {
    try {
      const timeSlots = await storage.getActiveTimeSlots();
      res.json(timeSlots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({ message: "Failed to fetch time slots" });
    }
  });

  // Get approved reviews
  app.get('/api/reviews', async (req, res) => {
    try {
      const reviews = await storage.getApprovedReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Get published blog posts
  app.get('/api/blog', async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Get blog post by slug
  app.get('/api/blog/:slug', async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Check availability for a specific date and time slot
  app.get('/api/availability/:date/:timeSlotId', async (req, res) => {
    try {
      const { date, timeSlotId } = req.params;
      
      // Check if date is a holiday
      const holiday = await storage.getHolidayByDate(date);
      if (holiday) {
        return res.json({ available: false, reason: holiday.name });
      }

      // Get bookings for the date and time slot
      const bookings = await storage.getBookingsByDate(date);
      const timeSlotBookings = bookings.filter(b => b.timeSlotId === parseInt(timeSlotId));
      
      // Get total children count for this slot
      const totalChildren = timeSlotBookings.reduce((sum, booking) => sum + (booking.numberOfChildren || 0), 0);
      
      // Check capacity (15 children per slot)
      const available = totalChildren < 15;
      const remainingCapacity = 15 - totalChildren;
      
      res.json({ available, remainingCapacity });
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  // Submit enquiry
  app.post('/api/enquiry', async (req, res) => {
    try {
      const validatedData = insertEnquirySchema.parse(req.body);
      const enquiry = await storage.createEnquiry(validatedData);
      
      // Send notifications
      await sendEnquiryNotification(enquiry);
      await sendWhatsAppNotification(
        process.env.ADMIN_PHONE || '+919876543210',
        `New enquiry from ${enquiry.name} (${enquiry.email}): ${enquiry.message}`
      );
      
      res.json(enquiry);
    } catch (error) {
      console.error("Error creating enquiry:", error);
      res.status(500).json({ message: "Failed to submit enquiry" });
    }
  });

  // Get discount voucher by code
  app.get('/api/voucher/:code', async (req, res) => {
    try {
      const voucher = await storage.getDiscountVoucherByCode(req.params.code);
      if (!voucher) {
        return res.status(404).json({ message: "Voucher not found" });
      }
      
      // Check if voucher is valid
      const now = new Date();
      const validFrom = new Date(voucher.validFrom);
      const validTill = new Date(voucher.validTill);
      
      if (now < validFrom || now > validTill) {
        return res.status(400).json({ message: "Voucher has expired" });
      }
      
      if (voucher.usageLimit && (voucher.usedCount || 0) >= voucher.usageLimit) {
        return res.status(400).json({ message: "Voucher usage limit exceeded" });
      }
      
      res.json(voucher);
    } catch (error) {
      console.error("Error fetching voucher:", error);
      res.status(500).json({ message: "Failed to fetch voucher" });
    }
  });

  // Protected routes

  // Create booking
  app.post('/api/bookings', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const validatedData = insertBookingSchema.parse({
        ...req.body,
        userId,
      });
      
      const booking = await storage.createBooking(validatedData);
      
      // Send notifications
      await sendBookingConfirmation(booking);
      await sendWhatsAppNotification(
        booking.parentPhone,
        `Booking confirmed for ${booking.bookingDate}. Booking ID: ${booking.id}`
      );
      
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Get user bookings
  app.get('/api/bookings', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get booking by ID
  app.get('/api/bookings/:id', isAuthenticated, async (req, res) => {
    try {
      const booking = await storage.getBookingById(parseInt(req.params.id));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Check if user owns this booking or is admin
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (booking.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Create birthday party booking
  app.post('/api/birthday-parties', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const validatedData = insertBirthdayPartySchema.parse({
        ...req.body,
        userId,
      });
      
      const party = await storage.createBirthdayParty(validatedData);
      
      // Send notifications
      await sendBirthdayPartyConfirmation(party);
      await sendWhatsAppNotification(
        party.parentPhone,
        `Birthday party booking confirmed for ${party.partyDate}. Party ID: ${party.id}`
      );
      
      res.json(party);
    } catch (error) {
      console.error("Error creating birthday party:", error);
      res.status(500).json({ message: "Failed to create birthday party" });
    }
  });

  // Get user birthday parties
  app.get('/api/birthday-parties', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const parties = await storage.getBirthdayPartiesByUser(userId);
      res.json(parties);
    } catch (error) {
      console.error("Error fetching birthday parties:", error);
      res.status(500).json({ message: "Failed to fetch birthday parties" });
    }
  });

  // Create payment order
  app.post('/api/payment/create-order', isAuthenticated, async (req, res) => {
    try {
      const { amount, currency = 'INR', receipt } = req.body;
      const order = await createPaymentOrder(amount, currency, receipt);
      res.json(order);
    } catch (error) {
      console.error("Error creating payment order:", error);
      res.status(500).json({ message: "Failed to create payment order" });
    }
  });

  // Verify payment
  app.post('/api/payment/verify', isAuthenticated, async (req, res) => {
    try {
      const { paymentId, orderId, signature, bookingId } = req.body;
      const isValid = await verifyPayment(paymentId, orderId, signature);
      
      if (isValid) {
        // Update booking payment status
        await storage.updateBookingPayment(bookingId, paymentId, 'completed');
        await storage.updateBookingStatus(bookingId, 'confirmed');
        
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Payment verification failed" });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Submit review
  app.post('/api/reviews', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId,
      });
      
      const review = await storage.createReview(validatedData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  // Admin routes
  const adminAuth = async (req: any, res: any, next: any) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: "Authorization failed" });
    }
  };

  // Admin: Get all bookings
  app.get('/api/admin/bookings', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      let bookings;
      
      if (startDate && endDate) {
        bookings = await storage.getBookingsByDateRange(startDate as string, endDate as string);
      } else {
        // Get last 30 days by default
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        bookings = await storage.getBookingsByDateRange(
          thirtyDaysAgo.toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        );
      }
      
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching admin bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Admin: Update booking status
  app.patch('/api/admin/bookings/:id/status', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const booking = await storage.updateBookingStatus(parseInt(req.params.id), status);
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Admin: Get analytics
  app.get('/api/admin/analytics', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const bookingAnalytics = await storage.getBookingAnalytics();
      const revenueAnalytics = await storage.getRevenueAnalytics();
      const popularPackages = await storage.getPopularPackages();
      const topCustomers = await storage.getTopCustomers();
      
      res.json({
        bookings: bookingAnalytics,
        revenue: revenueAnalytics,
        popularPackages,
        topCustomers,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Admin: Manage packages
  app.post('/api/admin/packages', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const validatedData = insertPackageSchema.parse(req.body);
      const package_ = await storage.createPackage(validatedData);
      res.json(package_);
    } catch (error) {
      console.error("Error creating package:", error);
      res.status(500).json({ message: "Failed to create package" });
    }
  });

  app.patch('/api/admin/packages/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const package_ = await storage.updatePackage(parseInt(req.params.id), req.body);
      res.json(package_);
    } catch (error) {
      console.error("Error updating package:", error);
      res.status(500).json({ message: "Failed to update package" });
    }
  });

  // Admin: Manage time slots
  app.get('/api/admin/time-slots', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const timeSlots = await storage.getTimeSlots();
      res.json(timeSlots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({ message: "Failed to fetch time slots" });
    }
  });

  app.post('/api/admin/time-slots', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const validatedData = insertTimeSlotSchema.parse(req.body);
      const timeSlot = await storage.createTimeSlot(validatedData);
      res.json(timeSlot);
    } catch (error) {
      console.error("Error creating time slot:", error);
      res.status(500).json({ message: "Failed to create time slot" });
    }
  });

  // Admin: Manage holidays
  app.get('/api/admin/holidays', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const holidays = await storage.getHolidayCalendar();
      res.json(holidays);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      res.status(500).json({ message: "Failed to fetch holidays" });
    }
  });

  app.post('/api/admin/holidays', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const validatedData = insertHolidayCalendarSchema.parse(req.body);
      const holiday = await storage.createHoliday(validatedData);
      res.json(holiday);
    } catch (error) {
      console.error("Error creating holiday:", error);
      res.status(500).json({ message: "Failed to create holiday" });
    }
  });

  app.delete('/api/admin/holidays/:id', isAuthenticated, adminAuth, async (req, res) => {
    try {
      await storage.deleteHoliday(parseInt(req.params.id));
      res.json({ message: "Holiday deleted successfully" });
    } catch (error) {
      console.error("Error deleting holiday:", error);
      res.status(500).json({ message: "Failed to delete holiday" });
    }
  });

  // Admin: Manage vouchers
  app.get('/api/admin/vouchers', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const vouchers = await storage.getDiscountVouchers();
      res.json(vouchers);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      res.status(500).json({ message: "Failed to fetch vouchers" });
    }
  });

  app.post('/api/admin/vouchers', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const validatedData = insertDiscountVoucherSchema.parse(req.body);
      const voucher = await storage.createDiscountVoucher(validatedData);
      res.json(voucher);
    } catch (error) {
      console.error("Error creating voucher:", error);
      res.status(500).json({ message: "Failed to create voucher" });
    }
  });

  // Admin: Manage reviews
  app.get('/api/admin/reviews', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.patch('/api/admin/reviews/:id/approve', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const review = await storage.approveReview(parseInt(req.params.id));
      res.json(review);
    } catch (error) {
      console.error("Error approving review:", error);
      res.status(500).json({ message: "Failed to approve review" });
    }
  });

  // Admin: Manage enquiries
  app.get('/api/admin/enquiries', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const enquiries = await storage.getEnquiries();
      res.json(enquiries);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      res.status(500).json({ message: "Failed to fetch enquiries" });
    }
  });

  app.patch('/api/admin/enquiries/:id/status', isAuthenticated, adminAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const enquiry = await storage.updateEnquiryStatus(parseInt(req.params.id), status);
      res.json(enquiry);
    } catch (error) {
      console.error("Error updating enquiry status:", error);
      res.status(500).json({ message: "Failed to update enquiry status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
